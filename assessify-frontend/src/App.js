import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AssessmentPage from "./pages/AssessmentPage";
import ResultsPage from "./pages/ResultsPage";

import AdminLogin from "./admin/AdminLogin";
import AdminProtectedRoute from "./admin/AdminProtectedRoute";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import Applicants from "./admin/Applicants";
import Programs from "./admin/Programs";
import AdminResults from "./admin/Results";
import Settings from "./admin/Settings";

function StudentApp() {
  const [page, setPage] = useState(() => {
    return localStorage.getItem("user") ? "dashboard" : "login";
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [assessmentType, setAssessmentType] = useState("main-assessment");
  const [latestResultId, setLatestResultId] = useState(null);
  const [latestResultData, setLatestResultData] = useState(null);

  const handleLoginSuccess = (loggedInUser) => {
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setLatestResultId(null);
    setLatestResultData(null);
    setPage("login");
  };

  const handleStartAssessment = (type = "main-assessment") => {
    setAssessmentType(type);
    setPage("assessment");
  };

  const handleAssessmentSubmit = (submissionResult) => {
    setLatestResultId(submissionResult?.result_id || null);
    setLatestResultData(submissionResult || null);
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
        resultId={latestResultId}
        resultData={latestResultData}
        setPage={setPage}
        onRetakeAssessment={() => handleStartAssessment("main-assessment")}
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="applicants" element={<Applicants />} />
          <Route path="programs" element={<Programs />} />
          <Route path="results" element={<AdminResults />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="/" element={<StudentApp />} />
        <Route path="/login" element={<StudentApp />} />
        <Route path="/register" element={<StudentApp />} />
        <Route path="/student" element={<StudentApp />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;