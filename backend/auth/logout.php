<?php
session_start();

require_once "../utils/cors.php";
require_once "../utils/response.php";

/*
    Clear all session variables
*/
$_SESSION = [];

/*
    Destroy the session cookie if it exists
*/
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();

    setcookie(
        session_name(),
        "",
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

/*
    Destroy the session completely
*/
session_destroy();

sendResponse(true, "Logout successful.");
?>