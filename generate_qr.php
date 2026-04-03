<?php
// Enable error handling
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Check if ticket_id is provided
if (!isset($_GET['ticket_id'])) {
    http_response_code(400);
    echo "Error: ticket_id not provided";
    exit;
}

$ticket_id = preg_replace('/[^a-zA-Z0-9_-]/', '', $_GET['ticket_id']);

// Create qrcodes directory if it doesn't exist
$qrcode_dir = __DIR__ . '/qrcodes';
if (!is_dir($qrcode_dir)) {
    mkdir($qrcode_dir, 0755, true);
}

// File path for the QR code
$file = $qrcode_dir . '/ticket_' . $ticket_id . '.png';

// Check if QR code already exists
if (file_exists($file)) {
    header('Content-Type: image/png');
    readfile($file);
    exit;
}

// QR data - customize this URL to your verification page
$verification_url = (isset($_SERVER['HTTPS']) ? "https" : "http") . "://" . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']);
$data = $verification_url . "/verify.php?ticket_id=" . urlencode($ticket_id);

// Use QR Code library
// Download from: https://sourceforge.net/projects/phpqrcode/
// Or install via Composer: composer require endroid/qr-code

// If phpqrcode is available
if (file_exists(__DIR__ . '/phpqrcode/qrlib.php')) {
    include(__DIR__ . '/phpqrcode/qrlib.php');
    QRcode::png($data, $file, QR_ECLEVEL_L, 5);
} else {
    // Fallback: Use a QR code API if phpqrcode is not installed
    // This is a temporary solution - install phpqrcode for production
    $qr_api = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" . urlencode($data);
    $qr_image = file_get_contents($qr_api);
    
    if ($qr_image === false) {
        http_response_code(500);
        echo "Error: Could not generate QR code";
        exit;
    }
    
    file_put_contents($file, $qr_image);
}

// Return the QR code
if (file_exists($file)) {
    header('Content-Type: image/png');
    header('Cache-Control: public, max-age=31536000');
    readfile($file);
} else {
    http_response_code(500);
    echo "Error: Could not create QR code file";
}

?>
