<?php
// ============================================================
// Mail Configuration
// Used for sending email verification links
// ============================================================

$envPath = __DIR__ . '/../.env';
$env = [];

if (file_exists($envPath)) {
    $env = parse_ini_file($envPath);
}

return [
    "smtp_host" => $env["SMTP_HOST"] ?? "smtp.gmail.com",
    "smtp_username" => $env["SMTP_USERNAME"] ?? "your_email@gmail.com",
    "smtp_password" => $env["SMTP_PASSWORD"] ?? "your_app_password",
    "smtp_port" => $env["SMTP_PORT"] ?? 587,
    "smtp_secure" => $env["SMTP_SECURE"] ?? "tls",

    "from_email" => $env["FROM_EMAIL"] ?? "your_email@gmail.com",
    "from_name" => $env["FROM_NAME"] ?? "Assessify",

    "backend_base_url" => $env["BACKEND_BASE_URL"] ?? "http://localhost/assessify/backend",
    "frontend_login_url" => $env["FRONTEND_LOGIN_URL"] ?? "http://localhost:3000"
];
?>