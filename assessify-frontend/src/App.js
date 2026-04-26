import { useState } from "react";
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
    setPage("login");
  };

  const handleStartAssessment = (type = "getting-to-know-you") => {
    setAssessmentType(type);
    setPage("assessment");
  };

  const handleAssessmentSubmit = (answers) => {
    setAssessmentAnswers(answers);
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