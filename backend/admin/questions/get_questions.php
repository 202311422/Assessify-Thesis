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
            id,
            question_text,
            question_type,
            category,
            is_required,
            is_active,
            created_at,
            updated_at
        FROM assessment_questions
        ORDER BY is_active DESC, id DESC
    ");

    $questions = $stmt->fetchAll();

    foreach ($questions as &$question) {
        $question["id"] = (int)$question["id"];
        $question["is_required"] = (int)$question["is_required"];
        $question["is_active"] = (int)$question["is_active"];
    }
    unset($question);

    sendResponse(true, "Questions loaded successfully.", [
        "questions" => $questions,
        "total_questions" => count($questions)
    ]);

} catch (Exception $e) {
    sendResponse(false, "Failed to load questions.", [
        "error" => $e->getMessage()
    ], 500);
}
?>