const express = require("express")
const router = express.Router()
const passport = require("passport")
const jwt = require("jsonwebtoken")
const authMiddleware = require("../middlewares/auth")
const {signUp, verifyOtp, resendOtp ,selectRole,Login,getUsers,UpdateUser, DeleteUser,blockUser, getTeachers, verifyTeacher, forgotPassword, resetPassword, UserChangePassword, editProfile, getProfieData} = require("../controllers/userController")
const {getStudents} = require("../controllers/courseController")
const isAdmin = require("../middlewares/isAdmin")
const {upload} = require("../middlewares/uploadMiddleware")

router.post("/signup" ,signUp)
router.post("/verify-otp", verifyOtp)
router.post("/resend-otp", resendOtp)
router.post("/login",Login)
router.get("/auth/google",passport.authenticate("google",{scope:["profile","email"]}))
router.get("/auth/google/callback", passport.authenticate("google",{session:false,failureRedirect:"/login"}),
(req,res)=>{
    const token = jwt.sign({id:req.user._id},process.env.JWT_SECRET,{expiresIn:"1h"})
    // res.json({token,message:"Google authetication is success"})
    if (req.user.role === "teacher") {
        res.redirect(`http://localhost:3000/teacher-home?token=${token}`);
      } else if(req.user.role === "student"){
        res.redirect(`http://localhost:3000/student-home?token=${token}`);
      }
      else {
        res.redirect(`http://localhost:3000/select-role?token=${token}`);
      }
})
router.post("/select-role",upload.single("certificate"),authMiddleware,selectRole)

router.get("/get-users",isAdmin,getUsers)
router.get("/get-teachers",isAdmin,getTeachers)

router.put("/admin-update-user/:id",UpdateUser )
router.delete("/admin-delete-user/:id",DeleteUser)
router.put("/admin-block-user/:id",blockUser)
router.put("/admin-verify-teacher/:id",verifyTeacher)

router.post('/forgot-password', forgotPassword);

router.post('/reset-password/:token', resetPassword);

router.get("/get-students", getStudents)
router.post('/change-password/:id', UserChangePassword);
router.put("/edit-profile/:id",editProfile )
router.get("/get-profile-data/:id",getProfieData)

module.exports = router