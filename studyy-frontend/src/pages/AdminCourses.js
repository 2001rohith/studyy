import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar2 from '../components/Sidebar2';

function AdminCourses() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [coursePerPage] = useState(5);
  const [courseID, setCourseID] = useState('');
  const [currentCourses, setCurrentCourses] = useState([]);

  const getCourses = async () => {
    try {
      const response = await fetch("http://localhost:8000/course/admin-get-courses", {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.status === "ok") {
        setCourses(data.courses);
        setAllCourses(data.courses);
        setLoading(false);
      } else {
        setError('No courses or failed to fetch!');
        setLoading(false);
      }
    } catch (error) {
      console.log("Error in fetching courses:", error);
      setError('Server error, please try again later');
      setLoading(false);
    }
  };

  useEffect(() => {
    getCourses();
  }, []);

  useEffect(() => {
    const indexOfLastCourse = currentPage * coursePerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursePerPage;
    
    if (courseID === '') {
      setCurrentCourses(allCourses.slice(indexOfFirstCourse, indexOfLastCourse));
    } else {
      const filteredCourses = allCourses.filter(course =>
        course.courseId.toLowerCase().includes(courseID.toLowerCase())
      );
      setCurrentCourses(filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse));
    }
  }, [allCourses, currentPage, courseID, coursePerPage]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      const response = await fetch(`http://localhost:8000/course/teacher-delete-course/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        alert("Course deleted successfully");
        setCourses(courses.filter(course => course.id !== id));
      } else {
        alert("Failed to delete course");
      }
    } catch (error) {
      console.log("Error in deleting course:", error);
    }
  };

  const handleView = (id) => {
    navigate("/admin-view-course", { state: { id } });
  };

  return (
    <div className='row'>
      <div className='col text-light side-bar'>
        <Sidebar2 />
      </div>
      <div className='col text-light'>
        <div className='row headers'>
          <h4>Courses</h4>
        </div>

        <div className='row table-content text-dark'>
          <div className='search-bar'>
            <input
              type="text"
              placeholder="Search by courseId..."
              value={courseID}
              onChange={(e) => setCourseID(e.target.value)}
            />
            <button className='btn search-bar-button' onClick={() => setCourseID('')}>Clear</button>
          </div>
          {loading ? (
            <div className="spinner-border text-primary spinner" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : error ? (
            <p className='ms-2'>{error}</p>
          ) : (
            <table className="table table-default table-hover table-responsive table-striped-columns table-borderless mt-2">
              <thead>
                <tr>
                  <th>#</th>
                  <th>CourseId</th>
                  <th>Title</th>
                  <th>Students</th>
                  <th>Teacher</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCourses.map((course, index) => (
                  <tr key={course.id}>
                    <td>{index + 1}</td>
                    <td>{course.courseId}</td>
                    <td>{course.title}</td>
                    <td>{course.studentCount}</td>
                    <td>{course.teacher}</td>
                    <td>
                      <button className='btn table-button mx-1' onClick={() => handleView(course.id)}>View</button>
                      <button className='btn table-button mx-1' onClick={() => handleDelete(course.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <nav>
            <ul className="pagination">
              {Array.from({ length: Math.ceil(allCourses.length / coursePerPage) }, (_, i) => (
                <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button onClick={() => paginate(i + 1)} className="page-link">
                    {i + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default AdminCourses;
