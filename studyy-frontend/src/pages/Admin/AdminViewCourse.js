import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar2 from '../components/Sidebar2'


function AdminViewCourse() {
    const navigate = useNavigate()
    const location = useLocation()
    const courseId = location.state?.id
    const [course, setCourse] = useState()
    const [loading, setLoading] = useState(true)
    const [modules, setModules] = useState()
    const [selectedModule, setSelectedModule] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [contentType, setContentType] = useState("")
    console.log("course id", courseId)
    useEffect(() => {
        const getCourse = async () => {
            console.log("course id again", courseId)

            try {
                const response = await fetch(`http://localhost:8000/course/admin-get-course/${courseId}`, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                let data = await response.json()
                console.log("data from teacher home", data)
                setCourse(data.course)
                setModules(data.modules || [])
                setLoading(false)
            } catch (error) {
                console.log("error in fetching course", error)
                setLoading(false)
            }
        }
        getCourse()
    }, [])


    const deleteModule = async (id) => {
        if (!window.confirm('Are you sure you want to delete this module?')) return;
        try {
            const response = await fetch(`http://localhost:8000/course/teacher-delete-module/${id}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            if (response.ok) {
                alert("Module deleted successfully");
                setModules(modules.filter(mod => mod._id !== id))
            } else {
                alert("Failed to delete module");
            }
        } catch (error) {
            console.log("Error in deleting module", error)
        }
    }

    const handleViewPDF = (mod) => {
        const backendOrigin = "http://localhost:8000";
        const formattedPath = `${backendOrigin}/${mod.pdfPath.replace(/\\/g, '/')}`.replace(/^\/+/, "");

        setSelectedModule({ ...mod, pdfPath: formattedPath });
        setContentType("pdf")
        setShowModal(true);
    };
    const handleViewVideo = (mod) => {
        const backendOrigin = "http://localhost:8000";
        const videoPath = `${backendOrigin}/${mod.videoPath.replace(/\\/g, '/')}`.replace(/^\/+/, "");

        setSelectedModule({ ...mod, videoPath: videoPath });
        setContentType("video")
        setShowModal(true);
    };



    const closeModal = () => {
        setShowModal(false);
        setSelectedModule(null);
        setContentType("")
    };


    if (loading) {
        return <div className="spinner-border text-primary spinner2" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    }

    return (
        <>
            <div className='row'>
                <div className='col text-light side-bar'>
                    <Sidebar2 />
                </div>
                <div className='col text-light content'>
                    <div className='row headers ms-2'>
                        <h4>View Course</h4>
                    </div>
                    <div className='row admin-banner ms-2'>
                        {course ? (
                            <>
                                <h2>{course.title}</h2>
                                <p>{course.description}</p>
                                <p>Teacher: {course.teacher}</p>
                            </>
                        ) : (
                            <p>No course found</p>
                        )}
                    </div>

                    <div className='row text-dark pt-3 ms-3'>
                        <h5>Modules</h5>
                        <div className='row '>
                            {Array.isArray(modules) && modules.map((mod, index) => (
                                <div className='col-md-4 mb-4' key={mod._id}> 
                                    <div className='card text-dark bg-light'>
                                        <img src="/course-card1.jpg" className="card-img-top" alt="module image" style={{ height: '200px', objectFit: 'cover' }} />
                                        <div className='card-body'>
                                            <h5 className='card-title'>{mod.title}</h5>
                                            <p className='card-text'>{mod.description}</p>
                                            <div className='d-flex '>
                                                <button
                                                    className='btn table-button'
                                                    onClick={() => handleViewPDF(mod)}
                                                >
                                                    View Pdf
                                                </button>
                                                {mod.videoPath && (
                                                    <button
                                                        className="btn table-button"
                                                        onClick={() => handleViewVideo(mod)}
                                                    >
                                                        View Video
                                                    </button>
                                                )}
                                                <button
                                                    className='btn table-button'
                                                    onClick={() => deleteModule(mod._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>


                </div>
            </div>
            {selectedModule && (
                <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{selectedModule.title} - {contentType === "pdf" ? "PDF" : "Video"}</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body">
                                {contentType === "pdf" ? (
                                    <iframe
                                        src={selectedModule.pdfPath}
                                        title={selectedModule.title}
                                        style={{ width: '100%', height: '500px' }}
                                        frameBorder="0"
                                    ></iframe>
                                ) : (
                                    <video
                                        controls
                                        src={selectedModule.videoPath}
                                        style={{ width: '100%' }}
                                    />
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </>
    )
}

export default AdminViewCourse