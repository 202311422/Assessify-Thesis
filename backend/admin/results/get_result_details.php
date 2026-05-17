<?php
require_once __DIR__ . "/../../utils/cors.php";
require_once __DIR__ . "/../../config/db.php";
require_once __DIR__ . "/../../utils/response.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    sendResponse(false, "Invalid request method.", null, 405);
}

$resultId = isset($_GET["result_id"]) ? (int)$_GET["result_id"] : 0;

if (!$resultId) {
    sendResponse(false, "Result ID is required.", null, 400);
}

try {
    $resultStmt = $pdo->prepare("
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
            s.started_at,
            s.completed_at,

            p.program_code AS top_program_code,
            p.program_name AS top_program_name,
            p.description AS top_program_description,
            p.college_department AS top_program_department
        FROM assessment_results ar
        INNER JOIN users u ON ar.user_id = u.id
        INNER JOIN assessment_sessions s ON ar.session_id = s.id
        LEFT JOIN programs p ON ar.top_program_id = p.id
        WHERE ar.id = ?
        LIMIT 1
    ");

    $resultStmt->execute([$resultId]);
    $result = $resultStmt->fetch();

    if (!$result) {
        sendResponse(false, "Assessment result not found.", null, 404);
    }

    $recommendationsStmt = $pdo->prepare("
        SELECT
            rr.id,
            rr.program_id,
            rr.raw_score,
            rr.percentage,

            p.program_code,
            p.program_name,
            p.description,
            p.college_department
        FROM result_recommendations rr
        INNER JOIN programs p ON rr.program_id = p.id
        WHERE rr.result_id = ?
        ORDER BY rr.percentage DESC, rr.raw_score DESC
    ");

    $recommendationsStmt->execute([$resultId]);
    $recommendations = $recommendationsStmt->fetchAll();

    foreach ($recommendations as $index => &$recommendation) {
        $recommendation["id"] = (int)$recommendation["id"];
        $recommendation["program_id"] = (int)$recommendation["program_id"];
        $recommendation["rank_order"] = $index + 1;
        $recommendation["raw_score"] = (int)$recommendation["raw_score"];
        $recommendation["percentage"] = (float)$recommendation["percentage"];
    }
    unset($recommendation);

    $aiStmt = $pdo->prepare("
    SELECT *
    FROM ai_explanations
    WHERE result_id = ?
    ORDER BY id DESC
    LIMIT 1
");

$aiStmt->execute([$resultId]);
$aiExplanation = $aiStmt->fetch();

if ($aiExplanation && isset($aiExplanation["id"])) {
    $aiExplanation["id"] = (int)$aiExplanation["id"];
}

    $aiStmt->execute([$resultId]);
    $aiExplanation = $aiStmt->fetch();

    if ($aiExplanation) {
        $aiExplanation["id"] = (int)$aiExplanation["id"];
    }

    $answersStmt = $pdo->prepare("
    SELECT
        aa.id AS answer_id,
        aa.question_id,
        aa.choice_id,
        NULL AS answer_text,

        aq.question_text,
        aq.question_type,
        aq.category,

        qc.choice_text
    FROM assessment_answers aa
    INNER JOIN assessment_questions aq ON aa.question_id = aq.id
    LEFT JOIN question_choices qc ON aa.choice_id = qc.id
    WHERE aa.session_id = ?
    ORDER BY aq.id ASC, aa.id ASC
");

    $answersStmt->execute([$result["session_id"]]);
    $answers = $answersStmt->fetchAll();

    foreach ($answers as &$answer) {
        $answer["answer_id"] = (int)$answer["answer_id"];
        $answer["question_id"] = (int)$answer["question_id"];
        $answer["choice_id"] = $answer["choice_id"] !== null ? (int)$answer["choice_id"] : null;
    }
    unset($answer);

    $result["result_id"] = (int)$result["result_id"];
    $result["session_id"] = (int)$result["session_id"];
    $result["user_id"] = (int)$result["user_id"];
    $result["top_program_id"] = $result["top_program_id"] !== null ? (int)$result["top_program_id"] : null;
    $result["total_possible_score"] = (int)$result["total_possible_score"];

    sendResponse(true, "Assessment result details loaded successfully.", [
        "result" => $result,
        "recommendations" => $recommendations,
        "ai_explanation" => $aiExplanation,
        "answers" => $answers
    ]);

} catch (Exception $e) {
    sendResponse(false, "Failed to load assessment result details.", [
        "error" => $e->getMessage()
    ], 500);
}
?>