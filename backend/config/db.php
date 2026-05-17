<?php
$host = "localhost";
$dbname = "assessify_db";
$username = "root";
$password = "";

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    /*
        Backward compatibility:
        Some older files may still use $conn.
        Newer files use $pdo.
    */
    $conn = $pdo;

} catch (PDOException $e) {
    header("Content-Type: application/json");
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database connection failed.",
        "error" => $e->getMessage()
    ]);
    exit;
}
?>