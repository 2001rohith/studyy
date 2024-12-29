const User = require("../models/userModel")
const Course = require("../models/courseModel")
const Module = require("../models/moduleModel")
const HttpStatus = require("../helpers/httpStatus")



exports.homeCourses = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId).populate('enrolledCourses', '_id');
        console.log("user from get home course:", user)
        if (!user) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "User not found" });
        }

        const enrolledCourseIds = user.enrolledCourses.map(course => course._id);

        const courses = await Course.find({ _id: { $nin: enrolledCourseIds } }).sort({ createdAt: -1 });
        console.log("courses:", courses)
        if (courses.length === 0) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "No courses available" });
        }

        res.status(HttpStatus.OK).json({
            status: "ok",
            courses,
            message: "Fetched courses successfully",
        });

    } catch (error) {
        console.error("Get courses error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
};
