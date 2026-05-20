<?php
require_once "../utils/cors.php";
require_once "../utils/response.php";
require_once "../config/db.php";
require_once "../utils/mailer.php";

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
        SELECT id, email_verified
        FROM users 
        WHERE email = ?
        LIMIT 1
    ");
    $checkStmt->execute([$email]);
    $existingUser = $checkStmt->fetch();

    if ($existingUser) {
        if ((int)$existingUser["email_verified"] === 0) {
            sendResponse(false, "Email already registered but not verified. Please check your email for the verification link.", null, 409);
        }

        sendResponse(false, "Email already exists.", null, 409);
    }

    $hashedPassword = password_hash($user_password, PASSWORD_DEFAULT);

    $full_name = trim(
        $first_name . " " .
        ($middle_name !== "" ? $middle_name . " " : "") .
        $last_name
    );

    /*
        Generate unique applicant number
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

        $applicantExists = $applicantCheck->fetch();
    } while ($applicantExists);

    /*
        Generate email verification token
    */
    $verificationToken = bin2hex(random_bytes(32));
    $verificationExpires = date("Y-m-d H:i:s", strtotime("+24 hours"));

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
            is_active,
            email_verified,
            verification_token,
            verification_expires
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, ?, ?)
    ");

    $stmt->execute([
        $first_name,
        $middle_name !== "" ? $middle_name : null,
        $last_name,
        $full_name,
        $email,
        $hashedPassword,
        $applicantNumber,
        $verificationToken,
        $verificationExpires
    ]);

    $userId = (int)$conn->lastInsertId();

    $mailConfig = require "../config/mail.php";

    $verificationLink = $mailConfig["backend_base_url"] . "/auth/verify_email.php?token=" . urlencode($verificationToken);

    $mailResult = sendVerificationEmail($email, $full_name, $verificationLink);

    $responseMessage = $mailResult["success"]
    ? "Registration successful. Please check your email to verify your account."
    : "Registration successful, but verification email was not sent. Use the verification link returned for local testing.";

sendResponse(true, $responseMessage, [
        "user" => [
            "id" => $userId,
            "first_name" => $first_name,
            "middle_name" => $middle_name !== "" ? $middle_name : null,
            "last_name" => $last_name,
            "full_name" => $full_name,
            "email" => $email,
            "applicant_number" => $applicantNumber,
            "role" => "student",
            "email_verified" => 0
        ],

        /*
            Kept for local testing.
            If email sending fails, you can manually open this link.
        */
        "verification_link" => $verificationLink,
        "email_sent" => $mailResult["success"],
        "email_message" => $mailResult["message"],
        "email_error" => $mailResult["success"] ? null : ($mailResult["error"] ?? null)
    ], 201);

} catch (PDOException $e) {
    sendResponse(false, "Registration failed: " . $e->getMessage(), null, 500);
}
?>