<?php
require_once __DIR__ . "/../utils/cors.php";
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../utils/response.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    sendResponse(false, "Invalid request method.", null, 405);
}

try {
    /*
        Revision:
        - Load only active questions
        - Order questions properly
        - Limit assessment to maximum of 50 questions
    */
    $questionStmt = $pdo->prepare("
        SELECT 
            id,
            question_text,
            question_type,
            category,
            display_order,
            is_required
        FROM assessment_questions
        WHERE is_active = 1
        ORDER BY display_order ASC, id ASC
        LIMIT 50
    ");
    $questionStmt->execute();
    $questions = $questionStmt->fetchAll();

    foreach ($questions as &$question) {
        if ($question["question_type"] === "multiple_choice") {
            $choiceStmt = $pdo->prepare("
                SELECT 
                    id,
                    question_id,
                    choice_text,
                    display_order
                FROM question_choices
                WHERE question_id = ?
                AND is_active = 1
                ORDER BY display_order ASC, id ASC
            ");
            $choiceStmt->execute([$question["id"]]);
            $question["choices"] = $choiceStmt->fetchAll();
        } else {
            $question["choices"] = [];
        }
    }

    sendResponse(true, "Assessment questions loaded successfully.", [
        "questions" => $questions,
        "question_count" => count($questions),
        "max_questions" => 50
    ]);

} catch (Exception $e) {
    sendResponse(false, "Failed to load assessment questions.", [
        "error" => $e->getMessage()
    ], 500);
}
?>