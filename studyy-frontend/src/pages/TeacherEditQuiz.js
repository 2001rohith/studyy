import { useEffect, useState } from 'react';
import TeacherSidebar from '../components/TeacherSidebar';
import { useLocation, useNavigate } from 'react-router-dom';

const TeacherEditQuiz = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const quizId = location.state?.quiz._id; 
    const courseId = location.state?.courseId;
    const [quizTitle, setQuizTitle] = useState('');
    const [questions, setQuestions] = useState([{ question: '', options: ['', ''], answer: '' }]);
    const [message, setMessage] = useState('Loading quiz details...');

    useEffect(() => {
        const fetchQuizDetails = async () => {
            try {
                const response = await fetch(`http://localhost:8000/course/get-quiz/${quizId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();

                if (response.ok) {
                    setQuizTitle(data.quiz.title);
                    console.log("quiz title:",quizTitle)
                    setQuestions(data.quiz.questions);
                    setMessage('Edit the quiz details');
                } else {
                    setMessage('Failed to load quiz details');
                }
            } catch (error) {
                console.error('Error fetching quiz details:', error);
                setMessage('Error loading quiz details');
            }
        };

        if (quizId) {
            fetchQuizDetails();
        }
    }, [quizId]);

    const handleQuizTitleChange = (e) => setQuizTitle(e.target.value);

    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...questions];
        if (field === 'option1' || field === 'option2') {
            const optionIndex = field === 'option1' ? 0 : 1;
            updatedQuestions[index].options[optionIndex] = value;
        } else {
            updatedQuestions[index][field] = value;
        }
        setQuestions(updatedQuestions);
    };

    const handleAddQuestion = () => {
        setQuestions([...questions, { question: '', options: ['', ''], answer: '' }]);
    };

    const handleRemoveQuestion = (index) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedTitle = quizTitle.trim();
        if (!trimmedTitle) {
            setMessage("Please provide a valid quiz title.");
            return;
        }

        const quizData = { title: trimmedTitle, questions };

        try {
            const response = await fetch(`http://localhost:8000/course/teacher-edit-quiz/${quizId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(quizData)
            });

            const data = await response.json();
            if (response.ok) {
                setMessage("Quiz updated successfully!");
            } else {
                setMessage(data.message || "Error occurred while updating the quiz.");
            }
        } catch (error) {
            console.error('Error updating quiz:', error);
            setMessage("Server error. Please try again.");
        }
    };

    const goback = async () => {
        navigate("/teacher-view-quizzes", { state: { id: courseId } });
    };

    return (
        <>
            <div className="row">
                <div className="col text-light side-bar">
                    <TeacherSidebar />
                </div>
                <div className="col text-light ms-2">
                    <div className="row mb-4 headers">
                        <h4>Edit Quiz</h4>
                    </div>

                    <div className="row add-course-forms">
                        <div className="col-md-6 text-dark first-form">
                            <h5 className="mb-5">Edit Quiz</h5>
                            {message && <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                <div className="modal-dialog">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title" id="exampleModalLabel">Alert!</h5>
                                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div className="modal-body">
                                            {message}
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" onClick={goback} className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                        </div>
                                    </div>
                                </div>
                            </div>}
                            <form onSubmit={handleSubmit}>
                                <input
                                    className="form-control mb-3"
                                    type="text"
                                    placeholder="Quiz Title"
                                    value={quizTitle}
                                    onChange={handleQuizTitleChange}
                                    required
                                />
                                {questions.map((q, index) => (
                                    <div key={index} className="question-section mb-4">
                                        <h6>Question {index + 1}</h6>
                                        <input
                                            className="form-control mb-2"
                                            type="text"
                                            placeholder="Question"
                                            value={q.question}
                                            onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                                            required
                                        />
                                        <input
                                            className="form-control mb-2"
                                            type="text"
                                            placeholder="Option 1"
                                            value={q.options[0]}
                                            onChange={(e) => handleQuestionChange(index, 'option1', e.target.value)}
                                            required
                                        />
                                        <input
                                            className="form-control mb-2"
                                            type="text"
                                            placeholder="Option 2"
                                            value={q.options[1]}
                                            onChange={(e) => handleQuestionChange(index, 'option2', e.target.value)}
                                            required
                                        />
                                        <input
                                            className="form-control mb-2"
                                            type="text"
                                            placeholder="Answer"
                                            value={q.answer}
                                            onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                                            required
                                        />
                                        <button type="button" className="btn table-button mt-2" onClick={() => handleRemoveQuestion(index)}>
                                            Remove
                                        </button>
                                        <button type="button" className="btn table-button mt-2 ms-2" onClick={handleAddQuestion}>
                                            Add
                                        </button>
                                    </div>
                                ))}

                                <button className="btn table-button" type="submit" data-bs-toggle="modal" data-bs-target="#exampleModal">
                                    Save Changes
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TeacherEditQuiz;
