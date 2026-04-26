<?php
session_start();
require_once "../utils/cors.php";

if (isset($_SESSION['user_id'])) {
    echo json_encode([
        "success" => true,
        "authenticated" => true,
        "user" => [
            "id" => $_SESSION['user_id'],
            "full_name" => $_SESSION['full_name'],
            "email" => $_SESSION['email'],
            "role" => $_SESSION['role']
        ]
    ]);
} else {
    echo json_encode([
        "success" => false,
        "authenticated" => false,
        "message" => "User is not logged in."
    ]);
}
?>