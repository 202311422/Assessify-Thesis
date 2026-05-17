<?php
session_start();

require_once "../utils/cors.php";
require_once "../utils/response.php";
require_once "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data["email"] ?? "");
$user_password = trim($data["password"] ?? "");

if (empty($email) || empty($user_password)) {
    sendResponse(false, "Email and password are required.", null, 400);
}

try {
    $stmt = $conn->prepare("
        SELECT 
            id,
            first_name,
            middle_name,
            last_name,
            full_name,
            email,
            password,
            applicant_number,
            is_active
        FROM users
        WHERE email = ?
        LIMIT 1
    ");

    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        sendResponse(false, "Invalid email or password.", null, 401);
    }

    if ((int)$user["is_active"] !== 1) {
        sendResponse(false, "Your account is inactive. Please contact the administrator.", null, 403);
    }

    if (!password_verify($user_password, $user["password"])) {
        sendResponse(false, "Invalid email or password.", null, 401);
    }

    $_SESSION["user_id"] = $user["id"];
    $_SESSION["first_name"] = $user["first_name"];
    $_SESSION["middle_name"] = $user["middle_name"];
    $_SESSION["last_name"] = $user["last_name"];
    $_SESSION["full_name"] = $user["full_name"];
    $_SESSION["email"] = $user["email"];
    $_SESSION["role"] = "student";

    sendResponse(true, "Login successful.", [
        "user" => [
            "id" => $user["id"],
            "first_name" => $user["first_name"],
            "middle_name" => $user["middle_name"],
            "last_name" => $user["last_name"],
            "full_name" => $user["full_name"],
            "email" => $user["email"],
            "applicant_number" => $user["applicant_number"],
            "role" => "student"
        ]
    ]);

} catch (PDOException $e) {
    sendResponse(false, "Login failed: " . $e->getMessage(), null, 500);
}
?>