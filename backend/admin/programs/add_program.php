<?php
require_once __DIR__ . "/../../utils/cors.php";
require_once __DIR__ . "/../../config/db.php";
require_once __DIR__ . "/../../utils/response.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    sendResponse(false, "Invalid request method.", null, 405);
}

$input = json_decode(file_get_contents("php://input"), true);

$programCode = strtoupper(trim($input["program_code"] ?? ""));
$programName = trim($input["program_name"] ?? "");
$description = trim($input["description"] ?? "");
$collegeDepartment = trim($input["college_department"] ?? "");

if ($programCode === "" || $programName === "") {
    sendResponse(false, "Program code and program name are required.", null, 400);
}

try {
    $checkStmt = $pdo->prepare("
        SELECT id 
        FROM programs 
        WHERE program_code = ?
        LIMIT 1
    ");
    $checkStmt->execute([$programCode]);

    if ($checkStmt->fetch()) {
        sendResponse(false, "Program code already exists.", null, 409);
    }

    $stmt = $pdo->prepare("
        INSERT INTO programs 
        (
            program_code, 
            program_name, 
            description, 
            college_department,
            is_active
        )
        VALUES (?, ?, ?, ?, 1)
    ");

    $stmt->execute([
        $programCode,
        $programName,
        $description !== "" ? $description : null,
        $collegeDepartment !== "" ? $collegeDepartment : null
    ]);

    $programId = (int)$pdo->lastInsertId();

    sendResponse(true, "Program added successfully.", [
        "program" => [
            "id" => $programId,
            "program_code" => $programCode,
            "program_name" => $programName,
            "description" => $description !== "" ? $description : null,
            "college_department" => $collegeDepartment !== "" ? $collegeDepartment : null,
            "is_active" => 1
        ]
    ], 201);

} catch (Exception $e) {
    sendResponse(false, "Failed to add program.", [
        "error" => $e->getMessage()
    ], 500);
}
?>