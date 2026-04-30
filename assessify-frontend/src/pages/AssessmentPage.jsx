import { useEffect, useMemo, useState } from "react";
import "./AssessmentPage.css";
import { assessmentsData } from "../data/assessments";
import { calculateTraits } from "../utils/calculateTraits";
import { scoreAssessment } from "../utils/scoreAssessment";

export default function AssessmentPage({
  user,
  assessmentType,
  setPage,
  onSubmitAssessment,
}) {
  const assessment = assessmentsData[assessmentType];

  const progressKey = useMemo(() => {
    return `assessify_progress_${user?.id || "guest"}_${assessmentType}`;
  }, [user, assessmentType]);

  const savedProgress = useMemo(() => {
    const saved = localStorage.getItem(progressKey);
    return saved ? JSON.parse(saved) : null;
  }, [progressKey]);

  const [answers, setAnswers] = useState(() => savedProgress?.answers || {});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    return savedProgress?.currentQuestionIndex || 0;
  });

  useEffect(() => {
    if (!assessment) return;

    const answeredCount = Object.keys(answers).length;

    if (answeredCount > 0) {
      const progressPercent = Math.round(
        (answeredCount / assessment.questions.length) * 100
      );

      localStorage.setItem(
        progressKey,
        JSON.stringify({
          assessmentType,
          assessmentTitle: assessment.title,
          answers,
          currentQuestionIndex,
          progressPercent,
          answeredCount,
          totalQuestions: assessment.questions.length,
          updatedAt: new Date().toISOString(),
        })
      );
    }
  }, [answers, currentQuestionIndex, assessment, assessmentType, progressKey]);

  if (!assessment) {
    return (
      <div className="assessment-page">
        <div className="assessment-container">
          <div className="assessment-header">
            <h1>Assessment not found</h1>
            <p className="assessment-subtitle">
              The selected assessment does not exist.
            </p>
            <button className="back-btn" onClick={() => setPage("dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const questions = assessment.questions;
  const currentQuestion = questions[currentQuestionIndex];

  const progressPercent =
    ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleSelect = (questionId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleNext = () => {
    if (!answers[currentQuestion.id]) {
      alert("Please select an answer first.");
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleExit = () => {
    setPage("dashboard");
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length !== questions.length) {
      alert("Please answer all questions first.");
      return;
    }

    const formattedAnswers = questions.map((q) => ({
      questionId: q.id,
      question: q.question,
      answer: answers[q.id],
      assessmentType,
      assessmentTitle: assessment.title,
    }));

    const traitScores = calculateTraits(formattedAnswers);
    const results = scoreAssessment(traitScores);

    localStorage.removeItem(progressKey);

    onSubmitAssessment({
      formattedAnswers,
      traitScores,
      results,
      assessmentType,
      assessmentTitle: assessment.title,
    });
  };

  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isCurrentAnswered = !!answers[currentQuestion.id];

  return (
    <div className="assessment-page">
      <div className="assessment-container">
        <div className="assessment-header">
          <p className="assessment-user">Student: {user?.full_name}</p>
          <h1>{assessment.title}</h1>
          <p className="assessment-subtitle">{assessment.subtitle}</p>

          <div className="assessment-progress-wrap">
            <div className="assessment-progress-top">
              <span className="progress-label">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="progress-label">
                {Object.keys(answers).length} answered
              </span>
            </div>

            <div className="assessment-progress-bar">
              <div
                className="assessment-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="single-question-card fade-in">
          <div className="question-number-badge">
            {currentQuestionIndex + 1}
          </div>

          <h2 className="single-question-title">{currentQuestion.question}</h2>

          <div className="single-options-grid four-options">
            {currentQuestion.options.map((option, index) => (
              <button
                key={option}
                type="button"
                className={`single-option-btn ${
                  answers[currentQuestion.id] === option ? "selected" : ""
                } option-theme-${(index % 5) + 1}`}
                onClick={() => handleSelect(currentQuestion.id, option)}
              >
                <span className="option-number">{index + 1}</span>
                <span className="option-text">{option}</span>

                {answers[currentQuestion.id] === option && (
                  <span className="check-icon">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="assessment-actions">
          <button className="back-btn" onClick={handleExit}>
            Exit Assessment
          </button>

          <div className="assessment-nav-actions">
            <button
              className="nav-btn secondary-nav-btn"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </button>

            {!isLastQuestion ? (
              <button
                className="nav-btn primary-nav-btn"
                onClick={handleNext}
                disabled={!isCurrentAnswered}
              >
                Next Question
              </button>
            ) : (
              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={!isCurrentAnswered}
              >
                Submit Assessment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}