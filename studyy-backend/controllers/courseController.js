const User = require("../models/userModel")
const Course = require("../models/courseModel")
const Module = require("../models/moduleModel")
const Assignment = require("../models/assignmentModel")
const Quiz = require("../models/quizModel")
const Class = require("../models/classModel")
const Notification = require("../models/notificationModel")
const sendEmail = require("../helpers/sendEmail")
const HttpStatus = require("../helpers/httpStatus")

exports.getStudents = async (req, res) => {
    try {
        let users = await User.find({ role: "student" })
        res.status(HttpStatus.OK).json({ users, message: "student list for teacher" })
    } catch (error) {
        console.error("get students error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.getCourses = async (req, res) => {
    const teacherId = req.user._id
    console.log("teacher id from get courses:", teacherId)
    try {
        const courses = await Course.find({ teacher: teacherId })
            .populate('studentsEnrolled', 'name')
            .exec();

        const coursesToSend = courses.map(course => ({
            id: course._id,
            courseId: course.courseId,
            title: course.title,
            description: course.description,
            teacher: course.teacher,
            studentCount: course.studentsEnrolled.length || 0,
            assignmentCount: course.assignments.length || 0
        }));
        res.status(HttpStatus.OK).json({ courses: coursesToSend, message: "Course list for teacher" });
    } catch (error) {
        console.error("Get courses error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
};

const generateRandomId = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

exports.createCourse = async (req, res) => {
    const { title, description, userId } = req.body;
    const teacher = await User.findById(userId)
    if (!userId) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Unauthorized. Please log in.' });
    }
    if (teacher.isTeacherVerified === false) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: "Only verified teachers can create a course.  Wait for your verification!" });
    }
    try {
        const newCourse = new Course({
            courseId: generateRandomId(6),
            title,
            description,
            teacher: userId,
        });
        await newCourse.save();
        res.status(HttpStatus.OK).json({ message: 'Course created successfully', course: newCourse });
    } catch (error) {
        console.error(error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
    }
}

exports.DeleteCourse = async (req, res) => {
    const courseId = req.params.id
    try {
        let course = await Course.findByIdAndDelete(courseId)
        if (!course) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "course not found" });
        }
        console.log("deleted course")
        res.status(HttpStatus.OK).json({ message: "course deleted successfully" })
    } catch (error) {
        console.error("delete course error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.getCourse = async (req, res) => {
    const courseId = req.params.id
    try {
        const course = await Course.findById(courseId)
        const modules = await Module.find({ course: courseId })
        const teacher = await User.findById(course.teacher)
        console.log("teacher from get course:", teacher)
        if (!course) return res.status(HttpStatus.BAD_REQUEST).json({ message: "no course found" })
        console.log(course)
        res.status(HttpStatus.OK).json({ course, modules, teacher, message: "fetched course succesfully" })
    } catch (error) {
        console.error("get course error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.EditCourse = async (req, res) => {
    const courseId = req.params.id
    const { title, description } = req.body
    try {
        let updatedCourse = await Course.findByIdAndUpdate(courseId, { title, description }, { new: true })
        if (!updatedCourse) res.status(HttpStatus.BAD_REQUEST).json({ status: "notok", message: "course not found" })
        res.status(HttpStatus.OK).json({ user: updatedCourse, message: "course updated successfully" });
    } catch (error) {
        console.error("Update course error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.createModule = async (req, res) => {
    const { courseId, title, description } = req.body
    const pdfFile = req.files['pdf'] ? req.files['pdf'][0] : null;
    const videoFile = req.files['video'] ? req.files['video'][0] : null

    if (!pdfFile) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: "PDF file is required" })
    }
    const pdfPath = pdfFile.path
    const videoPath = videoFile ? videoFile.path : null
    try {
        const newModule = new Module({
            course: courseId,
            title,
            description,
            pdfPath,
            videoPath
        })
        await newModule.save()
        const course = await Course.findById(courseId)
        course.modules.push(newModule._id)
        await course.save()
        res.status(HttpStatus.OK).json({ message: "Module created successfully", module: newModule })
    } catch (error) {
        console.error("Error creating module:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
};

exports.DeleteModule = async (req, res) => {
    const ModuleId = req.params.id
    try {
        let modulee = await Module.findByIdAndDelete(ModuleId)
        if (!modulee) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "module not found" });
        }
        console.log("deleted module")
        res.status(HttpStatus.OK).json({ message: "module deleted successfully" })
    } catch (error) {
        console.error("delete module error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.EditModule = async (req, res) => {
    const { title, description } = req.body
    const pdfFile = req.files['pdf'] ? req.files['pdf'][0] : null;
    const videoFile = req.files['video'] ? req.files['video'][0] : null;
    const moduleId = req.params.id

    const updateFields = { title, description };
    if (pdfFile) updateFields.pdfPath = pdfFile.path;
    if (videoFile) updateFields.videoPath = videoFile.path;
    try {
        let updatedModule = await Module.findByIdAndUpdate(moduleId, updateFields, { new: true })
        if (!updatedModule) res.status(HttpStatus.BAD_REQUEST).json({ message: "module not found" })
        res.status(HttpStatus.OK).json({ module: updatedModule, message: "module updated successfully" });
    } catch (error) {
        console.error("Update module error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.AdmingetCourses = async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 }).populate('teacher', 'name')
        const courseToSend = await Promise.all(
            courses.map(async (course) => {
                const teacher = await User.findById(course.teacher)
                return {
                    id: course._id,
                    courseId: course.courseId,
                    title: course.title,
                    teacher: teacher.name,
                    studentCount: course.studentsEnrolled.length || 0
                }
            })
        )
        res.status(HttpStatus.OK).json({ courses: courseToSend, message: "Courses for admin" })
    } catch (error) {
        console.error("Admin get courses error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.AdmingetCourse = async (req, res) => {
    const courseId = req.params.id
    try {
        const course = await Course.findById(courseId)
        const modules = await Module.find({ course: courseId })
        const teacher = await User.findById({ _id: course.teacher })
        const courseToSend = {
            title: course.title,
            description: course.description,
            teacher: teacher.name
        }
        if (!course) return res.status(HttpStatus.BAD_REQUEST).json({ message: "no course found" })
        console.log(course)
        res.status(HttpStatus.OK).json({ course: courseToSend, modules, message: "fetched course succesfully" })
    } catch (error) {
        console.error("delete course error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.GetAssignments = async (req, res) => {
    const courseId = req.params.id
    // console.log("course id from get assignments:",courseId)
    try {
        const assignments = await Assignment.find({ course: courseId }).populate({
            path: "course",
            select: "title"
        })
            .select("title dueDate description course submissions");
        const course = await Course.findById({ _id: courseId })
        // console.log("course:" ,course)
        if (assignments.length === 0) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: 'No assignments found for this course.', course: course.title });
        }

        const assignmentWithCourse = assignments.map(assignment => ({
            _id: assignment._id,
            title: assignment.title,
            dueDate: assignment.dueDate,
            description: assignment.description,
            course: assignment.course ? assignment.course.title : "unknown assignment",
            submissions: assignment.submissions
        }))
        res.status(HttpStatus.OK).json({ assignments: assignmentWithCourse, course: course.title });
    } catch (error) {
        console.error("get assignments error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.CreateAssignment = async (req, res) => {
    const { title, description, dueDate, courseId } = req.body
    try {
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "Course not found." });
        }
        const newAssignment = new Assignment({
            title,
            description,
            dueDate,
            course: courseId
        });
        await newAssignment.save();
        if (!course.assignments.includes(newAssignment._id)) {
            course.assignments.push(newAssignment._id)
            await course.save()
        }
        res.status(HttpStatus.OK).json({
            message: "Assignment created successfully.",
            assignment: newAssignment
        });
    } catch (error) {
        console.error("Error creating assignment:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while creating the assignment." });
    }
}

exports.EditAssignment = async (req, res) => {
    const _id = req.params.id
    const { title, description, dueDate } = req.body
    try {
        let updatedAssignment = await Assignment.findByIdAndUpdate(_id, { title, description, dueDate }, { new: true })
        if (!updatedAssignment) res.status(HttpStatus.BAD_REQUEST).json({ status: "notok", message: "assignment not found" })
        res.status(HttpStatus.OK).json({ status: "ok", assignment: updatedAssignment, message: "assignment updated successfully" });
    } catch (error) {
        console.error("Update assignment error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.DeleteAssignment = async (req, res) => {
    const Id = req.params.id
    try {
        let assignment = await Assignment.findByIdAndDelete(Id)
        if (!assignment) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "assignment not found" });
        }
        console.log("deleted assignment")
        res.status(HttpStatus.OK).json({ message: "assignment deleted successfully" })
    } catch (error) {
        console.error("delete assignment error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.addQuiz = async (req, res) => {
    const { title, courseId, questions } = req.body;
    console.log("course id from add quiz:", courseId)
    try {
        const quiz = new Quiz({
            title,
            course: courseId,
            questions
        });
        await quiz.save();
        res.status(HttpStatus.OK).json({ status: "ok", message: "Quiz created successfully" });
    } catch (error) {
        console.error("Error adding quiz:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to create quiz" });
    }
}

exports.getQuizzes = async (req, res) => {
    const courseId = req.params.id;
    console.log("course id from get Quizzes:", courseId)

    try {
        const quizzes = await Quiz.find({ course: courseId }).populate('course', 'name')
        console.log("Quizzes from get quiz:", quizzes)
        const course = await Course.findById(courseId)
        console.log("course from get Quiz:", course)
        if (!quizzes.length) {
            return res.status(HttpStatus.BAD_REQUEST).json({ status: "error", message: "No quizzes found for this course." });
        }

        res.status(HttpStatus.OK).json({ status: "ok", quizzes, courseName: course.title });
    } catch (error) {
        console.error("Error retrieving quizzes:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ status: "error", message: "Failed to retrieve quizzes." });
    }
}

exports.DeleteQuiz = async (req, res) => {
    const Id = req.params.id
    try {
        let quiz = await Quiz.findByIdAndDelete(Id)
        if (!quiz) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "quiz not found" });
        }
        console.log("deleted quiz")
        res.status(HttpStatus.OK).json({ message: "quiz deleted successfully" })
    } catch (error) {
        console.error("delete quiz error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.GetQuiz = async (req, res) => {
    const quizId = req.params.id
    try {
        const quiz = await Quiz.findById(quizId)
        if (!quiz) return res.status(404).json({ message: "quiz not found" });
        res.status(HttpStatus.OK).json({ status: "ok", quiz });
    } catch (error) {
        console.error("get quiz error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.EditQuiz = async (req, res) => {
    const quizId = req.params.id;
    const { title, questions, courseId, teacherId } = req.body;

    try {
        const updatedQuiz = await Quiz.findByIdAndUpdate(
            quizId,
            {
                title,
                questions,
                $set: { submissions: [] }
            },
            { new: true, runValidators: true }
        );

        if (!updatedQuiz) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "Quiz not found" });
        }
        const teacher = await User.findById(teacherId)
        const course = await Course.findById(courseId)
        if (!course) return res.status(HttpStatus.BAD_REQUEST).json({ message: 'course not found' })
        const message = `Quiz ${title} has been updated, Please attend again!`
        const notification = new Notification({
            course: courseId,
            message: message,
            sender: teacherId
        })
        await notification.save()

        res.status(HttpStatus.OK).json({ message: "Quiz updated successfully", quiz: updatedQuiz });
    } catch (error) {
        console.error("Error updating quiz:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.adminGetQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find().populate({
            path: "course",
            select: "title"
        })

        const quizWithCourse = quizzes.map(quiz => ({
            _id: quiz._id,
            title: quiz.title,
            questions: quiz.questions.map(q => ({
                question: q.question,
                options: q.options,
                answer: q.answer
            })),
            course: quiz.course ? quiz.course.title : "unknown course",
            submissions: quiz.submissions ? quiz.submissions.length : 0
        }))
        quizWithCourse.forEach((quiz, index) => {
            console.log(`Quiz ${index + 1} Questions:`, quiz.questions);
        })
        res.status(HttpStatus.OK).json({ status: "ok", message: "fetched quizzes", quizzes: quizWithCourse })
    } catch (error) {
        console.error("Error admin get quizzes:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.adminDeleteQuiz = async (req, res) => {
    const Id = req.params.id
    try {
        let quiz = await Quiz.findByIdAndDelete(Id)
        if (!quiz) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "quiz not found" });
        }
        console.log("deleted quiz")
        res.status(HttpStatus.OK).json({ message: "quiz deleted successfully" })
    } catch (error) {
        console.error("delete quiz error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.adminGetAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find().populate({
            path: "course",
            select: "title"
        })

        const assignmentWithCourse = assignments.map(assignment => ({
            _id: assignment._id,
            title: assignment.title,
            deadline: assignment.dueDate,
            course: assignment.course ? assignment.course.title : "unknown assignment"
        }))

        if (assignmentWithCourse.length === 0) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: 'No assignments found.' });
        }
        res.status(HttpStatus.OK).json({ status: 'ok', assignments: assignmentWithCourse });
    } catch (error) {
        console.error("get assignments error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.adminDeleteAssignment = async (req, res) => {
    const Id = req.params.id
    try {
        let assignment = await Assignment.findByIdAndDelete(Id)
        if (!assignment) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "assignment not found" });
        }
        console.log("deleted assignment")
        res.status(HttpStatus.OK).json({ message: "assignment deleted successfully" })
    } catch (error) {
        console.error("delete assignment error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.studentEnrollment = async (req, res) => {
    const { courseId, studentId } = req.body
    // console.log("course id from student enrollment:", courseId)
    // console.log("student id from student enrollment:", studentId)
    try {
        const student = await User.findById(studentId)
        const course = await Course.findById(courseId)
        if (!student || !course) return res.status(HttpStatus.BAD_REQUEST).json({ message: "Course or student not found" })

        if (!course.studentsEnrolled.includes(studentId)) {
            course.studentsEnrolled.push(studentId)
            await course.save()
        }
        if (!student.enrolledCourses.includes(courseId)) {
            student.enrolledCourses.push(courseId)
            await student.save()
        }
        res.status(HttpStatus.OK).json({ message: "student enrollment success" })
    } catch (error) {
        console.error("student enrollement error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.studentGetAssignments = async (req, res) => {
    const studentId = req.params.id;
    const { page = 1, limit = 6 } = req.query

    try {
        const student = await User.findById(studentId).populate('enrolledCourses');

        if (!student) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Student not found' });
        }

        const courseIds = student.enrolledCourses.map(course => course._id);

        const totalAssignments = await Assignment.countDocuments({ course: { $in: courseIds } });

        const assignments = await Assignment.find({ course: { $in: courseIds } })
            .populate({
                path: "course",
                select: "title"
            })
            .select("title dueDate description course submissions")
            .skip((page - 1) * limit)
            .limit(parseInt(limit))

        const assignmentWithCourse = assignments.map(assignment => ({
            _id: assignment._id,
            title: assignment.title,
            deadline: assignment.dueDate,
            description: assignment.description,
            course: assignment.course ? assignment.course.title : "unknown assignment",
            submissions: assignment.submissions
        }));

        res.status(HttpStatus.OK).json({
            message: "Fetched the assignments",
            assignments: assignmentWithCourse,
            totalAssignments,
            totalPages: Math.ceil(totalAssignments / limit),
            currentPage: parseInt(page),
        });
    } catch (error) {
        console.error("Error fetching assignments:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
};


exports.studentsubmitAssignment = async (req, res) => {
    const assignmentId = req.params.id
    const studentId = req.body.studentId;
    try {
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Assignment not found' });
        }
        const currentDate = new Date();
        const dueDate = new Date(assignment.dueDate);

        if (currentDate > dueDate) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: 'The assignment due date has passed. You cannot submit the assignment.' });
        }

        if (!req.file) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: 'File is required for submission' });
        }

        assignment.submissions.push({
            student: studentId,
            filePath: req.file.path
        });

        await assignment.save();

        res.status(HttpStatus.OK).json({ message: 'Assignment submitted successfully' });
    } catch (error) {
        console.error('Error submitting assignment:', error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
    }
};

