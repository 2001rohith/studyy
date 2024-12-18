import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import TeacherSidebar from '../components/TeacherSidebar'
import axios from 'axios';
import API_URL from '../../axiourl';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

function TeacherProfile() {
    const navigate = useNavigate()
    // const location = useLocation()
    const User = JSON.parse(localStorage.getItem('user'));
    console.log("user from localstorage:", User)
    const [userId, setUserId] = useState(User.id)
    console.log("user id:", userId)
    const [user, setUser] = useState()
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState('')
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [courses, setCourses] = useState([])
    const [error, setError] = useState(null)


    const getProfileData = async () => {
        try {
            const response = await apiClient.get(`/user/get-profile-data/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            })
            const data = response.data;
            if (response.status === 200) {
                setUser(data.user)

            }
        } catch (error) {
            console.log("error in fetching profile data", error)
            setError('Server error, please try again later')
        }
    }
    useEffect(() => {
        getProfileData();
    }, []);

    const getCourses = async () => {
        try {

            const response = await apiClient.get(`/course/get-courses`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            const data = response.data;
            if (response.status === 200) {
                setCourses(data.courses)
            } else {
                setError('No courses or failed to fetch!')
            }

        } catch (error) {
            console.log("error in fetching courses for teacher", error)
            setError('Server error, please try again later')
        }
    }

    useEffect(() => {
        getCourses()
    }, [])

    const setPassword = async (e) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            setMessage("New password and confirm password mismatch!")
            return
        }
        try {

            const response = await apiClient.post(`/user/change-password/${user._id}`, {
                currentPassword,
                newPassword,
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            const data = response.data;
            setMessage(data.message)
            if (response.status === 200) {
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
                setTimeout(() => {
                    closeModal()
                }, 2000)
            } else {
                setMessage(data.message || 'Password change failed.');
            }
        } catch (error) {
            setMessage('Server error. Please try again later.');
        }
    }

    const editProfile = async (e) => {
        e.preventDefault()
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        try {
            if (!trimmedName) {
                setMessage("Enter the name")
                return
            }
            if (trimmedName.length < 2) {
                setMessage("Too short for name")
                return
            }
            if (!trimmedEmail) {
                setMessage("Enter the name")
                return
            }
            if (trimmedEmail.length < 2) {
                setMessage("Too short for email")
                return
            }
            if (!emailRegex.test(trimmedEmail)) {
                setMessage("This is not a email")
                return
            }

            const response = await apiClient.put(`/user/edit-profile/${user._id}`, { name, email }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            const data = response.data;
            setMessage(data.message)
            if (response.status === 200) {
                localStorage.setItem('user', JSON.stringify(data.user));
                getProfileData()
                setName("")
                setEmail("")
                setTimeout(() => {
                    closeEditModal()
                }, 1000)
            } else {
                setMessage(data.message || 'Password change failed.');
            }
        } catch (error) {
            setMessage('Server error. Please try again later.');
        }
    }

    const setModal = () => setShowPasswordModal(!showPasswordModal)
    const setEditModal = () => {
        setName(user.name)
        setEmail(user.email)
        setShowEditModal(!showEditModal)
    }
    const closeModal = () => {
        setShowPasswordModal(!showPasswordModal)
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setMessage("")
    }
    const closeEditModal = () => {
        setShowEditModal(!showEditModal)
        setName('');
        setEmail('')
        setMessage("")
    }

    const handleView = (id) => {
        navigate("/teacher-view-course", { state: { id } })
    }

    return (
        <>
            <div className='row'>
                <div className='col text-light side-bar'>
                    <TeacherSidebar />
                </div>
                <div className='col text-light'>
                    <div className='row headers'>
                        <h4>Profile</h4>
                    </div>
                    <div className='row profile-banner ms-5'>
                        {user ? (
                            <>
                                <h2>{user.name}</h2>
                                <p>{user.email}</p>
                            </>
                        ) : (
                            <p>No user found</p>
                        )}
                        <div className='d-flex'>
                            <button className='btn table-button mx-1' onClick={setEditModal} style={{ borderRadius: "10px" }}>Edit</button>
                            <button className='btn table-button mx-1' onClick={setModal} style={{ borderRadius: "10px" }}>Change Password</button>
                        </div>
                    </div>
                    <div className="row mt-3 text-dark profile-course">
                        <h5 className='mb-2 mt-2'>Your Courses</h5>
                        {courses.length === 0 ? (
                            <p>No courses available</p>
                        ) : (
                            courses.map((course) => (
                                <div className="card course-card mx-2" style={{ width: '20rem', height: "25rem" }} key={course._id}>
                                    <img src="/banner7.jpg" className="card-img-top" alt="..." style={{ height: '200px', objectFit: 'cover', borderRadius: "20px 20px 10px 10px" }} />
                                    <div className="card-body">
                                        <h5 className="card-title">{course.title}</h5>
                                        <small className="card-text mb-1">{course.description}</small>
                                        <div className='text-center'>
                                            <button className="btn table-button mt-5" onClick={() => handleView(course.id)}>View</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                </div>
            </div>
            {showPasswordModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Change Password</h5>

                            </div>
                            <div className="modal-body">
                                <form onSubmit={setPassword}>
                                    {message && <div className="alert alert-info">{message}</div>}
                                    <div className="form-group mb-3">
                                        <label>Current Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label>New Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label>Confirm Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn table-button" onClick={closeModal}>Cancel</button>
                                        <button type="submit" className="btn table-button">Save Changes</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showEditModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit profile</h5>

                            </div>
                            <div className="modal-body">
                                <form onSubmit={editProfile}>
                                    {message && <div className="alert alert-info">{message}</div>}
                                    <div className="form-group mb-3">
                                        <label>Change Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label>Change email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn table-button" onClick={closeEditModal}>Cancel</button>
                                        <button type="submit" className="btn table-button">Save Changes</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default TeacherProfile
