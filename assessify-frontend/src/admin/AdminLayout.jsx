import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import "./AdminLayout.css";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const admin = JSON.parse(localStorage.getItem("admin") || "{}");

  const menu = [
    { name: "Dashboard", path: "/admin" },
    { name: "Assessment Takers", path: "/admin/applicants" },
    { name: "Programs", path: "/admin/programs" },
    { name: "Results", path: "/admin/results" },
    { name: "Settings", path: "/admin/settings" },
  ];

  const handleLogoutClick = () => {
    setShowDropdown(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("admin");
    setShowLogoutModal(false);
    navigate("/admin/login", { replace: true });
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="admin-container">
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

        <div className="sidebar-bottom">
          <button className="logout-btn" onClick={handleLogoutClick}>
            Logout
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="top-bar">
          <h1>Admin Panel</h1>

          <div className="user" style={{ position: "relative" }}>
            <span
              className="admin-name"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {admin?.full_name || "Admin"} ▼
            </span>

            {showDropdown && (
              <div className="admin-dropdown">
                <Link
                  to="/admin/settings"
                  onClick={() => setShowDropdown(false)}
                >
                  Settings
                </Link>

                <button type="button" onClick={handleLogoutClick}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <Outlet />
      </div>

      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <div className="logout-modal-icon">!</div>

            <h2>Log out of admin panel?</h2>

            <p>
              Are you sure you want to log out? You will need to sign in again
              to access the admin dashboard.
            </p>

            <div className="logout-modal-actions">
              <button className="logout-cancel-btn" onClick={cancelLogout}>
                Cancel
              </button>

              <button className="logout-confirm-btn" onClick={confirmLogout}>
                Yes, log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;