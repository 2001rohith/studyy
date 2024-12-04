const User = require("../models/userModel")
const Course = require("../models/courseModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const sendOTP = require("../helpers/sendOTP")
const sendEmail = require("../helpers/sendEmail")
const e = require("cors")
const { v4: uuidv4 } = require("uuid")
const { UserRefreshClient } = require("google-auth-library")
const crypto = require("crypto")
// const nodemailer = require("nodemailer")

exports.signUp = async (req, res) => {
    const { name, email, password } = req.body
    console.log(name)
    console.log(email)
    console.log(password)
    try {
        let user = await User.findOne({ email })
        if (user) return res.status(400).json({ message: "User already exists!" })

        const hashedPassword = await bcrypt.hash(password, 10)
        const { otp, otpExpires } = await sendOTP(email)

        user = new User({ name, email, password: hashedPassword, otp, otpExpires })
        await user.save()
        res.json({ status: "ok", message: "use registered, OTP send to email" })
        // res.status(201).json({ message: "use registered, OTP send to email" })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Server error" })
    }
}

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body

    try {
        let user = await User.findOne({ email })
        if (!user) return res.status(400).json({ message: "User not found" })

        if (Date.now() > user.otpExpires) {
            return res.json({ message: "OTP has expired" });
        }

        if (user.otp !== otp) return res.status(400).json({ message: "Enter valid OTP" })

        user.isVerified = true
        user.otp = null
        user.otpExpires = null

        await user.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" })
        res.json({ token, status: "ok", message: "OTP verified" })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "OTP verification failed" })
    }
}

exports.resendOtp = async (req, res) => {
    const { email } = req.body
    try {
        let user = await User.findOne({ email })
        if (!user) return res.json({ message: "no user found" })
        const { otp, otpExpires } = await sendOTP(email)
        user.otp = otp
        user.otpExpires = otpExpires
        await user.save()
        res.json({ message: "New OTP has been send to your email" })
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Failed to resend OTP" });
    }
}

exports.selectRole = async (req, res) => {
    const { role } = req.body
    const certificatePath = req.file ? req.file.path : null;
    const data = { role }
    if (certificatePath && role === "teacher") {
        data.teacherCertificatePath = certificatePath
        data.peerId = uuidv4()
    }
    try {
        const user = await User.findByIdAndUpdate(req.user._id, data)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" })
        res.json({ status: "ok", role, token, user: { id: user._id, email: user.email, name: user.name, role: user.role, peerId: user.peerId }, message: "user role added" })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: 'Server error' });
    }
}

exports.Login = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email })

        if (!user) return res.json({ message: "User not found" })

        if (!user.isVerified) {
            return res.status(400).json({ message: "Please verify your email before logging in" });
        }

        const isPasswordValid = await user.comparePassword(password)
        if (!isPasswordValid) {
            console.log("wrong password")
            return res.json({ message: "Invalid details" })
        }
        if (user.isBlocked === true) return res.status(400).json({ message: "Your profile has been blocked!" })
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" })

        req.session.user = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            token
        }
        if(user.role === "teacher" && user.peerId === null){
            user.peerId = uuidv4()
            await user.save()
        }
        console.log(req.session.user.id)
        res.json({ status: "ok", token, user: { id: user._id, email: user.email, name: user.name, role: user.role, peerId: user.peerId }, message: "Login success" })
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
}

exports.getUsers = async (req, res) => {
    try {
        let users = await User.find({ role: { $ne: 'admin' } })
        // console.log("users from get users:", users)
        res.json({ status: "ok", users, message: "user list for admin" })
    } catch (error) {
        console.error("get users error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
}

exports.UpdateUser = async (req, res) => {
    const userId = req.params.id
    const { name, email, role } = req.body
    try {
        let updatedUser = await User.findByIdAndUpdate(userId, { name, email, role }, { new: true })
        if (!updatedUser) res.status(404).json({ status: "notok", message: "user not found" })
        res.json({ status: "ok", user: updatedUser, message: "User updated successfully" });
    } catch (error) {
        console.error("Update user error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
}

exports.DeleteUser = async (req, res) => {
    const userId = req.params.id
    try {
        let user = await User.findByIdAndDelete(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        console.log("deleted user")
        res.status(200).json({ message: "User deleted successfully" })
    } catch (error) {
        console.error("delete user error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
}

exports.blockUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isBlocked = !user.isBlocked
        await user.save();

        const statusMessage = user.isBlocked ? "User has been blocked" : "User has been unblocked";
        res.status(200).json({ message: statusMessage });
    } catch (error) {
        console.error("Error blocking/unblocking user:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getTeachers = async (req, res) => {
    try {
        let users = await User.find({ role: "teacher" })
        // const courseCreated = Course.find({teacher:user._d})
        res.json({ status: "ok", users, message: "teachers list for admin" })
    } catch (error) {
        console.error("get users error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
}

exports.verifyTeacher = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isTeacherVerified = !user.isTeacherVerified
        await user.save();

        const statusMessage = user.isTeacherVerified ? "teacher has been verfied" : "teacher has been unverified";
        res.status(200).json({ message: statusMessage });
    } catch (error) {
        console.error("Error verifying/unverifying teacher:", error);
        res.status(500).json({ message: "Server error" });
    }
}

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });


        const resetURL = `http://localhost:3000/reset-password/${resetToken}`;
        const message = `Forgot your password? Reset it here: ${resetURL}`;

        await sendEmail(email, "here is the link for reset password", message)

        res.status(200).json({ message: 'Password reset link sent to your email' });
    } catch (error) {
        console.error("Error in forgot password:", error);
        res.status(500).json({ message: "Server error" });
    }
}

exports.resetPassword = async (req, res) => {
    const { password, confirmPassword } = req.body;
    const token = req.params.token;

    try {
        if (password !== confirmPassword) return res.json({ status: "notok", message: "password and confirm password should be same!" })
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

        if (!user) {
            return res.status(400).json({ message: "Token is invalid or has expired" });
        }
        const hashedPassword = await bcrypt.hash(password, 10)


        user.password = hashedPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(200).json({ status: "ok", message: "Password has been reset successfully" });
    } catch (error) {
        console.error("Error in reset password:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.UserChangePassword = async (req, res) => {
    const userId = req.params.id
    const { currentPassword, newPassword } = req.body
    try {
        const user = await User.findById(userId)
        console.log("user from change password:", user)
        if (!user) return res.status(400).json({ message: "User not found" })

        const isPasswordValid = await user.comparePassword(currentPassword)
        if (!isPasswordValid) return res.status(400).json({ message: "Wrong password!" })

        const encryptedPassword = await bcrypt.hash(newPassword, 10)
        user.password = encryptedPassword
        await user.save()

        res.status(200).json({ status: "ok", message: "Password has been reset successfully" });
    } catch (error) {
        console.error("Error in reset password:", error);
        res.status(500).json({ message: "Server error" });
    }
}

exports.editProfile = async (req, res) => {
    const userId = req.params.id
    const { name, email } = req.body
    try {
        const user = await User.findByIdAndUpdate(userId, { name, email }, { new: true })
        if (!user) return res.status(400).json({ message: "user not found" })
        res.status(200).json({ message: "Changes applied", user })
    } catch (error) {
        console.error("Error in reset password:", error);
        res.status(500).json({ message: "Server error" });
    }
}