exports.studentGetQuizzes = async (req, res) => {
    const studentId = req.params.id;
    console.log("Student ID from get quizzes:", studentId);

    try {
        const student = await User.findById(studentId).populate('enrolledCourses');
        if (!student) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Student not found' });
        }
        const courseIds = student.enrolledCourses.map(course => course._id);
        const quizzes = await Quiz.find({ course: { $in: courseIds } })
            .populate({
                path: "course",
                select: "title"
            });
        const quizWithCourse = quizzes.map(quiz => {
            const studentSubmission = quiz.submissions.find(sub => String(sub.student) === String(studentId));
            return {
                _id: quiz._id,
                title: quiz.title,
                questions: quiz.questions.map(q => ({
                    question: q.question,
                    options: q.options,
                    answer: q.answer
                })),
                course: quiz.course ? quiz.course.title : "unknown course",
                alreadySubmitted: Boolean(studentSubmission),
                numberOfQuestions: quiz.questions.length,
                score: studentSubmission ? studentSubmission.score : null,
                submissions: quiz.submissions.length
            };
        });
        console.log("Quiz data for student:", quizWithCourse);
        res.status(HttpStatus.OK).json({ message: "Fetched the quizzes", quizzes: quizWithCourse });
    } catch (error) {
        console.error("Error fetching quizzes:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
};

exports.enrolledCourses = async (req, res) => {
    const userId = req.params.id
    try {
        const student = await User.findById(userId).populate('enrolledCourses')
        if (!student) return res.status(HttpStatus.BAD_REQUEST).json({ message: "user not found" })
        const courseIds = student.enrolledCourses.map(course => course._id)
        const enrolledCourses = student.enrolledCourses
        console.log("enrolled course:", enrolledCourses)
        res.status(HttpStatus.OK).json({ courses: enrolledCourses, message: "fetched enrolled courses" })
    } catch (error) {
        console.error("Error fetching enrolled courses:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.SubmitQuiz = async (req, res) => {
    const { userId, quizId, score } = req.body;
    try {

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Quiz not found' });
        }

        const submission = {
            student: userId,
            score: score,
            submittedAt: new Date()
        };
        console.log("submission data:", submission)

        quiz.submissions.push(submission);

        await quiz.save();

        res.status(HttpStatus.OK).json({ message: 'Quiz submitted successfully', submission });
    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to submit quiz' });
    }
}

exports.getClasses = async (req, res) => {
    const courseId = req.params.id
    try {
        const classes = await Class.find({ course: courseId });
        if (classes.length === 0) return res.status(HttpStatus.BAD_REQUEST).json({ message: "No classes found" })
        res.status(HttpStatus.OK).json({ status: 'ok', classes });
    } catch (error) {
        console.log(error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ status: 'error', message: 'Failed to fetch classes' });
    }
}

exports.createClass = async (req, res) => {
    const { courseId, title, date, time, duration, teacherId } = req.body;

    try {
        const newClass = new Class({
            course: courseId,
            title,
            date,
            time,
            duration,
            teacher: teacherId,
        })
        console.log("new class:", newClass)

        await newClass.save();
        res.status(HttpStatus.OK).json({ status: 'ok', message: 'Class added successfully' });
    } catch (error) {
        console.error(error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ status: 'error', message: 'Failed to add class' });
    }
}

