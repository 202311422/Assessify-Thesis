<?php
// ============================================================
// Auth Utility
// Used for protected API routes
// ============================================================

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function requireUser() {
    if (!isset($_SESSION["user_id"])) {
        sendResponse(false, "Unauthorized. Please log in first.", null, 401);
    }

    return $_SESSION["user_id"];
}

function requireAdmin() {
    if (!isset($_SESSION["admin_id"])) {
        sendResponse(false, "Unauthorized. Admin access required.", null, 401);
    }

    return $_SESSION["admin_id"];
}
?>