<?php
// Create a new ticket in the database
header('Content-Type: application/json');

include('db.php');

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
$required_fields = ['ticket_id', 'event_id', 'buyer_address', 'price'];
foreach ($required_fields as $field) {
    if (!isset($data[$field])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => "$field is required"]);
        exit;
    }
}

$ticket_id = mysqli_real_escape_string($conn, $data['ticket_id']);
$event_id = mysqli_real_escape_string($conn, $data['event_id']);
$buyer_address = mysqli_real_escape_string($conn, $data['buyer_address']);
$price = floatval($data['price']);

// Check if ticket already exists
$check_query = "SELECT id FROM tickets WHERE ticket_id = '$ticket_id'";
$result = mysqli_query($conn, $check_query);

if (mysqli_num_rows($result) > 0) {
    http_response_code(409);
    echo json_encode(['status' => 'error', 'message' => 'Ticket already exists']);
    exit;
}

// Insert new ticket
$insert_query = "INSERT INTO tickets (ticket_id, event_id, buyer_address, price, status) 
                VALUES ('$ticket_id', '$event_id', '$buyer_address', $price, 'valid')";

if (mysqli_query($conn, $insert_query)) {
    $new_id = mysqli_insert_id($conn);
    echo json_encode([
        'status' => 'success',
        'message' => 'Ticket created successfully',
        'ticket_id' => $ticket_id,
        'qr_url' => 'generate_qr.php?ticket_id=' . urlencode($ticket_id)
    ]);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . mysqli_error($conn)]);
}

?>