exports.studentGetClasses = async (req, res) => {
    const studentId = req.params.id
    // console.log("student id from get classes:", studentId)
    try {
        const student = await User.findById(studentId).populate('enrolledCourses');

        if (!student) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Student not found' });
        }

        const courseIds = student.enrolledCourses.map(course => course._id);

        const classes = await Class.find({ course: { $in: courseIds }, status: { $ne: "Ended" } })
            .populate({
                path: "course",
                select: "title"
            })
            .select("title course time date peerId status");

        // console.log("classes:",classes)
        const ClassWithCourse = classes.map(cls => ({
            _id: cls._id,
            title: cls.title,
            date: cls.date,
            time: cls.time,
            course: cls.course ? cls.course.title : "unknown assignment",
            peerId: cls.peerId,
            status: cls.status
        }))
        // console.log("classwithcourse for student:", ClassWithCourse);
        res.status(HttpStatus.OK).json({ message: "fetched the classes", classes: ClassWithCourse });
    } catch (error) {
        console.error("Error fetching classes:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.sendNotification = async (req, res) => {
    const { courseId, userId, message } = req.body
    try {
        const teacher = await User.findById(userId)
        const course = await Course.findById(courseId)
        if (!course) return res.status(HttpStatus.BAD_REQUEST).json({ message: 'course not found' })
        const notification = new Notification({
            course: courseId,
            message: message,
            sender: userId
        })
        await notification.save()
        // io.to(courseId).emit('new-notification', notification)
        res.status(HttpStatus.OK).json({ message: 'Notification sent successfully', notification })
    } catch (error) {
        console.error("Error sending notification:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
    }
}

exports.getNotifications = async (req, res) => {
    const studentId = req.params.id;

    try {
        const student = await User.findById(studentId).populate('enrolledCourses', '_id');

        if (!student) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Student not found' });
        }

        const courseIds = student.enrolledCourses.map(course => course._id);

        const notifications = await Notification.find({
            course: { $in: courseIds }
        })
            .populate('course', 'title')
            .populate('sender', 'name')
            .sort({ createdAt: -1 });

        const mappedNotifications = notifications.map(notification => ({
            ...notification.toObject(),
            isRead: notification.read.includes(studentId),
        }));

        // console.log(mappedNotifications)
        res.status(HttpStatus.OK).json({
            notifications: mappedNotifications,
            message: 'Fetched notifications successfully',
        });
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
    }
};

exports.markNotificationsAsRead = async (req, res) => {
    const { notificationIds, studentId } = req.body;

    try {
        await Notification.updateMany(
            { _id: { $in: notificationIds } },
            { $addToSet: { read: studentId } }
        );

        res.status(HttpStatus.OK).json({ message: 'Notifications marked as read' });
    } catch (error) {
        console.error('Error marking notifications as read:', error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
    }
};

exports.addClassPeerId = async (req, res) => {
    const classId = req.params.id;
    const { peerId } = req.body;
    console.log("peer id", peerId)
    try {
        // Find the class by its ID and update the peerId
        const updatedClass = await Class.findByIdAndUpdate(
            classId,
            { peerId, status: "Started" },
            { new: true, runValidators: true }
        );
        console.log("peer id updated")

        // If the class with the provided ID is not found
        if (!updatedClass) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "Class not found" });
        }

        const course = await Course.findById(updatedClass.course);
        // console.log("course from addclasspeerid:",course)
        if (!course) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "Course not found" });
        }

        const notificationMessage = `${course.title} - Live class started`;

        const notification = new Notification({
            course: updatedClass.course,
            message: notificationMessage,
            sender: updatedClass.teacher,
        });

        await notification.save();

        res.status(HttpStatus.OK).json({ message: "Class updated successfully and notification sent", class: updatedClass, notification });
    } catch (error) {
        console.error("Error updating class:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
};

exports.EditClass = async (req, res) => {
    const classId = req.params.id;
    const { title, time, date, duration, status } = req.body;

    try {
        const updatedClass = await Class.findByIdAndUpdate(
            classId,
            { title, time, date, duration, status },
            { new: true, runValidators: true }
        );

        if (!updatedClass) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "class not found" });
        }

        res.status(HttpStatus.OK).json({ status: "ok", message: "class updated successfully" });
    } catch (error) {
        console.error("Error updating class:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
};

exports.deleteClass = async (req, res) => {
    const ClassId = req.params.id
    try {
        let classToDelete = await Class.findByIdAndDelete(ClassId)
        if (!classToDelete) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: "class not found" });
        }
        console.log("deleted class")
        res.status(HttpStatus.OK).json({ status: "ok", message: "class deleted successfully" })
    } catch (error) {
        console.error("delete class error:", error.message);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
}

