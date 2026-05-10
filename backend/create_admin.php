<?php
require_once __DIR__ . "/utils/cors.php";
require_once __DIR__ . "/config/db.php";
require_once __DIR__ . "/utils/response.php";

try {
    $fullName = "Assessify Admin";
    $email = "admin@assessify.com";
    $plainPassword = "admin123";
    $role = "super_admin";

    $checkStmt = $pdo->prepare("SELECT id FROM admins WHERE email = ?");
    $checkStmt->execute([$email]);

    if ($checkStmt->fetch()) {
        sendResponse(false, "Admin account already exists.", [
            "email" => $email
        ], 409);
    }

    $hashedPassword = password_hash($plainPassword, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("
        INSERT INTO admins (full_name, email, password, role)
        VALUES (?, ?, ?, ?)
    ");

    $stmt->execute([
        $fullName,
        $email,
        $hashedPassword,
        $role
    ]);

    sendResponse(true, "Admin account created successfully.", [
        "admin_id" => $pdo->lastInsertId(),
        "email" => $email,
        "password" => $plainPassword
    ], 201);

} catch (Exception $e) {
    sendResponse(false, "Failed to create admin account.", [
        "error" => $e->getMessage()
    ], 500);
}
?>