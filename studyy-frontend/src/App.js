import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import SignUp from "./pages/SignUp"
import Login from './pages/Login';
import Otp from './pages/Otp';
import SelectRole from './pages/SelectRole';
import TeacherHome from './pages/TeacherHome';
import StudentHome from './pages/StudentHome';
import AdminHome from './pages/AdminHome';
import AdminEditUser from './pages/AdminEditUser';
import AdminTeachers from './pages/AdminTeachers';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TeacherStudents from './pages/TeacherStudents';
import TeacherAddCourse from './pages/TeacherAddCourse';
import TeacherViewCourse from './pages/TeacherViewCourse';
import TeacherEditCourse from './pages/TeacherEditCourse';
import TeacherCourses from './pages/TeacherCourses';
import TeacherAddModule from './pages/TeacherAddModule';
import AdminUnverifiedTeachers from './pages/AdminUnverifiedTeachers';
import TeacherEditModule from './pages/TeacherEditModule';
import TeacherAddModuleForEdit from './pages/TeacherAddModuleForEdit';
import StudentAllCourses from './pages/StudentAllCourses';
import AdminStudents from './pages/AdminStudents';
import AdminCourses from './pages/AdminCourses';
import AdminViewCourse from './pages/AdminViewCourse';
import TeacherAssignmentsCourses from './pages/TeacherAssignmentCourse';
import TeacherAssignments from './pages/TeacherAssignments';
import TeacherAddAssignment from './pages/TeacherAddAssignment';
import TeacherEditAssignment from './pages/TeacherEditAssignment';
import TeacherQuizCourses from './pages/TeacherQuizCourse';
import TeacherQuizzes from './pages/TeacherQuizzes';
import TeacherAddQuiz from './pages/TeacherAddQuiz';
import TeacherEditQuiz from './pages/TeacherEditQuiz';
import TeacherProfile from './pages/TeacherProfile';
import AdminQuizzes from './pages/AdminQuizzes';
import AdminViewQuiz from './pages/AdminViewQuiz';
import AdminAssignments from './pages/AdminAssignments';
import StudentCheckCourse from './pages/StudentCheckCourse';
import StudentAllAssignments from './pages/StudentAllAssignments';
import StudentAllQuizzes from './pages/StudentAllQuizzes';
import StudentEnrolledCourses from './pages/StudentEnrolledCourses';
import StudentViewCourse from './pages/StudentViewCourse';
import StudentProfile from './pages/StudentProfile';
import StudentAttendQuiz from './pages/StudentAttendQuiz';
import TeacherLiveClass from './pages/TeacherLiveClass';
import TeacherLiveClassesCourses from './pages/TeacherLiveClassesCourse';
import TeacherLiveClasses from './pages/TeacherLiveClasses';
import TeacherAddLiveClass from './pages/TeacherAddLiveClass';
import StudentClasses from './pages/StudentClasses';
import StudentLiveClass from './pages/StudentLiveClass';
import TeacherEditClass from './pages/TeacherEditClass';


