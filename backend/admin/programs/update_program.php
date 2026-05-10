<?php
require_once __DIR__ . "/../../utils/cors.php";
require_once __DIR__ . "/../../config/db.php";
require_once __DIR__ . "/../../utils/response.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST" && $_SERVER["REQUEST_METHOD"] !== "PUT") {
    sendResponse(false, "Invalid request method.", null, 405);
}

$input = json_decode(file_get_contents("php://input"), true);

$id = $input["id"] ?? null;
$programCode = strtoupper(trim($input["program_code"] ?? ""));
$programName = trim($input["program_name"] ?? "");
$description = trim($input["description"] ?? "");
$collegeDepartment = trim($input["college_department"] ?? "");
$isActive = isset($input["is_active"]) ? (int)$input["is_active"] : 1;

if (!$id) {
    sendResponse(false, "Program ID is required.", null, 400);
}

if ($programCode === "" || $programName === "") {
    sendResponse(false, "Program code and program name are required.", null, 400);
}

try {
    $checkProgramStmt = $pdo->prepare("
        SELECT id
        FROM programs
        WHERE id = ?
        LIMIT 1
    ");
    $checkProgramStmt->execute([$id]);

    if (!$checkProgramStmt->fetch()) {
        sendResponse(false, "Program not found.", null, 404);
    }

    $duplicateStmt = $pdo->prepare("
        SELECT id
        FROM programs
        WHERE program_code = ?
        AND id != ?
        LIMIT 1
    ");
    $duplicateStmt->execute([$programCode, $id]);

    if ($duplicateStmt->fetch()) {
        sendResponse(false, "Another program with this code already exists.", null, 409);
    }

    $stmt = $pdo->prepare("
        UPDATE programs
        SET 
            program_code = ?,
            program_name = ?,
            description = ?,
            college_department = ?,
            is_active = ?
        WHERE id = ?
    ");

    $stmt->execute([
        $programCode,
        $programName,
        $description !== "" ? $description : null,
        $collegeDepartment !== "" ? $collegeDepartment : null,
        $isActive,
        $id
    ]);

    sendResponse(true, "Program updated successfully.", [
        "program_id" => $id
    ]);

} catch (Exception $e) {
    sendResponse(false, "Failed to update program.", [
        "error" => $e->getMessage()
    ], 500);
}
?>