import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';

function StudentAllAssignments() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [loading, setLoading] = useState(true)
    const [assignments, setAssignments] = useState([]);
    const fileInputRefs = useRef({}); // Ref to store file input for each assignment

    useEffect(() => {
        const getAssignments = async () => {
            try {
                const response = await fetch(`http://localhost:8000/course/student-get-assignments/${user.id}`, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                let data = await response.json();
                if (response.ok) {
                    setAssignments(data.assignments);
                    setLoading(false)
                    console.log("assignments:", data.assignments);
                } else {
                    console.log("something went wrong:", data.message);
                }
            } catch (error) {
                console.log("error in fetching assignments:", error);
            }
        };
        getAssignments();
    }, []);

    const handleFileUploadClick = (assignmentId) => {
        if (fileInputRefs.current[assignmentId]) {
            fileInputRefs.current[assignmentId].click();
        }
    };

    const handleFileChange = async (e, assignmentId) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('studentId', user.id);

        try {
            const response = await fetch(`http://localhost:8000/course/submit-assignment/${assignmentId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const data = await response.json();
            if (response.ok) {
                alert('Assignment submitted successfully');
                setAssignments(prevAssignments =>
                    prevAssignments.map(a => a._id === assignmentId ? {
                        ...a,
                        submissions: Array.isArray(a.submissions) ? [...a.submissions, { student: user.id, filePath: 'path-to-file' }] : [{ student: user.id, filePath: 'path-to-file' }]
                    } : a)
                );

            } else {
                const toastElement = document.getElementById('toast');
                const toast = new bootstrap.Toast(toastElement);
                document.getElementById('toast-message').textContent = data.message;
                toast.show();
                console.log("Error:", data.message);
            }
        } catch (error) {
            console.error('Error submitting assignment:', error);
        }
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
                                {assignments.map((assignment) => (
                                    <div className="card course-card mx-2" style={{ width: '20rem', height: "30rem" }} key={assignment._id}>
                                        <img src="/banner4.jpg" className="card-img-top" alt="..." style={{ height: '200px', objectFit: 'cover', borderRadius: "15px" }} />
                                        <div className="card-body text-center">
                                            <h5 className="card-title">{assignment.title}</h5>
                                            <h6>{assignment.course}</h6>
                                            <small className="card-text">{assignment.description}</small>
                                        </div>
                                        <div className='text-center'>
                                            {
                                                // Check if 'submissions' exists, is an array, and if the current user has already submitted the assignment
                                                assignment.submissions && Array.isArray(assignment.submissions) &&
                                                    !assignment.submissions.some(submission => submission.student.toString() === user.id.toString()) ? (
                                                    <>
                                                        <button
                                                            className="btn button mb-4"
                                                            style={{ width: "100px" }}
                                                            onClick={() => handleFileUploadClick(assignment._id)}
                                                        >
                                                            Upload
                                                        </button>
                                                        <input
                                                            type="file"
                                                            accept=".pdf,.mp4"
                                                            style={{ display: "none" }}
                                                            ref={(el) => (fileInputRefs.current[assignment._id] = el)}
                                                            onChange={(e) => handleFileChange(e, assignment._id)}
                                                        />
                                                    </>
                                                ) : (
                                                    <h6 className='mb-5' style={{ color: "#28A804" }}>Submitted!</h6> // If the user has already submitted
                                                )
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="toast-container position-fixed top-0 end-0 p-3">
                <div id="toast" className="toast align-items-center text-bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
                    <div className="d-flex">
                        <div className="toast-body" id="toast-message">
                            You have passed the due date!
                        </div>
                        <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default StudentAllAssignments;

