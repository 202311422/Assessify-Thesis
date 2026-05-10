<?php
require_once __DIR__ . "/../utils/cors.php";
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../utils/response.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    sendResponse(false, "Invalid request method.", null, 405);
}

$resultId = $_GET["result_id"] ?? null;
$userId = $_GET["user_id"] ?? null;

if (!$resultId && !$userId) {
    sendResponse(false, "Result ID or User ID is required.", null, 400);
}

try {
    /*
        This file supports two ways of loading results:

        1. By result_id:
           get_result.php?result_id=1

        2. By user_id:
           get_result.php?user_id=1

        If user_id is used, the system loads the latest completed assessment result.
        This supports retakes because each retake creates a new result record.

        Important revision:
        Strand now comes from assessment_sessions.strand,
        not users.strand.
    */

    if ($resultId) {
        $resultCondition = "ar.id = ?";
        $resultParams = [$resultId];
        $orderClause = "ORDER BY ar.created_at DESC";
    } else {
        $resultCondition = "ar.user_id = ? AND s.status = 'completed'";
        $resultParams = [$userId];
        $orderClause = "ORDER BY ar.created_at DESC";
    }

    // 1. Get result summary
    $resultStmt = $pdo->prepare("
        SELECT 
            ar.id AS result_id,
            ar.session_id,
            ar.user_id,
            ar.total_possible_score,
            ar.created_at,

            s.strand,

            u.first_name,
            u.middle_name,
            u.last_name,
            u.full_name,
            u.email,
            u.applicant_number,

            p.id AS top_program_id,
            p.program_code AS top_program_code,
            p.program_name AS top_program_name,
            p.description AS top_program_description
        FROM assessment_results ar
        INNER JOIN users u ON ar.user_id = u.id
        INNER JOIN assessment_sessions s ON ar.session_id = s.id
        LEFT JOIN programs p ON ar.top_program_id = p.id
        WHERE $resultCondition
        $orderClause
        LIMIT 1
    ");

    $resultStmt->execute($resultParams);
    $result = $resultStmt->fetch();

    if (!$result) {
        sendResponse(false, "Result not found.", null, 404);
    }

    // 2. Get ranked recommendations, max top 3 only
    $recommendationStmt = $pdo->prepare("
        SELECT
            rr.recommendation_rank AS rank,
            rr.program_id,
            p.program_code,
            p.program_name,
            p.description,
            rr.raw_score,
            rr.percentage
        FROM result_recommendations rr
        INNER JOIN programs p ON rr.program_id = p.id
        WHERE rr.result_id = ?
        ORDER BY rr.recommendation_rank ASC
        LIMIT 3
    ");
    $recommendationStmt->execute([$result["result_id"]]);
    $recommendations = $recommendationStmt->fetchAll();

    // 3. Get explanation
    $explanationStmt = $pdo->prepare("
        SELECT explanation
        FROM ai_explanations
        WHERE result_id = ?
        ORDER BY id DESC
        LIMIT 1
    ");
    $explanationStmt->execute([$result["result_id"]]);
    $explanationRow = $explanationStmt->fetch();

    $explanation = $explanationRow ? $explanationRow["explanation"] : "";

    sendResponse(true, "Result loaded successfully.", [
        "result" => [
            "result_id" => $result["result_id"],
            "session_id" => $result["session_id"],
            "user_id" => $result["user_id"],

            "student" => [
                "first_name" => $result["first_name"],
                "middle_name" => $result["middle_name"],
                "last_name" => $result["last_name"],
                "full_name" => $result["full_name"],
                "email" => $result["email"],
                "applicant_number" => $result["applicant_number"]
            ],

            "strand" => $result["strand"],

            "top_program" => [
                "program_id" => $result["top_program_id"],
                "program_code" => $result["top_program_code"],
                "program_name" => $result["top_program_name"],
                "description" => $result["top_program_description"]
            ],

            "total_possible_score" => $result["total_possible_score"],
            "created_at" => $result["created_at"],
            "recommendations" => $recommendations,
            "explanation" => $explanation
        ]
    ]);

} catch (Exception $e) {
    sendResponse(false, "Failed to load result.", [
        "error" => $e->getMessage()
    ], 500);
}
?>