import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';

function StudentAttendQuiz() {
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [score, setScore] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const quiz = location.state?.quiz;
  console.log("quizzes:", quiz);
  const user = JSON.parse(localStorage.getItem('user'));

  const currentQuestion = quiz.questions[currentQuestionIndex];
  setLoading(false)
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
      console.log("current score:",score)
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
    console.log("submission data:",submissionData)

    try {
      const response = await fetch('http://localhost:8000/course/student-submit-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
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
          <div className='row content'>
            <div className="question-container">
              <h5>Questions</h5>
              <div className="question-card">
                <div className='question'>
                  <h6>{currentQuestion.question} <i className="fa-solid fa-question"></i></h6>
                </div>
                <div className="options">
                  {currentQuestion.options.map((option, index) => (
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
                <button onClick={handlePrevious} disabled={currentQuestionIndex === 0}>Previous</button>
                <button onClick={handleNext}>{currentQuestionIndex < quiz.questions.length - 1 ? 'Next' : 'Submit'}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default StudentAttendQuiz;
