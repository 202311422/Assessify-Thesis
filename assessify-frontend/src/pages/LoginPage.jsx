import { useState } from "react";
import axios from "axios";
import "./LoginPage.css";

export default function LoginPage({ setPage, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost/assessify/backend/auth/login.php",
        { email, password }
      );

      if (res.data.success) {
        onLoginSuccess(res.data.user);
      } else {
        alert(res.data.message);
      }

    } catch (error) {
      console.error("Login error:", error);

      // 🔥 Improved error messages
      if (error.response) {
        alert("Server error: " + JSON.stringify(error.response.data));
      } else if (error.request) {
        alert("No response from server. Check XAMPP Apache.");
      } else {
        alert("Login failed: " + error.message);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        
        {/* LEFT SIDE */}
        <div className="login-left">
          <h1>WELCOME BACK</h1>
          <p className="subtitle">Welcome back! Please enter your details.</p>

          {/* EMAIL */}
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

          {/* OPTIONS */}
          <div className="login-options">
            <label className="remember-box">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>

            <button type="button" className="forgot-btn">
              Forgot password
            </button>
          </div>

          {/* LOGIN BUTTON */}
          <button className="sign-in-btn" onClick={handleLogin}>
            Sign in
          </button>

          {/* GOOGLE */}
          <button type="button" className="google-btn">
            <span className="google-icon">G</span>
            Sign in with Google
          </button>

          {/* SIGN UP */}
          <p className="signup-text">
            Don&apos;t have an account?{" "}
            <button
              className="signup-link"
              onClick={() => setPage("register")}
            >
              Sign up for free!
            </button>
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-right">
          <div className="visual-box">
            <img
              src="/login-visual.png"
              alt=""
              className="side-image"npm start
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