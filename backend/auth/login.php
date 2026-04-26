<?php
session_start();
require_once "../utils/cors.php";
require_once "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data['email'] ?? '');
$user_password = trim($data['password'] ?? '');

if (empty($email) || empty($user_password)) {
    echo json_encode([
        "success" => false,
        "message" => "Email and password are required."
    ]);
    exit();
}

try {
    $stmt = $conn->prepare("SELECT id, full_name, email, password, role FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid email or password."
        ]);
        exit();
    }

    if (!password_verify($user_password, $user['password'])) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid email or password."
        ]);
        exit();
    }

    $_SESSION['user_id'] = $user['id'];
    $_SESSION['full_name'] = $user['full_name'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['role'] = $user['role'];

    echo json_encode([
        "success" => true,
        "message" => "Login successful.",
        "user" => [
            "id" => $user['id'],
            "full_name" => $user['full_name'],
            "email" => $user['email'],
            "role" => $user['role']
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