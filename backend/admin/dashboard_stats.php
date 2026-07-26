<?php
require_once __DIR__ . "/../utils/cors.php";
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../utils/response.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    sendResponse(false, "Invalid request method.", null, 405);
}

try {
    $studentsStmt = $pdo->query("
        SELECT COUNT(*) AS total_students
        FROM users
        WHERE is_active = 1
    ");
    $totalStudents = (int)$studentsStmt->fetch()["total_students"];

    $programsStmt = $pdo->query("
        SELECT COUNT(*) AS total_programs
        FROM programs
        WHERE is_active = 1
    ");
    $totalPrograms = (int)$programsStmt->fetch()["total_programs"];

    $questionsStmt = $pdo->query("
        SELECT COUNT(*) AS total_questions
        FROM assessment_questions
        WHERE is_active = 1
    ");
    $totalQuestions = (int)$questionsStmt->fetch()["total_questions"];

    $completedStmt = $pdo->query("
        SELECT COUNT(*) AS completed_assessments
        FROM assessment_sessions
        WHERE status = 'completed'
    ");
    $completedAssessments = (int)$completedStmt->fetch()["completed_assessments"];

    $studentsTakenStmt = $pdo->query("
        SELECT COUNT(DISTINCT user_id) AS students_taken
        FROM assessment_sessions
        WHERE status = 'completed'
    ");
    $studentsTaken = (int)$studentsTakenStmt->fetch()["students_taken"];

    $mostRecommendedStmt = $pdo->query("
        SELECT 
            p.program_code,
            p.program_name,
            COUNT(ar.top_program_id) AS recommendation_count
        FROM assessment_results ar
        INNER JOIN programs p ON ar.top_program_id = p.id
        GROUP BY ar.top_program_id, p.program_code, p.program_name
        ORDER BY recommendation_count DESC
        LIMIT 1
    ");
    $mostRecommended = $mostRecommendedStmt->fetch();

    if ($mostRecommended) {
        $mostRecommended["recommendation_count"] = (int)$mostRecommended["recommendation_count"];
    }

    $recentResultsStmt = $pdo->query("
        SELECT
            ar.id AS result_id,
            ar.created_at,
            s.strand,
            u.full_name,
            u.applicant_number,
            p.program_code,
            p.program_name,
            rr.percentage
        FROM assessment_results ar
        INNER JOIN assessment_sessions s ON ar.session_id = s.id
        INNER JOIN users u ON ar.user_id = u.id
        LEFT JOIN programs p ON ar.top_program_id = p.id
        LEFT JOIN result_recommendations rr
            ON rr.result_id = ar.id
            AND rr.program_id = ar.top_program_id
        WHERE s.status = 'completed'
        ORDER BY ar.created_at DESC, ar.id DESC
        LIMIT 5
    ");
    $recentResults = $recentResultsStmt->fetchAll();

    foreach ($recentResults as &$result) {
        $result["result_id"] = (int)$result["result_id"];
        $result["percentage"] = $result["percentage"] !== null ? (float)$result["percentage"] : null;
    }
    unset($result);

    $programDistributionStmt = $pdo->query("
        SELECT
            p.program_code,
            p.program_name,
            COUNT(ar.top_program_id) AS total
        FROM programs p
        LEFT JOIN assessment_results ar ON ar.top_program_id = p.id
        WHERE p.is_active = 1
        GROUP BY p.id, p.program_code, p.program_name
        ORDER BY total DESC, p.program_code ASC
    ");
    $programDistribution = $programDistributionStmt->fetchAll();

    foreach ($programDistribution as &$program) {
        $program["total"] = (int)$program["total"];
    }
    unset($program);

    $departmentDistributionStmt = $pdo->query("
        SELECT
            p.college_department,
            COUNT(ar.id) AS total
        FROM assessment_results ar
        INNER JOIN programs p ON ar.top_program_id = p.id
        GROUP BY p.college_department
        ORDER BY total DESC
    ");
    $departmentDistribution = $departmentDistributionStmt->fetchAll();

    foreach ($departmentDistribution as &$dept) {
        $dept["total"] = (int)$dept["total"];
    }
    unset($dept);

    sendResponse(true, "Dashboard statistics loaded successfully.", [
        "cards" => [
            "total_students" => $totalStudents,
            "total_programs" => $totalPrograms,
            "total_questions" => $totalQuestions,
            "completed_assessments" => $completedAssessments,
            "students_taken" => $studentsTaken
        ],
        "most_recommended_program" => $mostRecommended ?: null,
        "recent_results" => $recentResults,
        "program_distribution" => $programDistribution,
        "department_distribution" => $departmentDistribution
    ]);

} catch (Exception $e) {
    sendResponse(false, "Failed to load dashboard statistics.", [
        "error" => $e->getMessage()
    ], 500);
}
?>