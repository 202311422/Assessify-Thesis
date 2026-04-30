import { useState } from "react";
import "./ResultsPage.css";

export default function ResultsPage({ user, answers, setPage }) {
  const [view, setView] = useState("results");

  const formattedAnswers = answers?.formattedAnswers || [];
  const results = answers?.results || [];

  const grouped = formattedAnswers.reduce((acc, item) => {
    const key = item.assessmentTitle || "Assessment";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const topResult = results[0];
  const otherResults = results.slice(1);

  const getFitLabel = (percentage) => {
    if (percentage >= 70) return "Strong Fit";
    if (percentage >= 40) return "Moderate Fit";
    return "Low Fit";
  };

  return (
    <div className="results-page">
      <div className="results-container">
        <div className="results-header">
          <p className="results-user">Student: {user?.full_name}</p>
          <h1>Assessment Results</h1>
          <p className="results-subtitle">
            Based on your responses, here’s your best academic program match.
          </p>

          <div className="view-toggle">
            <button
              className={view === "results" ? "active" : ""}
              onClick={() => setView("results")}
            >
              Results
            </button>

            <button
              className={view === "answers" ? "active" : ""}
              onClick={() => setView("answers")}
            >
              My Answers
            </button>
          </div>
        </div>

        {view === "results" && (
          <div className="result-flex">
            <div className="result-main">
              {topResult ? (
                <>
                  <p className="result-label">Your Result</p>

                  <div className="result-circle">
                    <span>{topResult.percentage}</span>
                    <small>/ 100</small>
                  </div>

                  <h2 className="result-status">
                    {getFitLabel(topResult.percentage)}
                  </h2>

                  <h3 className="result-program">{topResult.name}</h3>

                  <p className="result-desc">{topResult.reason}</p>
                </>
              ) : (
                <p>No assessment results available.</p>
              )}
            </div>

            <div className="result-summary">
              <h3>Program Matches</h3>

              {otherResults.length === 0 ? (
                <p className="empty-text">No other program matches available.</p>
              ) : (
                otherResults.map((item, index) => (
                  <div className="summary-item" key={index}>
                    <div className="summary-top">
                      <span>{item.name}</span>
                      <small>{item.percentage}%</small>
                    </div>

                    <div className="summary-bar">
                      <div
                        className="summary-fill"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}

              <button
                className="continue-btn"
                onClick={() => setPage("dashboard")}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {view === "answers" && (
          <div className="results-card">
            <div className="answers-title-row">
              <div>
                <h2>Your Profile Insights</h2>
                <p>
                  This section summarizes your submitted answers and helps explain
                  how your profile was formed.
                </p>
              </div>
            </div>

            {formattedAnswers.length === 0 ? (
              <p>No answers submitted yet.</p>
            ) : (
              <>
                <div className="insight-summary">
                  <div className="insight-icon">AI</div>

                  <div>
                    <h3>Response Summary</h3>
                    <ul>
                      <li>
                        You showed interest in{" "}
                        <strong>{formattedAnswers[0]?.answer || "your selected subject"}</strong>.
                      </li>
                      <li>
                        You described yourself as{" "}
                        <strong>{formattedAnswers[1]?.answer || "your chosen personality type"}</strong>.
                      </li>
                      <li>
                        You prefer activities related to{" "}
                        <strong>{formattedAnswers[2]?.answer || "your selected activity"}</strong>.
                      </li>
                      <li>
                        Your preferred environment is{" "}
                        <strong>{formattedAnswers[3]?.answer || "your selected environment"}</strong>.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="answers-list">
                  {Object.keys(grouped).map((groupName) => (
                    <div className="answer-group" key={groupName}>
                      <h3 className="answer-group-title">{groupName}</h3>

                      {grouped[groupName].map((item, index) => (
                        <div className="answer-item enhanced" key={index}>
                          <div className="answer-header">
                            <span className="question-tag">Q{index + 1}</span>
                            <h4>{item.question}</h4>
                          </div>

                          <div className="answer-pill">{item.answer}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}