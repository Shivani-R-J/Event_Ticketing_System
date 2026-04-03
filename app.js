// ══════════════════════════════════════════
//  BLOCKCHAIN CONFIG
// ══════════════════════════════════════════
const CONTRACT_ADDRESS = "0x8d059EEb57E0Eeb9098c8f503CA708593Aa80B1E";
const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_HEX      = "0xaa36a7";

const ABI = [
  "function buyTicket() public",
  "function ticketCount() public view returns (uint)",
  "function tickets(uint) public view returns (address owner, bool used)",
  "function markUsed(uint)"
];

// ══════════════════════════════════════════
//  STATE & INITIALIZATION
// ══════════════════════════════════════════
let provider, signer, contract, userAddress;
let walletConnected = false;
let currentRole     = null;
let currentFilter   = 'All';
let myOnChainTickets = [];
let salesChart      = null;

const ICONS = { Music:'music', Sports:'dribbble', Tech:'laptop', Art:'palette', Food:'coffee', Film:'film', Comedy:'smile', Other:'sparkles', All:'grid-2x2' };
const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80';

let events = JSON.parse(localStorage.getItem('chainpass_events_v2')) || [
  {
    id:'demo-1', name:'Neon Rave Night', category:'Music',
    date:'2026-04-15', time:'22:00', venue:'Warehouse 23, Berlin', price:'0.01',
    totalTickets:300, desc:'Immersive techno experience with world-class DJs and laser installations.',
    image:'https://images.unsplash.com/photo-1518977956810-a23f96a1c37b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id:'demo-2', name:'Web3 Summit 2026', category:'Tech',
    date:'2026-05-02', time:'09:00', venue:'Convention Center, SF', price:'0.05',
    totalTickets:1000, desc:'Premier blockchain conference — speakers from 40+ countries.',
    image:'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id:'demo-3', name:'Global Food Festival', category:'Food',
    date:'2026-06-10', time:'11:00', venue:'Central Park, NY', price:'0.02',
    totalTickets:5000, desc:'Taste delicacies from over 50 countries with live cooking shows by celebrity chefs.',
    image:'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id:'demo-4', name:'Abstract Art Exhibition', category:'Art',
    date:'2026-07-20', time:'18:00', venue:'The Louvre, Paris', price:'0.04',
    totalTickets:500, desc:'An exclusive evening viewing modern abstract masterpieces with complimentary champagne.',
    image:'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=800&q=80'
  },
  {
    id:'demo-5', name:'Championship Finals 2026', category:'Sports',
    date:'2026-08-05', time:'20:00', venue:'Wembley Stadium, London', price:'0.15',
    totalTickets:80000, desc:'Witness the biggest football match of the decade live.',
    image:'https://images.unsplash.com/photo-1496317899792-9d7dbcd928a1?auto=format&fit=crop&w=800&q=80'
  },
  {
    id:'demo-6', name:'Laugh Out Loud Comedy Club', category:'Comedy',
    date:'2026-04-25', time:'21:30', venue:'The Comedy Cellar, NY', price:'0.015',
    totalTickets:150, desc:'A night of hilarious stand-up featuring surprise celebrity guests.',
    image:'https://images.unsplash.com/photo-1455938238901-87ca138d0bb0?auto=format&fit=crop&w=800&q=80'
  },
  {
    id:'demo-7', name:'Cinematic Masterpieces Festival', category:'Film',
    date:'2026-05-15', time:'19:00', venue:'Cannes Film Festival, France', price:'0.08',
    totalTickets:2000, desc:'Experience award-winning films from international directors on the big screen.',
    image:'https://images.unsplash.com/photo-1511765224389-37f0e77cf0eb?auto=format&fit=crop&w=800&q=80'
  },
  {
    id:'demo-8', name:'Electronic Beats Festival', category:'Music',
    date:'2026-06-22', time:'20:00', venue:'Tomorrowland, Belgium', price:'0.12',
    totalTickets:150000, desc:'Three days of non-stop electronic music with world-famous DJs and immersive production.',
    image:'https://images.unsplash.com/photo-1528222354211-064affdaf50d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id:'demo-9', name:'Ultimate Tennis Championship', category:'Sports',
    date:'2026-07-10', time:'14:00', venue:'Wimbledon, London', price:'0.25',
    totalTickets:15000, desc:'Watch the finest tennis players compete for glory at the prestigious Wimbledon tournament.',
    image:'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80'
  },
  {
    id:'demo-10', name:'Innovation & Gaming Expo', category:'Tech',
    date:'2026-06-05', time:'10:00', venue:'Las Vegas Convention Center, USA', price:'0.06',
    totalTickets:5000, desc:'Latest gaming hardware, VR experiences, and cutting-edge technology demonstrations.',
    image:'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
  },
  {
    id:'demo-11', name:'Yoga & Wellness Retreat', category:'Other',
    date:'2026-05-28', time:'08:00', venue:'Bali Resort & Spa, Indonesia', price:'0.18',
    totalTickets:500, desc:'Five-day meditation and yoga retreat with world-renowned instructors in paradise.',
    image:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80'
  },
  {
    id:'demo-12', name:'Spring Jazz Festival', category:'Music',
    date:'2026-04-30', time:'18:00', venue:'Montreux Jazz Club, Switzerland', price:'0.045',
    totalTickets:3000, desc:'Legendary jazz performers and contemporary artists in the most scenic festival setting.',
    image:'https://images.unsplash.com/photo-1518976024611-48885a0f0b46?auto=format&fit=crop&w=800&q=80'
  },
  {
    id:'demo-13', name:'Contemporary Art Gala', category:'Art',
    date:'2026-05-18', time:'19:30', venue:'Museum of Modern Art, New York', price:'0.12',
    totalTickets:800, desc:'Exclusive evening celebrating emerging and established contemporary artists with live performances.',
    image:'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80'
  },
  {
    id:'demo-14', name:'International Film Awards', category:'Film',
    date:'2026-07-01', time:'20:00', venue:'Dolby Theatre, Los Angeles', price:'0.35',
    totalTickets:3500, desc:'Celebrate cinema excellence at the most prestigious film awards ceremony of the year.',
    image:'https://images.unsplash.com/photo-1489587021446-3fa7e27cd0df?auto=format&fit=crop&w=800&q=80'
  },
  {
    id:'demo-15', name:'Basketball Super League Finals', category:'Sports',
    date:'2026-06-15', time:'19:30', venue:'Chase Center, San Francisco', price:'0.20',
    totalTickets:20000, desc:'High-octane basketball action as elite teams battle for the championship title.',
    image:'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id:'demo-16', name:'Asian Fusion Culinary Fest', category:'Food',
    date:'2026-05-05', time:'12:00', venue:'Marina Bay, Singapore', price:'0.025',
    totalTickets:8000, desc:'Asia\'s finest chefs showcase traditional and modern fusion cuisine with cooking demonstrations.',
    image:'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id:'demo-17', name:'Stand-Up Comedy Night Bash', category:'Comedy',
    date:'2026-05-12', time:'20:00', venue:'Beacon Theater, New York', price:'0.035',
    totalTickets:2500, desc:'Four hours of non-stop laughter with the hottest comedians in the industry.',
    image:'https://images.unsplash.com/photo-1515165562835-cb09e773b1bb?auto=format&fit=crop&w=800&q=80'
  },
  {
    id:'demo-18', name:'Startup Tech Summit 2026', category:'Tech',
    date:'2026-07-25', time:'09:00', venue:'Singapore Expo, Singapore', price:'0.055',
    totalTickets:4000, desc:'Network with founders, VCs, and innovators building the future of technology.',
    image:'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id:'demo-19', name:'Rock & Metal Extravaganza', category:'Music',
    date:'2026-06-30', time:'18:00', venue:'Sonisphere Festival Grounds, Greece', price:'0.065',
    totalTickets:25000, desc:'Three days of electrifying rock and metal performances from legendary and emerging bands.',
    image:'https://images.unsplash.com/photo-1497032205916-ac775f0649ae?auto=format&fit=crop&w=800&q=80'
  },
  {
    id:'demo-20', name:'Marathon Trophy Grand Prix', category:'Sports',
    date:'2026-08-20', time:'06:00', venue:'Circuit des 24 Heures, France', price:'0.28',
    totalTickets:30000, desc:'Witness the ultimate endurance test: 24-hour racing with world\'s top drivers.',
    image:'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=800&q=80'
  }
];

