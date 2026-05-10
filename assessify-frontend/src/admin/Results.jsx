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
            style={{
              background: "#fff",
              borderRadius: "14px",
              padding: "22px",
              width: "min(720px, 100%)",
              maxHeight: "85vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <div>
                <h2>Result Details</h2>
                <p style={{ color: "#5a7059", marginTop: "4px" }}>
                  {getStudentName(selectedResult)} •{" "}
                  {getApplicantNumber(selectedResult)} •{" "}
                  {getStrand(selectedResult)}
                </p>
              </div>

              <button
                className="btn-view-result"
                onClick={() => setSelectedResult(null)}
              >
                Close
              </button>
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