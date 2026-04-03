# 🎫 Event Ticketing System - QR Code Setup Instructions

## Prerequisites
- PHP 7.4+ with MySQL support
- XAMPP, WAMP, or similar local server (Apache + MySQL)
- Composer (optional, for QR library via Composer)

---

## 🚀 Installation Steps

### Step 1: Set Up Local Server
1. Install **XAMPP** (https://www.apachefriends.org/)
2. Start **Apache** and **MySQL** from XAMPP Control Panel
3. Move project to XAMPP htdocs:
   ```
   C:\xampp\htdocs\Event_Ticketing_System\
   ```

### Step 2: Install QR Code Library

**Option A: Using Composer (Recommended for Production)**
```bash
cd C:\xampp\htdocs\Event_Ticketing_System
composer require endroid/qr-code
```

**Option B: Manual Download**
1. Download phpQRCode from: https://sourceforge.net/projects/phpqrcode/
2. Extract to: `phpqrcode/` folder in your project
3. Your structure should look like:
   ```
   Event_Ticketing_System/
   ├── phpqrcode/
   │   ├── qrlib.php
   │   └── ... (other files)
   ├── qrcodes/          (auto-created)
   ├── generate_qr.php
   ├── verify.php
   ├── mark_used.php
   ├── create_ticket.php
   ├── get_tickets.php
   └── ... (other files)
   ```

### Step 3: Create MySQL Database
1. Open phpMyAdmin: http://localhost/phpmyadmin/
2. The database will be created automatically when you first access the PHP files
3. Or manually run this SQL:
   ```sql
   CREATE DATABASE event_ticketing;
   USE event_ticketing;
   
   CREATE TABLE tickets (
       id INT AUTO_INCREMENT PRIMARY KEY,
       ticket_id VARCHAR(255) UNIQUE NOT NULL,
       event_id VARCHAR(255) NOT NULL,
       buyer_address VARCHAR(255) NOT NULL,
       price DECIMAL(10, 6) NOT NULL,
       purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       status ENUM('valid', 'used', 'cancelled') DEFAULT 'valid',
       scan_date TIMESTAMP NULL,
       scanned_by VARCHAR(255) NULL
   );
   ```

### Step 4: Configure Database Connection
Edit `db.php` if you have different credentials:
```php
$host = "localhost";
$user = "root";           // Change if needed
$password = "";           // Add password if set
$database = "event_ticketing";
```

---

## 📝 API Endpoints

### 1. Generate QR Code
**URL:** `generate_qr.php?ticket_id=YOUR_TICKET_ID`
**Method:** GET
**Returns:** PNG image of QR code

**Example:**
```html
<img src="generate_qr.php?ticket_id=T123456" width="200" height="200" />
```

### 2. Verify Ticket
**URL:** `verify.php?ticket_id=YOUR_TICKET_ID`
**Method:** GET
**Returns:** JSON
```json
{
  "status": "success",
  "message": "✅ Valid Ticket",
  "valid": true,
  "ticket_id": "T123456",
  "event_id": "demo-1",
  "buyer_address": "0x123...",
  "purchase_date": "2026-04-04 10:30:00"
}
```

### 3. Create Ticket
**URL:** `create_ticket.php`
**Method:** POST
**Body:**
```json
{
  "ticket_id": "T123456",
  "event_id": "demo-1",
  "buyer_address": "0x123...",
  "price": 0.01
}
```

### 4. Mark Ticket as Used
**URL:** `mark_used.php`
**Method:** POST
**Body:**
```json
{
  "ticket_id": "T123456",
  "scanner_address": "0x456..."
}
```

### 5. Get Tickets
**URL:** `get_tickets.php?buyer_address=0x123...` or `?event_id=demo-1`
**Method:** GET
**Returns:** JSON array of tickets

---

## 🔗 Integration with Frontend

### Display QR Code in Your UI
Replace white box with:
```html
<img src="generate_qr.php?ticket_id=<?php echo $ticket['id']; ?>" 
     width="200" height="200" 
     alt="Ticket QR Code"
     style="border: 2px solid var(--teal); border-radius: 8px; padding: 10px;">
```

### Scan QR Code (JavaScript)
The project already includes `html5-qrcode` library. Example:
```javascript
function startQRScanner() {
    const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-scanner", 
        { fps: 10, qrbox: 250 },
        false
    );
    
    html5QrcodeScanner.render((decodedText) => {
        // decodedText contains the QR data
        verifyTicket(decodedText);
    }, (error) => {
        console.log(error);
    });
}

function verifyTicket(qrData) {
    const ticketId = new URL(qrData).searchParams.get('ticket_id');
    
    fetch(`verify.php?ticket_id=${ticketId}`)
        .then(res => res.json())
        .then(data => {
            if (data.valid) {
                alert('✅ ' + data.message);
                // Mark as used
                markTicketUsed(ticketId);
            } else {
                alert('❌ ' + data.message);
            }
        });
}

function markTicketUsed(ticketId) {
    fetch('mark_used.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ticket_id: ticketId,
            scanner_address: userAddress // from MetaMask
        })
    })
    .then(res => res.json())
    .then(data => console.log(data.message));
}
```

---

## ⚠️ Security Tips

1. **SQL Injection Prevention:** All user inputs are escaped using `mysqli_real_escape_string()`
2. **For Production:** Use prepared statements instead:
   ```php
   $stmt = $conn->prepare("SELECT * FROM tickets WHERE ticket_id = ?");
   $stmt->bind_param("s", $ticket_id);
   $stmt->execute();
   ```
3. **Access Control:** Add authentication checks in `verify.php` and `mark_used.php`
4. **HTTPS:** Always use HTTPS in production
5. **QR Data Encryption:** Optional - encode ticket_id in base64 or encrypt

---

## 🧪 Testing

### Test QR Generation
Visit: `http://localhost/Event_Ticketing_System/generate_qr.php?ticket_id=test123`

### Test Verification
Visit: `http://localhost/Event_Ticketing_System/verify.php?ticket_id=test123`

### Create Test Ticket
```bash
curl -X POST http://localhost/Event_Ticketing_System/create_ticket.php \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_id": "T001",
    "event_id": "demo-1",
    "buyer_address": "0x123456789",
    "price": 0.01
  }'
```

---

## 📖 Advanced Features

### Encrypted QR Codes
Instead of plain ticket ID, use encrypted data:
```php
// In generate_qr.php
$encrypted = base64_encode(openssl_encrypt($ticket_id, 'AES-256-CBC', 'your-secret-key', true));
$data = "http://localhost/Event_Ticketing_System/verify.php?ticket_id=" . urlencode($encrypted);
```

### Email Ticket to Buyer
```php
// After creating ticket
$to = $buyer_email;
$subject = "Your Event Ticket - QR Code";
$message = "<img src='cid:qrcode' width='200'>";
// Use PHPMailer for production
```

### Admin Dashboard
Track ticket scans, view statistics:
```php
$query = "SELECT status, COUNT(*) as count FROM tickets GROUP BY status";
```

---

## ❓ Troubleshooting

### QR Code Not Generating
- Check if `phpqrcode/` folder exists
- Or use API fallback (already implemented)
- Check folder permissions on `/qrcodes/`

### Database Connection Error
- Ensure MySQL is running
- Check credentials in `db.php`
- Verify database name matches

### Permission Denied Error
- Make sure `/qrcodes/` folder is writable:
  ```bash
  chmod -R 755 qrcodes/
  ```

### CORS Issues (when calling from frontend)
- Add headers to PHP files:
  ```php
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
  ```

---

## 🎯 Next Steps

1. Set up XAMPP and local server
2. Install QR library (phpQRCode)
3. Create database via phpMyAdmin
4. Test endpoints using Postman or browser
5. Integrate with your blockchain ticketing system
6. Deploy to production server (DigitalOcean, AWS, etc.)

---

**Happy Ticketing! 🎫**
