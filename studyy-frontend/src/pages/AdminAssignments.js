import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar2 from '../components/Sidebar2';

function AdminAssignments() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [assignments, setAssignments] = useState([]);
    const [allAssignments, setAllAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [assignmentsPerPage] = useState(5);
    const [courseName, setCourseName] = useState('');
    const [currentAssignments, setCurrentAssignments] = useState([]);

    const getAssignments = async () => {
        try {
            const response = await fetch("http://localhost:8000/course/admin-get-assignments", {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (data.status === "ok") {
                setAssignments(data.assignments);
                setAllAssignments(data.assignments);
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
        getAssignments();
    }, []);

    useEffect(() => {
        const indexOfLastAssignment = currentPage * assignmentsPerPage;
        const indexOfFirstAssignment = indexOfLastAssignment - assignmentsPerPage;

        if (courseName === '') {
            setCurrentAssignments(allAssignments.slice(indexOfFirstAssignment, indexOfLastAssignment));
        } else {
            const filteredAssignments = allAssignments.filter(assignment =>
                assignment.course.toLowerCase().includes(courseName.toLowerCase())
            );
            setCurrentAssignments(filteredAssignments.slice(indexOfFirstAssignment, indexOfLastAssignment));
        }
    }, [allAssignments, currentPage, courseName, assignmentsPerPage]);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this assignment?')) return;
        try {
            const response = await fetch(`http://localhost:8000/course/admin-delete-assignment/${id}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                alert("assignment deleted successfully");
                const updatedAssignments = assignments.filter(assignment => assignment._id !== id);
                setAssignments(updatedAssignments);
                setAllAssignments(updatedAssignments);

                const indexOfLastAssignment = currentPage * assignmentsPerPage;
                const indexOfFirstAssignment = indexOfLastAssignment - assignmentsPerPage;
                const updatedCurrentAssignment = updatedAssignments.slice(indexOfFirstAssignment, indexOfLastAssignment);
                setCurrentAssignments(updatedCurrentAssignment);
            } else {
                alert("Failed to delete assignment");
            }
        } catch (error) {
            console.log("Error in deleting assignment:", error);
        }
    };

    //   const handleView = (id) => {
    //     navigate("/admin-view-course", { state: { id } });
    //   };

    return (
        <div className='row'>
            <div className='col text-light side-bar'>
                <Sidebar2 />
            </div>
            <div className='col text-light'>
                <div className='row headers'>
                    <h4>Assignments</h4>
                </div>

                <div className='row table-content text-dark'>
                    <div className='search-bar'>
                        <input
                            type="text"
                            placeholder="Search by course name..."
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
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
                                    <th>Title</th>
                                    <th>course</th>
                                    <th>Deadline(date)</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentAssignments.map((assignment, index) => (
                                    <tr key={assignment.id}>
                                        <td>{index + 1}</td>
                                        <td>{assignment.title}</td>
                                        <td>{assignment.course}</td>
                                        <td>{new Date(assignment.deadline).toLocaleDateString()}</td>
                                        <td>
                                            <button className='btn table-button mx-1' onClick={() => handleDelete(assignment._id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    <nav>
                        <ul className="pagination">
                            {Array.from({ length: Math.ceil(allAssignments.length / assignmentsPerPage) }, (_, i) => (
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

export default AdminAssignments;
