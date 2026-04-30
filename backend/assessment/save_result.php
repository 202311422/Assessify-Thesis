<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

require_once "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$user_id = $data["user_id"] ?? null;
$assessment_type = $data["assessment_type"] ?? "";
$assessment_title = $data["assessment_title"] ?? "";
$top_program = $data["top_program"] ?? "";
$top_percentage = $data["top_percentage"] ?? 0;
$top_reason = $data["top_reason"] ?? "";
$results_json = json_encode($data["results"] ?? []);
$answers_json = json_encode($data["formattedAnswers"] ?? []);
$trait_scores_json = json_encode($data["traitScores"] ?? []);

if (!$user_id || !$assessment_type || !$assessment_title || !$top_program) {
    echo json_encode([
        "success" => false,
        "message" => "Missing required assessment data."
    ]);
    exit;
}

try {
    $stmt = $conn->prepare("
        INSERT INTO assessment_results (
            user_id,
            assessment_type,
            assessment_title,
            top_program,
            top_percentage,
            top_reason,
            results_json,
            answers_json,
            trait_scores_json
        ) VALUES (
            :user_id,
            :assessment_type,
            :assessment_title,
            :top_program,
            :top_percentage,
            :top_reason,
            :results_json,
            :answers_json,
            :trait_scores_json
        )
    ");

    $stmt->execute([
        ":user_id" => $user_id,
        ":assessment_type" => $assessment_type,
        ":assessment_title" => $assessment_title,
        ":top_program" => $top_program,
        ":top_percentage" => $top_percentage,
        ":top_reason" => $top_reason,
        ":results_json" => $results_json,
        ":answers_json" => $answers_json,
        ":trait_scores_json" => $trait_scores_json
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Assessment result saved successfully."
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>