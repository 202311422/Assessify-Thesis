import { useState, useEffect } from "react";
import axios from "axios";
import "./LoginPage.css";

export default function LoginPage({ setPage, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleClientId, setGoogleClientId] = useState("");
  const [gisLoaded, setGisLoaded] = useState(false);
  const [scriptLoadError, setScriptLoadError] = useState(false);

  useEffect(() => {
    // 1. Fetch Google Client ID from backend
    axios
      .get("http://localhost/assessify/backend/config/google_config.php")
      .then((res) => {
        if (res.data.success && res.data.data?.google_client_id) {
          const cid = res.data.data.google_client_id;
          if (cid && !cid.includes("YOUR_GOOGLE_CLIENT_ID_HERE")) {
            setGoogleClientId(cid);
          }
        }
      })
      .catch((err) => console.error("Error loading Google config:", err));

    // 2. Load Google Identity Services Script dynamically
    if (!document.getElementById("google-gsi-script")) {
      const script = document.createElement("script");
      script.id = "google-gsi-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("Google GIS Script loaded successfully via onload");
        setGisLoaded(true);
      };
      script.onerror = () => {
        console.error("Failed to load Google GIS Script via onerror");
        setScriptLoadError(true);
      };
      document.head.appendChild(script);
    } else {
      if (window.google) {
        setGisLoaded(true);
      } else {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (window.google) {
            setGisLoaded(true);
            clearInterval(interval);
          } else if (attempts > 50) {
            setScriptLoadError(true);
            clearInterval(interval);
          }
        }, 100);
      }
    }
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    try {
      const res = await axios.post(
        "http://localhost/assessify/backend/auth/google_auth.php",
        { credential: response.credential }
      );

      if (res.data.success) {
        onLoginSuccess(res.data.data?.user || res.data.user);
      } else {
        alert(res.data.message || "Google login failed.");
      }
    } catch (error) {
      console.error("Google authentication error:", error);
      const errMsg = error.response?.data?.message || "Google authentication failed.";
      alert(errMsg);
    }
  };

  useEffect(() => {
    if (!googleClientId || !gisLoaded) return;

    let isMounted = true;
    const initializeGoogleSignIn = () => {
      if (!isMounted) return;
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
        });

        const btnContainer = document.getElementById("google-signin-btn-container");
        if (btnContainer) {
          window.google.accounts.id.renderButton(
            btnContainer,
            {
              theme: "outline",
              size: "large",
              width: "360", // fits standard width beautifully
              text: "signin_with",
              shape: "rectangular"
            }
          );
        } else {
          setTimeout(initializeGoogleSignIn, 100);
        }
      } else {
        setTimeout(initializeGoogleSignIn, 100);
      }
    };

    initializeGoogleSignIn();
    return () => {
      isMounted = false;
    };
  }, [googleClientId, gisLoaded]);

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

      if (error.response) {
        const errorMsg = error.response.data?.message || "Server error: " + JSON.stringify(error.response.data);
        alert(errorMsg);
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
        <div className="login-left">
          <h1>WELCOME BACK</h1>
          <p className="subtitle">Welcome back! Please enter your details.</p>

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

          <button className="sign-in-btn" onClick={handleLogin}>
            Sign in
          </button>

          {googleClientId && gisLoaded && !scriptLoadError ? (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px", width: "100%" }}>
              <div id="google-signin-btn-container"></div>
            </div>
          ) : (
            <button
              type="button"
              className="google-btn"
              onClick={() => {
                if (scriptLoadError) {
                  alert("Google Sign-in script is blocked. Please disable your AdBlocker, Brave Shields, or privacy extensions for this website to enable Google Sign-in.");
                } else if (!googleClientId) {
                  alert("Google Sign-in is not configured. Please add a valid GOOGLE_CLIENT_ID to your backend .env file.");
                } else {
                  alert("Google Sign-in script is still loading. Please wait a moment...");
                }
              }}
              style={{ marginBottom: "12px" }}
            >
              <span className="google-icon">G</span>
              Sign in with Google
            </button>
          )}

          <p className="signup-text">
            Don&apos;t have an account?{" "}
            <button className="signup-link" onClick={() => setPage("register")}>
              Sign up for free!
            </button>
          </p>
        </div>

        <div className="login-right">
          <div className="visual-box">
            <img
              src="/login-visual.png"
              alt="Gordon College"
              className="side-image"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <div className="fallback-visual">
              <span>ASSESSIFY</span>
              <span>GC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}