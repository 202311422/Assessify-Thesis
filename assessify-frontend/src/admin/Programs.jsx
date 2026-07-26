import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Programs.css";

const DEPARTMENT_COLORS = {
  "College of Allied Health Studies (CAHS)": {
    color: "#ef4444",
    bg: "#fef2f2",
    border: "#fecaca",
    abbr: "CAHS",
  },
  "College of Business and Accountancy (CBA)": {
    color: "#eab308",
    bg: "#fefce8",
    border: "#fef08a",
    abbr: "CBA",
  },
  "College of Computer Studies (CCS)": {
    color: "#f97316",
    bg: "#fff7ed",
    border: "#fed7aa",
    abbr: "CCS",
  },
  "College of Education, Arts, and Sciences (CEAS)": {
    color: "#6366f1",
    bg: "#eef2ff",
    border: "#c7d2fe",
    abbr: "CEAS",
  },
  "College of Hospitality and Tourism Management (CHTM)": {
    color: "#ec4899",
    bg: "#fdf2f8",
    border: "#fbcfe8",
    abbr: "CHTM",
  },
};

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeDept, setActiveDept] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [deptDistribution, setDeptDistribution] = useState([]);
  const [progDistribution, setProgDistribution] = useState([]);

  useEffect(() => {
    setLoading(true);
    setErrorMessage("");

    Promise.all([
      axios.get("http://localhost/assessify/backend/admin/get_programs.php"),
      axios.get("http://localhost/assessify/backend/admin/dashboard_stats.php"),
    ])
      .then(([progRes, statsRes]) => {
        if (progRes.data.success) {
          setPrograms(progRes.data.data?.programs || progRes.data.programs || []);
        } else {
          setErrorMessage(progRes.data.message || "Failed to load programs.");
        }
        if (statsRes.data.success) {
          setDeptDistribution(statsRes.data.data?.department_distribution || []);
          setProgDistribution(statsRes.data.data?.program_distribution || []);
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

  // Group programs by department
  const departments = Object.keys(DEPARTMENT_COLORS);
  const grouped = departments.reduce((acc, dept) => {
    acc[dept] = programs.filter((p) => p.college_department === dept);
    return acc;
  }, {});
  programs.forEach((p) => {
    const dept = p.college_department || "Other";
    if (!grouped[dept]) grouped[dept] = [];
    if (!grouped[dept].find((x) => x.id === p.id)) grouped[dept].push(p);
  });

  const activeDeptPrograms = activeDept ? grouped[activeDept] || [] : [];
  const activeDeptStyle = activeDept ? DEPARTMENT_COLORS[activeDept] : null;

  // ── PIE CHART helpers ──────────────────────────────────────────
  const getDeptColor = (dept) =>
    DEPARTMENT_COLORS[dept]?.color || "#8b5cf6";

  const getDeptLabel = (dept) => {
    if (!dept) return "Other";
    const m = dept.match(/\(([^)]+)\)/);
    return m ? m[1] : dept;
  };

  const buildConicGradient = (slices, totalKey = "total", labelKey = "college_department") => {
    const total = slices.reduce((s, i) => s + i[totalKey], 0);
    if (total === 0) return { gradient: "#e5e7eb", total: 0, sliceData: [] };
    let cum = 0;
    const sliceData = slices.map((item) => {
      const pct = (item[totalKey] / total) * 100;
      const start = cum;
      cum += pct;
      return { ...item, pct: Math.round(pct), start, end: cum };
    });
    const gradient = `conic-gradient(${sliceData
      .map(
        (s) =>
          `${getDeptColor(s[labelKey])} ${s.start.toFixed(2)}% ${s.end.toFixed(2)}%`
      )
      .join(", ")})`;
    return { gradient, total, sliceData };
  };

  // Dept-level chart (all departments)
  const { gradient: deptGradient, total: deptTotal, sliceData: deptSlices } =
    buildConicGradient(deptDistribution, "total", "college_department");

  // Program-level chart inside active dept with shaded colors
  const getShadedColor = (baseHex, index, total) => {
    if (!baseHex) return "#478745";
    if (total <= 1) return baseHex;
    let hex = baseHex.replace("#", "");
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Blend base color with white as index increases to get lighter shades
    const ratio = index / total;
    const nr = Math.round(r + (255 - r) * ratio * 0.75);
    const ng = Math.round(g + (255 - g) * ratio * 0.75);
    const nb = Math.round(b + (255 - b) * ratio * 0.75);
    return `rgb(${nr}, ${ng}, ${nb})`;
  };

  const deptProgMatches = progDistribution.filter((p) => {
    const prog = programs.find((pr) => pr.program_code === p.program_code);
    return prog?.college_department === activeDept;
  });

  const sortedProgMatches = [...deptProgMatches].sort((a, b) => b.total - a.total);
  const progMatchesWithColor = sortedProgMatches.map((item, index) => {
    const color = getShadedColor(activeDeptStyle?.color, index, sortedProgMatches.length);
    return { ...item, color };
  });

  const progTotal = progMatchesWithColor.reduce((s, i) => s + i.total, 0);

  const buildProgConicGradient = (slices) => {
    const total = slices.reduce((s, i) => s + i.total, 0);
    if (total === 0) return "#e5e7eb";
    let cum = 0;
    const slicesGradient = slices.map((s) => {
      const pct = (s.total / total) * 100;
      const start = cum;
      cum += pct;
      return `${s.color} ${start.toFixed(2)}% ${cum.toFixed(2)}%`;
    });
    return `conic-gradient(${slicesGradient.join(", ")})`;
  };

  const progGradient = buildProgConicGradient(progMatchesWithColor);

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <div className="page">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h2>Programs Offered</h2>
          {activeDept && (
            <p className="dept-breadcrumb">
              <button className="breadcrumb-back" onClick={() => setActiveDept(null)}>
                ← All Departments
              </button>
              <span className="breadcrumb-sep">›</span>
              <span>{activeDept}</span>
            </p>
          )}
        </div>
        {activeDept && (
          <button className="back-btn" onClick={() => setActiveDept(null)}>
            ← Back
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-card"><p>Loading programs...</p></div>
      ) : errorMessage ? (
        <div className="loading-card"><p style={{ color: "red" }}>{errorMessage}</p></div>
      ) : !activeDept ? (
        /* ══ DEPARTMENT VIEW ══════════════════════════════════ */
        <div className="programs-layout">

          {/* LEFT: Department cards */}
          <div className="dept-grid">
            {Object.entries(grouped).map(([dept, progs]) => {
              const style = DEPARTMENT_COLORS[dept] || {
                color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe", abbr: "?",
              };
              const matchData = deptDistribution.find(
                (d) => d.college_department === dept
              );
              const matchCount = matchData?.total || 0;
              return (
                <button
                  key={dept}
                  className="dept-card"
                  style={{ background: style.bg, borderColor: style.border }}
                  onClick={() => setActiveDept(dept)}
                >
                  <span className="dept-abbr" style={{ background: style.color }}>
                    {style.abbr}
                  </span>
                  <div className="dept-info">
                    <h3 className="dept-title">{dept}</h3>
                    <p className="dept-count">
                      {progs.length} program{progs.length !== 1 ? "s" : ""}
                      {matchCount > 0 && (
                        <span className="dept-matches" style={{ color: style.color }}>
                          &nbsp;· {matchCount} match{matchCount !== 1 ? "es" : ""}
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="dept-arrow" style={{ color: style.color }}>→</span>
                </button>
              );
            })}
          </div>

          {/* RIGHT: Department pie chart */}
          <div className="chart-panel">
            <h4 className="chart-panel-title">Student Matches by Department</h4>
            <p className="chart-panel-sub">Based on top program recommendations</p>

            {deptTotal > 0 ? (
              <>
                <div className="donut-wrap">
                  <div
                    className="donut-ring"
                    style={{ background: deptGradient }}
                  >
                    <div className="donut-hole">
                      <span className="donut-count">{deptTotal}</span>
                      <span className="donut-label">Total</span>
                    </div>
                  </div>
                </div>

                <div className="chart-legend">
                  {deptSlices.map((item) => (
                    <button
                      key={item.college_department}
                      className="legend-row legend-btn"
                      onClick={() => setActiveDept(item.college_department)}
                    >
                      <span
                        className="legend-dot"
                        style={{ background: getDeptColor(item.college_department) }}
                      />
                      <span className="legend-name">
                        {getDeptLabel(item.college_department)}
                      </span>
                      <span className="legend-val">
                        <strong>{item.total}</strong>
                        <em>{item.pct}%</em>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="no-data">
                <p>No student match data yet.<br />Take the assessment to populate this chart.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ══ PROGRAMS UNDER SELECTED DEPARTMENT ══════════════ */
        <div className="programs-layout">

          {/* LEFT: Program cards */}
          <div className="programs-col">
            <p className="dept-subtitle" style={{ color: activeDeptStyle?.color }}>
              {activeDeptPrograms.length} program{activeDeptPrograms.length !== 1 ? "s" : ""} &mdash; {activeDept}
            </p>

            {activeDeptPrograms.length === 0 ? (
              <div className="loading-card"><p>No programs found.</p></div>
            ) : (
              <div className="grid">
                {activeDeptPrograms.map((program) => {
                  const matchData = progDistribution.find(
                    (p) => p.program_code === program.program_code
                  );
                  const matchCount = matchData?.total || 0;
                  return (
                    <div
                      className="program-card"
                      key={program.id}
                      style={{ borderTop: `4px solid ${activeDeptStyle?.color || "#478745"}` }}
                    >
                      <div className="program-content">
                        <div className="prog-card-top">
                          <span
                            className="prog-code-badge"
                            style={{
                              background: activeDeptStyle?.bg || "#f0fdf4",
                              color: activeDeptStyle?.color || "#10b981",
                              border: `1px solid ${activeDeptStyle?.border || "#a7f3d0"}`,
                            }}
                          >
                            {program.program_code}
                          </span>
                          {matchCount > 0 && (
                            <span
                              className="match-chip"
                              style={{
                                background: activeDeptStyle?.bg,
                                color: activeDeptStyle?.color,
                              }}
                            >
                              {matchCount} match{matchCount !== 1 ? "es" : ""}
                            </span>
                          )}
                        </div>
                        <h3 className="prog-name">{program.program_name}</h3>
                        <p className="desc">
                          {program.description || "No description available."}
                        </p>
                      </div>
                      <button
                        className="view-btn"
                        style={{ background: activeDeptStyle?.color }}
                        onClick={() => setSelectedProgram(program)}
                      >
                        Details
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Program-level pie chart for this dept */}
          <div className="chart-panel">
            <h4 className="chart-panel-title">Program Matches</h4>
            <p className="chart-panel-sub" style={{ color: activeDeptStyle?.color }}>
              {activeDept}
            </p>

            {progTotal > 0 ? (
              <>
                <div className="donut-wrap">
                  <div
                    className="donut-ring"
                    style={{ background: progGradient }}
                  >
                    <div className="donut-hole">
                      <span className="donut-count">{progTotal}</span>
                      <span className="donut-label">Matches</span>
                    </div>
                  </div>
                </div>

                <div className="chart-legend">
                  {progMatchesWithColor.map((item) => {
                    const pct =
                      progTotal > 0 ? Math.round((item.total / progTotal) * 100) : 0;
                    return (
                      <div key={item.program_code} className="legend-row">
                        <span
                          className="legend-dot"
                          style={{ background: item.color }}
                        />
                        <span className="legend-name">{item.program_code}</span>
                        <span className="legend-val">
                          <strong>{item.total}</strong>
                          <em>{pct}%</em>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="no-data">
                <p>No match data for this department yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL */}
      {selectedProgram && (
        <div className="modal-overlay" onClick={() => setSelectedProgram(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div
              className="modal-dept-tag"
              style={{
                background: DEPARTMENT_COLORS[selectedProgram.college_department]?.bg || "#f0fdf4",
                color: DEPARTMENT_COLORS[selectedProgram.college_department]?.color || "#10b981",
                border: `1px solid ${DEPARTMENT_COLORS[selectedProgram.college_department]?.border || "#a7f3d0"}`,
              }}
            >
              {selectedProgram.college_department}
            </div>

            <span
              className="prog-code-badge"
              style={{
                background: DEPARTMENT_COLORS[selectedProgram.college_department]?.bg || "#f0fdf4",
                color: DEPARTMENT_COLORS[selectedProgram.college_department]?.color || "#10b981",
                border: `1px solid ${DEPARTMENT_COLORS[selectedProgram.college_department]?.border || "#a7f3d0"}`,
                marginTop: "12px",
                display: "inline-block",
              }}
            >
              {selectedProgram.program_code}
            </span>

            <h3 style={{ marginTop: "8px", color: "#1f2937", lineHeight: "1.4" }}>
              {selectedProgram.program_name}
            </h3>

            <p style={{ marginTop: "12px", fontSize: "14px", color: "#6b7280", lineHeight: "1.6" }}>
              {selectedProgram.description || "No description available."}
            </p>

            <button className="close-btn" onClick={() => setSelectedProgram(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Programs;