<?php
// ============================================================
// Assessify - Get Assessment Questions API
// Fetches active assessment questions with their choices
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

// ============================================================
// Database Connection
// ============================================================

$host = "localhost";
$db_name = "assessify_db";
$username = "root";
$password = "";

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$db_name;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed.",
        "error" => $e->getMessage()
    ]);
    exit;
}

// ============================================================
// Fetch Questions with Choices
// ============================================================

try {
    $questionsQuery = "
        SELECT 
            id,
            question_text,
            category,
            question_order
        FROM assessment_questions
        WHERE is_active = 1
        ORDER BY question_order ASC, id ASC
    ";

    $questionsStmt = $pdo->prepare($questionsQuery);
    $questionsStmt->execute();
    $questions = $questionsStmt->fetchAll();

    $choicesQuery = "
        SELECT 
            id,
            question_id,
            choice_text,
            choice_order
        FROM question_choices
        WHERE is_active = 1
        ORDER BY choice_order ASC, id ASC
    ";

    $choicesStmt = $pdo->prepare($choicesQuery);
    $choicesStmt->execute();
    $choices = $choicesStmt->fetchAll();

    $choicesByQuestion = [];

    foreach ($choices as $choice) {
        $questionId = $choice["question_id"];

        if (!isset($choicesByQuestion[$questionId])) {
            $choicesByQuestion[$questionId] = [];
        }

        $choicesByQuestion[$questionId][] = [
            "id" => (int) $choice["id"],
            "choice_text" => $choice["choice_text"],
            "choice_order" => (int) $choice["choice_order"]
        ];
    }

    $formattedQuestions = [];

    foreach ($questions as $question) {
        $questionId = $question["id"];

        $formattedQuestions[] = [
            "id" => (int) $question["id"],
            "question_text" => $question["question_text"],
            "category" => $question["category"],
            "question_order" => (int) $question["question_order"],
            "choices" => $choicesByQuestion[$questionId] ?? []
        ];
    }

    echo json_encode([
        "success" => true,
        "message" => "Assessment questions fetched successfully.",
        "data" => [
            "questions" => $formattedQuestions
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to fetch assessment questions.",
        "error" => $e->getMessage()
    ]);
    exit;
}
?>