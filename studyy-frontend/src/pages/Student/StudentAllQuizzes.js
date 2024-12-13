import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';

function StudentAllQuizzes() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [loading, setLoading] = useState(true)
    const [quizzes, setQuizzes] = useState([]);
    // const toastRef = useRef(null);

    useEffect(() => {
        const getQuizzes = async () => {
            try {
                const response = await fetch(`http://localhost:8000/course/student-get-quizzes/${user.id}`, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                let data = await response.json();
                if (response.ok) {
                    setQuizzes(data.quizzes);
                    setLoading(false)
                    console.log("quizzes:", data.quizzes);
                } else {
                    console.log("something went wrong:", data.message);
                }
            } catch (error) {
                console.log("error in fetching quizzes:", error);
            }
        };
        getQuizzes();
    }, []);

    const handleAttend = (quiz) => {
        navigate("/attend-quiz", { state: { quiz } });
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
                        <h4>Quizzes</h4>
                    </div>
                    <div className='row table-content'>
                        <div className="row mt-3 text-dark">
                            <h5 className='mb-3'>All Quizzes</h5>
                            <div className="scroll-container">
                                {quizzes.length === 0 ? (
                                    <p>There is no quizzes</p>
                                ) : (
                                    quizzes.map((quiz) => (
                                        <div className="card course-card mx-2" style={{ width: '20rem', height: "30rem" }} key={quiz._id}>
                                            <img src="/banner5.jpg" className="card-img-top" alt="..." style={{ height: '200px', objectFit: 'cover', borderRadius: "15px" }} />
                                            <div className="card-body text-center">
                                                <h5 className="card-title">{quiz.title}</h5>
                                                <h6>{quiz.course}</h6>
                                            </div>
                                            <div className="text-center">
                                                {
                                                    !quiz.alreadySubmitted ? (
                                                        <button
                                                            className="btn button mb-4"
                                                            style={{ width: "100px" }}
                                                            onClick={() => handleAttend(quiz)}
                                                        >
                                                            Attend
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <h5 style={{ color: "#9C09FF" }}>Score {quiz.score}</h5>
                                                            <h6 className='mb-4' style={{ color: "#28A804" }}>Submitted!</h6>
                                                        </>
                                                    )
                                                }
                                            </div>


                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* <div className="toast-container position-fixed top-0 end-0 p-3">
                <div ref={toastRef} className="toast align-items-center text-bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
                    <div className="d-flex">
                        <div className="toast-body">
                            You have passed the due date!
                        </div>
                        <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                </div>
            </div> */}
        </>
    );
}

export default StudentAllQuizzes;


