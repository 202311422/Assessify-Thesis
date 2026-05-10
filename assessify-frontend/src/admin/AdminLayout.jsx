import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import "./AdminLayout.css";

const AdminLayout = () => {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const [programs, setPrograms] = useState([
    {
      name: "BS Computer Science",
      applicants: 40,
      description:
        "Focuses on programming, artificial intelligence, and software development. Ideal for students who enjoy problem-solving and building systems.",
    },
    {
      name: "BS Information Technology",
      applicants: 35,
      description:
        "Covers networking, system administration, and web development with practical industry applications.",
    },
    {
      name: "BS Accountancy",
      applicants: 25,
      description:
        "Deals with financial reporting, auditing, and business management principles with strong analytical focus.",
    },
  ]);

  const menu = [
    { name: "Dashboard", path: "/admin" },
    { name: "Assessment Takers", path: "/admin/applicants" },
    { name: "Programs", path: "/admin/programs" },
    { name: "Results", path: "/admin/results" },
    { name: "Settings", path: "/admin/settings" },
  ];

  const handleLogout = () => {
    alert("Logged out"); // replace with real logout logic
  };

  return (
    <div className="admin-container">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <h2 className="logo">ASSESSIFY</h2>

          <ul>
            {menu.map((item) => (
              <li
                key={item.path}
                className={location.pathname === item.path ? "active" : ""}
              >
                <Link to={item.path}>{item.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* LOGOUT BUTTON */}
        <div className="sidebar-bottom">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="main-content">
        <header className="top-bar">
          <h1>Admin Panel</h1>

          <div className="user" style={{ position: "relative" }}>
            <span 
              className="admin-name"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              Admin ▼
            </span>

            {showDropdown && (
              <div className="admin-dropdown">
                <Link to="/admin/settings" onClick={() => setShowDropdown(false)}>Settings</Link>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </header>

        <Outlet context={{ programs, setPrograms }} />
      </div>
    </div>
  );
};

export default AdminLayout;