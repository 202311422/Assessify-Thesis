<?php
session_start();

require_once __DIR__ . "/../utils/cors.php";
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../utils/response.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    sendResponse(false, "Invalid request method.", null, 405);
}

$input = json_decode(file_get_contents("php://input"), true);

$email = trim($input["email"] ?? "");
$password = $input["password"] ?? "";

if ($email === "" || $password === "") {
    sendResponse(false, "Email and password are required.", null, 400);
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            id, 
            full_name, 
            email, 
            password, 
            role, 
            is_active
        FROM admins
        WHERE email = ?
        LIMIT 1
    ");

    $stmt->execute([$email]);
    $admin = $stmt->fetch();

    if (!$admin) {
        sendResponse(false, "Invalid email or password.", null, 401);
    }

    if ((int)$admin["is_active"] !== 1) {
        sendResponse(false, "This admin account is currently inactive.", null, 403);
    }

    if (!password_verify($password, $admin["password"])) {
        sendResponse(false, "Invalid email or password.", null, 401);
    }

    $_SESSION["admin_id"] = $admin["id"];
    $_SESSION["admin_full_name"] = $admin["full_name"];
    $_SESSION["admin_email"] = $admin["email"];
    $_SESSION["admin_role"] = $admin["role"];
    $_SESSION["role"] = "admin";

    unset($admin["password"]);

    sendResponse(true, "Admin login successful.", [
        "admin" => [
            "id" => $admin["id"],
            "full_name" => $admin["full_name"],
            "email" => $admin["email"],
            "role" => $admin["role"]
        ]
    ]);

} catch (Exception $e) {
    sendResponse(false, "Admin login failed.", [
        "error" => $e->getMessage()
    ], 500);
}
?>