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

  const handleDownloadPDF = () => {
    const originalView = view;
    if (view !== "details") {
      setView("details");
      setTimeout(() => {
        window.print();
        setView(originalView);
      }, 250);
    } else {
      window.print();
    }
  };

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

  const getPercentage = (program) => {
  if (!program) return 0;

  const totalScore = Number(program.total_score || 0);

  if (totalScore > 0) {
    return Math.round((totalScore / 15) * 100);
  }

  return Number(
    program.match_percentage ??
      program.percentage ??
      program.matchPercentage ??
      0
  );
};

  const topProgram =
    result?.top_program ||
    result?.topProgram ||
    (recommendations.length > 0 ? recommendations[0] : null);

  const topPercentage = getPercentage(topProgram);

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

  const getExplanation = () => {
    if (result?.explanation) return result.explanation;

    if (topProgram?.description) {
      return `Based on your assessment answers and selected strand (${result?.strand || "N/A"}), your highest match is ${getProgramName(
        topProgram
      )} with a ${topPercentage}% match. This result was calculated using the system's rule-based scoring engine.`;
    }

    return "This recommendation was generated using Assessify's rule-based scoring engine.";
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
        {/* Print-only official header layout */}
        <div className="print-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "3px solid #004b23", paddingBottom: "15px", marginBottom: "25px" }}>
            <div>
              <h1 style={{ color: "#004b23", margin: 0, fontSize: "28px", fontWeight: "900" }}>ASSESSIFY</h1>
              <p style={{ margin: "2px 0 0", color: "#5a7059", fontSize: "12px", fontWeight: "700" }}>Gordon College Academic Assessment System</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <h3 style={{ margin: 0, fontSize: "14px", color: "#333" }}>STUDENT EVALUATION REPORT</h3>
              <p style={{ margin: "2px 0 0", color: "#666", fontSize: "11px" }}>Date Generated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <div style={{ background: "#f4f7f4", border: "1px solid #d9e2dc", borderRadius: "10px", padding: "15px", marginBottom: "25px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div><strong>Student Name:</strong> {user?.full_name}</div>
            <div><strong>Email:</strong> {user?.email}</div>
            <div><strong>Applicant No:</strong> {result?.student?.applicant_number || user?.applicant_number || "N/A"}</div>
            <div><strong>Strand:</strong> {result?.strand || "N/A"}</div>
          </div>
        </div>

        <div className="results-header no-print">
          <p className="results-user">Student: {user?.full_name}</p>
          <h1>Assessment Results</h1>
          <p className="results-subtitle">
            Based on your responses, here are your top academic program matches.
          </p>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", marginTop: "15px" }}>
            <div className="view-toggle" style={{ margin: 0 }}>
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

            <button
              className="btn-download-pdf no-print"
              onClick={handleDownloadPDF}
              style={{
                background: "#004b23",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 16px",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 12px rgba(0, 75, 35, 0.15)",
                transition: "all 0.2s ease"
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download PDF
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
                    <span>{topPercentage}</span>
                    <small>%</small>
                  </div>

                  <h2 className="result-status">
                    {getMatchLabel(topPercentage)}
                  </h2>

                  <h3 className="result-program">{getProgramName(topProgram)}</h3>

                  <p className="result-desc">{getExplanation()}</p>
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
                recommendations.slice(0, 3).map((item, index) => {
                  const percentage = getPercentage(item);

                  return (
                    <div className="summary-item" key={item.program_id || index}>
                      <div className="summary-top">
                        <span>
                          #{item.rank || index + 1} {item.program_code} -{" "}
                          {item.program_name}
                        </span>
                        <small>{percentage}%</small>
                      </div>

                      <div className="summary-bar">
                        <div
                          className="summary-fill"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
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
                <p>{getExplanation()}</p>

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
                    Match Percentage: <strong>{topPercentage}%</strong>
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

                {recommendations.slice(0, 3).map((item, index) => {
                  const percentage = getPercentage(item);

                  return (
                    <div
                      className="answer-item enhanced"
                      key={item.program_id || index}
                    >
                      <div className="answer-header">
                        <span className="question-tag">
                          #{item.rank || index + 1}
                        </span>
                        <h4>
                          {item.program_code} - {item.program_name}
                        </h4>
                      </div>

                      <div className="answer-pill">{percentage}% match</div>
                    </div>
                  );
                })}
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