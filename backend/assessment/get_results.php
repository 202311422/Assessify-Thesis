<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

require_once "../config/db.php";

$user_id = $_GET["user_id"] ?? null;

if (!$user_id) {
    echo json_encode([
        "success" => false,
        "message" => "User ID is required.",
        "results" => []
    ]);
    exit;
}

try {
    $stmt = $conn->prepare("
        SELECT 
            id,
            assessment_type,
            assessment_title,
            top_program,
            top_percentage,
            top_reason,
            results_json,
            answers_json,
            trait_scores_json,
            created_at
        FROM assessment_results
        WHERE user_id = :user_id
        ORDER BY created_at DESC
    ");

    $stmt->execute([
        ":user_id" => $user_id
    ]);

    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "results" => $results
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage(),
        "results" => []
    ]);
}
?>