exports.getAssignmentSubmissions = async (req, res) => {
    try {
        const assId = req.params.id
        const assignment = await Assignment.findById(assId)
            .populate('submissions.student', 'name');

        if (!assignment) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Assignment not found' });
        }

        const submissions = assignment.submissions.map(submission => ({
            name: submission.student.name,
            filePath: submission.filePath,
            submittedAt: submission.submittedAt,
        }))

        res.status(HttpStatus.OK).json({ submissions });
    } catch (error) {
        console.error(error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
    }
}

exports.getQuizSubmissions = async (req, res) => {
    try {
        const quizId = req.params.id;

        const quiz = await Quiz.findById(quizId).populate('submissions.student', 'name');

        if (!quiz) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Quiz not found' });
        }

        const submissions = quiz.submissions.map(submission => ({
            name: submission.student.name,
            score: submission.score,
            submittedAt: submission.submittedAt,
        }));

        res.status(HttpStatus.OK).json({ submissions });
    } catch (error) {
        console.error(error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
    }
};

exports.getCourseStudents = async (req, res) => {
    const courseId = req.params.id
    try {
        const course = await Course.findById(courseId).populate("studentsEnrolled")

        if (!course) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Course not found' });
        }

        return res.status(HttpStatus.OK).json({
            students: course.studentsEnrolled
        });
    } catch (error) {
        console.error(error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
    }
}

