<?php
require_once __DIR__ . "/../../utils/cors.php";
require_once __DIR__ . "/../../config/db.php";
require_once __DIR__ . "/../../utils/response.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    sendResponse(false, "Invalid request method.", null, 405);
}

$userId = isset($_GET["user_id"]) ? (int)$_GET["user_id"] : 0;

if (!$userId) {
    sendResponse(false, "User ID is required.", null, 400);
}

try {
    /*
        Student profile
    */
    $userStmt = $pdo->prepare("
        SELECT
            id,
            first_name,
            middle_name,
            last_name,
            full_name,
            email,
            applicant_number,
            is_active,
            created_at
        FROM users
        WHERE id = ?
        LIMIT 1
    ");

    $userStmt->execute([$userId]);
    $user = $userStmt->fetch();

    if (!$user) {
        sendResponse(false, "User not found.", null, 404);
    }

    $user["id"] = (int)$user["id"];
    $user["is_active"] = (int)$user["is_active"];

    /*
        Assessment history
    */
    $historyStmt = $pdo->prepare("
        SELECT
            s.id AS session_id,
            s.strand,
            s.status,
            s.started_at,
            s.completed_at,

            ar.id AS result_id,
            ar.top_program_id,
            ar.total_possible_score,
            ar.created_at AS result_created_at,

            p.program_code AS top_program_code,
            p.program_name AS top_program_name,

            rr.raw_score AS top_raw_score,
            rr.percentage AS top_percentage
        FROM assessment_sessions s
        LEFT JOIN assessment_results ar 
            ON ar.session_id = s.id
        LEFT JOIN programs p 
            ON ar.top_program_id = p.id
        LEFT JOIN result_recommendations rr 
            ON rr.result_id = ar.id
            AND rr.program_id = ar.top_program_id
        WHERE s.user_id = ?
        ORDER BY s.started_at DESC, s.id DESC
    ");

    $historyStmt->execute([$userId]);
    $assessmentHistory = $historyStmt->fetchAll();

    foreach ($assessmentHistory as &$item) {
        $item["session_id"] = (int)$item["session_id"];
        $item["result_id"] = $item["result_id"] !== null ? (int)$item["result_id"] : null;
        $item["top_program_id"] = $item["top_program_id"] !== null ? (int)$item["top_program_id"] : null;
        $item["total_possible_score"] = $item["total_possible_score"] !== null ? (int)$item["total_possible_score"] : null;
        $item["top_raw_score"] = $item["top_raw_score"] !== null ? (int)$item["top_raw_score"] : null;
        $item["top_percentage"] = $item["top_percentage"] !== null ? (float)$item["top_percentage"] : null;
    }
    unset($item);

    /*
        Summary counts
    */
    $summaryStmt = $pdo->prepare("
        SELECT
            COUNT(*) AS total_sessions,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_assessments,
            COUNT(CASE WHEN status != 'completed' THEN 1 END) AS incomplete_assessments
        FROM assessment_sessions
        WHERE user_id = ?
    ");

    $summaryStmt->execute([$userId]);
    $summary = $summaryStmt->fetch();

    $summary["total_sessions"] = (int)$summary["total_sessions"];
    $summary["completed_assessments"] = (int)$summary["completed_assessments"];
    $summary["incomplete_assessments"] = (int)$summary["incomplete_assessments"];

    sendResponse(true, "User details loaded successfully.", [
        "user" => $user,
        "summary" => $summary,
        "assessment_history" => $assessmentHistory
    ]);

} catch (Exception $e) {
    sendResponse(false, "Failed to load user details.", [
        "error" => $e->getMessage()
    ], 500);
}
?>