function App() {
  // useEffect(() => {
  //   const handlePopState = () => {
  //     const token = localStorage.getItem('token');
  //     if (!token) {
  //       navigate("/", { replace: true });
  //     }
  //   };

  //   window.addEventListener("popstate", handlePopState);

  //   return () => {
  //     window.removeEventListener("popstate", handlePopState);
  //   };
  // }, [navigate]);
  return (
    <>
      <Router>
        <Routes>
          <Route path='/Signup' element={
            <>
              <SignUp />
            </>
          } />
          <Route path='/' element={
            <Login />
          } />
          <Route path='/otp' element={
            <Otp />
          } />
          <Route path='/select-role' element={
            <>
              <SelectRole />
            </>
          } />
          <Route path='/admin-home' element={
            <>
              <AdminHome />
            </>
          } />
          <Route path='/admin-edit-user' element={
            <>
              <AdminEditUser />
            </>
          } />
          <Route path='/admin-teachers' element={
            <>
              <AdminTeachers />
            </>
          } />
          <Route path='/admin-courses' element={
            <>
              <AdminCourses />
            </>
          } />
          <Route path='/admin-assignments' element={
            <>
              <AdminAssignments />
            </>
          } />
          <Route path='/admin-quizzes' element={
            <>
              <AdminQuizzes />
            </>
          } />
          <Route path='/admin-view-course' element={
            <>
              <AdminViewCourse />
            </>
          } />
          <Route path='/admin-view-quiz' element={
            <>
              <AdminViewQuiz />
            </>
          } />
          <Route path='/teacher-home' element={
            <>
              <TeacherHome />
            </>
          } />
          <Route path='/teacher-view-assignment-courses' element={
            <>
              <TeacherAssignmentsCourses />
            </>
          } />
          <Route path='/teacher-view-assignments' element={
            <>
              <TeacherAssignments />
            </>
          } />
          <Route path='/teacher-add-assignment' element={
            <>
              <TeacherAddAssignment />
            </>
          } />
          <Route path='/teacher-edit-assignment' element={
            <>
              <TeacherEditAssignment />
            </>
          } />
          <Route path='/teacher-view-quiz-courses' element={
            <>
              <TeacherQuizCourses />
            </>
          } />
          <Route path='/teacher-view-quizzes' element={
            <>
              <TeacherQuizzes />
            </>
          } />
          <Route path='/teacher-add-quiz' element={
            <>
              <TeacherAddQuiz />
            </>
          } />
          <Route path='/teacher-edit-quiz' element={
            <>
              <TeacherEditQuiz />
            </>
          } />
          <Route path='/teacher-view-profile' element={
            <>
              <TeacherProfile />
            </>
          } />
          {/* <Route path='/admin-students' element={
            <>
             <AdminStudents/>
            </>
          } /> */}
          {/* <Route path='/admin-unverified-teachers' element={
            <>
             <AdminUnverifiedTeachers/>
            </>
          } /> */}
          <Route path='/forgot-password' element={
            <>
              <ForgotPassword />
            </>
          } />
          <Route path='/reset-password/:token' element={
            <>
              <ResetPassword />
            </>
          } />
          {/* <Route path='/teacher-students' element={
            <>
             <TeacherStudents/>
            </>
          } /> */}
          <Route path='/teacher-view-courses' element={
            <>
              <TeacherCourses />
            </>
          } />
          <Route path='/teacher-add-course' element={
            <>
              <TeacherAddCourse />
            </>
          } />
          <Route path='/teacher-view-course' element={
            <>
              <TeacherViewCourse />
            </>
          } />
          <Route path='/teacher-edit-course' element={
            <>
              <TeacherEditCourse />
            </>
          } />
          <Route path='/teacher-add-module' element={
            <>
              <TeacherAddModule />
            </>
          } />
          <Route path='/teacher-edit-course-add-module' element={
            <>
              <TeacherAddModuleForEdit />
            </>
          } />
          <Route path='/teacher-edit-module' element={
            <>
              <TeacherEditModule />
            </>
          } />
          <Route path='/teacher-view-class-course' element={
            <>
              <TeacherLiveClassesCourses />
            </>
          } />
          <Route path='/teacher-view-classes' element={
            <>
              <TeacherLiveClasses />
            </>
          } />
          <Route path='/add-live-class' element={
            <>
              <TeacherAddLiveClass />
            </>
          } />
          <Route path='/teacher-live-class' element={
            <>
              <TeacherLiveClass />
            </>
          } />
          <Route path='/edit-class' element={
            <>
              <TeacherEditClass />
            </>
          } />
          <Route path='/student-home' element={
            <>
              <StudentHome />
            </>
          } />
          <Route path='/student-view-courses' element={
            <>
              <StudentAllCourses />
            </>
          } />
          <Route path='/student-check-course' element={
            <>
              <StudentCheckCourse />
            </>
          } />
          <Route path='/student-enrolled-courses' element={
            <>
              <StudentEnrolledCourses />
            </>
          } />
          <Route path='/student-view-course' element={
            <>
              <StudentViewCourse />
            </>
          } />
          <Route path='/student-view-assignments' element={
            <>
              <StudentAllAssignments />
            </>
          } />
          <Route path='/student-view-classes' element={
            <>
              <StudentClasses />
            </>
          } />
          <Route path='/student-view-quizzes' element={
            <>
              <StudentAllQuizzes />
            </>
          } />
          <Route path='/attend-quiz' element={
            <>
              <StudentAttendQuiz />
            </>
          } />
          <Route path='/student-view-profile' element={
            <>
              <StudentProfile />
            </>
          } />
          <Route path='/join-class' element={
            <>
              <StudentLiveClass />
            </>
          } />
        </Routes>
      </Router>
    </>
  );
}

export default App;
