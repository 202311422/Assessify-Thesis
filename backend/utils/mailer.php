<?php
// ============================================================
// Mailer Utility
// Sends email verification emails using PHPMailer
// ============================================================

require_once __DIR__ . "/../vendor/autoload.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function sendVerificationEmail($recipientEmail, $recipientName, $verificationLink) {
    $mailConfig = require __DIR__ . "/../config/mail.php";

    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = $mailConfig["smtp_host"];
        $mail->SMTPAuth = true;
        $mail->Username = $mailConfig["smtp_username"];
        $mail->Password = $mailConfig["smtp_password"];
        $mail->SMTPSecure = $mailConfig["smtp_secure"];
        $mail->Port = $mailConfig["smtp_port"];

        $mail->setFrom($mailConfig["from_email"], $mailConfig["from_name"]);
        $mail->addAddress($recipientEmail, $recipientName);

        $mail->isHTML(true);
        $mail->Subject = "Verify your Assessify account";

        $safeName = htmlspecialchars($recipientName);

        $mail->Body = "
            <div style='font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;'>
                <h2 style='color: #006b2c;'>Welcome to Assessify, {$safeName}!</h2>

                <p>Thank you for registering. Please verify your email address to activate your account.</p>

                <p>
                    <a href='{$verificationLink}' 
                       style='display: inline-block; background: #006b2c; color: #ffffff; padding: 12px 18px; text-decoration: none; border-radius: 6px; font-weight: bold;'>
                        Verify Email
                    </a>
                </p>

                <p>If the button does not work, copy and paste this link into your browser:</p>

                <p style='word-break: break-all;'>{$verificationLink}</p>

                <p>This verification link will expire in 24 hours.</p>

                <hr>

                <p style='font-size: 12px; color: #6b7280;'>
                    Assessify - Academic Program Selection Support System
                </p>
            </div>
        ";

        $mail->AltBody = "Welcome to Assessify, {$recipientName}!\n\nPlease verify your email using this link:\n{$verificationLink}\n\nThis link will expire in 24 hours.";

        $mail->send();

        return [
            "success" => true,
            "message" => "Verification email sent successfully."
        ];

    } catch (Exception $e) {
        return [
            "success" => false,
            "message" => "Failed to send verification email.",
            "error" => $mail->ErrorInfo
        ];
    }
}
?>