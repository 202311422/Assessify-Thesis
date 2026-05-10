<?php
require_once "../utils/cors.php";
require_once "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$first_name = trim($data["first_name"] ?? "");
$middle_name = trim($data["middle_name"] ?? "");
$last_name = trim($data["last_name"] ?? "");
$email = trim($data["email"] ?? "");
$user_password = trim($data["password"] ?? "");

if (empty($first_name) || empty($last_name) || empty($email) || empty($user_password)) {
    echo json_encode([
        "success" => false,
        "message" => "First name, last name, email, and password are required."
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
    $checkStmt = $conn->prepare("
        SELECT id 
        FROM users 
        WHERE email = ?
        LIMIT 1
    ");
    $checkStmt->execute([$email]);

    if ($checkStmt->fetch()) {
        echo json_encode([
            "success" => false,
            "message" => "Email already exists."
        ]);
        exit();
    }

    $hashedPassword = password_hash($user_password, PASSWORD_DEFAULT);

    $full_name = trim(
        $first_name . " " .
        ($middle_name !== "" ? $middle_name . " " : "") .
        $last_name
    );

    $applicantNumber = "APP-" . str_pad(random_int(1, 9999), 4, "0", STR_PAD_LEFT);

    $stmt = $conn->prepare("
        INSERT INTO users 
        (
            first_name,
            middle_name,
            last_name,
            full_name,
            email,
            password,
            applicant_number,
            is_active
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    ");

    $stmt->execute([
        $first_name,
        $middle_name !== "" ? $middle_name : null,
        $last_name,
        $full_name,
        $email,
        $hashedPassword,
        $applicantNumber
    ]);

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