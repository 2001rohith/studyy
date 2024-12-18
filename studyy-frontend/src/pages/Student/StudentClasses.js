import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';
import axios from 'axios';
import API_URL from '../../axiourl';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

function StudentClasses() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [error, setError] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("")


    useEffect(() => {
        const getClasses = async () => {
            try {
                
                const response = await apiClient.get(`/course/student-get-classes/${user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                const data = response.data;
                if (response.status === 200) {
                    setClasses(data.classes);
                    // console.log("classes fetched:",data.classes)
                } else {
                    setError(data.message || "Failed to fetch classes");
                }
            } catch (err) {
                setError("An unexpected error occurred while fetching classes.");
            } finally {
                setLoading(false);
            }
        };

        getClasses();
    }, [user.id]);

    const HandleJoinClass = (id, peerId, status, title) => {
        if (!peerId) {
            console.error("Peer ID missing for this class");
            return; // Prevent navigation if peerId is not available
        }
        if (status === "Ended") {
            setShowToast(true)
            setToastMessage("Class Ended!")
            return
        }
        if (status !== "Started") {
            setShowToast(true)
            setToastMessage("Class Not Started!")
            return
        }
        setToastMessage("")
        navigate("/join-class", { state: { classId: id, peerId, title } });
    };

    if (loading) {
        return (
            <div className="spinner-border text-primary spinner2" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                {error}
            </div>
        );
    }

    return (
        <>
            <div className="row">
                <div className="col text-light side-bar">
                    <StudentSidebar />
                </div>
                <div className="col text-dark">
                    <div className="row headers">
                        <h4>Live Classes</h4>
                    </div>
                    <div className="row table-content">
                        <div className="row mt-3 text-dark">
                            <h5 className="mb-3">All Classes</h5>
                            <div className="scroll-container">
                                {classes.length === 0 ? (
                                    <p>No class found</p>
                                ) : (
                                    classes.map((Class) => (
                                        <div
                                            className="card course-card mx-2"
                                            style={{ width: "20rem", height: "30rem" }}
                                            key={Class._id}
                                        >
                                            <img
                                                src="/banner11.jpg"
                                                className="card-img-top"
                                                alt={`${Class.title} banner`}
                                                style={{
                                                    height: "200px",
                                                    objectFit: "cover",
                                                    borderRadius: "15px",
                                                }}
                                            />
                                            <div className="card-body text-center">
                                                <h5 className="card-title">{Class.title}</h5>
                                                <h6>{Class.course}</h6>
                                                <h6>{new Date(Class.date).toLocaleDateString()}</h6>
                                                <h6>{Class.time}</h6>
                                            </div>
                                            <div className="text-center">
                                                <button
                                                    className="btn table-button mb-4"
                                                    onClick={() =>
                                                        HandleJoinClass(Class._id, Class.peerId, Class.status, Class.title)
                                                    }
                                                >
                                                    Join
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showToast && (
                <div className="toast show position-fixed  bottom-0 end-0 m-3" style={{ borderRadius: "15px", backgroundColor: "#0056b3", color: "white" }}>
                    <div className="toast-body">
                        {toastMessage}
                        <button type="button" className="btn-close ms-2 mb-1" onClick={() => setShowToast(false)}></button>
                    </div>
                </div>
            )}
        </>
    );
}

export default StudentClasses;
