const User = require("../models/userModel")
const Course = require("../models/courseModel")
const Module = require("../models/moduleModel")
const HttpStatus = require("../helpers/httpStatus")



// exports.homeCourses = async (req, res) => {
//     const userId = req.params.id;

//     try {
//         const user = await User.findById(userId).populate('enrolledCourses', '_id');
//         console.log("user from get home course:", user)
//         if (!user) {
//             return res.status(HttpStatus.BAD_REQUEST).json({ message: "User not found" });
//         }

//         const enrolledCourseIds = user.enrolledCourses.map(course => course._id);

//         const courses = await Course.find({ _id: { $nin: enrolledCourseIds } }).sort({ createdAt: -1 });
//         console.log("courses:", courses)
//         if (courses.length === 0) {
//             return res.status(HttpStatus.BAD_REQUEST).json({ message: "No courses available" });
//         }

//         res.status(HttpStatus.OK).json({
//             status: "ok",
//             courses,
//             message: "Fetched courses successfully",
//         });

//     } catch (error) {
//         console.error("Get courses error:", error.message);
//         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
//     }
// };

exports.homeCourses = async (req, res) => {
    const userId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const search = req.query.search || "";
    const modulesFilter = req.query.modulesFilter || "";
    
    try {
        const user = await User.findById(userId).populate('enrolledCourses', '_id');
        
        if (!user) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "User not found" });
        }
        
        const enrolledCourseIds = user.enrolledCourses.map(course => course._id);
        
        let filterConditions = { _id: { $nin: enrolledCourseIds } };
        
        if (search) {
            filterConditions.$or = [
                { title: { $regex: search, $options: 'i' } },
                { courseId: { $regex: search, $options: 'i' } }
            ];
        }

        if (modulesFilter === 'Less') {
            filterConditions['modules'] = { 
                $not: { $size: 0 },  
                $exists: true        
            };
            filterConditions['modules.2'] = { $exists: false }; 
        } else if (modulesFilter === 'Medium') {
            filterConditions['modules.2'] = { $exists: true };  
            filterConditions['modules.4'] = { $exists: false }; 
        } else if (modulesFilter === 'More') {
            filterConditions['modules.4'] = { $exists: true };  
        }

        const totalCourses = await Course.countDocuments(filterConditions);
        const totalPages = Math.ceil(totalCourses / limit);
        
        const courses = await Course.find(filterConditions)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
            
        res.status(HttpStatus.OK).json({
            status: "ok",
            courses,
            totalPages,
            totalCourses,
            message: "Fetched courses successfully",
        });
        
    } catch (error) {
        console.error("Get courses error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
};
