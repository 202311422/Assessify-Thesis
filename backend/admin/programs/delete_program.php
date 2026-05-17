<?php
require_once __DIR__ . "/../../utils/cors.php";
require_once __DIR__ . "/../../config/db.php";
require_once __DIR__ . "/../../utils/response.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST" && $_SERVER["REQUEST_METHOD"] !== "DELETE") {
    sendResponse(false, "Invalid request method.", null, 405);
}

$input = json_decode(file_get_contents("php://input"), true);

$id = isset($input["id"]) ? (int)$input["id"] : null;

if (!$id) {
    sendResponse(false, "Program ID is required.", null, 400);
}

try {
    $checkStmt = $pdo->prepare("
        SELECT 
            id, 
            program_code,
            program_name,
            is_active
        FROM programs
        WHERE id = ?
        LIMIT 1
    ");
    $checkStmt->execute([$id]);
    $program = $checkStmt->fetch();

    if (!$program) {
        sendResponse(false, "Program not found.", null, 404);
    }

    if ((int)$program["is_active"] === 0) {
        sendResponse(false, "Program is already deactivated.", [
            "program" => [
                "id" => (int)$program["id"],
                "program_code" => $program["program_code"],
                "program_name" => $program["program_name"],
                "is_active" => 0
            ]
        ], 409);
    }

    $stmt = $pdo->prepare("
        UPDATE programs
        SET is_active = 0
        WHERE id = ?
    ");
    $stmt->execute([$id]);

    sendResponse(true, "Program deactivated successfully.", [
        "program" => [
            "id" => (int)$program["id"],
            "program_code" => $program["program_code"],
            "program_name" => $program["program_name"],
            "is_active" => 0
        ]
    ]);

} catch (Exception $e) {
    sendResponse(false, "Failed to deactivate program.", [
        "error" => $e->getMessage()
    ], 500);
}
?>