<?php
require_once __DIR__ . "/../utils/cors.php";
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../utils/response.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    sendResponse(false, "Invalid request method.", null, 405);
}

$userId = $_GET["user_id"] ?? null;

try {
    /*
        Admin / Student Results List:
        - Shows list ng nag-take ng assessment
        - Supports optional filtering by user_id
        - Shows student name, applicant number
        - Shows strand from assessment_sessions
        - Shows top recommended program
        - Shows date taken
        - Shows all attempts, including retakes
    */

    $params = [];

    $whereClause = "
        WHERE s.status = 'completed'
    ";

    if ($userId) {
        $whereClause .= " AND ar.user_id = ?";
        $params[] = $userId;
    }

    $stmt = $pdo->prepare("
        SELECT 
            ar.id AS result_id,
            ar.session_id,
            ar.user_id,
            ar.total_possible_score,
            ar.created_at,

            s.strand,
            s.started_at,
            s.completed_at,
            s.status,

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
        INNER JOIN assessment_sessions s ON ar.session_id = s.id
        INNER JOIN users u ON ar.user_id = u.id
        LEFT JOIN programs p ON ar.top_program_id = p.id
        $whereClause
        ORDER BY ar.created_at DESC
    ");

    $stmt->execute($params);
    $results = $stmt->fetchAll();

    foreach ($results as &$result) {
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

        $explanationStmt = $pdo->prepare("
            SELECT explanation
            FROM ai_explanations
            WHERE result_id = ?
            ORDER BY id DESC
            LIMIT 1
        ");
        $explanationStmt->execute([$result["result_id"]]);
        $explanationRow = $explanationStmt->fetch();

        $result["student"] = [
            "id" => $result["user_id"],
            "first_name" => $result["first_name"],
            "middle_name" => $result["middle_name"],
            "last_name" => $result["last_name"],
            "full_name" => $result["full_name"],
            "email" => $result["email"],
            "applicant_number" => $result["applicant_number"]
        ];

        $result["top_program"] = [
            "program_id" => $result["top_program_id"],
            "program_code" => $result["top_program_code"],
            "program_name" => $result["top_program_name"],
            "description" => $result["top_program_description"]
        ];

        $result["recommendations"] = $recommendations;
        $result["explanation"] = $explanationRow["explanation"] ?? "";

        unset(
            $result["first_name"],
            $result["middle_name"],
            $result["last_name"],
            $result["full_name"],
            $result["email"],
            $result["applicant_number"],
            $result["top_program_id"],
            $result["top_program_code"],
            $result["top_program_name"],
            $result["top_program_description"]
        );
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