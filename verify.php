<?php
// Header for JSON response
header('Content-Type: application/json');

include('db.php');

// Get ticket_id from URL
if (!isset($_GET['ticket_id'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'ticket_id not provided']);
    exit;
}

$ticket_id = mysqli_real_escape_string($conn, $_GET['ticket_id']);

// Query the database
$query = "SELECT * FROM tickets WHERE ticket_id = '$ticket_id'";
$result = mysqli_query($conn, $query);

if (!$result) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error']);
    exit;
}

if (mysqli_num_rows($result) == 0) {
    echo json_encode([
        'status' => 'error',
        'message' => '❌ Invalid Ticket',
        'valid' => false
    ]);
} else {
    $row = mysqli_fetch_assoc($result);
    
    if ($row['status'] == 'used') {
        echo json_encode([
            'status' => 'warning',
            'message' => '⚠️ Ticket Already Used',
            'valid' => false,
            'scan_date' => $row['scan_date'],
            'scanned_by' => $row['scanned_by']
        ]);
    } else if ($row['status'] == 'cancelled') {
        echo json_encode([
            'status' => 'error',
            'message' => '❌ Ticket Cancelled',
            'valid' => false
        ]);
    } else {
        echo json_encode([
            'status' => 'success',
            'message' => '✅ Valid Ticket',
            'valid' => true,
            'ticket_id' => $row['ticket_id'],
            'event_id' => $row['event_id'],
            'buyer_address' => $row['buyer_address'],
            'purchase_date' => $row['purchase_date']
        ]);
    }
}

?>
