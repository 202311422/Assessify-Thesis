import "./ResultsPage.css";

export default function ResultsPage({ user, answers, setPage }) {
  const formattedAnswers = answers?.formattedAnswers || [];
  const results = answers?.results || [];

  const grouped = formattedAnswers.reduce((acc, item) => {
    const key = item.assessmentTitle || "Assessment";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const topResult = results[0];
  const otherResults = results.slice(1);

  return (
    <div className="results-page">
      <div className="results-container">
        <div className="results-header">
          <p className="results-user">Student: {user?.full_name}</p>
          <h1>Assessment Results</h1>
          <p className="results-subtitle">
            Here are your assessment results based on the rule-based
            recommendation engine.
          </p>
        </div>

        <div className="results-card">
          <h2>Recommended Program</h2>

          {!topResult ? (
            <p>No assessment results available yet.</p>
          ) : (
            <div className="answers-list">
              <div className="answer-group">
                <h3 className="answer-group-title">{topResult.name}</h3>
                <div className="answer-item">
                  <h4>Match Percentage</h4>
                  <p>{topResult.percentage}%</p>
                </div>
                <div className="answer-item">
                  <h4>Why this was recommended</h4>
                  <p>{topResult.reason}</p>
                </div>
              </div>

              {otherResults.length > 0 && (
                <div className="answer-group">
                  <h3 className="answer-group-title">
                    Other Recommended Programs
                  </h3>

                  {otherResults.map((item, index) => (
                    <div className="answer-item" key={index}>
                      <h4>{item.name}</h4>
                      <p>{item.percentage}% match</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="results-card">
          <h2>Your Answers</h2>

          {formattedAnswers.length === 0 ? (
            <p>No answers submitted yet.</p>
          ) : (
            <div className="answers-list">
              {Object.keys(grouped).map((groupName) => (
                <div className="answer-group" key={groupName}>
                  <h3 className="answer-group-title">{groupName}</h3>

                  {grouped[groupName].map((item, index) => (
                    <div className="answer-item" key={index}>
                      <h4>{item.question}</h4>
                      <p>{item.answer}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="results-actions">
          <button
            className="back-dashboard-btn"
            onClick={() => setPage("dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}