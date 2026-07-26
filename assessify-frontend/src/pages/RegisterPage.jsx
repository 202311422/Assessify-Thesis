import { useState, useEffect } from "react";
import axios from "axios";
import "./LoginPage.css";

export default function RegisterPage({ setPage, onLoginSuccess }) {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
        if (onLoginSuccess) {
          onLoginSuccess(res.data.data?.user || res.data.user);
        } else {
          alert("Registration and login successful!");
          setPage("login");
        }
      } else {
        alert(res.data.message || "Google signup failed.");
      }
    } catch (error) {
      console.error("Google signup error:", error);
      const errMsg = error.response?.data?.message || "Google signup failed.";
      alert(errMsg);
    }
  };

  useEffect(() => {
    if (!googleClientId || !gisLoaded) return;

    let isMounted = true;
    const initializeGoogleSignUp = () => {
      if (!isMounted) return;
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
        });

        const btnContainer = document.getElementById("google-signup-btn-container");
        if (btnContainer) {
          window.google.accounts.id.renderButton(
            btnContainer,
            {
              theme: "outline",
              size: "large",
              width: "360", // fits standard width beautifully
              text: "signup_with",
              shape: "rectangular"
            }
          );
        } else {
          setTimeout(initializeGoogleSignUp, 100);
        }
      } else {
        setTimeout(initializeGoogleSignUp, 100);
      }
    };

    initializeGoogleSignUp();
    return () => {
      isMounted = false;
    };
  }, [googleClientId, gisLoaded]);

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
      const errorMsg = error.response?.data?.message || "Register failed.";
      alert(errorMsg);
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

          {googleClientId && gisLoaded && !scriptLoadError ? (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px", width: "100%" }}>
              <div id="google-signup-btn-container"></div>
            </div>
          ) : (
            <button
              type="button"
              className="google-btn"
              onClick={() => {
                if (scriptLoadError) {
                  alert("Google Sign-up script is blocked. Please disable your AdBlocker, Brave Shields, or privacy extensions for this website to enable Google Sign-up.");
                } else if (!googleClientId) {
                  alert("Google Sign-up is not configured. Please add a valid GOOGLE_CLIENT_ID to your backend .env file.");
                } else {
                  alert("Google Sign-up script is still loading. Please wait a moment...");
                }
              }}
              style={{ marginBottom: "12px" }}
            >
              <span className="google-icon">G</span>
              Sign up with Google
            </button>
          )}

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