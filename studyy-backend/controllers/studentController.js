const User = require("../models/userModel")
const Course = require("..//models/courseModel")
const Module = require("../models/moduleModel")



exports.homeCourses = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId).populate('enrolledCourses', '_id');
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const enrolledCourseIds = user.enrolledCourses.map(course => course._id);

        const courses = await Course.find({ _id: { $nin: enrolledCourseIds } }).sort({ createdAt: -1 });

        if (courses.length === 0) {
            return res.json({ message: "No courses available" });
        }

        res.status(200).json({
            status: "ok",
            courses,
            message: "Fetched courses successfully",
        });

    } catch (error) {
        console.error("Get courses error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};
