import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DashboardPage.css";
import logo from "../assets/Assessify_logo.png";

export default function DashboardPage({
  user,
  handleLogout,
  onStartAssessment,
}) {
  const [savedResults, setSavedResults] = useState([]);
  const [savedProgress, setSavedProgress] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

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
  const strand = user?.strand || latestResult?.strand || "No strand";

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

  const handleSettingsClick = () => {
    setShowSettingsModal(true);
  };

  const closeSettingsModal = () => {
    setShowSettingsModal(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    handleLogout();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-topbar">
        <div className="dashboard-brand">
          <img src={logo} alt="Logo" className="dashboard-logo" />

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

          <button className="student-settings-btn" onClick={handleSettingsClick}>
            Settings
          </button>

          <button className="student-logout-btn" onClick={handleLogoutClick}>
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
                  <p className="hero-welcome">Welcome, {fullName}</p>

                  <h2>Find the best college program for you.</h2>

                  <p className="hero-description">
                    Start with one guided assessment. Assessify evaluates your
                    skills, interests, strengths, and goals using rule-based
                    scoring, then presents your top recommended programs with
                    explanations.
                  </p>

                  <div className="hero-actions">
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
                <h3>{savedProgress ? "Continue where you left off" : "Assessment"}</h3>
              </div>

              <div className="card-grid two-col">
                <div
                  className="dashboard-card"
                  onClick={() =>
                    savedProgress
                      ? onStartAssessment(
                          savedProgress.assessmentType || "main-assessment"
                        )
                      : onStartAssessment("main-assessment")
                  }
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
                      <h4>
                        {savedProgress
                          ? savedProgress.assessmentTitle ||
                            "Academic Program Suitability Assessment"
                          : "Academic Program Suitability Assessment"}
                      </h4>

                      <p>
                        {savedProgress
                          ? "You have an unfinished assessment. Continue from your saved progress."
                          : "One guided assessment for incoming Gordon College students."}
                      </p>
                    </div>

                    <span className="course-code">
                      {savedProgress ? "CONTINUE" : "START"}
                    </span>
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
                    <div className="latest-result-card">
                      <div className="latest-result-header">
                        <div>
                          <span className="latest-result-label">
                            Latest Recommendation
                          </span>
                          <h4>{getTopProgramLabel(latestResult)}</h4>
                        </div>

                        {getTopPercentage(latestResult) !== null && (
                          <span className="latest-match-badge">
                            {getTopPercentage(latestResult)}% match
                          </span>
                        )}
                      </div>

                      <p className="latest-result-explanation">
                        {latestResult.explanation ||
                          "This recommendation was generated based on your assessment answers using Assessify's rule-based scoring engine."}
                      </p>

                      <div className="latest-result-meta">
                        <span>
                          <strong>Strand:</strong>{" "}
                          {latestResult.strand || "No strand"}
                        </span>

                        <span>
                          <strong>Taken:</strong>{" "}
                          {latestResult.created_at
                            ? new Date(
                                latestResult.created_at
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    {latestResult.recommendations &&
                      latestResult.recommendations.length > 0 && (
                        <div className="top-matches-card">
                          <h4>Top 3 Course Matches</h4>

                          {latestResult.recommendations
                            .slice(0, 3)
                            .map((item) => (
                              <div
                                className="top-match-row"
                                key={item.rank || item.program_id}
                              >
                                <div className="top-match-left">
                                  <span className="top-match-rank">
                                    #{item.rank}
                                  </span>

                                  <div className="top-match-info">
                                    <strong>{item.program_code}</strong>
                                    <p>
                                      {item.program_name ||
                                        "Program name unavailable"}
                                    </p>
                                  </div>
                                </div>

                                <span className="top-match-percent">
                                  {item.percentage}%
                                </span>
                              </div>
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

      {showSettingsModal && (
        <div className="student-settings-modal-overlay">
          <div className="student-settings-modal">
            <div className="settings-modal-header">
              <div>
                <p className="settings-eyebrow">Student Settings</p>
                <h2>Profile Settings</h2>
              </div>

              <button
                className="settings-close-btn"
                onClick={closeSettingsModal}
                aria-label="Close settings"
              >
                ×
              </button>
            </div>

            <div className="settings-profile-summary">
              <img
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
                  fullName
                )}`}
                alt="Profile"
                className="settings-avatar"
              />

              <div>
                <h3>{fullName}</h3>
                <p>{email}</p>
              </div>
            </div>

            <div className="settings-fields">
              <div className="settings-field">
                <label>Full Name</label>
                <div>{fullName}</div>
              </div>

              <div className="settings-field">
                <label>Email</label>
                <div>{email}</div>
              </div>

              <div className="settings-field">
                <label>Applicant Number</label>
                <div>{applicantNumber}</div>
              </div>

              <div className="settings-field">
                <label>Strand</label>
                <div>{strand}</div>
              </div>
            </div>

            <div className="settings-note">
              <strong>Note:</strong> Profile editing can be enabled later once
              the backend update endpoint is ready.
            </div>

            <div className="settings-modal-actions">
              <button className="settings-done-btn" onClick={closeSettingsModal}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="student-logout-modal-overlay">
          <div className="student-logout-modal">
            <div className="student-logout-modal-icon">!</div>

            <h2>Log out of Assessify?</h2>

            <p>
              Are you sure you want to log out? You will need to sign in again
              to continue your assessment or view your results.
            </p>

            <div className="student-logout-modal-actions">
              <button
                className="student-logout-cancel-btn"
                onClick={cancelLogout}
              >
                Cancel
              </button>

              <button
                className="student-logout-confirm-btn"
                onClick={confirmLogout}
              >
                Yes, log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}