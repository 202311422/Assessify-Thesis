import React from "react";
import "./DashboardPage.css";

const topPrograms = [
  {
    name: "BS Computer Science",
    match: "75%",
    reason: "Strong logic and problem-solving",
  },
  {
    name: "BS Information Technology",
    match: "68%",
    reason: "Interested in technology and systems",
  },
  {
    name: "BS Accountancy",
    match: "54%",
    reason: "Shows structured and analytical thinking",
  },
];

const assessments = [
  {
    title: "Computer Science",
    code: "CCS",
    type: "computer-science",
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Education",
    code: "CEAS",
    type: "education",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Health Sciences",
    code: "CAHS",
    type: "health-sciences",
    image:
      "https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1200&auto=format&fit=crop",
  },
];

const ongoing = [
  {
    title: "Getting to Know You",
    progress: 25,
    type: "getting-to-know-you",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Interest Assessment",
    progress: 60,
    type: "interest",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function DashboardPage({ user, handleLogout, onStartAssessment }) {
  const fullName = user?.full_name || "Noel Justin Notario";
  const email = user?.email || "202311422@gordoncollege.edu.ph";

  const handleStartAssessment = () => {
    onStartAssessment("getting-to-know-you");
  };

  const handleContinueAssessment = (type) => {
    onStartAssessment(type);
  };

  const handleCourseAssessment = (type) => {
    onStartAssessment(type);
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-topbar">
        <div className="dashboard-brand">
          <img src="/logo512.png" alt="Assessify Logo" className="dashboard-logo" />
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
                    Start with a short guided assessment. Assessify uses rule-based
                    matching with AI-assisted explanations to recommend programs that
                    fit your interests, strengths, and goals.
                  </p>

                  <div className="hero-actions">
                    <button
                      className="primary-btn"
                      onClick={handleStartAssessment}
                    >
                      Start Assessment →
                    </button>
                    <div className="time-pill">Takes around 2–3 minutes</div>
                  </div>
                </div>

                <div className="how-card">
                  <h3>How it works</h3>

                  <div className="how-step">
                    <div className="step-number">1</div>
                    <p>Answer a short assessment</p>
                  </div>

                  <div className="how-step">
                    <div className="step-number">2</div>
                    <p>Get matched programs and fit percentages</p>
                  </div>

                  <div className="how-step">
                    <div className="step-number">3</div>
                    <p>Read AI-assisted explanations for each recommendation</p>
                  </div>
                </div>
              </div>
            </div>

            <section className="dashboard-section">
              <div className="section-header">
                <h3>Continue where you left off</h3>
                <button className="section-link">View all</button>
              </div>

              <div className="card-grid two-col">
                {ongoing.map((item, index) => (
                  <div className="dashboard-card" key={index}>
                    <div
                      className="card-image"
                      style={{ backgroundImage: `url(${item.image})` }}
                    ></div>

                    <div className="card-body">
                      <div className="card-top-row">
                        <h4>{item.title}</h4>
                        <span className="progress-badge">{item.progress}%</span>
                      </div>

                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>

                      <button
                        className="card-action"
                        onClick={() => handleContinueAssessment(item.type)}
                      >
                        Continue →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="dashboard-section">
              <div className="section-header">
                <h3>Available assessments</h3>
                <button className="section-link">View all</button>
              </div>

              <div className="card-grid three-col">
                {assessments.map((item, index) => (
                  <div
                    className="dashboard-card"
                    key={index}
                    onClick={() => handleCourseAssessment(item.type)}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className="card-image"
                      style={{ backgroundImage: `url(${item.image})` }}
                    ></div>

                    <div className="card-body assessment-body">
                      <div>
                        <h4>{item.title}</h4>
                        <p>Explore fit for this area</p>
                      </div>
                      <span className="course-code">{item.code}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </section>

          <aside className="dashboard-right">
            <div className="profile-card">
              <div className="profile-row">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop"
                  alt="Profile"
                  className="profile-avatar"
                />

                <div className="profile-info">
                  <h3>{fullName}</h3>
                  <p>{email}</p>
                  <button className="edit-profile-btn">Edit profile</button>
                </div>
              </div>
            </div>

            <div className="fit-card">
              <div className="fit-header">
                <div>
                  <h3>Programs that fit you</h3>
                  <p>Unlock after finishing the assessment</p>
                </div>
                <span className="preview-pill">Preview</span>
              </div>

              <div className="fit-list">
                {topPrograms.map((program, index) => (
                  <div className="fit-item" key={index}>
                    <div className="fit-text">
                      <h4>{program.name}</h4>
                      <p>{program.reason}</p>
                    </div>

                    <span
                      className={`match-pill ${
                        index === 0
                          ? "match-orange"
                          : index === 1
                          ? "match-yellow"
                          : "match-gray"
                      }`}
                    >
                      {program.match} match
                    </span>
                  </div>
                ))}
              </div>

              <div className="results-lock-box">
                <h4>Need your results first?</h4>
                <p>
                  Complete the assessment to unlock final recommendations and
                  detailed explanations.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}