import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentSidebar from '../components/StudentSidebar'
import axios from 'axios';
import API_URL from '../../axiourl';
import { useUser } from "../../UserContext"

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

function StudentAllCourses() {
  const navigate = useNavigate()
  const { user,token } = useUser();
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newCourses, setNewCourses] = useState([])
  const [search, setSearch] = useState("")

  useEffect(() => {

    const newCourse = async () => {
      try {
        if (!user || !user.id) {
          setError('User information not found')
          navigate("/", { replace: true })
          return
        }

        const response = await apiClient.get(`/course/home-get-courses/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          const data = response.data;
          setNewCourses(data.courses || [])
        }
      } catch (error) {
        console.error("Error in fetching courses:", error)
        setError(error.response?.data?.message || 'Failed to fetch courses')
      } finally {
        setLoading(false)
      }
    }
    newCourse()
  }, [])

  const viewCourse = (id) => {
    navigate("/student-check-course", { state: { courseId: id } })
  }

  const filteredCourses = newCourses?.filter((course) =>
    course?.title?.toLowerCase().includes(search.toLowerCase()) ||
    course?.description?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="spinner-border text-primary spinner2" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    )
  }

  return (
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
            <button
              className='btn search-bar-button'
              onClick={() => setSearch('')}
              disabled={!search}
            >
              Clear
            </button>
          </div>
          <div className="row mt-3 text-dark">
            <h5 className='mb-3'>Our courses!</h5>
            <div className="scroll-container">
              {newCourses.length === 0 ? (
                <div className="alert alert-info" role="alert">
                  No courses available at the moment. Please check back later.
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="alert alert-info" role="alert">
                  No courses match your search criteria.
                </div>
              ) : (
                filteredCourses.map((course) => (
                  <div
                    className="card course-card mx-2"
                    style={{ width: '20rem', height: "25rem" }}
                    key={course._id}
                  >
                    <img
                      src="/course-card1.jpg"
                      className="card-img-top"
                      alt="Course thumbnail"
                      style={{ height: '200px', objectFit: 'cover', borderRadius: "15px" }}
                    />
                    <div className="card-body">
                      <h5 className="card-title">{course.title}</h5>
                      <small className="card-text mb-1">{course.description}</small>
                      <div className='text-center'>
                        <button
                          className="btn button mt-5"
                          onClick={() => viewCourse(course._id)}
                        >
                          More
                        </button>
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
  )
}

export default StudentAllCourses