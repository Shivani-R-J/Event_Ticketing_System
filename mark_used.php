<?php
// Mark a ticket as used after scanning
header('Content-Type: application/json');

include('db.php');

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['ticket_id']) || !isset($data['scanner_address'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'ticket_id and scanner_address required']);
    exit;
}

$ticket_id = mysqli_real_escape_string($conn, $data['ticket_id']);
$scanner_address = mysqli_real_escape_string($conn, $data['scanner_address']);

// Check if ticket exists and is valid
$check_query = "SELECT * FROM tickets WHERE ticket_id = '$ticket_id'";
$result = mysqli_query($conn, $check_query);

if (mysqli_num_rows($result) == 0) {
    echo json_encode(['status' => 'error', 'message' => 'Ticket not found']);
    exit;
}

$ticket = mysqli_fetch_assoc($result);

if ($ticket['status'] == 'used') {
    echo json_encode(['status' => 'warning', 'message' => 'Ticket already marked as used']);
    exit;
}

// Update ticket status to 'used'
$update_query = "UPDATE tickets SET status='used', scan_date=NOW(), scanned_by='$scanner_address' WHERE ticket_id='$ticket_id'";

if (mysqli_query($conn, $update_query)) {
    echo json_encode(['status' => 'success', 'message' => '✅ Ticket marked as used']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . mysqli_error($conn)]);
}

?>
