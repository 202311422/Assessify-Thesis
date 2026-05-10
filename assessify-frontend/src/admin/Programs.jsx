import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Programs.css";

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    setErrorMessage("");

    axios
      .get("http://localhost/assessify/backend/admin/get_programs.php")
      .then((res) => {
        if (res.data.success) {
          setPrograms(res.data.data?.programs || res.data.programs || []);
        } else {
          setErrorMessage(res.data.message || "Failed to load programs.");
        }
      })
      .catch((error) => {
        console.error("Load programs error:", error);
        setErrorMessage("Unable to load programs.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Programs Offered</h2>
      </div>

      {loading ? (
        <div className="card">
          <p>Loading programs...</p>
        </div>
      ) : errorMessage ? (
        <div className="card">
          <p>{errorMessage}</p>
        </div>
      ) : programs.length === 0 ? (
        <div className="card">
          <p>No active programs found.</p>
        </div>
      ) : (
        <div className="grid">
          {programs.map((program) => (
            <div className="program-card" key={program.id}>
              <div className="program-content">
                <h3>{program.program_code}</h3>

                <p className="applicants">{program.program_name}</p>

                <p className="desc">
                  {program.description || "No description available."}
                </p>

                <p className="desc" style={{ marginTop: "10px" }}>
                  <strong>Department:</strong>{" "}
                  {program.college_department || "N/A"}
                </p>
              </div>

              <button
                className="view-btn"
                onClick={() => setSelectedProgram(program)}
              >
                View
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedProgram && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{selectedProgram.program_code}</h2>

            <h3 style={{ marginTop: "8px" }}>
              {selectedProgram.program_name}
            </h3>

            <p style={{ marginTop: "12px" }}>
              {selectedProgram.description || "No description available."}
            </p>

            <p style={{ marginTop: "12px" }}>
              <strong>Department:</strong>{" "}
              {selectedProgram.college_department || "N/A"}
            </p>

            <button
              className="close-btn"
              onClick={() => setSelectedProgram(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Programs;