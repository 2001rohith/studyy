import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';
import { useUser } from "../../UserContext";
import { useApiClient } from "../../utils/apiClient";

function StudentAllAssignments() {
    const apiClient = useApiClient();
    const navigate = useNavigate();
    const { user, token } = useUser();
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState([]);
    const fileInputRefs = useRef({});
    const [showToast, setShowToast] = useState(false);
    const [modal, setModal] = useState(false);
    const [message, setMessage] = useState("");
    const [assignmentDetails, setAssignmentDetails] = useState({ title: "", description: "", dueDate: "" });
    const [totalPages, setTotalPages] = useState(1)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // Number of assignments per page



    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        const fetchAssignments = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/course/student-get-assignments/${user.id}`, {
                    params: {
                        page: currentPage,
                        limit: itemsPerPage,
                    },
                });

                if (response.status === 200) {
                    const { assignments, totalPages } = response.data;
                    setAssignments(assignments);
                    setTotalPages(totalPages);
                } else {
                    console.log("Something went wrong:", response.data.message);
                }
            } catch (error) {
                console.error("Error fetching assignments:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, [currentPage]);

    const handleFileUploadClick = (assignmentId) => {
        if (fileInputRefs.current[assignmentId]) {
            fileInputRefs.current[assignmentId].click();
        }
    };

    const handleFileChange = async (e, assignmentId) => {
        const file = e.target.files[0];
        if (!file) {
            alert('No file selected');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('studentId', user.id);

        try {
            if (!token) {
                throw new Error('Authentication token is missing');
            }

            const response = await apiClient.post(`/course/submit-assignment/${assignmentId}`, formData);
            const data = response.data;

            if (response.status === 200) {
                setMessage("Assignment Uploaded");
                setModal(false);
                setShowToast(true);
                setAssignments(prevAssignments =>
                    prevAssignments.map(a =>
                        a._id === assignmentId
                            ? {
                                ...a,
                                submissions: Array.isArray(a.submissions)
                                    ? [...a.submissions, { student: user.id, filePath: 'path-to-file' }]
                                    : [{ student: user.id, filePath: 'path-to-file' }],
                            }
                            : a
                    )
                );
            } else {
                console.log("Error:", data.message);
                setMessage(data.message);
                setShowToast(true);
            }
        } catch (error) {
            console.error('Error submitting assignment:', error.response ? error.response.data : error.message);
        }
    };

    const openUploadModal = (assignment) => {
        setAssignmentDetails(assignment);
        setModal(true);
    };

    const closeUploadModal = () => {
        setModal(false);
        setAssignmentDetails({ title: '', description: '' });
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };


    if (loading) {
        return (
            <div className="spinner-border text-primary spinner2" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        );
    }

    return (
        <>
            <div className='row'>
                <div className='col text-light side-bar'>
                    <StudentSidebar />
                </div>
                <div className='col text-dark'>
                    <div className='row headers'>
                        <h4>Assignments</h4>
                    </div>
                    <div className='row table-content'>
                        <div className="row mt-3 text-dark">
                            <h5 className='mb-3 ms-2'>All Assignments</h5>
                            <div className="scroll-container">
                                {assignments.length === 0 ? (
                                    <p>There are no assignments</p>
                                ) : (
                                    assignments.map((assignment) => (
                                        <div className="card course-card mx-2" style={{ width: '20rem', height: "30rem" }} key={assignment._id}>
                                            <img src="/banner9.jpg" className="card-img-top" alt="..." style={{ height: '200px', objectFit: 'cover', borderRadius: "15px" }} />
                                            <div className="card-body text-center">
                                                <h5 className="card-title">{assignment.title}</h5>
                                                <h6>{assignment.course}</h6>
                                            </div>
                                            <div className='text-center'>
                                                {assignment.submissions &&
                                                    Array.isArray(assignment.submissions) &&
                                                    !assignment.submissions.some(submission => submission.student.toString() === user.id.toString()) ? (
                                                    <button
                                                        className="btn button mb-4"
                                                        style={{ width: "100px" }}
                                                        onClick={() => openUploadModal(assignment)}
                                                    >
                                                        View
                                                    </button>
                                                ) : (
                                                    <h6 className='mb-5' style={{ color: "#28A804" }}>Submitted!</h6>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="pagination-controls text-center mt-4">
                        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                            <button
                                key={page}
                                className={`btn mx-1 ${currentPage === page ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => handlePageChange(page)}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                </div>
            </div>
            {modal && (
                <div
                    className="modal show d-block"
                    tabIndex="-1"
                    role="dialog"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                >
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Upload Assignment</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeUploadModal}
                                ></button>
                            </div>
                            <div className="modal-body noti-body" style={{ maxHeight: '300px' }}>
                                <div className='student-assignment-banner'>
                                    <h4>{assignmentDetails.course}</h4>
                                </div>
                                <h5 className='mt-4 mb-3' style={{ color: "#0572e6" }}>{assignmentDetails.title}</h5>
                                <p><strong>Description:</strong> {assignmentDetails.description}</p>
                                <p><strong>Due date: {new Date(assignmentDetails.deadline).toLocaleString()}</strong></p>
                            </div>
                            <div className="modal-footer">
                                <>
                                    <button
                                        className="btn button"
                                        onClick={() => handleFileUploadClick(assignmentDetails._id)}
                                    >
                                        Upload
                                    </button>
                                    <input
                                        type="file"
                                        accept=".pdf,.mp4"
                                        style={{ display: "none" }}
                                        ref={(el) => (fileInputRefs.current[assignmentDetails._id] = el)}
                                        onChange={(e) => handleFileChange(e, assignmentDetails._id)}
                                    />
                                </>
                                <button
                                    type="button"
                                    className="btn button"
                                    onClick={closeUploadModal}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showToast && (
                <div className="toast show position-fixed bottom-0 end-0 m-3" style={{ borderRadius: "15px", backgroundColor: "#0056b3", color: "white" }}>
                    <div className="toast-body">
                        {message}
                        <button type="button" className="btn-close ms-2 mb-1" onClick={() => setShowToast(false)}></button>
                    </div>
                </div>
            )}
        </>
    );
}

export default StudentAllAssignments;