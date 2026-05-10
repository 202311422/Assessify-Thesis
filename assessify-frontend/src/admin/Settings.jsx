import React, { useState } from "react";
import "./Settings.css";

const Settings = () => {
  const [form, setForm] = useState({
    name: "Admin",
    email: "admin@email.com",
    password: "",
    confirmPassword: "",
    theme: "light",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    alert("Settings saved!");
  };

  return (
    <div className="settings-page">
      <h2>Settings</h2>

      <div className="settings-grid">

        {/* PROFILE */}
        <div className="settings-card">
          <h3>Profile</h3>

          <label>Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        {/* PASSWORD */}
        <div className="settings-card">
          <h3>Change Password</h3>

          <label>New Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />

          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
          />
        </div>

        {/* SYSTEM */}
        <div className="settings-card">
          <h3>System Settings</h3>

          <label>Theme</label>
          <select name="theme" value={form.theme} onChange={handleChange}>
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
          </select>

          <label>
            <input type="checkbox" />
            Enable Notifications
          </label>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="save-section">
        <button className="save-btn" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings;