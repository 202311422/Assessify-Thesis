import { useEffect, useState } from "react";
import axios from "axios";
import "./ResultsPage.css";

export default function ResultsPage({
  user,
  resultId,
  resultData,
  setPage,
  onRetakeAssessment,
}) {
  const [view, setView] = useState("results");
  const [result, setResult] = useState(resultData || null);
  const [loading, setLoading] = useState(!resultData);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (resultData) {
      setResult(resultData);
      setLoading(false);
      return;
    }

    if (!user?.id && !resultId) {
      setLoading(false);
      setErrorMessage("No result found. Please take the assessment first.");
      return;
    }

    const query = resultId ? `result_id=${resultId}` : `user_id=${user.id}`;

    setLoading(true);
    setErrorMessage("");

    axios
      .get(`http://localhost/assessify/backend/assessment/get_result.php?${query}`)
      .then((res) => {
        if (res.data.success) {
          setResult(res.data.data?.result || res.data.result || null);
        } else {
          setErrorMessage(res.data.message || "Failed to load result.");
        }
      })
      .catch((err) => {
        console.error("Load result error:", err);
        setErrorMessage("Unable to load assessment result.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [resultData, resultId, user]);

  const recommendations = result?.recommendations || [];

  const topProgram =
    result?.top_program ||
    result?.topProgram ||
    (recommendations.length > 0 ? recommendations[0] : null);

  const topPercentage =
    recommendations.length > 0
      ? recommendations[0].percentage
      : topProgram?.percentage || result?.top_program?.percentage || null;

  const getMatchLabel = (percentage) => {
  if (percentage >= 80) return "Highly Recommended";
  if (percentage >= 60) return "Recommended";
  return "Top Recommendation";
};

  const getProgramName = (program) => {
    if (!program) return "No program available";

    if (program.program_code && program.program_name) {
      return `${program.program_code} - ${program.program_name}`;
    }

    return program.program_name || program.name || "Program recommendation";
  };

  if (loading) {
    return (
      <div className="results-page">
        <div className="results-container">
          <div className="results-header">
            <p className="results-user">Student: {user?.full_name}</p>
            <h1>Loading Results...</h1>
            <p className="results-subtitle">
              Please wait while Assessify loads your recommendation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="results-page">
        <div className="results-container">
          <div className="results-header">
            <p className="results-user">Student: {user?.full_name}</p>
            <h1>Assessment Results</h1>
            <p className="results-subtitle">{errorMessage}</p>

            <button className="continue-btn" onClick={() => setPage("dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="results-page">
      <div className="results-container">
        <div className="results-header">
          <p className="results-user">Student: {user?.full_name}</p>
          <h1>Assessment Results</h1>
          <p className="results-subtitle">
            Based on your responses, here are your top academic program matches.
          </p>

          <div className="view-toggle">
            <button
              className={view === "results" ? "active" : ""}
              onClick={() => setView("results")}
            >
              Results
            </button>

            <button
              className={view === "details" ? "active" : ""}
              onClick={() => setView("details")}
            >
              Details
            </button>
          </div>
        </div>

        {view === "results" && (
          <div className="result-flex">
            <div className="result-main">
              {topProgram ? (
                <>
                  <p className="result-label">Your Top Match</p>

                  <div className="result-circle">
                    <span>{topPercentage ?? 0}</span>
                    <small>%</small>
                  </div>

                  <h2 className="result-status">
                    {getMatchLabel(Number(topPercentage || 0))}
                  </h2>

                  <h3 className="result-program">{getProgramName(topProgram)}</h3>

                  <p className="result-desc">
                    {result?.explanation ||
                      topProgram?.description ||
                      "This recommendation was generated using Assessify's rule-based scoring engine."}
                  </p>
                </>
              ) : (
                <p>No assessment results available.</p>
              )}
            </div>

            <div className="result-summary">
              <h3>Top 3 Program Matches</h3>

              {recommendations.length === 0 ? (
                <p className="empty-text">No program matches available.</p>
              ) : (
                recommendations.slice(0, 3).map((item, index) => (
                  <div className="summary-item" key={item.program_id || index}>
                    <div className="summary-top">
                      <span>
                        #{item.rank || index + 1} {item.program_code} -{" "}
                        {item.program_name}
                      </span>
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
                Back to Dashboard
              </button>

              <button
                className="continue-btn"
                onClick={onRetakeAssessment}
                style={{ marginTop: "10px" }}
              >
                Retake Assessment
              </button>
            </div>
          </div>
        )}

        {view === "details" && (
          <div className="results-card">
            <div className="answers-title-row">
              <div>
                <h2>Result Details</h2>
                <p>
                  This section shows the summary of your latest assessment result.
                </p>
              </div>
            </div>

            <div className="insight-summary">
              <div className="insight-icon">AI</div>

              <div>
                <h3>Recommendation Explanation</h3>
                <p>
                  {result?.explanation ||
                    "Your result was calculated using the system's rule-based scoring engine."}
                </p>

                <ul>
  <li>
    Strand: <strong>{result?.strand || "No strand selected"}</strong>
  </li>
  <li>
    Top Match:{" "}
    <strong>
      {topProgram?.program_code && topProgram?.program_name
        ? `${topProgram.program_code} - ${topProgram.program_name}`
        : "No top match available"}
    </strong>
  </li>
  <li>
    Match Percentage:{" "}
    <strong>{topPercentage ?? 0}%</strong>
  </li>
  <li>
    Assessment Type:{" "}
    <strong>Academic Program Suitability Assessment</strong>
  </li>
</ul>
              </div>
            </div>

            <div className="answers-list">
              <div className="answer-group">
                <h3 className="answer-group-title">Course Matches</h3>

                {recommendations.slice(0, 3).map((item, index) => (
                  <div className="answer-item enhanced" key={item.program_id || index}>
                    <div className="answer-header">
                      <span className="question-tag">#{item.rank || index + 1}</span>
                      <h4>
                        {item.program_code} - {item.program_name}
                      </h4>
                    </div>

                    <div className="answer-pill">{item.percentage}% match</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="results-card" style={{ marginTop: "18px" }}>
              <h3>Confidentiality Notice</h3>
              <p>
                Your answers and results are used only for academic program
                recommendation purposes. Assessify does not replace professional
                guidance counseling services.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}