function saveEvents() {
  localStorage.setItem('chainpass_events_v2', JSON.stringify(events));
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
});

// ══════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════
function loginAs(role) {
  currentRole = role;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(role === 'organizer' ? 'organizerPage' : 'userPage').classList.add('active');
  if (role === 'organizer') {
    renderOrgEvents();
    updateChart();
  } else {
    renderUserEvents();
  }
  window.scrollTo(0,0);
}
function goBack() {
  currentRole = null;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('loginPage').classList.add('active');
  window.scrollTo(0,0);
}

// ══════════════════════════════════════════
//  WALLET
// ══════════════════════════════════════════
async function connectWallet(ctx) {
  if (!window.ethereum) {
    toast('MetaMask Not Found', 'Install the MetaMask browser extension.', 'error'); return;
  }
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    provider = new ethers.providers.Web3Provider(window.ethereum);
    let net = await provider.getNetwork();

    if (net.chainId !== SEPOLIA_CHAIN_ID) {
      setNetBadge(ctx, false);
      toast('Wrong Network', 'Switching to Sepolia…', 'error');
      try {
        await window.ethereum.request({ method:'wallet_switchEthereumChain', params:[{chainId:SEPOLIA_HEX}] });
        provider = new ethers.providers.Web3Provider(window.ethereum);
        net = await provider.getNetwork();
      } catch(e) {
        toast('Switch Failed', 'Please switch to Sepolia manually in MetaMask.', 'error'); return;
      }
    }

    signer         = provider.getSigner();
    userAddress    = await signer.getAddress();
    contract       = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    walletConnected = true;

    setWalletUI(ctx, userAddress);
    setNetBadge(ctx, true);
    toast('Wallet Connected', shortAddr(userAddress), 'success');

    if (ctx === 'user') await loadMyOnChainTickets();
    if (ctx === 'org')  await refreshOrgChain();

  } catch(e) {
    console.error(e);
    const msg = e.code === 4001 ? 'Request rejected in MetaMask.' : (e.message?.slice(0,70)||'Unknown error');
    toast('Connection Failed', msg, 'error');
  }
}

