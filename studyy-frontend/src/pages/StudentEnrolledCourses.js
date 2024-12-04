import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import StudentSidebar from '../components/StudentSidebar'
// const navigate = useNavigate()

function StudentEnrolledCourses() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'));
  const [loading, setLoading] = useState(true)
  const [newCourses, setNewCourses] = useState([])

  useEffect(() => {
    const newCourse = async () => {
      try {
        const response = await fetch(`http://localhost:8000/course/enrolled-courses/${user.id}`, {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        let data = await response.json()
        setNewCourses(data.courses)
        setLoading(false)
      } catch (error) {
        console.log("error in fetching teachers from admin", error)
      }
    }
    newCourse()
  }, [])

const viewCourse = (id)=>{
  navigate("/student-view-course",{state:{courseId:id}})
}

if (loading) {
  return <div className="spinner-border text-primary spinner2" role="status">
      <span className="visually-hidden">Loading...</span>
  </div>
}
  return (
    <>
      <div className='row'>
        <div className='col text-light side-bar'>
          <StudentSidebar />
        </div>
        <div className='col text-dark'>
          <div className='row headers'>
            <h4>My-Courses</h4>
          </div>
          <div className='row content'>
            <div className="row mt-3 text-dark">
              <h5 className='mb-3'>Enrolled Courses</h5>
              <div className="scroll-container">
                {newCourses.map((course) => (
                  <div className="card course-card mx-2" style={{ width: '20rem',height:"25rem" }} key={course._id}>
                    <img src="/course-card1.jpg" className="card-img-top" alt="..." style={{ height: '200px', objectFit: 'cover',borderRadius:"15px" }} />
                    <div className="card-body">
                      <h5 className="card-title">{course.title}</h5>
                      <small className="card-text mb-1">{course.description}</small>
                      <div className='text-center'>
                      <button className="btn button mt-5" onClick={()=>viewCourse(course._id)}>View</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>


          </div>

        </div>
      </div>
    </>
  )
}

export default StudentEnrolledCourses
