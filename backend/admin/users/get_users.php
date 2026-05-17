<?php
require_once __DIR__ . "/../../utils/cors.php";
require_once __DIR__ . "/../../config/db.php";
require_once __DIR__ . "/../../utils/response.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    sendResponse(false, "Invalid request method.", null, 405);
}

try {
    $stmt = $pdo->query("
        SELECT
            u.id,
            u.first_name,
            u.middle_name,
            u.last_name,
            u.full_name,
            u.email,
            u.applicant_number,
            u.is_active,
            u.created_at,

            COUNT(DISTINCT s.id) AS total_sessions,
            COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) AS completed_assessments,
            MAX(s.completed_at) AS latest_completed_at,

            latest_result.id AS latest_result_id,
            latest_program.program_code AS latest_top_program_code,
            latest_program.program_name AS latest_top_program_name,
            latest_reco.percentage AS latest_top_percentage
        FROM users u
        LEFT JOIN assessment_sessions s 
            ON s.user_id = u.id
        LEFT JOIN assessment_results latest_result
            ON latest_result.id = (
                SELECT ar2.id
                FROM assessment_results ar2
                WHERE ar2.user_id = u.id
                ORDER BY ar2.created_at DESC, ar2.id DESC
                LIMIT 1
            )
        LEFT JOIN programs latest_program 
            ON latest_result.top_program_id = latest_program.id
        LEFT JOIN result_recommendations latest_reco
            ON latest_reco.result_id = latest_result.id
            AND latest_reco.program_id = latest_result.top_program_id
        GROUP BY
            u.id,
            u.first_name,
            u.middle_name,
            u.last_name,
            u.full_name,
            u.email,
            u.applicant_number,
            u.is_active,
            u.created_at,
            latest_result.id,
            latest_program.program_code,
            latest_program.program_name,
            latest_reco.percentage
        ORDER BY u.created_at DESC, u.id DESC
    ");

    $users = $stmt->fetchAll();

    foreach ($users as &$user) {
        $user["id"] = (int)$user["id"];
        $user["is_active"] = (int)$user["is_active"];
        $user["total_sessions"] = (int)$user["total_sessions"];
        $user["completed_assessments"] = (int)$user["completed_assessments"];
        $user["latest_result_id"] = $user["latest_result_id"] !== null ? (int)$user["latest_result_id"] : null;
        $user["latest_top_percentage"] = $user["latest_top_percentage"] !== null ? (float)$user["latest_top_percentage"] : null;
    }
    unset($user);

    sendResponse(true, "Users loaded successfully.", [
        "users" => $users,
        "total_users" => count($users)
    ]);

} catch (Exception $e) {
    sendResponse(false, "Failed to load users.", [
        "error" => $e->getMessage()
    ], 500);
}
?>