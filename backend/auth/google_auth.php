<?php
// ============================================================
// Google OAuth Sign-in & Sign-up Endpoint
// ============================================================

session_start();

require_once __DIR__ . "/../utils/cors.php";
require_once __DIR__ . "/../utils/response.php";
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../vendor/autoload.php";

// ============================================================
// 1. Self-Healing Database Column Alterations
// ============================================================
try {
    $colsQuery = $conn->query("SHOW COLUMNS FROM users");
    $columns = $colsQuery->fetchAll(PDO::FETCH_COLUMN);

    if (!in_array("google_id", $columns)) {
        $conn->exec("ALTER TABLE users ADD COLUMN google_id VARCHAR(255) DEFAULT NULL");
        $conn->exec("ALTER TABLE users ADD UNIQUE KEY (google_id)");
    }

    if (!in_array("auth_provider", $columns)) {
        $conn->exec("ALTER TABLE users ADD COLUMN auth_provider VARCHAR(50) DEFAULT 'local'");
    }
} catch (PDOException $e) {
    sendResponse(false, "Database schema check/update failed.", [
        "error" => $e->getMessage()
    ], 500);
}

// ============================================================
// 2. Read Input Credential
// ============================================================
$data = json_decode(file_get_contents("php://input"), true);
$id_token = $data["credential"] ?? "";

if (empty($id_token)) {
    sendResponse(false, "Google credential (ID token) is required.", null, 400);
}

// ============================================================
// 3. Load Client ID and Verify Token
// ============================================================
$envPath = __DIR__ . '/../.env';
$env = [];
if (file_exists($envPath)) {
    $env = parse_ini_file($envPath);
}
$clientId = $env["GOOGLE_CLIENT_ID"] ?? "";

if (empty($clientId)) {
    sendResponse(false, "GOOGLE_CLIENT_ID is not configured in backend/.env.", null, 500);
}

try {
    $client = new Google\Client(['client_id' => $clientId]);
    $payload = $client->verifyIdToken($id_token);

    if (!$payload) {
        sendResponse(false, "Invalid Google ID token.", null, 400);
    }

    // Verify target audience (aud) matches our Client ID
    if ($payload['aud'] !== $clientId) {
        sendResponse(false, "Google ID token audience mismatch.", null, 400);
    }

    // Strictly check email_verified is true
    if (empty($payload["email_verified"])) {
        sendResponse(false, "Google account email is not verified by Google.", null, 400);
    }

    $googleId = $payload["sub"];
    $email = trim($payload["email"]);
    $firstName = trim($payload["given_name"] ?? "");
    $lastName = trim($payload["family_name"] ?? "");
    $fullName = trim($payload["name"] ?? ($firstName . " " . $lastName));

    // ============================================================
    // 4. Authenticate or Register User
    // ============================================================

    // Check if user exists with this google_id
    $stmt = $conn->prepare("SELECT * FROM users WHERE google_id = ? LIMIT 1");
    $stmt->execute([$googleId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        // Fallback to checking by email
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // Account with this email exists, link it
            $updateStmt = $conn->prepare("
                UPDATE users 
                SET google_id = ?, 
                    auth_provider = 'google', 
                    email_verified = 1 
                WHERE id = ?
            ");
            $updateStmt->execute([$googleId, $user["id"]]);

            // Re-fetch user record
            $stmt = $conn->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
            $stmt->execute([$user["id"]]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
        } else {
            // New user registration
            // Generate unique applicant number
            do {
                $applicantNumber = "APP-" . str_pad(random_int(1, 9999), 4, "0", STR_PAD_LEFT);
                $checkApp = $conn->prepare("SELECT id FROM users WHERE applicant_number = ? LIMIT 1");
                $checkApp->execute([$applicantNumber]);
                $appExists = $checkApp->fetch();
            } while ($appExists);

            // Generate random password to satisfy NOT NULL constraints
            $randomPassword = bin2hex(random_bytes(16));
            $hashedPassword = password_hash($randomPassword, PASSWORD_DEFAULT);

            // Insert new user
            $insertStmt = $conn->prepare("
                INSERT INTO users 
                (
                    first_name, 
                    last_name, 
                    full_name, 
                    email, 
                    password, 
                    applicant_number, 
                    google_id, 
                    auth_provider, 
                    is_active, 
                    email_verified
                ) 
                VALUES (?, ?, ?, ?, ?, ?, ?, 'google', 1, 1)
            ");
            $insertStmt->execute([
                $firstName !== "" ? $firstName : null,
                $lastName !== "" ? $lastName : null,
                $fullName,
                $email,
                $hashedPassword,
                $applicantNumber,
                $googleId
            ]);

            $newUserId = (int)$conn->lastInsertId();

            // Fetch new user record
            $stmt = $conn->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
            $stmt->execute([$newUserId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
        }
    }

    // Verify account is active
    if ((int)$user["is_active"] !== 1) {
        sendResponse(false, "Your account is inactive. Please contact the administrator.", null, 403);
    }

    // Set PHP Session
    $_SESSION["user_id"] = $user["id"];
    $_SESSION["first_name"] = $user["first_name"];
    $_SESSION["middle_name"] = $user["middle_name"];
    $_SESSION["last_name"] = $user["last_name"];
    $_SESSION["full_name"] = $user["full_name"];
    $_SESSION["email"] = $user["email"];
    $_SESSION["role"] = "student";

    $loggedInUser = [
        "id" => (int)$user["id"],
        "first_name" => $user["first_name"],
        "middle_name" => $user["middle_name"],
        "last_name" => $user["last_name"],
        "full_name" => $user["full_name"],
        "email" => $user["email"],
        "applicant_number" => $user["applicant_number"],
        "role" => "student",
        "email_verified" => (int)$user["email_verified"]
    ];

    sendResponse(true, "Authentication successful.", [
        "user" => $loggedInUser
    ]);

} catch (Exception $e) {
    sendResponse(false, "Authentication failed: " . $e->getMessage(), null, 500);
}
?>
