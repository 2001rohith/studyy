import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import StudentSidebar from '../components/StudentSidebar'
// const navigate = useNavigate()

function StudentAllCourses() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'));
  const [loading, setLoading] = useState(true)
  const [newCourses, setNewCourses] = useState([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    const newCourse = async () => {
      try {
        const response = await fetch(`http://localhost:8000/course/home-get-courses/${user.id}`, {
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

  const viewCourse = (id) => {
    navigate("/student-check-course", { state: { courseId: id } })
  }

  const filteredCourses = newCourses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase()) ||
    course.description.toLowerCase().includes(search.toLowerCase())
  );


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
            <h4>Courses</h4>
          </div>
          <div className='row table-content'>
            <div className='search-bar ms-1 border-bottom pb-3'>
              <input
                type="text"
                placeholder="Search course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className='btn search-bar-button' onClick={() => setSearch('')}>Clear</button>
            </div>
            <div className="row mt-3 text-dark">
              <h5 className='mb-3'>Our courses!</h5>
              <div className="scroll-container">
                {filteredCourses.length === 0 ? (
                  <p>There is no courses</p>
                ) : (
                  filteredCourses.map((course) => (
                    <div className="card course-card mx-2" style={{ width: '20rem', height: "25rem" }} key={course._id}>
                      <img src="/course-card1.jpg" className="card-img-top" alt="..." style={{ height: '200px', objectFit: 'cover', borderRadius: "15px" }} />
                      <div className="card-body">
                        <h5 className="card-title">{course.title}</h5>
                        <small className="card-text mb-1">{course.description}</small>
                        <div className='text-center'>
                          <button className="btn button mt-5" onClick={() => viewCourse(course._id)}>More</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>


          </div>

        </div>
      </div>
    </>
  )
}

export default StudentAllCourses
