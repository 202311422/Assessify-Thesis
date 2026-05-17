<?php
session_start();

require_once "../utils/cors.php";
require_once "../utils/response.php";

if (isset($_SESSION["user_id"])) {
    sendResponse(true, "User is authenticated.", [
        "authenticated" => true,
        "user" => [
            "id" => $_SESSION["user_id"],
            "first_name" => $_SESSION["first_name"] ?? null,
            "middle_name" => $_SESSION["middle_name"] ?? null,
            "last_name" => $_SESSION["last_name"] ?? null,
            "full_name" => $_SESSION["full_name"] ?? null,
            "email" => $_SESSION["email"] ?? null,
            "role" => $_SESSION["role"] ?? "student"
        ]
    ]);
}

sendResponse(false, "User is not logged in.", [
    "authenticated" => false
], 401);
?>