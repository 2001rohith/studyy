const User = require("../models/userModel")
const Course = require("../models/courseModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { sendOTP } = require("../helpers/sendSMS")
const sendEmail = require("../helpers/sendEmail")
const { v4: uuidv4 } = require("uuid")
const { UserRefreshClient } = require("google-auth-library")
const crypto = require("crypto")
const HttpStatus = require("../helpers/httpStatus")

exports.signUp = async (req, res) => {
    const { name, email, password, phone } = req.body
    console.log(name)
    console.log(email)
    console.log(password)

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: "Invalid phone number format" });
    }

    try {
        let user = await User.findOne({ email } )
        if (user) return res.status(HttpStatus.BAD_REQUEST).json({ message: "User already exists!" })

        const hashedPassword = await bcrypt.hash(password, 10)
        const { otp, otpExpires } = await sendOTP(phone)

        user = new User({ name, email, phone, password: hashedPassword, otp, otpExpires })
        console.log("user after saving from signup:",user)
        await user.save()
        res.status(HttpStatus.OK).json({ message: "use registered, OTP sent via SMS" })
    } catch (error) {
        console.log(error.message)
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" })
    }
}

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body

    try {
        let user = await User.findOne({ email })
        if (!user) return res.status(HttpStatus.BAD_REQUEST).json({ message: "User not found" })

        if (Date.now() > user.otpExpires) {
            return res.json({ message: "OTP has expired" });
        }

        if (user.otp !== otp) return res.status(HttpStatus.BAD_REQUEST).json({ message: "Enter valid OTP" })

        user.isVerified = true
        user.otp = null
        user.otpExpires = null

        await user.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" })
        res.status(HttpStatus.OK).json({ status: "ok", token, message: "OTP verified" })
    } catch (error) {
        console.log(error.message)
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "OTP verification failed" })
    }
}

exports.resendOtp = async (req, res) => {
    const { phone } = req.body
    try {
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(HttpStatus.BAD_REQUEST).json({ error: "Invalid phone number format" });
        }
        let user = await User.findOne({ email })
        if (!user) return res.status(HttpStatus.BAD_REQUEST).json({ message: "no user found" })
        const { otp, otpExpires } = await sendOTP(phone)
        user.otp = otp
        user.otpExpires = otpExpires
        await user.save()
        res.status(HttpStatus.OK).json({ message: "New OTP has been sent via SMS" })
    } catch (error) {
        console.error(error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to resend OTP" });
    }
}

exports.selectRole = async (req, res) => {
    const { role } = req.body
    const certificatePath = req.file ? req.file.path : null;
    console.log("certificate path:", certificatePath)
    const data = { role }
    if (certificatePath && role === "teacher") {
        data.teacherCertificatePath = certificatePath
        data.peerId = uuidv4()
    }
    try {
        const user = await User.findByIdAndUpdate(req.user._id, data)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" })
        res.status(HttpStatus.OK).json({ role, token, user: { id: user._id, email: user.email, name: user.name, role: user.role, peerId: user.peerId }, message: "user role added" })
    } catch (error) {
        console.log(error.message)
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
    }
}

