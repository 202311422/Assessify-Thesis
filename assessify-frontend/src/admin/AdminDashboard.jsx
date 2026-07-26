import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    setErrorMessage("");

    axios
      .get("http://localhost/assessify/backend/admin/dashboard_stats.php")
      .then((res) => {
        if (res.data.success) {
          setStats(res.data.data || null);
        } else {
          setErrorMessage(res.data.message || "Failed to load dashboard stats.");
        }
      })
      .catch((error) => {
        console.error("Dashboard stats error:", error);
        setErrorMessage("Unable to load dashboard statistics.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const cards = stats?.cards || {};
  const recentResults = stats?.recent_results || [];
  const mostRecommended = stats?.most_recommended_program || null;
  const deptData = stats?.department_distribution || [];

  const totalMatches = deptData.reduce((sum, item) => sum + item.total, 0);

  const getDeptColor = (dept) => {
    if (!dept) return "#9ca3af";
    const name = dept.toLowerCase();
    if (name.includes("health") || name.includes("cahs")) return "#06b6d4"; // Cyan
    if (name.includes("business") || name.includes("cba")) return "#f59e0b"; // Amber
    if (name.includes("computer") || name.includes("ccs")) return "#10b981"; // Emerald
    if (name.includes("education") || name.includes("ceas")) return "#6366f1"; // Indigo
    if (name.includes("hospitality") || name.includes("chtm")) return "#ec4899"; // Pink
    return "#8b5cf6"; // Purple default
  };

  const getDeptLabel = (dept) => {
    if (!dept) return "Other";
    const match = dept.match(/\(([^)]+)\)/);
    return match ? match[1] : dept;
  };

  let cumulativePercent = 0;
  const gradientSlices = deptData.map((item) => {
    const percent = totalMatches > 0 ? (item.total / totalMatches) * 100 : 0;
    const start = cumulativePercent;
    cumulativePercent += percent;
    return `${getDeptColor(item.college_department)} ${start}% ${cumulativePercent}%`;
  });

  const backgroundStyle = {
    background: totalMatches > 0 
      ? `conic-gradient(${gradientSlices.join(", ")})` 
      : "#e5e7eb"
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    return new Date(dateValue).toLocaleString();
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <section className="hero">
          <div className="hero-left">
            <h2>Loading dashboard...</h2>
            <p>Please wait while Assessify loads the latest admin statistics.</p>
          </div>
        </section>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="dashboard-wrapper">
        <section className="hero">
          <div className="hero-left">
            <h2>Dashboard unavailable</h2>
            <p>{errorMessage}</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-left">
          <h2>Manage and monitor assessment takers.</h2>
          <p>
            Track completed assessments, review student recommendations, and
            monitor program match trends in Assessify.
          </p>
        </div>

        <div className="quick-stats">
          <div className="stat">
            <h3>{cards.total_students || 0}</h3>
            <p>Total Students</p>
          </div>

          <div className="stat">
            <h3>{cards.completed_assessments || 0}</h3>
            <p>Completed Attempts</p>
          </div>

          <div className="stat">
            <h3>{cards.students_taken || 0}</h3>
            <p>Students Taken</p>
          </div>
        </div>
      </section>

      {/* STATS CARDS */}
      <section className="cards">
        <div className="card">
          <h3>Total Students</h3>
          <p>{cards.total_students || 0}</p>
        </div>

        <div className="card">
          <h3>Assessments Completed</h3>
          <p>{cards.completed_assessments || 0}</p>
        </div>

        <div className="card">
          <h3>Students Taken</h3>
          <p>{cards.students_taken || 0}</p>
        </div>

        <div className="card">
          <h3>Programs Offered</h3>
          <p>{cards.total_programs || 0}</p>
        </div>

        <div className="card">
          <h3>Total Questions</h3>
          <p>{cards.total_questions || 0}</p>
        </div>

        <div className="card">
          <h3>Most Recommended</h3>
          <p>
            {mostRecommended
              ? `${mostRecommended.program_code} - ${mostRecommended.program_name}`
              : "No data yet"}
          </p>
        </div>
      </section>

      {/* PIE CHART / MATCH DISTRIBUTION */}
      <section className="dashboard-charts">
        <div className="chart-card">
          <h3>Program Match Trends by College Department</h3>
          <p className="chart-subtitle">Percentage of students matched to each college department based on their assessment results</p>
          
          <div className="chart-container">
            {totalMatches > 0 ? (
              <div className="chart-content-wrapper">
                <div className="pie-chart-wrapper">
                  <div className="conic-pie-chart" style={backgroundStyle}>
                    <div className="pie-chart-inner">
                      <span className="total-count">{totalMatches}</span>
                      <span className="total-label">Matches</span>
                    </div>
                  </div>
                </div>
                <div className="chart-legend">
                  {deptData.map((item) => {
                    const pct = totalMatches > 0 ? Math.round((item.total / totalMatches) * 100) : 0;
                    return (
                      <div key={item.college_department} className="legend-item">
                        <span 
                          className="legend-color" 
                          style={{ backgroundColor: getDeptColor(item.college_department) }}
                        />
                        <span className="legend-name">
                          <strong>{getDeptLabel(item.college_department)}</strong>: <strong>{item.total}</strong> student{item.total !== 1 ? 's' : ''} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="no-chart-data">
                <p>No student match data available yet. Students must take the assessment to populate this chart.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* RECENT RESULTS */}
      <section className="table-section">
        <h3>Recent Assessment Results</h3>

        {recentResults.length === 0 ? (
          <p>No recent assessment results yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Applicant No.</th>
                <th>Strand</th>
                <th>Top Program</th>
                <th>Match</th>
                <th>Date Taken</th>
              </tr>
            </thead>

            <tbody>
              {recentResults.map((item) => (
                <tr key={item.result_id}>
                  <td>{item.full_name || "Unnamed Student"}</td>
                  <td>{item.applicant_number || "N/A"}</td>
                  <td>{item.strand || "No strand"}</td>
                  <td>
                    {item.program_code && item.program_name
                      ? `${item.program_code} - ${item.program_name}`
                      : "No recommendation"}
                  </td>
                  <td>{item.percentage || 0}%</td>
                  <td>{formatDate(item.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;