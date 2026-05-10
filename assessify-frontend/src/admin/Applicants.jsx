import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Applicants.css";

const Applicants = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    setErrorMessage("");

    axios
      .get("http://localhost/assessify/backend/assessment/get_results.php")
      .then((res) => {
        if (res.data.success) {
          const results = res.data.data?.results || res.data.results || [];
          setApplicants(results);
        } else {
          setErrorMessage(res.data.message || "Failed to load applicants.");
        }
      })
      .catch((error) => {
        console.error("Load applicants error:", error);
        setErrorMessage("Unable to load applicants.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    return new Date(dateValue).toLocaleString();
  };

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

  const getStatus = (item) => {
    return item.status || "completed";
  };

  const getTopProgram = (item) => {
    if (item.top_program?.program_code && item.top_program?.program_name) {
      return `${item.top_program.program_code} - ${item.top_program.program_name}`;
    }

    return item.top_program_name || "No recommendation";
  };

  const filteredApplicants = useMemo(() => {
    return applicants.filter((item) => {
      const name = getStudentName(item).toLowerCase();
      const email = getStudentEmail(item).toLowerCase();
      const applicantNumber = getApplicantNumber(item).toLowerCase();
      const strand = getStrand(item).toLowerCase();
      const status = getStatus(item).toLowerCase();

      const searchValue = search.toLowerCase();

      const matchesSearch =
        name.includes(searchValue) ||
        email.includes(searchValue) ||
        applicantNumber.includes(searchValue) ||
        strand.includes(searchValue);

      const matchesStatus =
        statusFilter === "All Status" ||
        status === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [applicants, search, statusFilter]);

  return (
    <div className="applicants-page">
      <div className="page-header">
        <h2>Assessment Takers</h2>
      </div>

      <div className="controls">
        <input
          type="text"
          placeholder="Search by name, email, applicant number, or strand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All Status">All Status</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <p>Loading applicants...</p>
        ) : errorMessage ? (
          <p>{errorMessage}</p>
        ) : filteredApplicants.length === 0 ? (
          <p>No assessment takers found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Applicant No.</th>
                <th>Strand</th>
                <th>Status</th>
                <th>Top Program</th>
                <th>Date Taken</th>
              </tr>
            </thead>

            <tbody>
              {filteredApplicants.map((item) => (
                <tr key={item.result_id}>
                  <td>{getStudentName(item)}</td>
                  <td>{getStudentEmail(item)}</td>
                  <td>{getApplicantNumber(item)}</td>
                  <td>{getStrand(item)}</td>
                  <td>
                    <span
                      className={`status ${getStatus(item)
                        .replace(" ", "")
                        .toLowerCase()}`}
                    >
                      {getStatus(item)}
                    </span>
                  </td>
                  <td>{getTopProgram(item)}</td>
                  <td>{formatDate(item.completed_at || item.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Applicants;