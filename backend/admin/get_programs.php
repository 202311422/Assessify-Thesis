<?php
require_once __DIR__ . "/../utils/cors.php";
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../utils/response.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    sendResponse(false, "Invalid request method.", null, 405);
}

try {
    $stmt = $pdo->query("
        SELECT 
            id,
            program_code,
            program_name,
            description,
            college_department,
            is_active,
            created_at,
            updated_at
        FROM programs
        WHERE is_active = 1
        ORDER BY college_department ASC, program_code ASC
    ");

    $programs = $stmt->fetchAll();

    foreach ($programs as &$program) {
        $program["id"] = (int)$program["id"];
        $program["is_active"] = (int)$program["is_active"];
    }
    unset($program);

    sendResponse(true, "Programs loaded successfully.", [
        "programs" => $programs,
        "total_programs" => count($programs)
    ]);

} catch (Exception $e) {
    sendResponse(false, "Failed to load programs.", [
        "error" => $e->getMessage()
    ], 500);
}
?>