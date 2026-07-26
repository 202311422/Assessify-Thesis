import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Results.css";

const Results = () => {
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    setErrorMessage("");

    axios
      .get("http://localhost/assessify/backend/assessment/get_results.php")
      .then((res) => {
        if (res.data.success) {
          const loadedResults = res.data.data?.results || res.data.results || [];
          setResults(loadedResults);
        } else {
          setErrorMessage(res.data.message || "Failed to load results.");
        }
      })
      .catch((error) => {
        console.error("Load results error:", error);
        setErrorMessage("Unable to load assessment results.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getStudentName = (item) => {
    return item.student?.full_name || item.full_name || "Unnamed Student";
  };

  const getStudentEmail = (item) => {
    return item.student?.email || item.email || "No email";
  };

  const getApplicantNumber = (item) => {
    return item.student?.applicant_number || item.applicant_number || "N/A";
  };

  const getStrand = (item) => {
    return item.strand || "No strand";
  };

  const getTopProgram = (item) => {
    if (item.top_program?.program_code && item.top_program?.program_name) {
      return `${item.top_program.program_code} - ${item.top_program.program_name}`;
    }

    return item.top_program_name || "No recommendation";
  };

  const getTopPercentage = (item) => {
    if (item.recommendations && item.recommendations.length > 0) {
      return item.recommendations[0].percentage;
    }

    return "N/A";
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    return new Date(dateValue).toLocaleString();
  };

  const filteredResults = useMemo(() => {
    const value = search.toLowerCase();

    return results.filter((item) => {
      const name = getStudentName(item).toLowerCase();
      const email = getStudentEmail(item).toLowerCase();
      const applicantNumber = getApplicantNumber(item).toLowerCase();
      const strand = getStrand(item).toLowerCase();
      const topProgram = getTopProgram(item).toLowerCase();

      return (
        name.includes(value) ||
        email.includes(value) ||
        applicantNumber.includes(value) ||
        strand.includes(value) ||
        topProgram.includes(value)
      );
    });
  }, [results, search]);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Assessment Results</h2>
      </div>

      <div className="card">
        <div style={{ marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Search by name, email, applicant number, strand, or program..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {loading ? (
          <p>Loading results...</p>
        ) : errorMessage ? (
          <p>{errorMessage}</p>
        ) : filteredResults.length === 0 ? (
          <p>No assessment results found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Applicant No.</th>
                <th>Strand</th>
                <th>Recommended Program</th>
                <th>Match</th>
                <th>Date Taken</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredResults.map((item) => (
                <tr key={item.result_id}>
                  <td>{getStudentName(item)}</td>
                  <td>{getApplicantNumber(item)}</td>
                  <td>{getStrand(item)}</td>
                  <td>{getTopProgram(item)}</td>
                  <td>{getTopPercentage(item)}%</td>
                  <td>{formatDate(item.completed_at || item.created_at)}</td>
                  <td>
                    <button
                      className="btn-view-result"
                      onClick={() => setSelectedResult(item)}
                    >
                      View Result
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedResult && (
        <div
          className="admin-print-modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "20px",
          }}
        >
          <div
            className="admin-print-modal-content"
            style={{
              background: "#fff",
              borderRadius: "14px",
              padding: "22px",
              width: "min(720px, 100%)",
              maxHeight: "85vh",
              overflowY: "auto",
            }}
          >
            {/* Print-only official header layout */}
            <div className="print-header">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "3px solid #004b23", paddingBottom: "15px", marginBottom: "25px" }}>
                <div>
                  <h1 style={{ color: "#004b23", margin: 0, fontSize: "28px", fontWeight: "900" }}>ASSESSIFY</h1>
                  <p style={{ margin: "2px 0 0", color: "#5a7059", fontSize: "12px", fontWeight: "700" }}>Gordon College Academic Assessment System</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <h3 style={{ margin: 0, fontSize: "14px", color: "#333" }}>OFFICIAL EVALUATION REPORT</h3>
                  <p style={{ margin: "2px 0 0", color: "#666", fontSize: "11px" }}>Date Generated: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              
              <div style={{ background: "#f4f7f4", border: "1px solid #d9e2dc", borderRadius: "10px", padding: "15px", marginBottom: "25px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", color: "#333", fontSize: "14px" }}>
                <div><strong>Student Name:</strong> {getStudentName(selectedResult)}</div>
                <div><strong>Email:</strong> {getStudentEmail(selectedResult)}</div>
                <div><strong>Applicant No:</strong> {getApplicantNumber(selectedResult)}</div>
                <div><strong>Strand:</strong> {getStrand(selectedResult)}</div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
              className="no-print"
            >
              <div>
                <h2>Result Details</h2>
                <p style={{ color: "#5a7059", marginTop: "4px" }}>
                  {getStudentName(selectedResult)} •{" "}
                  {getApplicantNumber(selectedResult)} •{" "}
                  {getStrand(selectedResult)}
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn-download-pdf"
                  onClick={() => window.print()}
                  style={{
                    background: "#004b23",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 14px",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download PDF
                </button>
                <button
                  className="btn-view-result"
                  onClick={() => setSelectedResult(null)}
                  style={{ background: "#666", color: "#fff" }}
                >
                  Close
                </button>
              </div>
            </div>

            <div style={{ marginBottom: "18px" }}>
              <h3>Top Recommendation</h3>
              <p>
                <strong>{getTopProgram(selectedResult)}</strong>
              </p>
              <p>{getTopPercentage(selectedResult)}% match</p>
            </div>

            <div style={{ marginBottom: "18px" }}>
              <h3>Course Matches</h3>

              {selectedResult.recommendations?.length > 0 ? (
                selectedResult.recommendations.slice(0, 3).map((item) => (
                  <div
                    key={item.program_id}
                    style={{
                      border: "1px solid #e0e8e0",
                      borderRadius: "10px",
                      padding: "12px",
                      marginBottom: "10px",
                    }}
                  >
                    <strong>
                      #{item.rank} {item.program_code} - {item.program_name}
                    </strong>
                    <p style={{ marginTop: "5px" }}>{item.percentage}% match</p>
                    <p style={{ color: "#5a7059", marginTop: "5px" }}>
                      {item.description}
                    </p>
                  </div>
                ))
              ) : (
                <p>No course matches available.</p>
              )}
            </div>

            <div>
              <h3>Explanation</h3>
              <p style={{ lineHeight: 1.6 }}>
                {selectedResult.explanation ||
                  "No explanation available for this result."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;