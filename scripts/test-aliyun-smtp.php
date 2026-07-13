<?php
/**
 * Self-contained Alibaba Cloud DirectMail SMTP test.
 * Uses only PHP built-in sockets — no Composer/PHPMailer required.
 *
 * Run:
 *   php scripts/test-aliyun-smtp.php recipient@example.com
 */

$to = $argv[1] ?? null;
if (!$to || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
    echo "Usage: php scripts/test-aliyun-smtp.php recipient@example.com\n";
    exit(1);
}

// Alibaba Cloud DirectMail settings

$username = 'no-reply@rems.uno';
$password = 'XKRT79xh123';
$from     = 'no-reply@rems.uno';
$fromName = 'REMS Test';

$subject = 'Alibaba Cloud DirectMail SMTP Test';
$body    = "This is a test email sent via Alibaba Cloud DirectMail SMTP.\r\n";

// Build the message payload
$boundary = md5(uniqid(time(), true));
$headers  = "From: \"{$fromName}\" <{$from}>\r\n";
$headers .= "To: {$to}\r\n";
$headers .= "Subject: {$subject}\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 7bit\r\n";

$message = $headers . "\r\n" . $body;

// Open SSL connection to SMTP server
$socket = @fsockopen("ssl://{$smtpHost}", $smtpPort, $errno, $errstr, 15);
if (!$socket) {
    echo "Failed to connect to {$smtpHost}:{$smtpPort}\n";
    echo "Error {$errno}: {$errstr}\n";
    exit(1);
}

function smtpRead($socket): string
{
    $response = '';
    while ($line = fgets($socket, 515)) {
        $response .= $line;
        if (substr($line, 3, 1) === ' ') {
            break;
        }
    }
    return $response;
}

function smtpCommand($socket, string $command): string
{
    fwrite($socket, $command . "\r\n");
    return smtpRead($socket);
}

function expectCode(string $response, string $code): bool
{
    return substr($response, 0, strlen($code)) === $code;
}

// Read greeting
$greeting = smtpRead($socket);
echo "SERVER: " . trim($greeting) . "\n";

// EHLO
$reply = smtpCommand($socket, "EHLO rems.uno");
echo "EHLO: " . trim($reply) . "\n";
if (!expectCode($reply, '250')) {
    echo "EHLO failed.\n";
    fclose($socket);
    exit(1);
}

// AUTH LOGIN
$reply = smtpCommand($socket, "AUTH LOGIN");
echo "AUTH: " . trim($reply) . "\n";
if (!expectCode($reply, '334')) {
    echo "AUTH LOGIN failed.\n";
    fclose($socket);
    exit(1);
}

// Send username (base64)
$reply = smtpCommand($socket, base64_encode($username));
echo "USER: " . trim($reply) . "\n";
if (!expectCode($reply, '334')) {
    echo "Username rejected.\n";
    fclose($socket);
    exit(1);
}

// Send password (base64)
$reply = smtpCommand($socket, base64_encode($password));
echo "PASS: " . trim($reply) . "\n";
if (!expectCode($reply, '235')) {
    echo "Authentication failed. Check your SMTP password.\n";
    fclose($socket);
    exit(1);
}

// MAIL FROM
$reply = smtpCommand($socket, "MAIL FROM:<{$from}>");
echo "MAIL: " . trim($reply) . "\n";
if (!expectCode($reply, '250')) {
    echo "MAIL FROM failed.\n";
    fclose($socket);
    exit(1);
}

// RCPT TO
$reply = smtpCommand($socket, "RCPT TO:<{$to}>");
echo "RCPT: " . trim($reply) . "\n";
if (!expectCode($reply, '250')) {
    echo "RCPT TO failed.\n";
    fclose($socket);
    exit(1);
}

// DATA
$reply = smtpCommand($socket, "DATA");
echo "DATA: " . trim($reply) . "\n";
if (!expectCode($reply, '354')) {
    echo "DATA command failed.\n";
    fclose($socket);
    exit(1);
}

// Send message and terminate with \r\n.\r\n
fwrite($socket, $message . "\r\n.\r\n");
$reply = smtpRead($socket);
echo "SEND: " . trim($reply) . "\n";
if (!expectCode($reply, '250')) {
    echo "Message was not accepted.\n";
    fclose($socket);
    exit(1);
}

// QUIT
$reply = smtpCommand($socket, "QUIT");
echo "QUIT: " . trim($reply) . "\n";

fclose($socket);
echo "\nTest email sent successfully to {$to}\n";
