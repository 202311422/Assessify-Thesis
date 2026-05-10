import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./AssessmentPage.css";

export default function AssessmentPage({
  user,
  assessmentType,
  setPage,
  onSubmitAssessment,
}) {
  const progressKey = useMemo(() => {
    return `assessify_progress_${user?.id || "guest"}_${
      assessmentType || "main-assessment"
    }`;
  }, [user, assessmentType]);

  const savedProgress = useMemo(() => {
    const saved = localStorage.getItem(progressKey);
    return saved ? JSON.parse(saved) : null;
  }, [progressKey]);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState(() => savedProgress?.answers || {});
  const [selectedStrand, setSelectedStrand] = useState(
    () => savedProgress?.selectedStrand || ""
  );

  const [hasStartedQuestions, setHasStartedQuestions] = useState(
    () => savedProgress?.hasStartedQuestions || false
  );

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    return savedProgress?.currentQuestionIndex || 0;
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const strandOptions = [
    "STEM",
    "ABM",
    "HUMSS",
    "GAS",
    "TVL-ICT",
    "TVL-HE",
    "TVL-SMAW",
    "Other",
  ];

  useEffect(() => {
    setLoading(true);
    setErrorMessage("");

    axios
      .get("http://localhost/assessify/backend/assessment/get_questions.php")
      .then((res) => {
        if (res.data.success) {
          const loadedQuestions =
            res.data.data?.questions || res.data.questions || [];

          setQuestions(loadedQuestions);

          if (
            savedProgress?.currentQuestionIndex &&
            savedProgress.currentQuestionIndex >= loadedQuestions.length
          ) {
            setCurrentQuestionIndex(0);
          }
        } else {
          setErrorMessage(res.data.message || "Failed to load questions.");
        }
      })
      .catch((err) => {
        console.error("Load questions error:", err);
        setErrorMessage("Unable to load assessment questions.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [savedProgress]);

  useEffect(() => {
    if (!questions.length && !selectedStrand) return;

    const answeredCount = Object.keys(answers).length;
    const progressPercent =
      questions.length > 0
        ? Math.round((answeredCount / questions.length) * 100)
        : 0;

    localStorage.setItem(
      progressKey,
      JSON.stringify({
        assessmentType: assessmentType || "main-assessment",
        assessmentTitle: "Academic Program Suitability Assessment",
        selectedStrand,
        hasStartedQuestions,
        answers,
        currentQuestionIndex,
        progressPercent,
        answeredCount,
        totalQuestions: questions.length,
        updatedAt: new Date().toISOString(),
      })
    );
  }, [
    selectedStrand,
    hasStartedQuestions,
    answers,
    currentQuestionIndex,
    questions,
    assessmentType,
    progressKey,
  ]);

  const currentQuestion = questions[currentQuestionIndex];

  const progressPercent =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  const getQuestionText = (question) => {
    return question?.question_text || "";
  };

  const handleSelectChoice = (questionId, choiceId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        question_id: questionId,
        choice_id: choiceId,
      },
    }));
  };

  const isAnswered = (question) => {
    if (!question) return false;

    const answer = answers[question.id];

    return !!answer?.choice_id;
  };

  const handleStartQuestions = () => {
    if (!selectedStrand) {
      alert("Please select your strand first.");
      return;
    }

    setHasStartedQuestions(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    if (!isAnswered(currentQuestion)) {
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
    } else {
      setHasStartedQuestions(false);
    }
  };

  const handleExit = () => {
    setPage("dashboard");
  };

  const handleSubmit = async () => {
    if (!selectedStrand) {
      alert("Please select your strand first.");
      setHasStartedQuestions(false);
      return;
    }

    const unansweredRequired = questions.some((question) => {
      const required = Number(question.is_required) === 1;

      if (!required) return false;

      return !isAnswered(question);
    });

    if (unansweredRequired) {
      alert("Please answer all required questions first.");
      return;
    }

    if (!user?.id) {
      alert("User ID missing. Please log out and log in again.");
      return;
    }

    const formattedAnswers = questions
      .map((question) => {
        const answer = answers[question.id];

        return {
          question_id: question.id,
          choice_id: answer?.choice_id || null,
        };
      })
      .filter((answer) => answer.choice_id);

    if (formattedAnswers.length === 0) {
      alert("Please answer the assessment first.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await axios.post(
        "http://localhost/assessify/backend/assessment/submit_assessment.php",
        {
          user_id: user.id,
          strand: selectedStrand,
          answers: formattedAnswers,
        }
      );

      if (!res.data.success) {
        alert(res.data.message || "Assessment submission failed.");
        return;
      }

      localStorage.removeItem(progressKey);

      const submissionResult = res.data.data || res.data;

      onSubmitAssessment(submissionResult);
    } catch (error) {
      console.error("Submit assessment error:", error);
      alert("Failed to submit assessment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="assessment-page">
        <div className="assessment-container">
          <div className="assessment-header">
            <p className="assessment-user">Student: {user?.full_name}</p>
            <h1>Loading assessment...</h1>
            <p className="assessment-subtitle">
              Please wait while Assessify loads your questions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="assessment-page">
        <div className="assessment-container">
          <div className="assessment-header">
            <p className="assessment-user">Student: {user?.full_name}</p>
            <h1>Assessment unavailable</h1>
            <p className="assessment-subtitle">{errorMessage}</p>

            <button className="back-btn" onClick={() => setPage("dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="assessment-page">
        <div className="assessment-container">
          <div className="assessment-header">
            <p className="assessment-user">Student: {user?.full_name}</p>
            <h1>No questions available</h1>
            <p className="assessment-subtitle">
              There are no active assessment questions yet. Please contact the
              administrator.
            </p>

            <button className="back-btn" onClick={() => setPage("dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasStartedQuestions) {
    return (
      <div className="assessment-page">
        <div className="assessment-container">
          <div className="assessment-header">
            <p className="assessment-user">Student: {user?.full_name}</p>

            <h1>Academic Program Suitability Assessment</h1>

            <p className="assessment-subtitle">
              Before starting, please select your senior high school strand. This
              will be saved with your assessment attempt.
            </p>
          </div>

          <div className="single-question-card fade-in">
            <div className="question-number-badge">1</div>

            <h2 className="single-question-title">Select your strand</h2>

            <div className="single-options-grid four-options">
              {strandOptions.map((strand, index) => (
                <button
                  key={strand}
                  type="button"
                  className={`single-option-btn ${
                    selectedStrand === strand ? "selected" : ""
                  } option-theme-${(index % 5) + 1}`}
                  onClick={() => setSelectedStrand(strand)}
                >
                  <span className="option-number">{index + 1}</span>
                  <span className="option-text">{strand}</span>

                  {selectedStrand === strand && (
                    <span className="check-icon">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="assessment-actions">
            <button className="back-btn" onClick={handleExit}>
              Back to Dashboard
            </button>

            <div className="assessment-nav-actions">
              <button
                className="nav-btn primary-nav-btn"
                onClick={handleStartQuestions}
                disabled={!selectedStrand}
              >
                Start Questions
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isCurrentAnswered = isAnswered(currentQuestion);

  return (
    <div className="assessment-page">
      <div className="assessment-container">
        <div className="assessment-header">
          <p className="assessment-user">Student: {user?.full_name}</p>

          <h1>Academic Program Suitability Assessment</h1>

          <p className="assessment-subtitle">
            Strand: <strong>{selectedStrand}</strong>. Answer each question
            honestly. Your responses will be evaluated using Assessify&apos;s
            rule-based recommendation engine.
          </p>

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

          <h2 className="single-question-title">
            {getQuestionText(currentQuestion)}
          </h2>

          <div className="single-options-grid four-options">
            {(currentQuestion.choices || []).map((choice, index) => (
              <button
                key={choice.id}
                type="button"
                className={`single-option-btn ${
                  answers[currentQuestion.id]?.choice_id === choice.id
                    ? "selected"
                    : ""
                } option-theme-${(index % 5) + 1}`}
                onClick={() =>
                  handleSelectChoice(currentQuestion.id, choice.id)
                }
              >
                <span className="option-number">{index + 1}</span>
                <span className="option-text">{choice.choice_text}</span>

                {answers[currentQuestion.id]?.choice_id === choice.id && (
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
              disabled={submitting}
            >
              Previous
            </button>

            {!isLastQuestion ? (
              <button
                className="nav-btn primary-nav-btn"
                onClick={handleNext}
                disabled={!isCurrentAnswered || submitting}
              >
                Next Question
              </button>
            ) : (
              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={!isCurrentAnswered || submitting}
              >
                {submitting ? "Submitting..." : "Submit Assessment"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}