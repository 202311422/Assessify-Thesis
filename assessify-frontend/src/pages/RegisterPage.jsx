import { useState } from "react";
import axios from "axios";
import "./LoginPage.css";

export default function RegisterPage({ setPage }) {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRegister = async () => {
    if (!firstName.trim()) {
      alert("Please enter your first name.");
      return;
    }

    if (!lastName.trim()) {
      alert("Please enter your last name.");
      return;
    }

    if (!email.trim()) {
      alert("Please enter your email.");
      return;
    }

    if (!password.trim()) {
      alert("Please enter your password.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost/assessify/backend/auth/register.php",
        {
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          email,
          password,
        }
      );

      alert(res.data.message);

      if (res.data.success) {
        setPage("login");
      }
    } catch (error) {
      console.error("Register error:", error);
      alert("Register failed.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-left">
          <h1>WELCOME</h1>
          <p className="subtitle">Welcome! Please enter your details.</p>

          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              placeholder="Enter your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Middle Name / Initial</label>
            <input
              type="text"
              placeholder="Enter your middle name or initial"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              placeholder="Enter your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="**********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                <img
                  src={showPassword ? "/eye-open.png" : "/eye-closed.png"}
                  alt=""
                />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Re-enter Password</label>
            <div className="password-wrapper">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="**********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                <img
                  src={showConfirm ? "/eye-open.png" : "/eye-closed.png"}
                  alt=""
                />
              </button>
            </div>
          </div>

          <button className="sign-in-btn" onClick={handleRegister}>
            Sign up
          </button>

          <button type="button" className="google-btn">
            <span className="google-icon">G</span>
            Sign up with Google
          </button>

          <p className="signup-text">
            Already have an account?{" "}
            <button className="signup-link" onClick={() => setPage("login")}>
              Sign in
            </button>
          </p>
        </div>

        <div className="login-right">
          <div className="visual-box">
            <img
              src="/login-visual.png"
              alt=""
              className="side-image"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <div className="fallback-visual">
              <span>LOGO</span>
              <span>or picture</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}