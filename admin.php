<?php
// Admin dashboard - view all scans and statistics
header('Content-Type: text/html; charset=utf-8');
include('db.php');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Ticket Scanner</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'DM Sans', sans-serif; 
            background: #0a0e27;
            color: #fff;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { margin-bottom: 30px; color: #00d4ff; }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-box {
            background: #1a1f3a;
            border: 2px solid #00d4ff;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }
        
        .stat-box h3 { color: #00ff88; font-size: 32px; margin-bottom: 5px; }
        .stat-box p { color: #aaa; font-size: 12px; }
        
        table {
            width: 100%;
            border-collapse: collapse;
            background: #1a1f3a;
            border: 1px solid #00d4ff;
            border-radius: 8px;
            overflow: hidden;
        }
        
        th {
            background: #0a0e27;
            border-bottom: 1px solid #00d4ff;
            padding: 12px;
            text-align: left;
            color: #00d4ff;
            font-weight: bold;
        }
        
        td {
            padding: 12px;
            border-bottom: 1px solid #2a2f4a;
        }
        
        tbody tr:hover { background: #252a45; }
        
        .badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
        }
        
        .badge-valid { background: #00ff88; color: #0a0e27; }
        .badge-used { background: #ffaa00; color: #0a0e27; }
        .badge-cancelled { background: #ff4488; color: #fff; }
        
        @media (max-width: 768px) {
            .stats { grid-template-columns: 1fr; }
            table { font-size: 12px; }
            td, th { padding: 8px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Admin Dashboard - Ticket Scanner</h1>
        
        <?php
        // Get statistics
        $total_query = "SELECT COUNT(*) as total FROM tickets";
        $total = mysqli_fetch_assoc(mysqli_query($conn, $total_query))['total'];

        $valid_query = "SELECT COUNT(*) as valid FROM tickets WHERE status='valid'";
        $valid = mysqli_fetch_assoc(mysqli_query($conn, $valid_query))['valid'];

        $used_query = "SELECT COUNT(*) as used FROM tickets WHERE status='used'";
        $used = mysqli_fetch_assoc(mysqli_query($conn, $used_query))['used'];

        $revenue_query = "SELECT SUM(price) as total FROM tickets";
        $revenue = mysqli_fetch_assoc(mysqli_query($conn, $revenue_query))['total'] ?? 0;
        ?>
        
        <div class="stats">
            <div class="stat-box">
                <h3><?php echo $total; ?></h3>
                <p>Total Tickets</p>
            </div>
            <div class="stat-box">
                <h3><?php echo $valid; ?></h3>
                <p>Valid Tickets</p>
            </div>
            <div class="stat-box">
                <h3><?php echo $used; ?></h3>
                <p>Used Tickets</p>
            </div>
            <div class="stat-box">
                <h3>Ⓔ <?php echo number_format($revenue, 4); ?></h3>
                <p>Total Revenue</p>
            </div>
        </div>

        <h2 style="margin: 20px 0; color: #00d4ff;">📋 Recent Tickets</h2>
        
        <table>
            <thead>
                <tr>
                    <th>Ticket ID</th>
                    <th>Event ID</th>
                    <th>Buyer Address</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Purchase Date</th>
                    <th>Scanned By</th>
                </tr>
            </thead>
            <tbody>
                <?php
                $query = "SELECT * FROM tickets ORDER BY purchase_date DESC LIMIT 50";
                $result = mysqli_query($conn, $query);

                while ($row = mysqli_fetch_assoc($result)) {
                    $badge_class = 'badge-' . $row['status'];
                    echo "<tr>";
                    echo "<td style='font-family:monospace;'>" . substr($row['ticket_id'], 0, 16) . "...</td>";
                    echo "<td>" . $row['event_id'] . "</td>";
                    echo "<td style='font-family:monospace;'>" . substr($row['buyer_address'], 0, 12) . "...</td>";
                    echo "<td>Ⓔ " . number_format($row['price'], 6) . "</td>";
                    echo "<td><span class='badge $badge_class'>" . strtoupper($row['status']) . "</span></td>";
                    echo "<td>" . $row['purchase_date'] . "</td>";
                    echo "<td style='font-family:monospace;'>" . ($row['scanned_by'] ? substr($row['scanned_by'], 0, 12) . "..." : '-') . "</td>";
                    echo "</tr>";
                }
                ?>
            </tbody>
        </table>
    </div>
</body>
</html>
