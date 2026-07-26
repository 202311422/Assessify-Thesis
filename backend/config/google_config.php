<?php
// ============================================================
// Google Client Configuration API
// Exposes only the safe Client ID to the React frontend
// ============================================================

require_once __DIR__ . "/../utils/cors.php";
require_once __DIR__ . "/../utils/response.php";

$envPath = __DIR__ . '/../.env';
$env = [];

if (file_exists($envPath)) {
    $env = parse_ini_file($envPath);
}

$googleClientId = $env["GOOGLE_CLIENT_ID"] ?? "";

sendResponse(true, "Google configuration loaded.", [
    "google_client_id" => $googleClientId
]);
?>
