<?php
require_once __DIR__ . "/../utils/cors.php";
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../utils/response.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    sendResponse(false, "Invalid request method.", null, 405);
}

$input = json_decode(file_get_contents("php://input"), true);

$userId = $input["user_id"] ?? null;
$strand = trim($input["strand"] ?? "");
$answers = $input["answers"] ?? [];

if (!$userId) {
    sendResponse(false, "User ID is required.", null, 400);
}

if ($strand === "") {
    sendResponse(false, "Strand is required before taking the assessment.", null, 400);
}

if (!is_array($answers) || count($answers) === 0) {
    sendResponse(false, "Answers are required.", null, 400);
}

try {
    $pdo->beginTransaction();

    // 1. Check if user exists and active
    $userStmt = $pdo->prepare("
        SELECT 
            id,
            first_name,
            middle_name,
            last_name,
            full_name,
            email,
            applicant_number
        FROM users
        WHERE id = ?
        AND is_active = 1
        LIMIT 1
    ");
    $userStmt->execute([$userId]);
    $user = $userStmt->fetch();

    if (!$user) {
        $pdo->rollBack();
        sendResponse(false, "User not found or inactive.", null, 404);
    }

    /*
        Students are allowed to retake the assessment.
        Every submit creates a new assessment session.
        Strand is saved per assessment session, not in registration.
    */

    // 2. Create a new assessment session every time
    $sessionStmt = $pdo->prepare("
        INSERT INTO assessment_sessions (user_id, strand, status)
        VALUES (?, ?, 'in_progress')
    ");
    $sessionStmt->execute([$userId, $strand]);
    $sessionId = $pdo->lastInsertId();

    // 3. Prepare insert answer statement
    $answerStmt = $pdo->prepare("
        INSERT INTO assessment_answers
        (session_id, question_id, choice_id, text_answer)
        VALUES (?, ?, ?, ?)
    ");

    $programScores = [];
    $scoredQuestionIds = [];

    foreach ($answers as $answer) {
        $questionId = $answer["question_id"] ?? null;
        $choiceId = $answer["choice_id"] ?? null;
        $textAnswer = trim($answer["text_answer"] ?? "");

        if (!$questionId) {
            continue;
        }

        $answerStmt->execute([
            $sessionId,
            $questionId,
            $choiceId ?: null,
            $textAnswer !== "" ? $textAnswer : null
        ]);

        if ($choiceId) {
            $scoredQuestionIds[$questionId] = true;

            $scoreStmt = $pdo->prepare("
                SELECT 
                    cps.program_id,
                    cps.score,
                    p.program_code,
                    p.program_name,
                    p.description
                FROM choice_program_scores cps
                INNER JOIN programs p ON cps.program_id = p.id
                WHERE cps.choice_id = ?
                AND p.is_active = 1
            ");
            $scoreStmt->execute([$choiceId]);
            $scores = $scoreStmt->fetchAll();

            foreach ($scores as $scoreRow) {
                $programId = (int)$scoreRow["program_id"];

                if (!isset($programScores[$programId])) {
                    $programScores[$programId] = [
                        "program_id" => $programId,
                        "program_code" => $scoreRow["program_code"],
                        "program_name" => $scoreRow["program_name"],
                        "description" => $scoreRow["description"],
                        "raw_score" => 0
                    ];
                }

                $programScores[$programId]["raw_score"] += (int)$scoreRow["score"];
            }
        }
    }

    if (count($programScores) === 0) {
        $pdo->rollBack();
        sendResponse(false, "No scoring rules were found for the submitted answers.", null, 400);
    }

    $maxScorePerQuestion = 5;
    $totalPossibleScore = count($scoredQuestionIds) * $maxScorePerQuestion;

    if ($totalPossibleScore <= 0) {
        $pdo->rollBack();
        sendResponse(false, "Unable to calculate total possible score.", null, 400);
    }

    foreach ($programScores as &$program) {
        $percentage = ($program["raw_score"] / $totalPossibleScore) * 100;

        if ($percentage > 100) {
            $percentage = 100;
        }

        $program["percentage"] = round($percentage, 2);
    }
    unset($program);

    usort($programScores, function ($a, $b) {
        if ($b["percentage"] == $a["percentage"]) {
            return $b["raw_score"] <=> $a["raw_score"];
        }

        return $b["percentage"] <=> $a["percentage"];
    });

    // Save only the top 3 recommendations
    $topRecommendations = array_slice($programScores, 0, 3);
    $topProgramId = $topRecommendations[0]["program_id"];

    // 4. Mark session completed
    $completeSessionStmt = $pdo->prepare("
        UPDATE assessment_sessions
        SET status = 'completed',
            completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ");
    $completeSessionStmt->execute([$sessionId]);

    // 5. Save assessment result summary
    $resultStmt = $pdo->prepare("
        INSERT INTO assessment_results
        (session_id, user_id, top_program_id, total_possible_score)
        VALUES (?, ?, ?, ?)
    ");
    $resultStmt->execute([
        $sessionId,
        $userId,
        $topProgramId,
        $totalPossibleScore
    ]);
    $resultId = $pdo->lastInsertId();

    // 6. Save top 3 ranked recommendations only
    $recommendationStmt = $pdo->prepare("
        INSERT INTO result_recommendations
        (result_id, program_id, raw_score, percentage, recommendation_rank)
        VALUES (?, ?, ?, ?, ?)
    ");

    foreach ($topRecommendations as $index => &$program) {
        $rank = $index + 1;

        $recommendationStmt->execute([
            $resultId,
            $program["program_id"],
            $program["raw_score"],
            $program["percentage"],
            $rank
        ]);

        $program["rank"] = $rank;
    }
    unset($program);

    // 7. Generate simple explanation
    $topProgram = $topRecommendations[0];

    $basicExplanation = "Based on your assessment answers and selected strand (" .
        $strand . "), your highest match is " .
        $topProgram["program_code"] . " - " .
        $topProgram["program_name"] . " with a " .
        $topProgram["percentage"] . "% match. This result was calculated using the system's rule-based scoring engine.";

    $aiStmt = $pdo->prepare("
        INSERT INTO ai_explanations (result_id, explanation)
        VALUES (?, ?)
    ");
    $aiStmt->execute([$resultId, $basicExplanation]);

    $pdo->commit();

    sendResponse(true, "Assessment submitted successfully.", [
        "session_id" => $sessionId,
        "result_id" => $resultId,
        "student" => [
            "id" => $user["id"],
            "first_name" => $user["first_name"],
            "middle_name" => $user["middle_name"],
            "last_name" => $user["last_name"],
            "full_name" => $user["full_name"],
            "email" => $user["email"],
            "applicant_number" => $user["applicant_number"]
        ],
        "strand" => $strand,
        "total_possible_score" => $totalPossibleScore,
        "top_program" => [
            "program_id" => $topProgram["program_id"],
            "program_code" => $topProgram["program_code"],
            "program_name" => $topProgram["program_name"],
            "raw_score" => $topProgram["raw_score"],
            "percentage" => $topProgram["percentage"]
        ],
        "recommendations" => array_map(function ($program) {
            return [
                "rank" => $program["rank"],
                "program_id" => $program["program_id"],
                "program_code" => $program["program_code"],
                "program_name" => $program["program_name"],
                "description" => $program["description"],
                "raw_score" => $program["raw_score"],
                "percentage" => $program["percentage"]
            ];
        }, $topRecommendations),
        "explanation" => $basicExplanation
    ], 201);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    sendResponse(false, "Assessment submission failed.", [
        "error" => $e->getMessage()
    ], 500);
}
?>