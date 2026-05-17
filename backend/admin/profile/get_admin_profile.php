<?php
session_start();

require_once __DIR__ . "/../../utils/cors.php";
require_once __DIR__ . "/../../config/db.php";
require_once __DIR__ . "/../../utils/response.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    sendResponse(false, "Invalid request method.", null, 405);
}

/*
    For development:
    If admin session exists, use it.
    Otherwise, fallback to the first active admin account.
*/
$adminId = $_SESSION["admin_id"] ?? null;

try {
    if ($adminId) {
        $stmt = $pdo->prepare("
            SELECT
                id,
                full_name,
                email,
                role,
                is_active,
                created_at,
                updated_at
            FROM admins
            WHERE id = ?
            LIMIT 1
        ");

        $stmt->execute([$adminId]);
    } else {
        $stmt = $pdo->query("
            SELECT
                id,
                full_name,
                email,
                role,
                is_active,
                created_at,
                updated_at
            FROM admins
            WHERE is_active = 1
            ORDER BY id ASC
            LIMIT 1
        ");
    }

    $admin = $stmt->fetch();

    if (!$admin) {
        sendResponse(false, "Admin profile not found.", null, 404);
    }

    $admin["id"] = (int)$admin["id"];
    $admin["is_active"] = (int)$admin["is_active"];

    sendResponse(true, "Admin profile loaded successfully.", [
        "admin" => $admin
    ]);

} catch (Exception $e) {
    sendResponse(false, "Failed to load admin profile.", [
        "error" => $e->getMessage()
    ], 500);
}
?>