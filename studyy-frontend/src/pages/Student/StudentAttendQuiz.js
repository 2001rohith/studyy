import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

function StudentAttendQuiz() {
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [score, setScore] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const quiz = location.state?.quiz;
  const user = useMemo(() => JSON.parse(localStorage.getItem('user')), []);

  useEffect(() => {
    if (quiz) {
      setLoading(false);
    }
  }, [quiz]);

  if (!quiz) {
    return <div>No quiz data available</div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex] || {};

  const handleOptionSelect = (option) => {
    const previousOption = selectedOptions[currentQuestionIndex];
    const isCorrectAnswer = option === currentQuestion.answer;
    const wasPreviouslyCorrect = previousOption === currentQuestion.answer;

    if (previousOption !== option) {
      setSelectedOptions({
        ...selectedOptions,
        [currentQuestionIndex]: option,
      });

      setScore((prevScore) => {
        if (isCorrectAnswer && !wasPreviouslyCorrect) {
          return prevScore + 1;
        } else if (!isCorrectAnswer && wasPreviouslyCorrect) {
          return prevScore - 1;
        }
        return prevScore;
      });
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitQuiz = async () => {
    const submissionData = {
      userId: user.id,
      quizId: quiz._id,
      score: score,
    };

    try {
      const response = await apiClient.post(`/course/student-submit-quiz`, submissionData,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.status === 200) {
        alert('Quiz submitted successfully!');
        navigate('/student-view-quizzes');
      } else {
        alert('Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  if (loading) {
    return <div>Loading quiz...</div>;
  }

  return (
    <div className='row'>
      <div className='col text-light side-bar'>
        <StudentSidebar />
      </div>
      <div className='col text-dark'>
        <div className='row headers'>
          <h4>Quizzes</h4>
        </div>
        <div className='row table-content'>
          <div className="question-container">
            <h5>Questions</h5>
            <div className="question-card">
              <div className='question'>
                <h6>{currentQuestion.question} <i className="fa-solid fa-question"></i></h6>
              </div>
              <div className="options">
                {currentQuestion.options?.map((option, index) => (
                  <div
                    key={index}
                    className={`option ${selectedOptions[currentQuestionIndex] === option ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
            <div className="navigation-buttons text-center">
              <button onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                Previous
              </button>
              <button onClick={handleNext} disabled={!quiz?.questions}>
                {currentQuestionIndex < quiz.questions.length - 1 ? 'Next' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentAttendQuiz;
