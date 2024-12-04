const express = require("express")
const router = express.Router()
const authMiddleware = require("../middlewares/auth")
const { upload } = require("../middlewares/uploadMiddleware")
const { createCourse, getCourses, DeleteCourse, getCourse, EditCourse,
    createModule, DeleteModule, EditModule, AdmingetCourses, AdmingetCourse,
    CreateAssignment, GetAssignments, EditAssignment, DeleteAssignment, addQuiz,
    getQuizzes, DeleteQuiz, GetQuiz, EditQuiz, adminGetQuizzes, adminDeleteQuiz,
    adminGetAssignments, adminDeleteAssignment, studentEnrollment,
    studentGetAssignments, studentsubmitAssignment, studentGetQuizzes,
    enrolledCourses, SubmitQuiz, getClasses, createClass, 
    studentGetClasses,
    sendNotification,
    getNotifications,
    markNotificationsAsRead,
    addClassPeerId,
    EditClass,
    deleteClass,
    getAssignmentSubmission,
    getAssignmentSubmissions,
    getQuizSubmissions,
    getCourseStudents,
    sendEmailNotification} = require("../controllers/courseController")
const { homeCourses } = require("../controllers/studentController")

router.post("/create", createCourse)
router.get("/get-courses", authMiddleware, getCourses)
router.delete("/teacher-delete-course/:id", DeleteCourse)
router.get("/get-course/:id", getCourse)
router.put("/teacher-edit-course/:id", EditCourse)
router.post("/teacher-add-module", upload.fields([{ name: "pdf", maxCount: 1 }, { name: "video", maxCount: 1 }]), createModule)
router.get("/home-get-courses/:id", homeCourses)
router.delete("/teacher-delete-module/:id", DeleteModule)
router.put("/teacher-edit-module/:id", upload.fields([{ name: "pdf", maxCount: 1 }, { name: "video", maxCount: 1 }]), EditModule)
router.get("/admin-get-courses", AdmingetCourses)
router.get("/admin-get-course/:id", AdmingetCourse)
router.post("/create-assignment", CreateAssignment)
router.get('/get-assignments/:id', GetAssignments);
router.put("/teacher-edit-assignment/:id", EditAssignment)
router.delete("/teacher-delete-assignment/:id", DeleteAssignment)
router.post("/add-quiz", addQuiz)
router.get('/get-quizzes/:id', getQuizzes);
router.delete("/teacher-delete-quiz/:id", DeleteQuiz)
router.get("/get-quiz/:id", GetQuiz)
router.put("/teacher-edit-quiz/:id", EditQuiz)
router.get("/teacher-get-classes/:id", getClasses)
router.post("/send-notification",sendNotification)
router.post("/add-class", createClass)
router.put("/add-peerid/:id",addClassPeerId)
router.put("/teacher-edit-class/:id", EditClass)
router.delete("/teacher-delete-class/:id", deleteClass)
router.get("/get-assignment-submissions/:id", getAssignmentSubmissions)
router.get("/get-quiz-submissions/:id", getQuizSubmissions)
router.get("/get-course-students/:id", getCourseStudents)
router.post("/send-email-notification",sendEmailNotification)


router.get("/admin-get-quizzes", adminGetQuizzes)
router.delete("/admin-delete-quiz/:id", adminDeleteQuiz)
router.get("/admin-get-assignments", adminGetAssignments)
router.delete("/admin-delete-assignment/:id", adminDeleteAssignment)

router.post("/student-enroll", studentEnrollment)
router.get("/enrolled-courses/:id", enrolledCourses)
router.get("/student-get-assignments/:id", studentGetAssignments)
router.post("/submit-assignment/:id", upload.single("file"), studentsubmitAssignment)
router.get("/student-get-quizzes/:id", studentGetQuizzes)
router.post("/student-submit-quiz", SubmitQuiz)
router.get("/student-get-classes/:id", studentGetClasses)
router.get("/get-notifications/:id", getNotifications)
router.post("/mark-notifications-as-read",markNotificationsAsRead)




module.exports = router