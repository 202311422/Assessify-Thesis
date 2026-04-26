<?php
require_once "../utils/cors.php";
require_once "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$full_name = trim($data['full_name'] ?? '');
$email = trim($data['email'] ?? '');
$user_password = trim($data['password'] ?? '');

if (empty($full_name) || empty($email) || empty($user_password)) {
    echo json_encode([
        "success" => false,
        "message" => "All fields are required."
    ]);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid email format."
    ]);
    exit();
}

try {
    $checkStmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $checkStmt->execute([$email]);

    if ($checkStmt->fetch()) {
        echo json_encode([
            "success" => false,
            "message" => "Email already exists."
        ]);
        exit();
    }

    $hashedPassword = password_hash($user_password, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, 'student')");
    $stmt->execute([$full_name, $email, $hashedPassword]);

    echo json_encode([
        "success" => true,
        "message" => "Registration successful."
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Registration failed: " . $e->getMessage()
    ]);
}
?>