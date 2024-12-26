import { useState } from 'react';
import TeacherSidebar from '../components/TeacherSidebar';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../axiourl';
import { useUser } from "../../UserContext"

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Accept': 'application/json',
    },
});

const TeacherAddQuiz = () => {
    const { user,token } = useUser();
    const location = useLocation();
    const navigate = useNavigate();
    const cId = location.state?.id;
    console.log("cId from create quiz:", cId)
    const [courseId, setCourseId] = useState(cId);
    console.log("courseid from create quiz:", courseId)
    const [quizTitle, setQuizTitle] = useState('');
    // const [questions, setQuestions] = useState([{ question: '', option1: '', option2: '', answer: '' }]);
    const [questions, setQuestions] = useState([{ question: '', options: ['', ''], answer: '' }])
    const [message, setMessage] = useState('Fill Fields!');

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

        const quizData = { title: trimmedTitle, courseId, questions };

        try {
            
            const response = await apiClient.post(`/course/add-quiz`, quizData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = response.data;
            if (response.status === 200) {
                setMessage(data.message);
            } else {
                setMessage(data.message || "Error occurred while creating the quiz.");
            }
        } catch (error) {
            console.error('Error creating quiz:', error);
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
                        <h4>Quizzes</h4>
                    </div>

                    <div className="row add-course-forms">
                        <div className="col-md-6 text-dark first-form">
                            <h5 className="mb-5">Create a Quiz</h5>
                            {message && <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                <div class="modal-dialog">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title" id="exampleModalLabel">Alert!</h5>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div class="modal-body">
                                            {message}
                                        </div>
                                        <div class="modal-footer">
                                            <button type="button" onClick={goback} class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
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
                                    Save
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TeacherAddQuiz;
