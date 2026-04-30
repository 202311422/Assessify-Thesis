import { useState } from "react";
import axios from "axios";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AssessmentPage from "./pages/AssessmentPage";
import ResultsPage from "./pages/ResultsPage";

function App() {
  const [page, setPage] = useState(() => {
    return localStorage.getItem("user") ? "dashboard" : "login";
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [assessmentType, setAssessmentType] = useState("getting-to-know-you");
  const [assessmentAnswers, setAssessmentAnswers] = useState([]);

  const handleLoginSuccess = (loggedInUser) => {
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setAssessmentAnswers([]);
    setPage("login");
  };

  const handleStartAssessment = (type = "getting-to-know-you") => {
    setAssessmentType(type);
    setPage("assessment");
  };

  const handleAssessmentSubmit = async (assessmentData) => {
    setAssessmentAnswers(assessmentData);

    const topResult = assessmentData.results?.[0];

    if (!user?.id) {
      alert("User ID missing. Please log out and log in again.");
      setPage("results");
      return;
    }

    if (!topResult) {
      alert("No assessment result found.");
      setPage("results");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost/assessify/backend/assessment/save_result.php",
        {
          user_id: user.id,
          assessment_type: assessmentData.assessmentType,
          assessment_title: assessmentData.assessmentTitle,
          top_program: topResult.name,
          top_percentage: topResult.percentage,
          top_reason: topResult.reason,
          results: assessmentData.results,
          formattedAnswers: assessmentData.formattedAnswers,
          traitScores: assessmentData.traitScores,
        }
      );

      if (!res.data.success) {
        alert(res.data.message || "Assessment save failed.");
      }
    } catch (error) {
      console.error("Save assessment error:", error);
      alert("Assessment result was calculated, but failed to save to database.");
    }

    setPage("results");
  };

  if (page === "register") {
    return <RegisterPage setPage={setPage} />;
  }

  if (page === "assessment" && user) {
    return (
      <AssessmentPage
        user={user}
        assessmentType={assessmentType}
        setPage={setPage}
        onSubmitAssessment={handleAssessmentSubmit}
      />
    );
  }

  if (page === "results" && user) {
    return (
      <ResultsPage
        user={user}
        answers={assessmentAnswers}
        setPage={setPage}
      />
    );
  }

  if (page === "dashboard" && user) {
    return (
      <DashboardPage
        user={user}
        handleLogout={handleLogout}
        onStartAssessment={handleStartAssessment}
      />
    );
  }

  return (
    <LoginPage
      setPage={setPage}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}

export default App;