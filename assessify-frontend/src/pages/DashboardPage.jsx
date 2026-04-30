import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DashboardPage.css";

/* =========================
   ANONYMOUS NAME GENERATOR
========================= */
function generateAnonymousName(seed = "") {
  const adjectives = [
    "Anonymous",
    "Curious",
    "Silent",
    "Brave",
    "Chill",
    "Smart",
    "Lucky",
    "Calm",
    "Quick",
    "Clever",
  ];

  const animals = [
    "Capybara",
    "Panda",
    "Owl",
    "Fox",
    "Tiger",
    "Koala",
    "Dolphin",
    "Eagle",
    "Wolf",
    "Penguin",
  ];

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const adj = adjectives[Math.abs(hash) % adjectives.length];
  const animal = animals[Math.abs(hash * 7) % animals.length];

  return `${adj} ${animal}`;
}

/* =========================
   STATIC DATA
========================= */
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
  {
    title: "Business Administration",
    code: "CBA",
    type: "business-administration",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1200&auto=format&fit=crop",
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
  {
    title: "Skills Assessment",
    progress: 0,
    type: "skills",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop",
  },
];

/* =========================
   COMPONENT
========================= */
export default function DashboardPage({
  user,
  handleLogout,
  onStartAssessment,
}) {
  const [savedResults, setSavedResults] = useState([]);
  const [showAllOngoing, setShowAllOngoing] = useState(false);
  const [showAllAssessments, setShowAllAssessments] = useState(false);

  const fullName = generateAnonymousName(user?.email || "guest");
  const email = user?.email || "No email";

  const visibleOngoing = showAllOngoing ? ongoing : ongoing.slice(0, 2);
  const visibleAssessments = showAllAssessments
    ? assessments
    : assessments.slice(0, 3);

  /* =========================
     FETCH RESULTS
  ========================= */
  useEffect(() => {
    if (!user?.id) return;

    axios
      .get(
        `http://localhost/assessify/backend/assessment/get_results.php?user_id=${user.id}`
      )
      .then((res) => {
        if (res.data.success) {
          setSavedResults(res.data.results);
        }
      })
      .catch((err) => {
        console.error("Fetch results error:", err);
      });
  }, [user]);

  /* =========================
     UI
  ========================= */
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
          {/* LEFT SIDE */}
          <section className="dashboard-left">
            <div className="hero-card">
              <div className="hero-content">
                <div className="hero-text">
                  <p className="hero-welcome">Welcome back, {fullName}</p>

                  <h2>Find the best college program for you.</h2>

                  <p className="hero-description">
                    Start with a short guided assessment. Assessify evaluates
                    your responses using rule-based scoring and presents
                    recommended programs with explanations.
                  </p>

                  <div className="hero-actions">
                    <button
                      className="primary-btn"
                      onClick={() =>
                        onStartAssessment("getting-to-know-you")
                      }
                    >
                      Start Assessment →
                    </button>

                    <div className="time-pill">Takes 2–3 minutes</div>
                  </div>
                </div>

                {/* HOW IT WORKS */}
                <div className="how-card">
                  <h3>How it works</h3>

                  <div className="how-step">
                    <div className="step-number">1</div>
                    <p>
                      Answer questions about your interests, strengths, and
                      goals.
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
                      Review your recommended programs with short explanations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTINUE */}
            <section className="dashboard-section">
              <div className="section-header">
                <h3>Continue where you left off</h3>

                {ongoing.length > 2 && (
                  <button
                    className="section-link"
                    onClick={() => setShowAllOngoing(!showAllOngoing)}
                  >
                    {showAllOngoing ? "Show less" : "View all"}
                  </button>
                )}
              </div>

              <div className="card-grid two-col">
                {visibleOngoing.map((item, index) => (
                  <div className="dashboard-card" key={index}>
                    <div
                      className="card-image"
                      style={{ backgroundImage: `url(${item.image})` }}
                    ></div>

                    <div className="card-body">
                      <div className="card-top-row">
                        <h4>{item.title}</h4>
                        <span className="progress-badge">
                          {item.progress}%
                        </span>
                      </div>

                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>

                      <button
                        className="card-action"
                        onClick={() => onStartAssessment(item.type)}
                      >
                        Continue →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* AVAILABLE */}
            <section className="dashboard-section">
              <div className="section-header">
                <h3>Available assessments</h3>

                {assessments.length > 3 && (
                  <button
                    className="section-link"
                    onClick={() =>
                      setShowAllAssessments(!showAllAssessments)
                    }
                  >
                    {showAllAssessments ? "Show less" : "View all"}
                  </button>
                )}
              </div>

              <div className="card-grid three-col">
                {visibleAssessments.map((item, index) => (
                  <div
                    className="dashboard-card"
                    key={index}
                    onClick={() => onStartAssessment(item.type)}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className="card-image"
                      style={{ backgroundImage: `url(${item.image})` }}
                    ></div>

                    <div className="card-body assessment-body">
                      <div>
                        <h4>{item.title}</h4>
                        <p>Explore fit</p>
                      </div>

                      <span className="course-code">{item.code}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </section>

          {/* RIGHT SIDE */}
          <aside className="dashboard-right">
            <div className="profile-card">
              <div className="profile-row">
                <img
                  src="https://api.dicebear.com/7.x/adventurer/svg?seed=student"
                  alt="Profile"
                  className="profile-avatar"
                />

                <div className="profile-info">
                  <h3>{fullName}</h3>
                  <p>{email}</p>
                </div>
              </div>
            </div>

            {/* RESULTS */}
            <div className="fit-card">
              <div className="fit-header">
                <div>
                  <h3>Your Results</h3>
                  <p className="fit-subtitle">
                    Your latest saved recommendations.
                  </p>
                </div>
              </div>

              <div className="fit-list">
                {savedResults.length > 0 ? (
                  savedResults.slice(0, 3).map((item, index) => (
                    <div className="fit-item" key={index}>
                      <div className="fit-rank">#{index + 1}</div>

                      <div className="fit-text">
                        <h4>{item.top_program}</h4>
                        <p>{item.top_reason}</p>

                        <span className="result-date">
                          Taken on{" "}
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <span className="match-pill match-orange">
                        {item.top_percentage}% match
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="results-lock-box">
                    <h4>No results yet</h4>
                    <p>Take an assessment to see your results.</p>
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