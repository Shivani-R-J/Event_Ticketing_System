<?php
// Database Configuration
$host = "localhost";
$user = "root";
$password = "";
$database = "event_ticketing";

// Create connection
$conn = mysqli_connect($host, $user, $password);

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

// Create database if it doesn't exist
$sql = "CREATE DATABASE IF NOT EXISTS $database";
if (mysqli_query($conn, $sql)) {
    // Select the database
    mysqli_select_db($conn, $database);
} else {
    die("Error creating database: " . mysqli_error($conn));
}

// Create tickets table if it doesn't exist
$table_sql = "CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id VARCHAR(255) UNIQUE NOT NULL,
    event_id VARCHAR(255) NOT NULL,
    buyer_address VARCHAR(255) NOT NULL,
    price DECIMAL(10, 6) NOT NULL,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('valid', 'used', 'cancelled') DEFAULT 'valid',
    scan_date TIMESTAMP NULL,
    scanned_by VARCHAR(255) NULL
)";

if (!mysqli_query($conn, $table_sql)) {
    // Table might already exist, that's okay
}

?>