exports.Login = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email })

        if (!user) return res.status(HttpStatus.BAD_REQUEST).json({ message: "User not found" })

        if (!user.isVerified) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "Please verify your email before logging in" });
        }

        if (user.otp !== null) {
            user.otp = null
            await user.save()
        }

        const isPasswordValid = await user.comparePassword(password)
        if (!isPasswordValid) {
            console.log("wrong password")
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "Invalid details" })
        }
        if (user.isBlocked === true) return res.status(HttpStatus.BAD_REQUEST).json({ message: "Your profile has been blocked!" })
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" })

        // req.session.user = {
        //     id: user._id.toString(),
        //     email: user.email,
        //     name: user.name,
        //     role: user.role,
        //     token
        // }
        if (user.role === "teacher" && user.peerId === null) {
            user.peerId = uuidv4()
            await user.save()
        }
        // console.log(req.session.user.id)
        res.status(HttpStatus.OK).json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role }, message: "Login success" })
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.getUsers = async (req, res) => {
    try {
        let users = await User.find({ role: { $ne: 'admin' } })
        // console.log("users from get users:", users)
        res.status(HttpStatus.OK).json({ users, message: "user list for admin" })
    } catch (error) {
        console.error("get users error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.UpdateUser = async (req, res) => {
    const userId = req.params.id
    const { name, email, role } = req.body
    try {
        let updatedUser = await User.findByIdAndUpdate(userId, { name, email, role }, { new: true })
        if (!updatedUser) res.status(HttpStatus.BAD_REQUEST).json({ status: "notok", message: "user not found" })
        res.status(HttpStatus.OK).json({ user: updatedUser, message: "User updated successfully" });
    } catch (error) {
        console.error("Update user error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.DeleteUser = async (req, res) => {
    const userId = req.params.id
    try {
        let user = await User.findByIdAndDelete(userId)
        if (!user) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "User not found" });
        }
        console.log("deleted user")
        res.status(HttpStatus.OK).json({ message: "User deleted successfully" })
    } catch (error) {
        console.error("delete user error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.blockUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "User not found" });
        }

        user.isBlocked = !user.isBlocked
        await user.save();

        const statusMessage = user.isBlocked ? "User has been blocked" : "User has been unblocked";
        res.status(HttpStatus.OK).json({ message: statusMessage });
    } catch (error) {
        console.error("Error blocking/unblocking user:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
};

exports.getTeachers = async (req, res) => {
    try {
        let users = await User.find({ role: "teacher" })
        res.status(HttpStatus.OK).json({ users, message: "teachers list for admin" })
    } catch (error) {
        console.error("get users error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.verifyTeacher = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "User not found" });
        }

        user.isTeacherVerified = !user.isTeacherVerified
        await user.save();

        const statusMessage = user.isTeacherVerified ? "teacher has been verfied" : "teacher has been unverified";
        res.status(HttpStatus.OK).json({ message: statusMessage });
    } catch (error) {
        console.error("Error verifying/unverifying teacher:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "User not found" });
        }

        const resetToken = user.createPasswordResetToken();
        console.log("reset token:",resetToken)
        await user.save({ validateBeforeSave: false });


        const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        console.log("reset url:",resetURL)
        const message = `Forgot your password? Reset it here: ${resetURL}`;

        await sendEmail(email, "here is the link for reset password", message)

        res.status(HttpStatus.OK).json({ message: 'Password reset link sent to your email' });
    } catch (error) {
        console.error("Error in forgot password:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.resetPassword = async (req, res) => {
    const { password, confirmPassword } = req.body;
    const token = req.params.token;

    try {
        if (password !== confirmPassword) return res.status(HttpStatus.BAD_REQUEST).json({ message: "password and confirm password should be same!" })
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

        if (!user) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "Token is invalid or has expired" });
        }
        const hashedPassword = await bcrypt.hash(password, 10)


        user.password = hashedPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(HttpStatus.OK).json({ message: "Password has been reset successfully" });
    } catch (error) {
        console.error("Error in reset password:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
};

exports.UserChangePassword = async (req, res) => {
    const userId = req.params.id
    const { currentPassword, newPassword } = req.body
    try {
        const user = await User.findById(userId)
        console.log("user from change password:", user)
        if (!user) return res.status(HttpStatus.BAD_REQUEST).json({ message: "User not found" })

        const isPasswordValid = await user.comparePassword(currentPassword)
        if (!isPasswordValid) return res.status(HttpStatus.BAD_REQUEST).json({ message: "Wrong password!" })

        const encryptedPassword = await bcrypt.hash(newPassword, 10)
        user.password = encryptedPassword
        await user.save()

        res.status(HttpStatus.OK).json({ message: "Password has been reset successfully" });
    } catch (error) {
        console.error("Error in reset password:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.getProfieData = async (req, res) => {
    const userId = req.params.id
    console.log("user id from profile:", userId)
    try {
        const user = await User.findById(userId)
        console.log("user founded:", user)
        const isVerified = user.isTeacherVerified
        if (!user) return res.status(HttpStatus.BAD_REQUEST).json({ message: "User not found" })
        res.status(HttpStatus.OK).json({ message: "User data fetched", user,isVerified })
    } catch (error) {
        console.error("Error in get profile data:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.editProfile = async (req, res) => {
    const userId = req.params.id

    const { name} = req.body
    try {
        const user = await User.findByIdAndUpdate(userId, { name }, { new: true })
        if (!user) return res.status(HttpStatus.BAD_REQUEST).json({ message: "user not found" })

        const userToSend = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
        
        res.status(HttpStatus.OK).json({ message: "Changes applied", user: userToSend })
    } catch (error) {
        console.error("Error in reset password:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.getProfile = async (req, res) => {
    const userId = req.user._id
    try {
        const user = await User.findById(userId)
        if (!user) return res.status(HttpStatus.BAD_REQUEST).json({ message: "user not found" })

            const userToSend = {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        console.log("user from get user info:",userToSend)
        res.json({ user: userToSend });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile' });
    }
}