function setWalletUI(ctx, addr) {
  const p = ctx === 'org' ? 'org' : 'user';
  document.getElementById(p+'WalletDot').classList.add('connected');
  const t = document.getElementById(p+'WalletText');
  t.textContent = shortAddr(addr); t.classList.add('connected');
}

function setNetBadge(ctx, ok) {
  const p = ctx === 'org' ? 'org' : 'user';
  const b = document.getElementById(p+'NetBadge');
  b.style.display = 'block';
  b.className = 'net-badge ' + (ok ? 'sepolia' : 'wrong');
  b.textContent = ok ? '● Sepolia' : '✕ Wrong Network';
}

if (window.ethereum) {
  window.ethereum.on('accountsChanged', ()=>location.reload());
  window.ethereum.on('chainChanged',    ()=>location.reload());
}

// ══════════════════════════════════════════
//  ORGANIZER
// ══════════════════════════════════════════
function addEvent() {
  const name  = document.getElementById('evtName').value.trim();
  const date  = document.getElementById('evtDate').value;
  const venue = document.getElementById('evtVenue').value.trim();
  if (!name || !date || !venue) { toast('Missing Fields','Fill in name, date, and venue.','error'); return; }

  events.push({
    id:'evt-'+Date.now(),
    name, category: document.getElementById('evtCategory').value,
    date, time: document.getElementById('evtTime').value,
    venue, price: document.getElementById('evtPrice').value || '0',
    totalTickets: parseInt(document.getElementById('evtTickets').value)||null,
    desc: document.getElementById('evtDesc').value.trim(),
    image: document.getElementById('evtImage').value.trim()
  });

  saveEvents();
  renderOrgEvents(); renderUserEvents(); updateChart();
  toast('Event Published', `"${name}" is now live.`, 'success');
  ['evtName','evtDate','evtTime','evtVenue','evtPrice','evtTickets','evtDesc','evtImage'].forEach(id=>document.getElementById(id).value='');
}

async function refreshOrgChain() {
  if (!contract) { toast('No Wallet','Connect MetaMask first.','error'); return; }
  try {
    const c = (await contract.ticketCount()).toNumber();
    document.getElementById('orgChainCount').textContent = c;
    renderOrgEvents(c);
    toast('Chain Synced', `${c} ticket(s) sold on-chain.`, 'success');
  } catch(e) { toast('Chain Error', e.message?.slice(0,60), 'error'); }
}

function renderOrgEvents(chainCount) {
  const grid = document.getElementById('orgEventsGrid');
  document.getElementById('orgEventCount').textContent = events.length + (events.length!==1?' events':' event');
  if (!events.length) { 
    grid.innerHTML=`<div class="empty-state"><i data-lucide="inbox" class="es-icon" style="margin:0 auto 14px; width:44px; height:44px"></i><p>No events yet.</p></div>`; 
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return; 
  }
  
  grid.innerHTML = events.map(evt => {
    const iconName = ICONS[evt.category] || 'sparkles';
    const imgSrc = evt.image || DEFAULT_EVENT_IMAGE;
    const img = `<img class="event-img" src="${imgSrc}" alt="${evt.name}" onerror="this.onerror=null;this.src='${DEFAULT_EVENT_IMAGE}'">`; 
    const sold = chainCount !== undefined ? chainCount : '—';
    const total = evt.totalTickets || '∞';
    const pct = (evt.totalTickets && chainCount && chainCount !== '—') ? Math.min(100,Math.round(chainCount/evt.totalTickets*100)) : 0;
    return `<div class="event-card">${img}
      <div class="event-body">
        <div class="event-category"><i data-lucide="${iconName}" style="width:10px;height:10px"></i>${evt.category}</div>
        <div class="event-name">${evt.name}</div>
        <div class="event-meta">📅 ${fmtDate(evt.date)} ${evt.time?'· '+evt.time:''}<br>📍 ${evt.venue}<br>◆ ${evt.price} ETH</div>
        <div class="ticket-bar"><div class="ticket-fill" style="width:${pct}%"></div></div>
        <div class="ticket-info"><span>On-chain: ${sold}</span><span>Total: ${total}</span></div>
      </div></div>`;
  }).join('');
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function updateChart() {
  const ctx = document.getElementById('salesChart');
  if(!ctx) return;
  
  const labels = events.map(e => e.name);
  const data = events.map(e => {
    // Mock analytics logic because our legacy contract doesn't tie tickets to specific events.
    // We use a deterministic pseudo-random number based on the event name length to keep it consistent
    let pseudo = (e.name.length * 7) % 100 / 100; // 0 to 0.99
    return Math.floor((e.totalTickets || 100) * (pseudo * 0.5 + 0.1)); 
  });

  if(salesChart) {
    salesChart.data.labels = labels;
    salesChart.data.datasets[0].data = data;
    salesChart.update();
  } else {
    salesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Est. Tickets Sold',
          data: data,
          backgroundColor: 'rgba(212, 168, 67, 0.6)',
          borderColor: 'rgba(212, 168, 67, 1)',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#888899', font: {family: "'Space Mono', monospace"} } }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, border: {display: false}, ticks: { color: '#888899', font: {family: "'Space Mono', monospace"} } },
          x: { grid: { display: false }, border: {display: false}, ticks: { color: '#888899', font: {family: "'DM Sans', sans-serif"} } }
        }
      }
    });
  }
}

