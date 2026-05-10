import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../pages/LoginPage.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost/assessify/backend/admin/login.php",
        {
          email,
          password,
        }
      );

      if (!res.data.success) {
        alert(res.data.message || "Admin login failed.");
        return;
      }

      const adminData = res.data.admin || res.data.data?.admin;

      localStorage.setItem(
        "admin",
        JSON.stringify(
          adminData || {
            email,
            role: "admin",
          }
        )
      );

      navigate("/admin");
    } catch (error) {
      console.error("Admin login error:", error);

      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Admin login failed.";

      alert(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-left">
          <h1>ADMIN LOGIN</h1>
          <p className="subtitle">Sign in to access the Assessify admin panel.</p>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter admin email"
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAdminLogin();
                  }
                }}
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

          <button
            className="sign-in-btn"
            onClick={handleAdminLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in as Admin"}
          </button>

          <p className="signup-text">
            Student side?{" "}
            <button className="signup-link" onClick={() => navigate("/")}>
              Go to student login
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
              <span>ADMIN</span>
              <span>ASSESSIFY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}