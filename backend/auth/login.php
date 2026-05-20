<?php
session_start();

require_once "../utils/cors.php";
require_once "../utils/response.php";
require_once "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data["email"] ?? "");
$user_password = trim($data["password"] ?? "");

if (empty($email) || empty($user_password)) {
    echo json_encode([
        "success" => false,
        "message" => "Email and password are required."
    ]);
    exit();
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
            is_active,
            email_verified
        FROM users
        WHERE email = ?
        LIMIT 1
    ");

    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid email or password."
        ]);
        exit();
    }

    if ((int)$user["is_active"] !== 1) {
        echo json_encode([
            "success" => false,
            "message" => "Your account is inactive. Please contact the administrator."
        ]);
        exit();
    }

    if ((int)$user["email_verified"] !== 1) {
        echo json_encode([
            "success" => false,
            "message" => "Please verify your email before logging in."
        ]);
        exit();
    }

    if (!password_verify($user_password, $user["password"])) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid email or password."
        ]);
        exit();
    }

    $_SESSION["user_id"] = $user["id"];
    $_SESSION["first_name"] = $user["first_name"];
    $_SESSION["middle_name"] = $user["middle_name"];
    $_SESSION["last_name"] = $user["last_name"];
    $_SESSION["full_name"] = $user["full_name"];
    $_SESSION["email"] = $user["email"];
    $_SESSION["role"] = "student";

    $loggedInUser = [
        "id" => (int)$user["id"],
        "first_name" => $user["first_name"],
        "middle_name" => $user["middle_name"],
        "last_name" => $user["last_name"],
        "full_name" => $user["full_name"],
        "email" => $user["email"],
        "applicant_number" => $user["applicant_number"],
        "role" => "student",
        "email_verified" => (int)$user["email_verified"]
    ];

    echo json_encode([
        "success" => true,
        "message" => "Login successful.",

        "user" => $loggedInUser,

        "data" => [
            "user" => $loggedInUser
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Login failed: " . $e->getMessage()
    ]);
}
?>