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