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
            ar.id AS result_id,
            ar.session_id,
            ar.user_id,
            ar.top_program_id,
            ar.total_possible_score,
            ar.created_at,

            u.full_name,
            u.email,
            u.applicant_number,

            s.strand,
            s.status,
            s.completed_at,

            p.program_code AS top_program_code,
            p.program_name AS top_program_name,

            rr.raw_score AS top_raw_score,
            rr.percentage AS top_percentage
        FROM assessment_results ar
        INNER JOIN users u ON ar.user_id = u.id
        INNER JOIN assessment_sessions s ON ar.session_id = s.id
        LEFT JOIN programs p ON ar.top_program_id = p.id
        LEFT JOIN result_recommendations rr 
            ON rr.result_id = ar.id 
            AND rr.program_id = ar.top_program_id
        ORDER BY ar.created_at DESC, ar.id DESC
    ");

    $results = $stmt->fetchAll();

    foreach ($results as &$result) {
        $result["result_id"] = (int)$result["result_id"];
        $result["session_id"] = (int)$result["session_id"];
        $result["user_id"] = (int)$result["user_id"];
        $result["top_program_id"] = $result["top_program_id"] !== null ? (int)$result["top_program_id"] : null;
        $result["total_possible_score"] = (int)$result["total_possible_score"];
        $result["top_raw_score"] = $result["top_raw_score"] !== null ? (int)$result["top_raw_score"] : null;
        $result["top_percentage"] = $result["top_percentage"] !== null ? (float)$result["top_percentage"] : null;
    }
    unset($result);

    sendResponse(true, "Assessment results loaded successfully.", [
        "results" => $results,
        "total_results" => count($results)
    ]);

} catch (Exception $e) {
    sendResponse(false, "Failed to load assessment results.", [
        "error" => $e->getMessage()
    ], 500);
}
?>