// ══════════════════════════════════════════
//  USER — EVENTS
// ══════════════════════════════════════════
function setFilter(cat, btn) {
  currentFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderUserEvents();
}

function renderUserEvents() {
  const grid = document.getElementById('userEventsGrid');
  const searchPhrase = (document.getElementById('searchInput')?.value || '').toLowerCase();
  
  let filtered = currentFilter==='All' ? events : events.filter(e=>e.category===currentFilter);
  if (searchPhrase) {
    filtered = filtered.filter(e => e.name.toLowerCase().includes(searchPhrase) || e.venue.toLowerCase().includes(searchPhrase));
  }

  if (!filtered.length) { 
    grid.innerHTML=`<div class="empty-state"><i data-lucide="calendar-x" class="es-icon" style="margin: 0 auto 14px; width:44px; height:44px"></i><p>No events found matching your criteria.</p></div>`; 
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return; 
  }
  
  grid.innerHTML = filtered.map(evt => {
    const owned = myOnChainTickets.some(t=>t.eventId===evt.id);
    const iconName = ICONS[evt.category] || 'sparkles';
    const imgSrc = evt.image || DEFAULT_EVENT_IMAGE;
    const img = `<img class="user-event-img" src="${imgSrc}" alt="${evt.name}" onerror="this.onerror=null;this.src='${DEFAULT_EVENT_IMAGE}'">`; 
    return `<div class="user-event-card">
      <div class="price-tag">◆ ${evt.price} ETH</div>
      ${img}
      <div class="user-event-body">
        <div class="event-category"><i data-lucide="${iconName}" style="width:10px;height:10px"></i>${evt.category}</div>
        <div style="font-family:Bebas Neue,sans-serif;font-size:24px;letter-spacing:.03em;margin-bottom:5px">${evt.name}</div>
        <div class="event-meta">📅 ${fmtDate(evt.date)} ${evt.time?'· '+evt.time:''} &nbsp;·&nbsp; 📍 ${evt.venue}</div>
        <div style="font-size:13px;color:var(--text-dim);margin:8px 0 10px;line-height:1.6">${evt.desc||''}</div>
        <button class="btn-book" ${owned?'disabled':''} onclick="openBooking('${evt.id}')">
          ${owned ? '<i data-lucide="check-circle" style="width:16px;height:16px"></i> Ticket Owned' : '<i data-lucide="link-2" style="width:16px;height:16px"></i> Buy via MetaMask'}
        </button>
      </div></div>`;
  }).join('');
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ══════════════════════════════════════════
//  BOOKING — REAL BLOCKCHAIN TX
// ══════════════════════════════════════════
function openBooking(eventId) {
  const evt = events.find(e=>e.id===eventId);
  if (!evt) return;
  const imgSrc = evt.image || DEFAULT_EVENT_IMAGE;
  const img = `<img src="${imgSrc}" style="width:100%;height:145px;object-fit:cover;border-radius:8px;margin-bottom:16px" onerror="this.onerror=null;this.src='${DEFAULT_EVENT_IMAGE}'">`;
  document.getElementById('modalContent').innerHTML = `
    ${img}
    <div style="font-family:Space Mono,monospace;font-size:9px;letter-spacing:.3em;color:var(--gold);margin-bottom:4px">${evt.category.toUpperCase()}</div>
    <div style="font-family:Bebas Neue,sans-serif;font-size:28px;margin-bottom:10px">${evt.name}</div>
    <div style="font-size:13px;color:var(--text-dim);margin-bottom:18px;line-height:1.7">
      📅 ${fmtDate(evt.date)} ${evt.time?'· '+evt.time:''}<br>📍 ${evt.venue}
    </div>
    <div class="chain-info" style="margin-bottom:16px">
      <div>Contract &nbsp;<span class="addr">${CONTRACT_ADDRESS}</span></div>
      <div>Network: <span class="hl">Sepolia Testnet</span> &nbsp;·&nbsp; Function: <span class="hl">buyTicket()</span></div>
    </div>
    <div style="background:var(--black);border-radius:10px;padding:14px 16px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:13px;color:var(--text-dim)">MetaMask will ask you to sign</span>
      <span style="font-family:Bebas Neue,sans-serif;font-size:22px;color:var(--gold)">◆ ${evt.price} ETH</span>
    </div>
    ${!walletConnected
      ? `<button class="btn-primary" onclick="connectWallet('user')"><i data-lucide="wallet" style="width:18px;height:18px"></i> Connect Wallet First</button>`
      : `<button class="btn-primary" id="confirmBtn" onclick="confirmBooking('${evt.id}')"><i data-lucide="pen-tool" style="width:18px;height:18px"></i> Sign & Buy</button>`}
  `;
  document.getElementById('bookingModal').classList.add('open');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function confirmBooking(eventId) {
  if (!contract) { toast('No Wallet','Connect MetaMask first.','error'); return; }
  const evt = events.find(e=>e.id===eventId);
  if (!evt) return;

  const btn = document.getElementById('confirmBtn');
  if (btn) { btn.disabled=true; btn.innerHTML=`<span class="tx-spinner"></span>Waiting for MetaMask…`; }

  try {
    toast('MetaMask Opening','Please confirm the transaction.','info');
    const tx = await contract.buyTicket(); // We send empty value here because legacy contract is non-payable or generic

    if (btn) btn.innerHTML = `<span class="tx-spinner"></span>Mining block…`;
    toast('TX Submitted', tx.hash.slice(0,22)+'…', 'info');

    const receipt = await tx.wait(); // confirmed on-chain

    // Read back the new ticket from contract
    const count    = await contract.ticketCount();
    const ticketId = count.toNumber();
    const onChain  = await contract.tickets(ticketId);

    const ticketObj = {
      ticketId, eventId: evt.id, eventName: evt.name,
      category: evt.category, date: evt.date, time: evt.time,
      venue: evt.venue, price: evt.price,
      used: onChain.used, owner: onChain.owner,
      txHash: tx.hash, blockNumber: receipt.blockNumber,
      qrData: JSON.stringify({
        ticketId, event: evt.name, owner: onChain.owner,
        contract: CONTRACT_ADDRESS, network:'Sepolia', txHash: tx.hash
      })
    };

    myOnChainTickets.push(ticketObj);
    renderUserEvents(); renderMyTickets();
    closeModal();
    setTimeout(() => showTicketModal(ticketObj), 200);
    toast('Ticket Minted! 🎉', `On-chain #${ticketId} · Block ${receipt.blockNumber}`, 'success');

  } catch(e) {
    console.error(e);
    const msg = e.code===4001 ? 'Rejected in MetaMask.' : (e.reason||e.message?.slice(0,80)||'Transaction failed.');
    toast('Transaction Failed', msg, 'error');
    if (btn) { btn.disabled=false; btn.innerHTML='<i data-lucide="pen-tool" style="width:18px;height:18px"></i> Sign & Buy'; if (typeof lucide !== 'undefined') lucide.createIcons(); }
  }
}

// ══════════════════════════════════════════
//  SYNC MY TICKETS FROM CHAIN
// ══════════════════════════════════════════
async function loadMyOnChainTickets() {
  if (!contract || !userAddress) { toast('No Wallet','Connect MetaMask first.','error'); return; }
  const listEl = document.getElementById('myTicketsList');
  listEl.innerHTML = `<div class="empty-state"><span class="tx-spinner" style="width:28px;height:28px;border-width:3px"></span><p style="margin-top:14px">Scanning Sepolia blockchain…</p></div>`;
  try {
    const total = (await contract.ticketCount()).toNumber();
    myOnChainTickets = [];
    for (let i = 1; i <= total; i++) {
      const t = await contract.tickets(i);
      if (t.owner.toLowerCase() === userAddress.toLowerCase()) {
        const matchEvt = events[myOnChainTickets.length] || null;
        myOnChainTickets.push({
          ticketId: i, eventId: matchEvt?.id||null,
          eventName: matchEvt?.name || `Event Ticket #${i}`,
          category: matchEvt?.category||'Other', date: matchEvt?.date||'',
          time: matchEvt?.time||'', venue: matchEvt?.venue||'See contract',
          price: matchEvt?.price||'—', used: t.used, owner: t.owner,
          txHash: '', blockNumber: null,
          qrData: JSON.stringify({ ticketId:i, owner:t.owner, contract:CONTRACT_ADDRESS, network:'Sepolia', used:t.used })
        });
      }
    }
    renderMyTickets(); renderUserEvents();
    const c = myOnChainTickets.length;
    toast(c ? 'Synced!' : 'No Tickets', c ? `Found ${c} ticket(s) on-chain.` : "You don't own any tickets yet.", c?'success':'info');
  } catch(e) {
    console.error(e);
    toast('Sync Failed', e.message?.slice(0,60), 'error');
    listEl.innerHTML = `<div class="empty-state"><i data-lucide="alert-triangle" class="es-icon" style="margin: 0 auto 14px"></i><p>Could not read from chain.</p></div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

// ══════════════════════════════════════════
//  MARK USED (on-chain)
// ══════════════════════════════════════════
async function markTicketUsed(ticketId) {
  if (!contract) { toast('No Wallet','Connect first.','error'); return; }
  try {
    toast('MetaMask Opening','Confirm markUsed transaction.','info');
    const tx = await contract.markUsed(ticketId);
    await tx.wait();
    toast('Marked Used!', `Ticket #${ticketId} updated on-chain.`, 'success');
    await loadMyOnChainTickets();
  } catch(e) {
    toast('Failed', e.reason||e.message?.slice(0,60), 'error');
  }
}

// UI Mock Transfer (Legacy ABI doesn't support safeTransferFrom easily without standard ERC721)
function promptTransfer(ticketId) {
  const addr = prompt("Enter the Ethereum address to transfer Ticket #" + ticketId + " to:\n(Note: Current contract ABI does not support standard transfers, this is a mock representation)");
  if (addr) {
      toast('Transfer Requested', 'Smart Contract upgrade needed for this feature.', 'info');
  }
}

// ══════════════════════════════════════════
//  RENDER MY TICKETS
// ══════════════════════════════════════════
function renderMyTickets() {
  const list = document.getElementById('myTicketsList');
  const c = myOnChainTickets.length;
  document.getElementById('myTicketCount').textContent = c + ' ticket' + (c!==1?'s':'');
  if (!c) { 
    list.innerHTML=`<div class="empty-state"><i data-lucide="ticket" class="es-icon" style="margin:0 auto 14px; width:44px; height:44px;"></i><p>No tickets found. Connect wallet and sync.</p></div>`; 
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return; 
  }
  list.innerHTML = myOnChainTickets.map(t=>buildTicketHTML(t, 'list')).join('');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function buildTicketHTML(t, ctx = 'list') {
  const etherscanTx = t.txHash ? `https://sepolia.etherscan.io/tx/${t.txHash}` : `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`;
  const qrData = encodeURIComponent(t.qrData || JSON.stringify({ ticketId:t.ticketId, network:'Sepolia', used:t.used }));
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrData}`;
  return `
  <div class="ticket-card" style="background:#11111e">
    <div class="ticket-stub">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
        <div style="flex:1;min-width:0">
          <div style="font-family:Space Mono,monospace;font-size:9px;letter-spacing:.3em;color:var(--gold);margin-bottom:4px">${t.category.toUpperCase()} · SEPOLIA</div>
          <div class="ticket-event-name">${t.eventName}</div>
          <div class="ticket-event-meta">${t.date?'📅 '+fmtDate(t.date):''} ${t.venue&&t.venue!=='See contract'?'· 📍 '+t.venue:''}</div>
        </div>
        <span class="badge-status ${t.used?'used':'valid'}">${t.used?'Used':'Valid'}</span>
      </div>
    </div>
    <div class="ticket-bottom">
      <div class="ticket-qr"><img src="${qrUrl}" alt="Ticket QR Code" style="width:100%;height:100%;border-radius:6px;"></div>
      <div class="ticket-details">
        <div class="ticket-id">Ticket #${t.ticketId}</div>
        <div class="ticket-detail-row">Owner: ${shortAddr(t.owner||userAddress||'')}</div>
        <div class="ticket-detail-row">Contract: ${shortAddr(CONTRACT_ADDRESS)}</div>
        ${t.blockNumber ? `<div class="ticket-detail-row">Block: ${t.blockNumber}</div>` : ''}
        <div class="ticket-actions" style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
          <a href="${etherscanTx}" target="_blank" class="icon-btn" style="color:var(--teal);border-color:rgba(46,207,179,.3);text-decoration:none">
            <i data-lucide="external-link" style="width:10px;height:10px"></i> Etherscan
          </a>
          <button onclick="promptTransfer(${t.ticketId})" class="icon-btn">
             <i data-lucide="send" style="width:10px;height:10px"></i> Transfer
          </button>
          <button onclick="downloadTicket(this, ${t.ticketId})" class="icon-btn" style="color:var(--white); border-color:var(--text-dim)">
             <i data-lucide="download" style="width:10px;height:10px"></i> Download
          </button>
          ${!t.used?`<button onclick="markTicketUsed(${t.ticketId})" class="icon-btn" style="background:rgba(212,168,67,0.1); border-color:var(--gold); color:var(--gold)"><i data-lucide="check-square" style="width:10px;height:10px;"></i> Mark Used</button>`:''}
        </div>
      </div>
    </div>
  </div>`;
}

// ══════════════════════════════════════════
//  DOWNLOAD TICKET
// ══════════════════════════════════════════
async function downloadTicket(btnElem, ticketId) {
  try {
    const ticketCard = btnElem.closest('.ticket-card');
    const actions = ticketCard.querySelector('.ticket-actions');
    
    // Hide actions temporarily for the screenshot
    if(actions) actions.style.display = 'none';
    
    const canvas = await html2canvas(ticketCard, {
      scale: 2,
      backgroundColor: '#11111e',
      allowTaint: true,
      useCORS: true
    });
    
    // Restore actions
    if(actions) actions.style.display = 'flex';
    
    const link = document.createElement('a');
    link.download = `chainpass-ticket-${ticketId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    toast('Downloaded', 'Ticket saved successfully as image.', 'success');
  } catch(e) {
    console.error(e);
    toast('Download Failed', 'Could not generate ticket image', 'error');
  }
}

// ══════════════════════════════════════════
//  TICKET CONFIRMATION MODAL
// ══════════════════════════════════════════
function showTicketModal(t) {
  document.getElementById('modalContent').innerHTML = `
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-family:Bebas Neue,sans-serif;font-size:28px;color:var(--teal);display:flex;align-items:center;justify-content:center;gap:10px">
        <i data-lucide="party-popper" style="width:28px;height:28px;"></i> Ticket Minted!
      </div>
      <div style="font-size:13px;color:var(--text-dim);margin-top:4px">Transaction confirmed on Sepolia</div>
    </div>
    ${buildTicketHTML(t, 'modal')}
    <div class="chain-info" style="margin-top:14px">
      <div>TX Hash</div>
      <div><a href="https://sepolia.etherscan.io/tx/${t.txHash}" target="_blank" class="tx-link">${t.txHash||'—'}</a></div>
      ${t.blockNumber?`<div style="margin-top:4px">Block confirmed: <span class="hl">${t.blockNumber}</span></div>`:''}
    </div>
  `;
  document.getElementById('bookingModal').classList.add('open');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ══════════════════════════════════════════
//  UTILS
// ══════════════════════════════════════════
function closeModal() { document.getElementById('bookingModal').classList.remove('open'); }
function shortAddr(a) { return (!a||a.length<10) ? a : a.slice(0,6)+'…'+a.slice(-4); }
function fmtDate(d) {
  if (!d) return '';
  return new Date(d+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
}                           
function toast(title, sub, type='info') {
  const colors={success:'var(--teal)',error:'var(--red)',info:'var(--gold)'};
  const iconNames={success:'check-circle',error:'x-circle',info:'info'};
  const el=document.createElement('div');
  el.className=`toast ${type}`;
  el.innerHTML=`<div class="toast-icon" style="color:${colors[type]}"><i data-lucide="${iconNames[type]}" style="width:20px;height:20px"></i></div><div class="toast-body"><div class="toast-title">${title}</div>${sub?`<div class="toast-sub">${sub}</div>`:''}</div>`;
  document.getElementById('toastContainer').appendChild(el);
  if (typeof lucide !== 'undefined') lucide.createIcons();
  setTimeout(()=>el.remove(), 5500);
}
// ══════════════════════════════════════════
//  QR SCANNER (ORGANIZER)
// ══════════════════════════════════════════
let html5QrcodeScanner = null;

function openScanner() {
  if (!contract) { toast('No Wallet','Please connect MetaMask as Organizer first.','error'); return; }
  document.getElementById('scannerModal').classList.add('open');
  document.getElementById('scanResult').style.display = 'none';
  
  if (!html5QrcodeScanner) {
    html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width: 250, height: 250} }, /* verbose= */ false);
  }
  
  html5QrcodeScanner.render(onScanSuccess, onScanFailure);
}

function closeScannerModal() {
  document.getElementById('scannerModal').classList.remove('open');
  if (html5QrcodeScanner) {
    html5QrcodeScanner.clear().catch(error => {
      console.error("Failed to clear html5QrcodeScanner. ", error);
    });
    html5QrcodeScanner = null;
  }
}

async function onScanSuccess(decodedText, decodedResult) {
  // Pause scanning while processing
  if (html5QrcodeScanner) {
    html5QrcodeScanner.pause(true);
  }
  
  const resDiv = document.getElementById('scanResult');
  resDiv.style.display = 'block';
  resDiv.innerHTML = `<div style="padding:20px;background:var(--surface2);border-radius:12px;border:1px solid var(--border)"><span class="tx-spinner"></span> Checking blockchain...</div>`;

  try {
    let data;
    try {
      data = JSON.parse(decodedText);
    } catch (jsonErr) {
      data = { ticketId: decodedText.trim() };
    }
    const tId = data.ticketId;
    if (!tId) throw new Error("Invalid QR data");
    
    // Read from contract
    const t = await contract.tickets(tId);
    
    if (t.owner === "0x0000000000000000000000000000000000000000") {
      resDiv.innerHTML = `<div style="padding:20px;background:var(--surface2);border-radius:12px;border:1px solid var(--red)"><div style="color:var(--red);font-size:18px;margin-bottom:8px"><i data-lucide="x-circle" style="width:24px;height:24px;vertical-align:middle;margin-right:6px"></i> Ticket #${tId} Not Found</div><p style="font-size:13px;color:var(--text-dim);margin-bottom:14px">This ticket does not exist on-chain.</p><button class="btn-primary" style="width:auto;padding:8px 16px;font-size:14px" onclick="resumeScanner()">Scan Another</button></div>`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }
    
    if (t.used) {
      resDiv.innerHTML = `<div style="padding:20px;background:rgba(224,62,62,.08);border-radius:12px;border:1px solid var(--red)"><div style="color:var(--red);font-size:18px;margin-bottom:8px"><i data-lucide="x-octagon" style="width:24px;height:24px;vertical-align:middle;margin-right:6px"></i> Ticket #${tId} Already Used!</div><div style="font-size:13px;color:var(--text-dim);margin-bottom:14px;font-family:'Space Mono',monospace">Owner: ${shortAddr(t.owner)}</div><button class="btn-primary" style="width:auto;padding:8px 16px;font-size:14px" onclick="resumeScanner()">Scan Another</button></div>`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    } else {
      resDiv.innerHTML = `
        <div style="padding:20px;background:rgba(46,207,179,.08);border-radius:12px;border:1px solid var(--teal)">
          <div style="color:var(--teal);font-size:22px;margin-bottom:8px;font-family:'Bebas Neue',sans-serif"><i data-lucide="check-circle" style="width:24px;height:24px;vertical-align:middle;margin-right:6px"></i> Valid Ticket #${tId}</div>
          <div style="font-size:12px;color:var(--text-dim);margin-bottom:16px;font-family:'Space Mono',monospace">Owner: ${shortAddr(t.owner)}</div>
          <div style="display:flex;gap:10px;justify-content:center">
            <button class="btn-primary" id="admitBtn-${tId}" onclick="admitScannedTicket(${tId})" style="width:auto;padding:10px 20px;font-size:16px;margin-top:0"><i data-lucide="user-check" style="width:16px;height:16px"></i> Admit & Mark Used</button>
            <button class="btn-back" onclick="resumeScanner()">Cancel</button>
          </div>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  } catch(e) {
    console.error(e);
    resDiv.innerHTML = `<div style="padding:20px;background:var(--surface2);border-radius:12px;border:1px solid var(--red)"><div style="color:var(--red);font-size:16px;margin-bottom:14px">Invalid QR Code Format</div><button class="btn-primary" style="width:auto;padding:8px 16px;font-size:14px" onclick="resumeScanner()">Scan Another</button></div>`;
  }
}

function onScanFailure(error) {
  // Ignore continuous background scan failures
}

function resumeScanner() {
  document.getElementById('scanResult').style.display = 'none';
  if (html5QrcodeScanner) {
    html5QrcodeScanner.resume();
  }
}

async function admitScannedTicket(ticketId) {
  try {
    const btn = document.getElementById('admitBtn-'+ticketId);
    if(btn) { btn.disabled = true; btn.innerHTML = `<span class="tx-spinner"></span> Confirming`; }
    toast('MetaMask Opening', 'Confirm markUsed transaction.', 'info');
    
    const tx = await contract.markUsed(ticketId);
    if(btn) btn.innerHTML = `<span class="tx-spinner"></span> Mining block...`;
    
    await tx.wait();
    
    toast('Admitted!', `Ticket #${ticketId} marked used.`, 'success');
    document.getElementById('scanResult').innerHTML = `<div style="padding:20px;background:rgba(46,207,179,.08);border-radius:12px;border:1px solid var(--teal)"><div style="color:var(--teal);font-size:18px;margin-bottom:14px"><i data-lucide="check-circle" style="width:24px;height:24px;vertical-align:middle;margin-right:6px"></i> Success! Attendee Admitted.</div><button class="btn-primary" style="width:auto;padding:8px 16px;font-size:14px" onclick="resumeScanner()">Scan Next</button></div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    refreshOrgChain();
  } catch(e) {
    const msg = e.reason || e.message?.slice(0, 60);
    toast('Failed', msg, 'error');
    if(btn) { btn.disabled = false; btn.innerHTML = `<i data-lucide="user-check" style="width:16px;height:16px"></i> Admit & Mark Used`; if (typeof lucide !== 'undefined') lucide.createIcons(); }
  }
}

// Ensure modals close when clicking outside
document.addEventListener('DOMContentLoaded', () => {
  const bookingModal = document.getElementById('bookingModal');
  const scannerModal = document.getElementById('scannerModal');
  if (bookingModal) bookingModal.addEventListener('click', function(e) { if (e.target === this) closeModal(); });
  if (scannerModal) scannerModal.addEventListener('click', function(e) { if (e.target === this) closeScannerModal(); });
});

