import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TeacherSidebar from '../components/TeacherSidebar';

function TeacherAssignments() {
    const navigate = useNavigate();
    const location = useLocation();
    const cId = location.state?.id;
    const [courseId] = useState(cId);
    const [assignments, setAssignments] = useState([]);
    const [courseName, setCourseName] = useState('');
    const [submissions, setSubmissions] = useState([]);
    const [modal, setModal] = useState(false);
    const [showModal, setShowModal] = useState(false)
    const [selectedSubmission, setSelectedSubmission] = useState(null)
    const [contentType, setContentType] = useState("")
    const [deleteModal, setDeleteModal] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [message, setMessage] = useState('');
    const [assnId, setAssnId] = useState("")
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getAssignments = async () => {
        try {
            const response = await fetch(`http://localhost:8000/course/get-assignments/${courseId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            const data = await response.json();
            if (response.ok) {
                setAssignments(data.assignments);
                setCourseName(data.course);
            } else {
                setError(data.message || 'Failed to fetch assignments');
            }
        } catch (error) {
            setError('Server error, please try again later');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAssignments();
    }, [courseId]);

    const addAssignment = () => {
        navigate('/teacher-add-assignment', { state: { courseId } });
    };

    const handleEdit = (assignment) => {
        navigate('/teacher-edit-assignment', { state: { assignment, courseId } });
    };

    const confirmDelete = (id) => {
        setDeleteModal(!deleteModal)
        setAssnId(id)
    }

    const handleDelete = async (id) => {
        // if (!window.confirm('Are you sure you want to delete this course?')) return;
        try {
            const response = await fetch(`http://localhost:8000/course/teacher-delete-assignment/${assnId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data = await response.json()
            if (response.ok) {
                setAssignments((prev) => prev.filter((assignment) => assignment._id !== assnId));
                setDeleteModal(!deleteModal)
                setAssnId("")
                setMessage(data.message)
                setShowToast(!showToast)
                setTimeout(() => {
                    setMessage("")
                    setShowToast(false)
                }, 5000);
            } else {
                alert('Failed to delete course');
            }
        } catch (error) {
            console.log('Error in deleting course', error);
        }
    };

    const getSubmissions = async (id) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/course/get-assignment-submissions/${id}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            const data = await response.json();
            if (response.ok) {
                setSubmissions(data.submissions);
                setModal(true); // Open modal after fetching submissions
            } else {
                setError(data.message || 'Failed to fetch submissions');
            }
        } catch (error) {
            setError('Server error, please try again later');
        } finally {
            setLoading(false);
        }
    };

    const handleViewPDF = (submission) => {
        const backendOrigin = "http://localhost:8000";
        const formattedPath = `${backendOrigin}/${submission.filePath.replace(/\\/g, '/')}`.replace(/^\/+/, "");

        setSelectedSubmission({ ...submission, filePath: formattedPath });
        setContentType("pdf")
        setShowModal(true);
    };
    const closeModal = () => {
        setShowModal(false);
        setSelectedSubmission(null);
        setContentType("")

    };


    return (
        <div className='row'>
            <div className='col text-light side-bar'>
                <TeacherSidebar />
            </div>
            <div className='col text-light'>
                <div className='row headers'>
                    <h4>Assignments - {courseName}</h4>
                </div>
                <div className='row table-content text-dark'>
                    <button className='btn btn-secondary regular-button mx-4 mt-4 mb-3' onClick={addAssignment}>
                        Add
                    </button>

                    {loading ? (
                        <div className="spinner-border text-primary spinner" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    ) : error ? (
                        <p className='ms-2'>{error}</p>
                    ) : assignments.length === 0 ? (
                        <p className='mt-3'>No assignments available.</p>
                    ) : (
                        <table className="table table-default table-hover table-responsive table-striped-columns table-borderless mt-2 ms-4">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Title</th>
                                    <th>Deadline</th>
                                    <th>Submissions</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignments.map((assignment, index) => (
                                    <tr key={assignment._id}>
                                        <td>{index + 1}</td>
                                        <td>{assignment.title}</td>
                                        <td>{new Date(assignment.dueDate).toLocaleDateString()}</td>
                                        <td>{assignment.submissions.length}</td>
                                        <td>
                                            <button
                                                className='btn table-button mx-1'
                                                onClick={() => handleEdit(assignment)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className='btn table-button mx-1'
                                                onClick={() => getSubmissions(assignment._id)}
                                            >
                                                View Submissions
                                            </button>
                                            <button
                                                className='btn table-button mx-1'
                                                onClick={() => confirmDelete(assignment._id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            {modal && (
                <div
                    className="modal show d-block text-dark"
                    tabIndex="-1"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                >
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Submissions</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setModal(false)}
                                ></button>
                            </div>
                            <div
                                className="modal-body"
                                style={{ maxHeight: '400px', overflowY: 'auto' }}
                            >
                                {loading ? (
                                    <p>Loading submissions...</p>
                                ) : submissions.length > 0 ? (
                                    <>
                                        <table className='table table-default table-hover table-responsive table-striped-columns'>
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Submitted At</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            
                                                {submissions.map((submission, index) => (
                                                    <tbody>
                                                        <tr>
                                                            <td>{submission.name}</td>
                                                            <td>{new Date(submission.submittedAt).toLocaleString()}</td>
                                                            <td> <button className='btn table-button' onClick={() => handleViewPDF(submission)}>View</button></td>
                                                        </tr>
                                                    </tbody>
                                                ))}
                                            
                                        </table>
                                    </>
                                ) : (
                                    <p>No submissions available.</p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selectedSubmission && (
                <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{selectedSubmission.name} - {contentType === "pdf" ? "PDF" : "Video"}</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body">
                                {contentType === "pdf" ? (
                                    <iframe
                                        src={selectedSubmission.filePath}
                                        style={{ width: '100%', height: '500px' }}
                                        frameBorder="0"
                                    ></iframe>
                                ) : (
                                    <video
                                        controls
                                        src={selectedSubmission.videoPath}
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
            {deleteModal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button type="button" className="btn-close" onClick={() => setDeleteModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete this Assignment?</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setDeleteModal(false)}>Cancel</button>
                                <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showToast && (
                <div className="toast show position-fixed  bottom-0 end-0 m-3" style={{ borderRadius: "15px", backgroundColor: "#0056b3", color: "white" }}>
                    <div className="toast-body">
                        {message}
                        <button type="button" className="btn-close ms-2 mb-1" onClick={() => setShowToast(false)}></button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TeacherAssignments;