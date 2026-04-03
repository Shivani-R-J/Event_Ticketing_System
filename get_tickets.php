<?php
// Get all tickets or filter by buyer address
header('Content-Type: application/json');

include('db.php');

$buyer_address = isset($_GET['buyer_address']) ? mysqli_real_escape_string($conn, $_GET['buyer_address']) : null;
$event_id = isset($_GET['event_id']) ? mysqli_real_escape_string($conn, $_GET['event_id']) : null;

$query = "SELECT * FROM tickets WHERE 1=1";

if ($buyer_address) {
    $query .= " AND buyer_address = '$buyer_address'";
}

if ($event_id) {
    $query .= " AND event_id = '$event_id'";
}

$query .= " ORDER BY purchase_date DESC";

$result = mysqli_query($conn, $query);

if (!$result) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error']);
    exit;
}

$tickets = [];
while ($row = mysqli_fetch_assoc($result)) {
    $tickets[] = $row;
}

echo json_encode([
    'status' => 'success',
    'count' => count($tickets),
    'tickets' => $tickets
]);

?>
