import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DashboardPage.css";

export default function DashboardPage({
  user,
  handleLogout,
  onStartAssessment,
}) {
  const [savedResults, setSavedResults] = useState([]);
  const [savedProgress, setSavedProgress] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);

  const fullName = user?.full_name || user?.name || "Student";
  const email = user?.email || "No email";
  const applicantNumber = user?.applicant_number || "No applicant number";

  useEffect(() => {
    if (!user?.id) return;

    setLoadingResults(true);

    axios
      .get(
        `http://localhost/assessify/backend/assessment/get_results.php?user_id=${user.id}`
      )
      .then((res) => {
        if (res.data.success) {
          setSavedResults(res.data.data?.results || res.data.results || []);
        }
      })
      .catch((err) => {
        console.error("Fetch results error:", err);
      })
      .finally(() => {
        setLoadingResults(false);
      });

    const keyPrefix = `assessify_progress_${user.id}_`;
    let latestProgress = null;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith(keyPrefix)) {
        const progress = JSON.parse(localStorage.getItem(key));

        if (
          !latestProgress ||
          new Date(progress.updatedAt) > new Date(latestProgress.updatedAt)
        ) {
          latestProgress = progress;
        }
      }
    }

    setSavedProgress(latestProgress);
  }, [user]);

  const latestResult = savedResults.length > 0 ? savedResults[0] : null;

  const getTopProgramLabel = (result) => {
    if (!result) return "No result";

    if (result.top_program?.program_code && result.top_program?.program_name) {
      return `${result.top_program.program_code} - ${result.top_program.program_name}`;
    }

    if (result.top_program_name && result.top_program_code) {
      return `${result.top_program_code} - ${result.top_program_name}`;
    }

    return "Program recommendation";
  };

  const getTopPercentage = (result) => {
    if (!result) return null;

    if (result.recommendations && result.recommendations.length > 0) {
      return result.recommendations[0].percentage;
    }

    if (result.percentage) {
      return result.percentage;
    }

    return null;
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-topbar">
        <div className="dashboard-brand">
          <img src="/logo512.png" alt="Logo" className="dashboard-logo" />

          <div className="dashboard-brand-text">
            <h1>ASSESSIFY</h1>
            <span>AI-assisted program fit dashboard</span>
          </div>
        </div>

        <div className="dashboard-topbar-right">
          <div className="dashboard-status-pill">
            <span className="status-dot"></span>
            Student Dashboard
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          <section className="dashboard-left">
            <div className="hero-card">
              <div className="hero-content">
                <div className="hero-text">
                  <p className="hero-welcome">Welcome back, {fullName}</p>

                  <h2>Find the best college program for you.</h2>

                  <p className="hero-description">
                    Start with one guided assessment. Assessify evaluates your
                    interests, strengths, strand, and goals using rule-based
                    scoring, then presents your top recommended programs with
                    explanations.
                  </p>

                  <div className="hero-actions">
                    <button
                      className="primary-btn"
                      onClick={() => onStartAssessment("main-assessment")}
                    >
                      Start Assessment →
                    </button>

                    <div className="time-pill">Maximum 50 questions</div>
                  </div>
                </div>

                <div className="how-card">
                  <h3>How it works</h3>

                  <div className="how-step">
                    <div className="step-number">1</div>
                    <p>
                      Answer questions about your interests, strengths, strand,
                      and career goals.
                    </p>
                  </div>

                  <div className="how-step">
                    <div className="step-number">2</div>
                    <p>
                      Assessify calculates your program match using rule-based
                      scoring.
                    </p>
                  </div>

                  <div className="how-step">
                    <div className="step-number">3</div>
                    <p>
                      Review your top 3 recommended programs with match
                      percentages.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <section className="dashboard-section">
              <div className="section-header">
                <h3>Continue where you left off</h3>
              </div>

              {savedProgress ? (
                <div className="card-grid two-col">
                  <div className="dashboard-card">
                    <div
                      className="card-image"
                      style={{
                        backgroundImage:
                          "url(https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200&auto=format&fit=crop)",
                      }}
                    ></div>

                    <div className="card-body">
                      <div className="card-top-row">
                        <h4>{savedProgress.assessmentTitle || "Assessment"}</h4>
                        <span className="progress-badge">
                          {savedProgress.progressPercent || 0}%
                        </span>
                      </div>

                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${savedProgress.progressPercent || 0}%`,
                          }}
                        ></div>
                      </div>

                      <button
                        className="card-action"
                        onClick={() =>
                          onStartAssessment(
                            savedProgress.assessmentType || "main-assessment"
                          )
                        }
                      >
                        Continue →
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="results-lock-box">
                  <h4>No unfinished assessment</h4>
                  <p>
                    Start the assessment, then exit before submitting to continue
                    later.
                  </p>
                </div>
              )}
            </section>

            <section className="dashboard-section">
              <div className="section-header">
                <h3>Assessment</h3>
              </div>

              <div className="card-grid two-col">
                <div
                  className="dashboard-card"
                  onClick={() => onStartAssessment("main-assessment")}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className="card-image"
                    style={{
                      backgroundImage:
                        "url(https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop)",
                    }}
                  ></div>

                  <div className="card-body assessment-body">
                    <div>
                      <h4>Academic Program Suitability Assessment</h4>
                      <p>
                        One guided assessment for incoming Gordon College
                        students.
                      </p>
                    </div>

                    <span className="course-code">START</span>
                  </div>
                </div>

                <div className="results-lock-box">
                  <h4>Confidentiality Notice</h4>
                  <p>
                    Your answers and results are used only for academic program
                    recommendation purposes. This system does not replace
                    professional guidance counseling.
                  </p>
                </div>
              </div>
            </section>
          </section>

          <aside className="dashboard-right">
            <div className="profile-card">
              <div className="profile-row">
                <img
                  src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
                    fullName
                  )}`}
                  alt="Profile"
                  className="profile-avatar"
                />

                <div className="profile-info">
                  <h3>{fullName}</h3>
                  <p>{email}</p>
                  <p>{applicantNumber}</p>
                </div>
              </div>
            </div>

            <div className="fit-card">
              <div className="fit-header">
                <div>
                  <h3>Your Results</h3>
                  <p className="fit-subtitle">
                    Your latest saved recommendation.
                  </p>
                </div>
              </div>

              <div className="fit-list">
                {loadingResults ? (
                  <div className="results-lock-box">
                    <h4>Loading results...</h4>
                    <p>Please wait while we fetch your latest result.</p>
                  </div>
                ) : latestResult ? (
                  <>
                    <div className="fit-item">
                      <div className="fit-rank">#1</div>

                      <div className="fit-text">
                        <h4>{getTopProgramLabel(latestResult)}</h4>
                        <p>
                          {latestResult.explanation ||
                            "This is your latest assessment result based on rule-based scoring."}
                        </p>

                        <span className="result-date">
                          Taken on{" "}
                          {new Date(
                            latestResult.created_at
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      {getTopPercentage(latestResult) !== null && (
                        <span className="match-pill match-orange">
                          {getTopPercentage(latestResult)}% match
                        </span>
                      )}
                    </div>

                    {latestResult.recommendations &&
                      latestResult.recommendations.length > 0 && (
                        <div className="results-lock-box">
                          <h4>Top 3 Course Matches</h4>

                          {latestResult.recommendations
                            .slice(0, 3)
                            .map((item) => (
                              <p key={item.rank || item.program_id}>
                                #{item.rank} {item.program_code} -{" "}
                                {item.percentage}% match
                              </p>
                            ))}
                        </div>
                      )}
                  </>
                ) : (
                  <div className="results-lock-box">
                    <h4>No results yet</h4>
                    <p>Take the assessment to see your top 3 course matches.</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}