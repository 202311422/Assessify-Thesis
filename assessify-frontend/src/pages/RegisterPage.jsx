import { useState } from "react";
import axios from "axios";
import "./LoginPage.css"; // reuse same design

export default function RegisterPage({ setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost/assessify/backend/auth/register.php",
        {
          full_name: email, // TEMP (you can add full name later)
          email,
          password
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
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* PASSWORD */}
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

          {/* CONFIRM PASSWORD */}
          <div className="form-group">
            <label>Re enter Password</label>
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

          <div className="login-options">
            <label className="remember-box">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
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
            <button
              className="signup-link"
              onClick={() => setPage("login")}
            >
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