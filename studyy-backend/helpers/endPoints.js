const Endpoints = {
    AUTH: {
        SIGNUP: `/signup`,
        VERIFY_OTP: `/verify-otp`,
        RESEND_OTP: `/resend-otp`,
        LOGIN: `/login`,
        USER_INFO: '/get-user-info',
        AUTH_GOOGLE: `/auth/google`,
        GOOGLE_CALLBACK: `/auth/google/callback`,
        SELECT_ROLE: `/select-role/:token`,
        FORGOT_PASSWORD: `/forgot-password`,
        RESET_PASSWORD: `/reset-password/:token`,
        CHANGE_PASSWORD: `/change-password/:id`,
        EDIT_PROFILE: `/edit-profile/:id`,
        GET_PROFILE_DATA: `/get-profile-data/:id`,
    },
    TEACHER: {
        CREATE_COURSE: `/create`,
        GET_COURSES: `/get-courses`,
        DELETE_COURSE: `/teacher-delete-course/:id`,
        GET_COURSE: `/get-course/:id`,
        EDIT_COURSE: `/teacher-edit-course/:id`,
        ADD_MODULE: `/teacher-add-module`,
        DELETE_MODULE: `/teacher-delete-module/:id`,
        EDIT_MODULE: `/teacher-edit-module/:id`,
        GET_MODULE_DATA: `/get-module-data/:id`,
        CREATE_ASSIGNMENT: `/create-assignment`,
        GET_ASSIGNMENTS: `/get-assignments/:id`,
        EDIT_ASSIGNMENT: `/teacher-edit-assignment/:id`,
        DELETE_ASSIGNMENT: `/teacher-delete-assignment/:id`,
        ADD_QUIZ: `/add-quiz`,
        GET_QUIZZES: `/get-quizzes/:id`,
        DELETE_QUIZ: `/teacher-delete-quiz/:id`,
        GET_QUIZ: `/get-quiz/:id`,
        EDIT_QUIZ: `/teacher-edit-quiz/:id`,
        GET_CLASSES: `/teacher-get-classes/:id`,
        ADD_CLASS: `/add-class`,
        EDIT_CLASS: `/teacher-edit-class/:id`,
        DELETE_CLASS: `/teacher-delete-class/:id`,
        GET_ASSIGNMENT_SUBMISSION: `/get-assignment-submissions/:id`,
        GET_QUIZ_SUBMISSION: `/get-quiz-submissions/:id`,
        GET_COURSE_STUDENTS: `/get-course-students/:id`,
        SEND_NOTIFICATION: `/send-notification`,
        ADD_PEER_ID: `/add-peerid/:id`,
        SEND_EMAIL_NOTIFICATION: `/send-email-notification`,
        UPDATE_CLASS_STATUS: `/update-class-status/:id`,
    },
    ADMIN: {
        GET_USERS: `/get-users`,
        GET_TEACHERS: `/get-teachers`,
        DELETE_USER: `/admin-delete-user/:id`,
        BLOCK_USER: `/admin-block-user/:id`,
        VERIFY_TEACHER: `/admin-verify-teacher/:id`,
        GET_COURSES: `/admin-get-courses`,
        GET_COURSE: `/admin-get-course/:id`,
        GET_QUIZZES: `/admin-get-quizzes`,
        DELETE_QUIZ: `/admin-delete-quiz/:id`,
        GET_ASSIGNMENTS: `/admin-get-assignments`,
        DELETE_ASSIGNMENT: `/admin-delete-assignment/:id`,
    },
    STUDENT: {
        ENROLL: `/student-enroll`,
        ENROLLED_COURSES: `/enrolled-courses/:id`,
        GET_ASSIGNMENTS: `/student-get-assignments/:id`,
        SUBMIT_ASSIGNMENT: `/submit-assignment/:id`,
        GET_QUIZZES: `/student-get-quizzes/:id`,
        SUBMIT_QUIZ: `/student-submit-quiz`,
        GET_CLASSES: `/student-get-classes/:id`,
        GET_NOTIFICATIONS: `/get-notifications/:id`,
        MARK_NOTIFICATIONS_AS_READ: `/mark-notifications-as-read`,
        GET_COURSES: `/home-get-courses/:id`,
    },

};

module.exports = Endpoints;
