<?php
// Test all endpoints - simple test page
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Code System - Test Dashboard</title>
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
        .section { 
            background: #1a1f3a;
            border: 1px solid #00d4ff;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .section h2 { color: #00d4ff; margin-bottom: 15px; }
        input, textarea { 
            width: 100%;
            padding: 10px;
            margin-bottom: 10px;
            background: #0a0e27;
            border: 1px solid #00d4ff;
            color: #fff;
            border-radius: 4px;
            font-family: monospace;
        }
        button { 
            background: #00d4ff;
            color: #0a0e27;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            margin-right: 10px;
        }
        button:hover { background: #00b8cc; }
        .result { 
            background: #0a0e27;
            border: 1px solid #00d4ff;
            padding: 15px;
            border-radius: 4px;
            margin-top: 10px;
            max-height: 300px;
            overflow-y: auto;
            font-family: monospace;
            font-size: 12px;
            white-space: pre-wrap;
            word-break: break-all;
        }
        .success { color: #00ff88; }
        .error { color: #ff4488; }
        .warning { color: #ffaa00; }
        .qr-preview { 
            margin-top: 10px;
            text-align: center;
        }
        .qr-preview img { 
            max-width: 200px;
            border: 2px solid #00d4ff;
            border-radius: 8px;
            padding: 10px;
        }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        @media (max-width: 768px) { .row { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎫 QR Code System - Test Dashboard</h1>
        
        <!-- Create Ticket -->
        <div class="section">
            <h2>1️⃣ Create Ticket</h2>
            <div class="row">
                <input type="text" id="ticket_id_create" placeholder="Ticket ID (e.g., T001)" value="T" onfocus="this.value='T'">
                <input type="text" id="event_id" placeholder="Event ID (e.g., demo-1)" value="demo-1">
                <input type="text" id="buyer_address" placeholder="Buyer Address (0x...)" value="0xAbcd1234">
                <input type="number" id="price" placeholder="Price (0.01)" value="0.01" step="0.001">
            </div>
            <button onclick="createTicket()">Create Ticket</button>
            <button onclick="randomTicket()">Create Random</button>
            <div id="create_result" class="result" style="display:none;"></div>
        </div>

        <!-- Generate QR -->
        <div class="section">
            <h2>2️⃣ Generate QR Code</h2>
            <input type="text" id="ticket_id_qr" placeholder="Ticket ID" value="T002">
            <button onclick="generateQR()">Generate QR</button>
            <div id="qr_result" class="result" style="display:none;"></div>
            <div class="qr-preview" id="qr_preview"></div>
        </div>

        <!-- Verify Ticket -->
        <div class="section">
            <h2>3️⃣ Verify Ticket</h2>
            <input type="text" id="ticket_id_verify" placeholder="Ticket ID" value="T002">
            <button onclick="verifyTicket()">Verify</button>
            <div id="verify_result" class="result" style="display:none;"></div>
        </div>

        <!-- Mark as Used -->
        <div class="section">
            <h2>4️⃣ Mark Ticket as Used</h2>
            <input type="text" id="ticket_id_used" placeholder="Ticket ID" value="T002">
            <input type="text" id="scanner_address" placeholder="Scanner Address (0x...)" value="0xScanner1">
            <button onclick="markUsed()">Mark as Used</button>
            <div id="used_result" class="result" style="display:none;"></div>
        </div>

        <!-- Get Tickets -->
        <div class="section">
            <h2>5️⃣ Get All Tickets</h2>
            <div class="row">
                <input type="text" id="filter_buyer" placeholder="Filter by buyer address (optional)">
                <input type="text" id="filter_event" placeholder="Filter by event ID (optional)">
            </div>
            <button onclick="getTickets()">Get Tickets</button>
            <div id="tickets_result" class="result" style="display:none;"></div>
        </div>
    </div>

    <script>
        function randomTicket() {
            document.getElementById('ticket_id_create').value = 'T' + Math.floor(Math.random() * 10000);
        }

        function createTicket() {
            const data = {
                ticket_id: document.getElementById('ticket_id_create').value,
                event_id: document.getElementById('event_id').value,
                buyer_address: document.getElementById('buyer_address').value,
                price: parseFloat(document.getElementById('price').value)
            };

            if (!data.ticket_id) {
                alert('Please enter a ticket ID');
                return;
            }

            fetch('create_ticket.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(data => {
                const result = document.getElementById('create_result');
                result.style.display = 'block';
                if (data.status === 'success') {
                    result.innerHTML = '<span class="success">' + JSON.stringify(data, null, 2) + '</span>';
                    document.getElementById('ticket_id_qr').value = data.ticket_id;
                    document.getElementById('ticket_id_verify').value = data.ticket_id;
                    document.getElementById('ticket_id_used').value = data.ticket_id;
                } else {
                    result.innerHTML = '<span class="error">' + JSON.stringify(data, null, 2) + '</span>';
                }
            })
            .catch(err => {
                const result = document.getElementById('create_result');
                result.style.display = 'block';
                result.innerHTML = '<span class="error">Error: ' + err.message + '</span>';
            });
        }

        function generateQR() {
            const ticketId = document.getElementById('ticket_id_qr').value;
            if (!ticketId) {
                alert('Please enter a ticket ID');
                return;
            }

            const qrUrl = 'generate_qr.php?ticket_id=' + encodeURIComponent(ticketId);
            const preview = document.getElementById('qr_preview');
            const result = document.getElementById('qr_result');

            result.style.display = 'block';
            result.innerHTML = '<span class="success">Generating QR code...</span>';

            // Check if image loads
            const img = new Image();
            img.onload = function() {
                result.innerHTML = '<span class="success">✅ QR Code generated successfully!</span>';
                preview.innerHTML = '<img src="' + qrUrl + '" alt="QR Code">';
            };
            img.onerror = function() {
                result.innerHTML = '<span class="error">❌ Failed to generate QR code</span>';
                preview.innerHTML = '';
            };
            img.src = qrUrl + '&t=' + Date.now(); // Cache bust
        }

        function verifyTicket() {
            const ticketId = document.getElementById('ticket_id_verify').value;
            if (!ticketId) {
                alert('Please enter a ticket ID');
                return;
            }

            fetch('verify.php?ticket_id=' + encodeURIComponent(ticketId))
                .then(res => res.json())
                .then(data => {
                    const result = document.getElementById('verify_result');
                    result.style.display = 'block';
                    const className = data.valid ? 'success' : 'error';
                    result.innerHTML = '<span class="' + className + '">' + JSON.stringify(data, null, 2) + '</span>';
                })
                .catch(err => {
                    const result = document.getElementById('verify_result');
                    result.style.display = 'block';
                    result.innerHTML = '<span class="error">Error: ' + err.message + '</span>';
                });
        }

        function markUsed() {
            const data = {
                ticket_id: document.getElementById('ticket_id_used').value,
                scanner_address: document.getElementById('scanner_address').value
            };

            if (!data.ticket_id) {
                alert('Please enter a ticket ID');
                return;
            }

            fetch('mark_used.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(data => {
                const result = document.getElementById('used_result');
                result.style.display = 'block';
                const className = data.status === 'success' ? 'success' : 'warning';
                result.innerHTML = '<span class="' + className + '">' + JSON.stringify(data, null, 2) + '</span>';
            })
            .catch(err => {
                const result = document.getElementById('used_result');
                result.style.display = 'block';
                result.innerHTML = '<span class="error">Error: ' + err.message + '</span>';
            });
        }

        function getTickets() {
            let url = 'get_tickets.php?';
            const buyer = document.getElementById('filter_buyer').value;
            const event = document.getElementById('filter_event').value;

            if (buyer) url += 'buyer_address=' + encodeURIComponent(buyer);
            if (event) url += (buyer ? '&' : '') + 'event_id=' + encodeURIComponent(event);

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    const result = document.getElementById('tickets_result');
                    result.style.display = 'block';
                    result.innerHTML = '<span class="success">' + JSON.stringify(data, null, 2) + '</span>';
                })
                .catch(err => {
                    const result = document.getElementById('tickets_result');
                    result.style.display = 'block';
                    result.innerHTML = '<span class="error">Error: ' + err.message + '</span>';
                });
        }
    </script>
</body>
</html>
