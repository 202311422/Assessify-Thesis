<?php
require_once "../utils/cors.php";
require_once "../utils/response.php";
require_once "../config/db.php";

$token = trim($_GET["token"] ?? "");

if ($token === "") {
    sendResponse(false, "Verification token is required.", null, 400);
}

try {
    $stmt = $conn->prepare("
        SELECT 
            id,
            full_name,
            email,
            email_verified,
            verification_expires
        FROM users
        WHERE verification_token = ?
        LIMIT 1
    ");

    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if (!$user) {
        sendResponse(false, "Invalid verification token.", null, 404);
    }

    if ((int)$user["email_verified"] === 1) {
        sendResponse(true, "Email is already verified. You may now log in.", [
            "email" => $user["email"]
        ]);
    }

    if (!empty($user["verification_expires"]) && strtotime($user["verification_expires"]) < time()) {
        sendResponse(false, "Verification link has expired. Please request a new verification email.", null, 410);
    }

    $updateStmt = $conn->prepare("
        UPDATE users
        SET 
            email_verified = 1,
            verification_token = NULL,
            verification_expires = NULL
        WHERE id = ?
    ");

    $updateStmt->execute([$user["id"]]);

    sendResponse(true, "Email verified successfully. You may now log in.", [
        "user" => [
            "id" => (int)$user["id"],
            "full_name" => $user["full_name"],
            "email" => $user["email"],
            "email_verified" => 1
        ]
    ]);

} catch (PDOException $e) {
    sendResponse(false, "Email verification failed: " . $e->getMessage(), null, 500);
}
?>