<?php
require_once "../utils/cors.php";
require_once "../utils/response.php";
require_once "../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);

$first_name = trim($data["first_name"] ?? "");
$middle_name = trim($data["middle_name"] ?? "");
$last_name = trim($data["last_name"] ?? "");
$email = trim($data["email"] ?? "");
$user_password = trim($data["password"] ?? "");

if (empty($first_name) || empty($last_name) || empty($email) || empty($user_password)) {
    sendResponse(false, "First name, last name, email, and password are required.", null, 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, "Invalid email format.", null, 400);
}

if (strlen($user_password) < 6) {
    sendResponse(false, "Password must be at least 6 characters long.", null, 400);
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
        sendResponse(false, "Email already exists.", null, 409);
    }

    $hashedPassword = password_hash($user_password, PASSWORD_DEFAULT);

    $full_name = trim(
        $first_name . " " .
        ($middle_name !== "" ? $middle_name . " " : "") .
        $last_name
    );

    /*
        Generate applicant number.
        This retries until it finds an unused applicant number.
    */
    do {
        $applicantNumber = "APP-" . str_pad(random_int(1, 9999), 4, "0", STR_PAD_LEFT);

        $applicantCheck = $conn->prepare("
            SELECT id 
            FROM users 
            WHERE applicant_number = ?
            LIMIT 1
        ");
        $applicantCheck->execute([$applicantNumber]);

        $exists = $applicantCheck->fetch();
    } while ($exists);

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

    sendResponse(true, "Registration successful.", [
        "user" => [
            "id" => $conn->lastInsertId(),
            "first_name" => $first_name,
            "middle_name" => $middle_name !== "" ? $middle_name : null,
            "last_name" => $last_name,
            "full_name" => $full_name,
            "email" => $email,
            "applicant_number" => $applicantNumber,
            "role" => "student"
        ]
    ], 201);

} catch (PDOException $e) {
    sendResponse(false, "Registration failed: " . $e->getMessage(), null, 500);
}
?>