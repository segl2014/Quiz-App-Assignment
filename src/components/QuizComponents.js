import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

function QuizApp() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [quizEnded, setQuizEnded] = useState(false);
  const [attempted, setAttempted] = useState([]);
  const [notAttempted, setNotAttempted] = useState([]);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    axios
      .get('https://jsonplaceholder.typicode.com/posts')
      .then((response) => {
        const data = response.data.slice(0, 100);
        setQuestions(
          data.map((item) => ({
            question: item.title,
            correctAnswer: item.id,
            options: shuffleOptions([item.id, item.id + 1, item.id + 2, item.id + 3]),
          }))
        );
      })
      .catch((error) => console.error('Error fetching questions:', error));
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      handleNextQuestion(false);
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const shuffleOptions = (options) => {
    return options.sort(() => Math.random() - 0.5);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setAttempted([...attempted, currentQuestionIndex]);
    if (option === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    } else {
      setWrongAnswers(wrongAnswers + 1);
    }
    setTimeout(() => handleNextQuestion(true), 1000);
  };

  const handleNextQuestion = (wasAttempted) => {
    setSelectedOption(null);
    if (!wasAttempted) {
      setNotAttempted([...notAttempted, currentQuestionIndex]);
    }
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeLeft(15);
    } else {
      setQuizEnded(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(15);
    setQuizEnded(false);
    setAttempted([]);
    setNotAttempted([]);
    setWrongAnswers(0);
    setSelectedOption(null);
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setTimeLeft(15);
    setSelectedOption(null);
  };

  if (questions.length === 0) {
    return <div className="text-center mt-5">Loading questions...</div>;
  }

  return (
    <div className="container mt-4">
      <h4 className="text-center mb-4">Quiz App</h4>
      {!quizEnded ? (
        <>
        
          <div className="btn-toolbar m-3" role="toolbar">
            {questions.map((_, index) => (
              <button
                key={index}
                className={`btn btn-sm m-2 ${
                  attempted.includes(index)
                    ? 'btn-success'
                    : notAttempted.includes(index)
                    ? ''
                    : 'btn-secondary'
                }`}
                style={{
                    backgroundColor: notAttempted.includes(index) ? '#BA471E' : undefined,
                    color: notAttempted.includes(index) ? '#fff' : undefined,
                  }}
                onClick={() => goToQuestion(index)}
              >
                Q{index + 1}
              </button>
            ))}
          </div>

        
          <div className="card mt-5 shadow-lg p-3 mb-5 bg-white rounded-top-5">
            <div className="card-body">
              <h5 className="card-title">
                Question {currentQuestionIndex + 1}: {questions[currentQuestionIndex].question}
              </h5>
              <div className="list-group fs-6">
                {questions[currentQuestionIndex].options.map((option, index) => {
                    const isCorrect = option === questions[currentQuestionIndex].correctAnswer;
                    const isSelected = selectedOption === option;
                    const labels = ['A', 'B', 'C', 'D']; 
                    return (
                    <button
                        key={index}
                        className={`list-group-item list-group-item-action fs-6 d-flex align-items-center${
                        isSelected ? (isCorrect ? ' text-success' : ' text-danger') : ''
                        }`}
                        style={{
                        pointerEvents: selectedOption ? 'none' : 'auto',
                        fontWeight: isSelected ? 'bold' : 'normal',
                        }}
                        onClick={() => handleOptionClick(option)}
                    >
                        <span
                        className="badge me-3"
                        style={{
                            borderRadius: '50%',
                            width: '30px',
                            height: '30px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                           backgroundColor: '#3a9dbc'
                        }}
                        >
                        {labels[index]}
                        </span>
                        {option}{' '}
                        {isSelected && <span>{isCorrect ? '✔️' : '❌'}</span>}
                    </button>
                    );
                })}
                </div>

              <div className="mt-4">
                <h6>Time left: {timeLeft} seconds</h6>
                <button
                  className="btn float-right"
                  onClick={() => handleNextQuestion(false)}
                  disabled={selectedOption !== null}
                >
                  Next Question
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center">
          <h4>Your Score: {score}/{questions.length}</h4>
          <h6>Correct Answers: {score}</h6>
          <h6>Attempted Questions: {attempted.length}</h6>
          <h6>Not Attempted Questions: {questions.length - attempted.length}</h6>
          <h6>Wrong Answers: {wrongAnswers}</h6>
          <button className="btn mt-3" onClick={handleRestart}>
            Restart Quiz
          </button>
        </div>
      )}
    </div>
  );
}

export default QuizApp;
