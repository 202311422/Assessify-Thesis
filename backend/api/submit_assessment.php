<?php
// ============================================================
// Assessify - Submit Assessment API
// Calculates recommendation and saves result permanently
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method. Use POST."
    ]);
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
// Read JSON Input
// ============================================================

$rawInput = file_get_contents("php://input");
$input = json_decode($rawInput, true);

if (!$input) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON input."
    ]);
    exit;
}

$userId = isset($input["user_id"]) ? intval($input["user_id"]) : 0;
$strand = trim($input["strand"] ?? "");
$selectedChoiceIds = $input["selected_choice_ids"] ?? [];

if ($userId <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "User ID is required."
    ]);
    exit;
}

if ($strand === "") {
    echo json_encode([
        "success" => false,
        "message" => "Strand is required."
    ]);
    exit;
}

if (!is_array($selectedChoiceIds) || count($selectedChoiceIds) === 0) {
    echo json_encode([
        "success" => false,
        "message" => "No selected choices were provided."
    ]);
    exit;
}

$selectedChoiceIds = array_map("intval", $selectedChoiceIds);
$selectedChoiceIds = array_filter($selectedChoiceIds, function ($id) {
    return $id > 0;
});
$selectedChoiceIds = array_values(array_unique($selectedChoiceIds));

if (count($selectedChoiceIds) === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Selected choices are invalid."
    ]);
    exit;
}

try {
    $pdo->beginTransaction();

    $placeholders = implode(",", array_fill(0, count($selectedChoiceIds), "?"));

    // ============================================================
    // Validate selected choices
    // ============================================================

    $validateQuery = "
        SELECT 
            qc.id,
            qc.question_id,
            qc.choice_text,
            aq.question_text,
            aq.category
        FROM question_choices qc
        JOIN assessment_questions aq ON qc.question_id = aq.id
        WHERE qc.id IN ($placeholders)
        ORDER BY aq.question_order ASC, qc.choice_order ASC
    ";

    $validateStmt = $pdo->prepare($validateQuery);
    $validateStmt->execute($selectedChoiceIds);
    $selectedChoices = $validateStmt->fetchAll();

    if (count($selectedChoices) !== count($selectedChoiceIds)) {
        $pdo->rollBack();

        echo json_encode([
            "success" => false,
            "message" => "One or more selected choices do not exist."
        ]);
        exit;
    }

    $questionIds = [];

    foreach ($selectedChoices as $choice) {
        $questionIds[] = $choice["question_id"];
    }

    if (count($questionIds) !== count(array_unique($questionIds))) {
        $pdo->rollBack();

        echo json_encode([
            "success" => false,
            "message" => "Multiple choices from the same question are not allowed."
        ]);
        exit;
    }

    // ============================================================
    // Calculate recommendation scores
    // ============================================================

    $scoreQuery = "
        SELECT 
            p.id AS program_id,
            p.program_code,
            p.program_name,
            p.description,
            p.college_department,
            SUM(cps.score) AS total_score
        FROM choice_program_scores cps
        JOIN programs p ON cps.program_id = p.id
        WHERE cps.choice_id IN ($placeholders)
        GROUP BY 
            p.id,
            p.program_code,
            p.program_name,
            p.description,
            p.college_department
        ORDER BY total_score DESC, p.program_name ASC
        LIMIT 5
    ";

    $scoreStmt = $pdo->prepare($scoreQuery);
    $scoreStmt->execute($selectedChoiceIds);
    $recommendations = $scoreStmt->fetchAll();

    if (count($recommendations) === 0) {
        $pdo->rollBack();

        echo json_encode([
            "success" => false,
            "message" => "No recommendations were generated."
        ]);
        exit;
    }

    $maxPossibleScore = count($selectedChoiceIds) * 3;
    $topProgramId = intval($recommendations[0]["program_id"]);

    // ============================================================
    // Save assessment session
    // ============================================================

    $sessionStmt = $pdo->prepare("
        INSERT INTO assessment_sessions 
        (user_id, strand, status, started_at, completed_at)
        VALUES 
        (?, ?, 'completed', NOW(), NOW())
    ");

    $sessionStmt->execute([$userId, $strand]);
    $sessionId = intval($pdo->lastInsertId());

    // ============================================================
    // Save assessment answers
    // ============================================================

    $answerStmt = $pdo->prepare("
        INSERT INTO assessment_answers
        (session_id, question_id, choice_id, text_answer)
        VALUES
        (?, ?, ?, NULL)
    ");

    foreach ($selectedChoices as $choice) {
        $answerStmt->execute([
            $sessionId,
            intval($choice["question_id"]),
            intval($choice["id"])
        ]);
    }

    // ============================================================
    // Save assessment result
    // ============================================================

    $resultStmt = $pdo->prepare("
        INSERT INTO assessment_results
        (session_id, user_id, top_program_id, total_possible_score)
        VALUES
        (?, ?, ?, ?)
    ");

    $resultStmt->execute([
        $sessionId,
        $userId,
        $topProgramId,
        $maxPossibleScore
    ]);

    $resultId = intval($pdo->lastInsertId());

    // ============================================================
    // Save result recommendations
    // ============================================================

    $recommendationStmt = $pdo->prepare("
        INSERT INTO result_recommendations
        (result_id, program_id, raw_score, percentage, recommendation_rank)
        VALUES
        (?, ?, ?, ?, ?)
    ");

    $formattedRecommendations = [];

    foreach ($recommendations as $index => $program) {
        $totalScore = intval($program["total_score"]);
        $matchPercentage = $maxPossibleScore > 0
            ? round(($totalScore / $maxPossibleScore) * 100)
            : 0;

        $rank = $index + 1;

        $recommendationStmt->execute([
            $resultId,
            intval($program["program_id"]),
            $totalScore,
            $matchPercentage,
            $rank
        ]);

        $formattedRecommendations[] = [
            "rank" => $rank,
            "program_id" => intval($program["program_id"]),
            "program_code" => $program["program_code"],
            "program_name" => $program["program_name"],
            "college_department" => $program["college_department"],
            "description" => $program["description"],
            "total_score" => $totalScore,
            "match_percentage" => $matchPercentage,
            "percentage" => $matchPercentage
        ];
    }

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Assessment submitted and saved successfully.",
        "data" => [
            "session_id" => $sessionId,
            "result_id" => $resultId,
            "user_id" => $userId,
            "strand" => $strand,
            "selected_choices" => $selectedChoices,
            "max_possible_score" => $maxPossibleScore,
            "top_program" => $formattedRecommendations[0] ?? null,
            "recommendations" => $formattedRecommendations
        ]
    ]);
    exit;

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    echo json_encode([
        "success" => false,
        "message" => "Failed to submit and save assessment.",
        "error" => $e->getMessage()
    ]);
    exit;
}
?>