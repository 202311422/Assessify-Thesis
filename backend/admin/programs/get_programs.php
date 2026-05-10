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
            program_code,
            program_name,
            description,
            college_department,
            is_active,
            created_at,
            updated_at
        FROM programs
        ORDER BY is_active DESC, program_code ASC
    ");

    $programs = $stmt->fetchAll();

    sendResponse(true, "Programs loaded successfully.", [
        "programs" => $programs
    ]);

} catch (Exception $e) {
    sendResponse(false, "Failed to load programs.", [
        "error" => $e->getMessage()
    ], 500);
}
?>