exports.sendEmailNotification = async (req, res) => {
    const { courseId, message } = req.body

    try {
        const course = await Course.findById(courseId).populate('studentsEnrolled');
        if (!course) return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Course not found' });

        const studentEmails = course.studentsEnrolled.map(student => student.email);

        const emailPromises = studentEmails.map(email =>
            sendEmail(email, ` Notification from ${course.title}`, message)
        );

        const results = await Promise.allSettled(emailPromises);

        const failedEmails = results.filter(result => result.status === 'rejected');

        if (failedEmails.length > 0) {
            console.error('Failed to send emails to some recipients:', failedEmails);
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: 'Some emails failed to send.',
                failedCount: failedEmails.length,
            });
        }
        console.log("email notification sent succesfully")
        res.status(HttpStatus.OK).json({ message: 'Email notifications sent successfully!' });
    } catch (error) {
        console.error('Error sending email notifications:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Failed to send email notifications.' });
    }
}

exports.updateClassStatusToEnded = async (req, res) => {
    const classId = req.params.id
    try {
        const selectedClass = await Class.findById(classId)
        selectedClass.status = "Ended"
        await selectedClass.save()
        res.status(HttpStatus.OK).json({ message: "Class Status updated" })
    } catch (error) {
        console.error('Error setting class status as ended:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Error setting class status as ended.' });
    }
}

exports.dashboardData = async (req, res) => {
    try {
        const userCount = await User.countDocuments()
        const courseCount = await Course.countDocuments()

        res.status(HttpStatus.OK).json({ userCount, courseCount })
    } catch (error) {
        console.error('Error getting dashboard data:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Error getting dashboard data.' });
    }
}

exports.getModuleData = async (req, res) => {
    const moduleId = req.params.id
    try {
        const moduleData = await Module.findById(moduleId)
        if (!moduleData) return res.status(HttpStatus.BAD_REQUEST).json({ message: "No module found" })
        res.status(HttpStatus.OK).json({ message: "Fetched module data", module: moduleData })
    } catch (error) {
        console.error('Error getting dashboard data:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Error getting dashboard data.' });
    }
}