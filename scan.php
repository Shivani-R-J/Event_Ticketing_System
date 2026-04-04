<?php
$ticket_id = isset($_GET['ticket_id']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', $_GET['ticket_id']) : '';
?><!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ticket Scan — Event Ticketing</title>
  <link rel="stylesheet" href="style.css" />
  <style>
    body { background:#080c18; color:#eef2ff; margin:0; font-family:Inter,system-ui, sans-serif; }
    .scan-shell { max-width:560px; margin:0 auto; padding:24px; }
    .scan-card { background:rgba(10,14,26,.95); border:1px solid rgba(255,255,255,.08); border-radius:22px; padding:24px; box-shadow:0 20px 40px rgba(0,0,0,.25); }
    .scan-card h1 { font-size:2.1rem; margin:0 0 10px; color:#f8c66c; }
    .scan-card p { color:#a0aec0; line-height:1.7; margin:0 0 18px; }
    .status-box { padding:18px; border-radius:18px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.03); margin-bottom:18px; }
    .status-box strong { display:block; margin-bottom:8px; color:#fff; }
    .field-group { margin-bottom:18px; }
    .field-group label { display:block; margin-bottom:8px; font-size:0.85rem; color:#9ca3af; }
    .field-group input { width:100%; padding:14px 16px; border-radius:12px; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.04); color:#eef2ff; font-size:1rem; }
    .button-row { display:grid; gap:12px; }
    .button-row button, .button-row a { width:100%; border:none; border-radius:14px; padding:14px 16px; font-size:1rem; cursor:pointer; text-decoration:none; display:inline-flex; justify-content:center; align-items:center; gap:8px; }
    .btn-primary { background:linear-gradient(135deg,#d4a843,#2ed66c); color:#08121b; }
    .btn-secondary { background:rgba(255,255,255,.06); color:#eef2ff; }
    .btn-disabled { opacity:.55; cursor:not-allowed; }
    .badge { display:inline-flex; align-items:center; gap:6px; padding:8px 12px; border-radius:999px; font-weight:700; font-size:0.95rem; }
    .badge.success { background:rgba(42,183,90,.12); color:#7ef0a4; }
    .badge.warning { background:rgba(239,154,0,.12); color:#ffd76d; }
    .badge.error { background:rgba(239,68,68,.12); color:#ff9ea0; }
    .note { font-size:.9rem; color:#94a3b8; margin-top:18px; }
  </style>
</head>
<body>
  <div class="scan-shell">
    <div class="scan-card">
      <h1>Scan Ticket</h1>
      <p>Organizer scan mode. The ticket link opens this verification page, then you can mark the ticket as used.</p>

      <div class="status-box" id="ticketStatus">
        <strong>Status</strong>
        <div id="statusMessage">Loading ticket details...</div>
      </div>

      <div class="field-group">
        <label for="scannerAddress">Scanner / Organizer ID</label>
        <input id="scannerAddress" type="text" placeholder="Enter your name or scanner ID" value="Organizer App" />
      </div>

      <div class="button-row">
        <button id="markButton" class="btn-primary btn-disabled" disabled onclick="markTicketUsed()">Mark Ticket Used</button>
        <button id="connectButton" class="btn-secondary" style="display:none;" onclick="connectWallet()">Connect Wallet</button>
        <a href="index.html" class="btn-secondary">Open Main App</a>
      </div>

      <div class="note">Ticket ID: <span id="ticketIdText"></span></div>
      <div class="note" id="extraNote">If the ticket already shows used or invalid, it cannot be marked again.</div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js"></script>
  <script>
    const ticketId = <?php echo json_encode($ticket_id); ?>;
    const statusMessage = document.getElementById('statusMessage');
    const ticketIdText = document.getElementById('ticketIdText');
    const markButton = document.getElementById('markButton');
    const connectButton = document.getElementById('connectButton');
    const extraNote = document.getElementById('extraNote');

    const CONTRACT_ADDRESS = '0x8d059EEb57E0Eeb9098c8f503CA708593Aa80B1E';
    const ABI = [
      'function tickets(uint) public view returns (address owner, bool used)',
      'function markUsed(uint)'
    ];

    let scanMode = null;
    let provider = null;
    let chainContract = null;

    ticketIdText.textContent = ticketId || 'Missing';

    if (!ticketId) {
      statusMessage.textContent = 'No ticket_id provided in the QR link.';
      disableMark();
    } else {
      verifyTicket();
    }

    async function verifyTicket() {
      const dbResult = await verifyDatabaseTicket();
      if (dbResult === true) {
        return;
      }

      if (window.ethereum) {
        connectButton.style.display = 'inline-flex';
        statusMessage.innerHTML = `<span class="badge warning">Not found in database.</span> Connect wallet to verify on-chain ticket.`;
      } else {
        statusMessage.innerHTML = `<span class="badge error">Not found in database.</span> Use a browser with MetaMask to verify on-chain.`;
        disableMark();
      }
    }

    async function verifyDatabaseTicket() {
      try {
        const res = await fetch(`verify.php?ticket_id=${encodeURIComponent(ticketId)}`);
        const data = await res.json();

        if (data.status === 'success') {
          scanMode = 'db';
          statusMessage.innerHTML = `<span class="badge success">${data.message}</span><br>Event: ${data.event_id || 'Unknown'}`;
          enableMark();
          return true;
        }

        if (data.status === 'warning') {
          statusMessage.innerHTML = `<span class="badge warning">${data.message}</span><br>Scanned by: ${data.scanned_by || 'N/A'}<br>Scanned at: ${data.scan_date || 'N/A'}`;
          disableMark();
          return true;
        }

        return false;
      } catch (err) {
        return false;
      }
    }

    async function connectWallet() {
      if (!window.ethereum) {
        statusMessage.innerHTML = `<span class="badge error">MetaMask not available.</span> Install MetaMask to continue.`;
        return;
      }

      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        provider = new ethers.providers.Web3Provider(window.ethereum);
        chainContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        connectButton.style.display = 'none';
        await verifyChainTicket();
      } catch (err) {
        statusMessage.innerHTML = `<span class="badge error">Wallet connection failed.</span>`;
      }
    }

    async function verifyChainTicket() {
      try {
        const ticket = await chainContract.tickets(parseInt(ticketId));
        const owner = ticket.owner;
        const used = ticket.used;

        if (!owner || owner === '0x0000000000000000000000000000000000000000') {
          statusMessage.innerHTML = `<span class="badge error">Invalid ticket on-chain.</span>`;
          disableMark();
          return;
        }

        scanMode = 'chain';
        if (used) {
          statusMessage.innerHTML = `<span class="badge warning">Ticket already used.</span><br>Owner: ${owner}`;
          disableMark();
        } else {
          statusMessage.innerHTML = `<span class="badge success">Valid on-chain ticket.</span><br>Owner: ${owner}`;
          enableMark();
        }
      } catch (err) {
        statusMessage.innerHTML = `<span class="badge error">Failed to verify on-chain ticket.</span>`;
        disableMark();
      }
    }

    function enableMark() {
      markButton.disabled = false;
      markButton.classList.remove('btn-disabled');
    }

    function disableMark() {
      markButton.disabled = true;
      markButton.classList.add('btn-disabled');
    }

    async function markTicketUsed() {
      const scannerAddress = document.getElementById('scannerAddress').value.trim() || 'Organizer App';
      markButton.disabled = true;
      markButton.textContent = 'Marking...';

      if (scanMode === 'db') {
        await markDatabaseTicket(scannerAddress);
      } else if (scanMode === 'chain') {
        await markChainTicket();
      } else {
        statusMessage.innerHTML = `<span class="badge error">No ticket mode set.</span>`;
      }

      markButton.textContent = 'Mark Ticket Used';
    }

    async function markDatabaseTicket(scannerAddress) {
      try {
        const res = await fetch('mark_used.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticket_id: ticketId, scanner_address: scannerAddress })
        });
        const data = await res.json();

        if (data.status === 'success') {
          statusMessage.innerHTML = `<span class="badge success">${data.message}</span>`;
          extraNote.textContent = 'The ticket is now marked used and cannot be reused.';
          disableMark();
        } else {
          statusMessage.innerHTML = `<span class="badge error">${data.message}</span>`;
          disableMark();
        }
      } catch (err) {
        statusMessage.innerHTML = `<span class="badge error">Unable to update ticket status.</span>`;
        disableMark();
      }
    }

    async function markChainTicket() {
      try {
        if (!provider) {
          await connectWallet();
          if (!provider) return;
        }

        const signer = provider.getSigner();
        const contractWithSigner = chainContract.connect(signer);
        const tx = await contractWithSigner.markUsed(parseInt(ticketId));
        statusMessage.innerHTML = `<span class="badge warning">Confirming transaction...</span>`;
        await tx.wait();
        statusMessage.innerHTML = `<span class="badge success">Ticket marked used on-chain.</span>`;
        disableMark();
      } catch (err) {
        statusMessage.innerHTML = `<span class="badge error">Failed to mark ticket used.</span>`;
        disableMark();
      }
    }
  </script>
</body>
</html>
