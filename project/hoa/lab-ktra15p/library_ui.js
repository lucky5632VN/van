/* ============================================================
   library_ui.js — Giao diện Thư Viện QuantumLab v2.0
   ============================================================ */

// ——— SVG ICON ASSETS ———
// ——— SVG ICON ASSETS ———
const LIB_ICONS = {
  beaker: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 3h15"/><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/><path d="M6 14h12"/></svg>',
  atom: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 21c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9z"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/></svg>',
  wind: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>',
  droplet: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5L12 2 8 9.5c-2 1.6-3 3.5-3 5.5a7 7 0 0 0 7 7z"/></svg>',
  dna: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m8 3 4 8 5-5"/><path d="m4 14 8-4 8 8"/><path d="m6 21 5-9 7 8"/></svg>',
  flame: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
  tag: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 10 3 3"/><path d="M2.5 13 13 2.5c.34-.33.82-.5 1.3-.5h6.2c1.1 0 2 .9 2 2v6.2c0 .48-.17.96-.5 1.3L11 22c-.66.67-1.74.67-2.4 0L2.5 15.4c-.66-.66-.66-1.74 0-2.4Z"/></svg>',
  shield: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  activity: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  palette: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20.94c1.88 0 3.05-1.4 3.05-3.05 0-.53-.23-1.03-.63-1.37a4.5 4.5 0 1 1-3.33-7.58c.5 0 .9.4.9.9v1.2c0 .44.36.8.8.8h1.2c.5 0 .9.4.9.9s-.4.9-.9.9h-1.2a.8.8 0 0 1-.8-.8V9.9c0-.5-.4-.9-.9-.9a4.5 4.5 0 1 0 3.33 7.58c.4.34.63.84.63 1.37 0 1.65-1.17 3.05-3.05 3.05a9 9 0 1 1 0-18c5 0 9 4 9 9s-4 9-9 9Z"/></svg>',
  biohazard: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="11.9" r="2"/><path d="M6.7 8.3c-1.1 0-2.1.4-2.9 1.2a4 4 0 0 0-.1 5.7c.3.4.6.7 1 1"/><path d="M17.3 8.3c1.1 0 2.1.4 2.9 1.2a4 4 0 0 1 .1 5.7c-.3.4-.6.7-1 1"/><path d="M12 15.6c0 1.1-.4 2.1-1.2 2.9a4 4 0 0 1-5.7.1c-.4-.3-.7-.6-1-1"/><path d="M12 15.6c0 1.1.4 2.1 1.2 2.9a4 4 0 0 0 5.7.1c.4-.3.7-.6 1-1"/><path d="M9.1 5.2c.3-.4.6-.7 1-1a4 4 0 0 1 5.7.1c.8.8 1.2 1.8 1.2 2.9"/><path d="M14.9 5.2c-.3-.4-.6-.7-1-1a4 4 0 0 0-5.7.1c-.8.8-1.2 1.8-1.2 2.9"/></svg>',
  scale: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 16 20 22"/><path d="M8 16 4 22"/><path d="M12 3v3"/><path d="M12 10v3"/><path d="M12 17v3"/><path d="M3 10h18"/><path d="M3 7h18"/></svg>',
  tool: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m14.7 6.3-2.8 2.8c-1.1 1.1-2.4 1.2-3.5 1.2M12 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M20 4v8"/><path d="M4 20h8"/></svg>',
  zap: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  cube: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  layers: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.1 6.27a2 2 0 0 0 0 3.66l9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09a2 2 0 0 0 0-3.66Z"/><path d="m2.1 12.07 9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09"/><path d="m2.1 17.07 9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09"/></svg>',
  lightning: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 2v10h10v10h-6"/></svg>',
  
  // ——— LAB EQUIPMENT & SAFETY ASSETS ———
  beaker: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 3h15"/><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/><path d="M6 14h12"/></svg>',
  flask: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 2h6"/><path d="M12 2v6"/><path d="m14 8 3.4 10.3c.3.9-.3 1.7-1.2 1.7H7.8c-.9 0-1.5-.8-1.2-1.7L10 8"/><path d="M7 16h10"/></svg>',
  buret: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="10" y="2" width="4" height="18" rx="1"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M8 18h8"/><path d="M12 20v2"/></svg>',
  pipet: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 22 1-1"/><path d="M9 3v8"/><path d="m11.5 13.5 8-8"/><path d="M15 9V3"/><path d="m18 10 3-3"/><path d="m7 17-4 4"/></svg>',
  test_tube: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2h8"/><path d="M10 2v17.5c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5V2"/></svg>',
  condenser: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2v20"/><path d="M14 2v20"/><path d="M10 6h8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-8"/><path d="M14 14h-8a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h8"/></svg>',
  cylinder: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2h4"/><path d="M10 2v18"/><path d="M14 2v18"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M6 20h12v2H6z"/></svg>',
  burner: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 10c-2 0-4 2-4 4s1.8 4 4 4 4-2 4-4-2-4-4-4z"/><path d="M12 10V2"/><path d="M8 18h8"/><path d="M6 22h12"/></svg>',
  mortar: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10a8 8 0 0 0 16 0V4H4v6z"/><path d="M14 4v6"/><path d="M10 4v6"/></svg>',
  goggles: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 13h4a3 3 0 1 0 6 0h4a3 3 0 1 0 6 0h4"/><path d="M3 13V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/></svg>',
  gloves: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V5a2 2 0 0 0-4 0v5"/><path d="M10 10V6a2 2 0 0 0-4 0v8"/><path d="M6 14v2a6 6 0 0 0 12 0v-5"/></svg>',
  hood: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h18v18H3z"/><path d="M3 14h18"/><path d="M12 3v11"/></svg>',
};

const LIB_CATEGORIES = [
  {
    label: 'Cơ bản',
    tabs: [
      { id: 'safety', label: 'An Toàn', icon: LIB_ICONS.shield },
      { id: 'atomic_mass', label: 'Nguyên Tử Khối', icon: LIB_ICONS.atom },
      { id: 'measurement', label: 'Đo Lường', icon: LIB_ICONS.scale },
      { id: 'reactivity', label: 'Dãy Hoạt Động', icon: LIB_ICONS.lightning },
      { id: 'equipment', label: 'Dụng Cụ', icon: LIB_ICONS.tool },
      { id: 'nomenclature', label: 'Danh Pháp', icon: LIB_ICONS.tag },
    ]
  },
  {
    label: 'Định tính & pH',
    tabs: [
      { id: 'ph_indicators', label: 'Chỉ Thị pH', icon: LIB_ICONS.activity },
      { id: 'amphoteric', label: 'Lưỡng Tính', icon: LIB_ICONS.beaker },
      { id: 'cation', label: 'Cation', icon: LIB_ICONS.atom },
      { id: 'anion', label: 'Anion', icon: LIB_ICONS.atom },
      { id: 'solubility', label: 'Quy Tắc Tan', icon: LIB_ICONS.droplet },
      { id: 'sol_matrix', label: 'Bảng Tính Tan', icon: LIB_ICONS.layers },
    ]
  },
  {
    label: 'Nâng cao',
    tabs: [
      { id: 'conc_acids', label: 'Axit Đặc', icon: LIB_ICONS.zap },
      { id: 'organic', label: 'Hữu Cơ', icon: LIB_ICONS.dna },
      { id: 'thermal', label: 'Nhiệt Phân', icon: LIB_ICONS.flame },
    ]
  },
  {
    label: 'Hiện tượng & Màu sắc',
    tabs: [
      { id: 'phen_precipitate', label: 'Kết Tủa', icon: LIB_ICONS.cube },
      { id: 'phen_ion', label: 'Màu Ion', icon: LIB_ICONS.palette },
      { id: 'phen_flame', label: 'Ngọn Lửa', icon: LIB_ICONS.flame },
      { id: 'phen_gas', label: 'Nhận Biết Khí', icon: LIB_ICONS.wind },
      { id: 'phen_organic', label: 'Nhận Biết Hữu Cơ', icon: LIB_ICONS.biohazard },
    ]
  }
];

let currentLibTab = 'safety';

// ——— INITIALIZATION ———
function initLibrary() {
  const headerRight = document.querySelector('.header-right');
  const libBtn = document.createElement('button');
  libBtn.className = 'btn-guide';
  libBtn.id = 'libBtn';
  libBtn.style.background = 'rgba(56,189,248,0.1)';
  libBtn.style.borderColor = 'rgba(56,189,248,0.3)';
  libBtn.innerHTML = `
    <div style="display:flex; align-items:center; gap: 6px;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
      Thư Viện
    </div>
  `;
  libBtn.onclick = openLibrary;
  if (headerRight) {
      headerRight.insertBefore(libBtn, headerRight.firstChild);
  }

  const overlay = document.createElement('div');
  overlay.id = 'libraryOverlay';
  overlay.className = 'library-overlay';
  overlay.innerHTML = buildLibraryHTML();
  document.body.appendChild(overlay);

  // Pre-load current tab content immediately
  switchLibTab(currentLibTab);
}

function openLibrary() {
  playQuantumSound(800, 0.1, 'sine');
  document.getElementById('libraryOverlay').classList.add('open');
  // Auto-load first tab if empty
  if (document.getElementById('libContent').innerHTML === '') {
    switchLibTab(currentLibTab);
  }
}

function closeLibrary() {
  playQuantumSound(400, 0.1, 'sine');
  document.getElementById('libraryOverlay').classList.remove('open');
}

// ——— AUDIO ENGINE ———
let audioCtx = null;
function playQuantumSound(freq = 1000, duration = 0.05, type = 'sine') {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.02, audioCtx.currentTime); // Soft click
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

// ——— BUILD HTML SHELL ———
function buildLibraryHTML() {
  const bentoHTML = LIB_CATEGORIES.map(cat => `
    <div class="bento-category">
      <div class="bento-cat-tag">${cat.label}</div>
      <div class="bento-grid-mini">
        ${cat.tabs.map(t => `
          <div class="bento-item ${t.id === currentLibTab ? 'active' : ''}" 
               id="node-${t.id}"
               onclick="switchLibTab('${t.id}')">
            <div class="lib-nav-icon" style="color:var(--lib-accent); opacity:0.8">${t.icon}</div>
            <div class="bento-label">${t.label}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  return `
  <div class="lib-panel" onclick="event.stopPropagation()">
    <!-- 1. Header Control Center -->
    <div class="lib-header-strip">
      <nav class="lib-bento-nav">
        ${bentoHTML}
      </nav>
      
      <div class="lib-utility-bar">
        <div class="lib-search-box">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" id="libSearch" placeholder="TÌM KIẾM DỮ LIỆU..." oninput="filterLibrary()">
        </div>
        <button onclick="closeLibrary()" class="btn-exit-mono">THOÁT ✕</button>
      </div>
    </div>

    <!-- 2. Dynamic Content Frame -->
    <div class="lib-content-frame" id="libContentScroll">
      <div id="libResultCount" style="margin-bottom:15px; font-size: 10px; color: var(--lib-accent); font-weight: 800; opacity: 0.6; letter-spacing: 1px;"></div>
      <div id="libContent" class="tab-content-anim"></div>
    </div>
  </div>`;
}

// ——— LOGIC FUNCTIONS ———

function switchLibTab(tab) {
  if (currentLibTab === tab && document.getElementById('libContent').innerHTML !== '') return;
  
  // Subtle Click Sound
  playQuantumSound(1200, 0.03, 'sine');

  currentLibTab = tab;
  
  // Update Bento Highlight
  document.querySelectorAll('.bento-item').forEach(item => {
    item.classList.toggle('active', item.id === `node-${tab}`);
  });

  const content = document.getElementById('libContent');
  const scrollFrame = document.getElementById('libContentScroll');
  const searchInput = document.getElementById('libSearch');
  if (searchInput) searchInput.value = ''; 

  // Reset Animation
  content.classList.remove('tab-content-anim');
  void content.offsetWidth; // Trigger reflow
  content.classList.add('tab-content-anim');

  let html = '';
  switch (tab) {
    case 'safety': html = renderSafety(); break;
    case 'equipment': html = renderEquipment(); break;
    case 'ph_indicators': html = renderPHIndicators(); break;
    case 'cation': html = renderCationTable(); break;
    case 'anion': html = renderAnionTable(); break;
    case 'solubility': html = renderSolubility(); break;
    case 'conc_acids': html = renderConcAcids(); break;
    case 'organic': html = renderOrganic(); break;
    case 'thermal': html = renderThermal(); break;
    case 'nomenclature': html = renderNomenclature(); break;
    case 'measurement': html = renderMeasurement(); break;
    case 'atomic_mass': html = renderAtomicMass(); break;
    case 'amphoteric': html = renderAmphoteric(); break;
    case 'reactivity': html = renderReactivity(); break;
    case 'sol_matrix': html = renderSolMatrix(); break;
    case 'phen_precipitate': html = renderPhenPrecipitate(); break;
    case 'phen_ion': html = renderPhenIon(); break;
    case 'phen_flame': html = renderPhenFlame(); break;
    case 'phen_gas': html = renderPhenGas(); break;
    case 'phen_organic': html = renderPhenOrganic(); break;
  }
  content.innerHTML = html;
  
  if (scrollFrame) scrollFrame.scrollTop = 0;
  filterLibrary();
}

function closeHologram() {
  // Not used in Monolith mode, keeping for compatibility if needed
}

function filterLibrary() {
    const q = (document.getElementById('libSearch')?.value || '').toLowerCase();
    const items = document.querySelectorAll('.analytic-profile, .spec-plate, .rule-tag, .path-step, .quantum-card');
    let visibleCount = 0;

    items.forEach(el => {
        const text = el.innerText.toLowerCase();
        const matches = !q || text.includes(q);
        el.style.display = matches ? '' : 'none';
        if (matches) visibleCount++;
    });

    const countEl = document.getElementById('libResultCount');
    if (countEl) countEl.innerText = q ? `Tìm thấy: ${visibleCount} kết quả` : '';
}

// ——— UTILS ———
function formatFormula(str) {
  if (!str) return '';
  return str.replace(/([A-Z][a-z]?|[\)])(\d+)/g, (match, p1, p2) => {
    return p1 + `<sub>${p2}</sub>`;
  });
}

// ——— RENDERS ———

function renderMeasurement() {
  return `
    <div class="lib-section-title">
      <div style="display:flex; align-items:center; gap:12px">
        <span style="color:#38bdf8">${LIB_ICONS.scale}</span>
        Thông số Thiết bị & Phép đo
      </div>
    </div>
    <div class="lib-section-desc">Trong QuantumLab, mọi phép đo đều được hiệu chuẩn với độ chính xác cao. Dưới đây là bảng thông số thiết bị tiêu chuẩn.</div>
    
    <div style="margin-top:20px; display:grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap:15px">
      ${MEASUREMENT_INSTRUMENTS.map(m => `
        <div class="spec-plate" style="padding:20px">
          <div class="spec-info">
            <div style="font-size:10px; color:var(--lib-accent); font-weight:800; margin-bottom:4px; font-family:'Orbitron', sans-serif">DỤNG CỤ ĐO</div>
            <div class="spec-name" style="font-size:16px; margin-bottom:8px">${m.name}</div>
            <div class="spec-desc" style="font-size:11px; opacity:0.7">${m.use}</div>
          </div>
          <div style="text-align:right">
             <div style="font-size:9px; color:#fb7185; font-weight:800; margin-bottom:4px">SAI SỐ (±)</div>
             <div class="spec-value" style="font-size:20px; color:#fff; font-family:'Orbitron', sans-serif">${m.uncertainty}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderAtomicMass() {
  const elements = [
    { s: 'H', n: 'Hiđro', m: 1 }, { s: 'He', n: 'Heli', m: 4 }, { s: 'Li', n: 'Liti', m: 7 },
    { s: 'Be', n: 'Beri', m: 9 }, { s: 'B', n: 'Bo', m: 11 }, { s: 'C', n: 'Cacbon', m: 12 },
    { s: 'N', n: 'Nitơ', m: 14 }, { s: 'O', n: 'Oxi', m: 16 }, { s: 'F', n: 'Flo', m: 19 },
    { s: 'Ne', n: 'Neon', m: 20 }, { s: 'Na', n: 'Natri', m: 23 }, { s: 'Mg', n: 'Magie', m: 24 },
    { s: 'Al', n: 'Nhôm', m: 27 }, { s: 'Si', n: 'Silic', m: 28 }, { s: 'P', n: 'Photpho', m: 31 },
    { s: 'S', n: 'Lưu huỳnh', m: 32 }, { s: 'Cl', n: 'Clo', m: 35.5 }, { s: 'Ar', n: 'Argon', m: 40 },
    { s: 'K', n: 'Kali', m: 39 }, { s: 'Ca', n: 'Canxi', m: 40 }, { s: 'Mn', n: 'Mangan', m: 55 },
    { s: 'Fe', n: 'Sắt', m: 56 }, { s: 'Cu', n: 'Đồng', m: 64 }, { s: 'Zn', n: 'Kẽm', m: 65 },
    { s: 'Br', n: 'Brom', m: 80 }, { s: 'Ag', n: 'Bạc', m: 108 }, { s: 'Ba', n: 'Bari', m: 137 },
    { s: 'Pb', n: 'Chì', m: 207 }, { s: 'Hg', n: 'Thủy ngân', m: 201 }, { s: 'Au', n: 'Vàng', m: 197 }
  ];

  return `
    <div class="lib-section-title">
      <div style="display:flex; align-items:center; gap:12px">
        <span style="color:var(--lib-accent)">${LIB_ICONS.atom}</span>
        Bảng tra cứu Nguyên tử khối
      </div>
    </div>
    <div class="lib-section-desc">Giá trị nguyên tử khối xấp xỉ dùng trong các bài tập tính toán hóa học phổ thông.</div>
    
    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap:10px; margin-top:25px">
      ${elements.map(e => `
        <div class="rule-tag" style="padding:15px; display:flex; flex-direction:column; align-items:center; gap:5px; border-bottom:3px solid var(--lib-glow)">
           <div style="font-family:'Orbitron', sans-serif; font-size:22px; font-weight:800; color:#fff">${e.s}</div>
           <div style="font-size:10px; opacity:0.7; font-weight:700">${e.n.toUpperCase()}</div>
           <div style="font-size:18px; color:var(--lib-accent); font-weight:800">${e.m}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderReactivity() {
  return `
    <div class="lib-section-title">
      <div style="display:flex; align-items:center; gap:12px">
        <span style="color:#fbbf24">${LIB_ICONS.lightning}</span>
        Dãy Hoạt động Hóa học của Kim loại
      </div>
    </div>
    <div class="lib-section-desc">Thứ tự giảm dần khả năng tham gia phản ứng hóa học của các kim loại phổ biến. Mnemonic: "Khi Ba Cần Nàng May Áo Mặc Giáp Sắt Nhớ Sang Phố Hỏi Cửa Hàng Á Phi Âu".</div>
    
    <div class="reactivity-hud" style="margin-top:40px; padding:20px 0; overflow-x:auto">
       <div style="display:flex; align-items:center; min-width:1200px; padding-bottom:40px; position:relative">
          <div style="position:absolute; top:25px; left:0; right:0; height:2px; background:linear-gradient(90deg, #ef4444, #fbbf24, #38bdf8); z-index:0; opacity:0.3"></div>
          
          ${METAL_REACTIVITY.map((m, idx) => `
            <div style="flex:1; display:flex; flex-direction:column; align-items:center; position:relative; z-index:1; ${m.isDivider ? 'opacity:0.6' : ''}">
               <div style="width:12px; height:12px; border-radius:50%; background:${m.isDivider ? '#94a3b8' : (idx < 5 ? '#ef4444' : (idx < 13 ? '#fbbf24' : '#38bdf8'))}; margin-bottom:15px; box-shadow:0 0 10px currentColor"></div>
               <div style="font-family:'Orbitron', sans-serif; font-weight:800; font-size:18px; color:#fff">${m.symbol}</div>
               <div style="font-size:11px; margin-top:4px; font-weight:700; color:var(--lib-accent)">${m.name}</div>
               <div style="font-size:9px; text-align:center; padding:0 5px; margin-top:8px; opacity:0.6; line-height:1.2; width:80px">${m.note}</div>
            </div>
          `).join('')}
       </div>
    </div>

    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-top:20px">
       <div class="rule-tag" style="border-left:4px solid #ef4444">
          <h4 style="margin:0 0 10px 0; color:#ef4444">KIM LOẠI MẠNH</h4>
          <div style="font-size:12px; opacity:0.8; line-height:1.5">Phản ứng với nước ở điều kiện thường tạo thành kiềm và giải phóng Hidro. Bao gồm: K, Na, Ba, Ca, Li...</div>
       </div>
       <div class="rule-tag" style="border-left:4px solid #38bdf8">
          <h4 style="margin:0 0 10px 0; color:#38bdf8">KIM LOẠI QUÝ (TRƠ)</h4>
          <div style="font-size:12px; opacity:0.8; line-height:1.5">Rất khó bị oxy hóa, chỉ tan trong các hỗn hợp axit cực mạnh hoặc không tan. Bao gồm: Ag, Pt, Au.</div>
       </div>
    </div>
  `;
}

function renderSolMatrix() {
  const cations = ['H+', 'Na+', 'K+', 'Ba2+', 'Ca2+', 'Mg2+', 'Al3+', 'Zn2+', 'Fe2+', 'Fe3+', 'Cu2+', 'Ag+', 'Pb2+'];
  const anions = ['OH-', 'Cl-', 'Br-', 'I-', 'S2-', 'SO4 2-', 'CO3 2-', 'PO4 3-'];

  const getSol = (c, a) => {
    // Basic rules simulation for the matrix
    const cation = c.replace(/[0-9+]/g, '').toUpperCase();
    const anion = a.replace(/[0-9-]/g, '').replace(' ', '').toUpperCase();
    
    if (cation === 'NA' || cation === 'K' || cation === 'H') return 'T';
    if (anion === 'NO3') return 'T';
    if (anion === 'CL' || anion === 'BR' || anion === 'I') {
       if (cation === 'AG') return 'K';
       if (cation === 'PB') return 'I';
       return 'T';
    }
    if (anion === 'SO4') {
       if (cation === 'BA' || cation === 'PB' || cation === 'CA') return 'K';
       if (cation === 'AG') return 'I';
       return 'T';
    }
    if (anion === 'OH') {
       if (['NA','K','BA','CA'].includes(cation)) return 'T';
       return 'K';
    }
    if (['CO3','PO4','S','SO3'].includes(anion)) {
       if (['NA','K'].includes(cation)) return 'T';
       return 'K';
    }
    return '-';
  };

  return `
    <div class="lib-section-title">
       <div style="display:flex; align-items:center; gap:12px">
        <span style="color:var(--lib-accent)">${LIB_ICONS.layers}</span>
        Bảng Tính Tan Matrix (2D)
      </div>
    </div>
    <div class="lib-section-desc">Bảng tra cứu khả năng hòa tan của các muối và bazơ phổ biến trong nước ở 25°C. Ký hiệu: T (Tan), K (Không tan), I (Ít tan), - (Phân hủy hoặc không tồn tại).</div>
    
    <div class="sol-matrix-container" style="margin-top:25px; overflow-x:auto; background:rgba(0,0,0,0.2); border-radius:8px; border:1px solid var(--monolith-border)">
      <table style="width:100%; border-collapse:collapse; font-size:12px; color:#fff">
        <thead>
          <tr style="background:rgba(56, 189, 248, 0.1)">
             <th style="padding:15px; border:1px solid var(--monolith-border); color:var(--lib-accent)">ANION / CATION</th>
             ${cations.map(c => `<th style="padding:15px; border:1px solid var(--monolith-border); font-family:monospace">${formatFormula(c)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${anions.map(a => `
            <tr>
              <td style="padding:12px; border:1px solid var(--monolith-border); background:rgba(56, 189, 248, 0.05); font-weight:800; font-family:monospace">${formatFormula(a)}</td>
              ${cations.map(c => {
                const s = getSol(c, a);
                const color = s === 'T' ? '#4ade80' : (s === 'K' ? '#fb7185' : (s === 'I' ? '#fbbf24' : '#64748b'));
                return `<td style="padding:12px; border:1px solid var(--monolith-border); text-align:center; font-weight:800; color:${color}">${s}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <div style="margin-top:20px; font-size:11px; color:#94a3b8; display:flex; gap:20px; justify-content:center">
       <span><b style="color:#4ade80">T:</b> Tan (Dung dịch trong)</span>
       <span><b style="color:#fb7185">K:</b> Không tan (Kết tủa)</span>
       <span><b style="color:#fbbf24">I:</b> Ít tan</span>
       <span><b style="color:#64748b">-:</b> Không bền / Phân hủy</span>
    </div>
  `;
}

function renderCationTable() {
  return `
    <div class="lib-section-title">
      <div style="display:flex; align-items:center; gap:12px">
        <span style="color:var(--lib-accent)">${LIB_ICONS.atom}</span>
        Hồ sơ Phân tích Cation (Kim loại)
      </div>
    </div>
    <div class="lib-section-desc">Phân tích đặc trưng các ion kim loại và amoni qua thuốc thử và màu sắc ngọn lửa.</div>
    <div style="margin-top:24px">
      ${CATION_ID.map(c => `
      <div class="analytic-profile" style="border-left: 5px solid ${c.precipitateColor || 'var(--lib-accent)'}">
        <div class="profile-id" style="display:flex; justify-content:space-between; align-items:flex-end">
          <div>
            <div class="profile-ion" style="font-size:36px; font-weight:800">${c.ion}</div>
            <div class="profile-name" style="font-size:14px; opacity:0.8">${c.name}</div>
          </div>
          <div style="margin-bottom:10px">
            ${c.ion === 'Ag⁺' || c.ion === 'Pb²⁺' || c.ion === 'Cd²⁺' ? '<span class="lib-badge badge-danger">Độc hại</span>' : ''}
            ${c.ion === 'NH₄⁺' ? '<span class="lib-badge badge-toxic">Tạo khí khai</span>' : ''}
            <span class="lib-badge badge-info">ION DƯƠNG</span>
          </div>
        </div>
        <div class="profile-section">
          <h4><span style="color:#fbbf24">🔍</span> PHƯƠNG PHÁP NHẬN BIẾT</h4>
          <div class="profile-val"><b>Thuốc thử:</b> <span style="color:#fff">${c.reagent}</span></div>
          <div class="profile-val" style="margin-top:10px; padding:15px; background:rgba(255,255,255,0.03); border-radius:4px">
             <b>Hiện tượng:</b> <span style="color:var(--lib-accent); font-weight:800; text-shadow:0 0 10px var(--lib-glow)">${c.observation}</span>
          </div>
        </div>
        <div class="profile-section">
          <h4>GHI CHÚ KỸ THUẬT</h4>
          <div class="profile-val" style="font-style:italic; opacity:0.8; font-size:12px">${c.note}</div>
        </div>
        <div class="profile-eq" style="border-top: 1px dashed rgba(255,255,255,0.1); padding-top:15px; margin-top:15px">
          <div style="font-size:10px; color:#64748b; margin-bottom:8px; font-family:'Orbitron', sans-serif">PHƯƠNG TRÌNH ION</div>
          <div style="font-family:monospace; font-size:14px; color:#34d399">${formatFormula(c.equation)}</div>
        </div>
      </div>`).join('')}
    </div>
  `;
}

function renderAnionTable() {
  return `
    <div class="lib-section-title">
      <div style="display:flex; align-items:center; gap:12px">
        <span style="color:var(--lib-accent)">${LIB_ICONS.atom}</span>
        Hồ sơ Phân tích Anion (Gốc Axit)
      </div>
    </div>
    <div class="lib-section-desc">Cách nhận diện các gốc axit phổ biến thông qua phản ứng tạo kết tủa hoặc sủi bọt khí.</div>
    <div style="margin-top:24px">
      ${ANION_ID.map(a => `
      <div class="analytic-profile" style="border-left: 5px solid #fb7185">
        <div class="profile-id" style="display:flex; justify-content:space-between; align-items:flex-end">
          <div>
            <div class="profile-ion" style="color:#fb7185; font-size:36px; font-weight:800">${a.ion}</div>
            <div class="profile-name" style="font-size:14px; opacity:0.8">${a.name}</div>
          </div>
          <div style="margin-bottom:10px">
            ${a.ion === 'NO₃⁻' ? '<span class="lib-badge badge-danger">Phát NO₂ Độc</span>' : ''}
            ${a.ion === 'CN⁻' ? '<span class="lib-badge badge-danger">KỊ ĐỘC</span>' : ''}
            <span class="lib-badge badge-info" style="border-color:rgba(251, 113, 133, 0.3); color:#fb7185">ION ÂM</span>
          </div>
        </div>
        <div class="profile-section">
          <h4><span style="color:#fbbf24">🔍</span> PHƯƠNG PHÁP NHẬN BIẾT</h4>
          <div class="profile-val"><b>Thuốc thử:</b> <span style="color:#fff">${a.reagent}</span></div>
          <div class="profile-val" style="margin-top:10px; padding:15px; background:rgba(251,113,133,0.05); border-radius:4px">
             <b>Hiện tượng:</b> <span style="color:#fb7185; font-weight:800; text-shadow:0 0 10px rgba(251,113,133,0.4)">${a.observation}</span>
          </div>
        </div>
        <div class="profile-section">
          <h4>GHI CHÚ KỸ THUẬT</h4>
          <div class="profile-val" style="font-style:italic; opacity:0.8; font-size:12px">${a.note || 'Thực hiện trong điều kiện tiêu chuẩn.'}</div>
        </div>
        <div class="profile-eq" style="border-top: 1px dashed rgba(255,255,255,0.1); padding-top:15px; margin-top:15px">
          <div style="font-size:10px; color:#64748b; margin-bottom:8px; font-family:'Orbitron', sans-serif">QUY TRÌNH PHẢN ỨNG</div>
          <div style="font-family:monospace; font-size:14px; color:#38bdf8">${formatFormula(a.equation)}</div>
        </div>
      </div>`).join('')}
    </div>
  `;
}

function renderGasTests() {
  return `
    <div class="lib-section-title">
      <div style="display:flex; align-items:center; gap:12px">
        <span style="color:var(--lib-accent)">${LIB_ICONS.wind}</span>
        Phân tích & Thử Chất khí
      </div>
    </div>
    <div class="lib-section-desc">Quy trình xác định các hợp chất khí dựa trên tính chất hóa lý đặc trưng.</div>
    <div style="margin-top:24px">
      ${GAS_TESTS.map(g => `
      <div class="analytic-profile" style="border-left: 5px solid var(--lib-accent)">
        <div class="profile-id">
          <div class="profile-ion" style="color:var(--lib-accent); font-size:40px">${g.icon}</div>
          <div class="profile-name" style="font-family:'Orbitron', sans-serif; font-weight:800; font-size:16px; opacity:1; color:var(--lib-accent); margin-top:2px">${g.gas}</div>
        </div>
        <div class="profile-section">
          <h4>Phương pháp nhận diện</h4>
          <div class="profile-val"><b>Tên gọi:</b> ${g.name}</div>
          <div class="profile-val" style="margin-top:8px"><b>Phép thử:</b> ${g.test}</div>
        </div>
        <div class="profile-section">
          <h4>Dấu hiệu & An toàn</h4>
          <div class="profile-val"><b>Tính chất:</b> ${g.smell}</div>
          <div class="profile-val" style="margin-top:8px; color:#fb7185"><b>An toàn:</b> ${g.safety}</div>
        </div>
        <div class="profile-eq" style="color:var(--lib-accent)">
          <div style="font-size:9px; color:#64748b; margin-bottom:4px">DẤU HIỆU HÓA HỌC</div>
          ${g.equation}
        </div>
      </div>`).join('')}
    </div>
  `;
}

function renderSolubility() {
  return `
    <div class="lib-section-title">
      <div style="display:flex; align-items:center; gap:12px">
        <span style="color:var(--lib-accent)">${LIB_ICONS.droplet}</span>
        Ma trận Độ tan Quantum
      </div>
    </div>
    <div class="lib-section-desc">Hệ thống phân loại tính tan của muối vô cơ trong dung môi nước (25°C).</div>
    
    <div class="matrix-cluster">
      <div class="cluster-header" style="color:var(--lib-accent)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        CÁC GỐC MUỐI DỄ TAN (SOLUBLE)
      </div>
      <div class="rule-grid">
        ${SOLUBILITY_RULES.soluble.map(s => `
          <div class="rule-tag soluble">
            <div class="anion-id">${s.anion}</div>
            <div class="status-line">${s.rule}</div>
            <div class="exception-box">
               <span style="color:var(--lib-accent); font-weight:800; opacity:0.6; margin-right:8px">NGOẠI LỆ:</span>
               ${s.exceptions}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="matrix-cluster">
      <div class="cluster-header" style="color:#fb7185">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        CÁC GỐC MUỐI KHÓ TAN (INSOLUBLE)
      </div>
      <div class="rule-grid">
        ${SOLUBILITY_RULES.insoluble.map(s => `
          <div class="rule-tag insoluble">
            <div class="anion-id">${s.anion}</div>
            <div class="status-line">${s.rule}</div>
            <div class="exception-box">
               <span style="color:#fb7185; font-weight:800; opacity:0.6; margin-right:8px">ƯU TIÊN TAN:</span>
               ${s.exceptions}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderAmphoteric() {
  return `
    <div class="lib-section-title">
      <div style="display:flex; align-items:center; gap:12px">
        <span style="color:var(--lib-accent)">${LIB_ICONS.beaker}</span>
        Phân tích Lưỡng tính
      </div>
    </div>
    <div class="lib-section-desc">Hợp chất có khả năng phản ứng song song với cả Axit và Bazơ mạnh. Dưới đây là hồ sơ chi tiết về tính chất hóa học.</div>
    
    <div style="margin-top:24px; display:flex; flex-direction:column; gap:25px">
      ${AMPHOTERIC_COMPOUNDS.map(c => `
      <div class="ampho-card" style="background:rgba(15, 23, 42, 0.6); border:1px solid rgba(56, 189, 248, 0.2); border-radius:12px; overflow:hidden">
        <div style="background:rgba(56, 189, 248, 0.1); padding:15px 20px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(56, 189, 248, 0.1)">
           <div>
              <div style="font-family:'Orbitron', sans-serif; font-size:20px; font-weight:800; color:#fff">${formatFormula(c.formula)}</div>
              <div style="font-size:11px; color:var(--lib-accent); font-weight:700; text-transform:uppercase">${c.name}</div>
           </div>
           <div style="font-size:10px; padding:4px 10px; border-radius:4px; background:rgba(255,255,255,0.05); color:#94a3b8">AMPHOTERIC PROFILE</div>
        </div>
        
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0">
           <div style="padding:20px; border-right:1px solid rgba(56, 189, 248, 0.1)">
              <div style="font-size:10px; color:#38bdf8; font-weight:800; margin-bottom:10px; display:flex; align-items:center; gap:6px">
                 <div style="width:6px; height:6px; background:#38bdf8; border-radius:50%"></div>
                 TÍNH AXIT (VỚI BAZƠ)
              </div>
              <div style="font-family:'JetBrains Mono', monospace; font-size:13px; color:#e2e8f0; line-height:1.6">
                 ${formatFormula(c.withBase)}
              </div>
           </div>
           
           <div style="padding:20px">
              <div style="font-size:10px; color:#fb7185; font-weight:800; margin-bottom:10px; display:flex; align-items:center; gap:6px">
                 <div style="width:6px; height:6px; background:#fb7185; border-radius:50%"></div>
                 TÍNH BAZƠ (VỚI AXIT)
              </div>
              <div style="font-family:'JetBrains Mono', monospace; font-size:13px; color:#e2e8f0; line-height:1.6">
                 ${formatFormula(c.withAcid)}
              </div>
           </div>
        </div>
        
        <div style="padding:12px 20px; background:rgba(0,0,0,0.3); border-top:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; gap:12px">
           <div style="font-size:9px; font-weight:800; color:#64748b; white-space:nowrap">GHI CHÚ KỸ THUẬT:</div>
           <div style="font-size:12px; color:var(--lib-accent); opacity:0.9 italic">${c.note}</div>
        </div>
      </div>`).join('')}
    </div>
  `;
}

function renderOrganic() {
  return `
    <div class="lib-section-title">
      <div style="display:flex; align-items:center; gap:12px">
        <span style="color:#f472b6">${LIB_ICONS.dna}</span>
        BLUEPRINT: Lộ trình Tổng hợp Hữu cơ
      </div>
    </div>
    <div class="lib-section-desc">Phân tích cơ chế chuyển hóa và ứng dụng thực tế của các chuỗi phản ứng trọng tâm.</div>
    
    <div style="margin-top:40px">
      ${ORGANIC_REACTIONS.map(r => `
        <div class="organic-blueprint" style="margin-bottom:60px">
          <!-- Reaction Header -->
          <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:30px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:15px">
            <div>
              <div class="lib-badge badge-info" style="margin-bottom:10px">${r.category}</div>
              <h3 style="font-size:32px; margin:0; color:#fff; font-family:'Orbitron', sans-serif">${r.title.toUpperCase()}</h3>
            </div>
            <div style="text-align:right">
              <div style="font-size:9px; color:var(--lib-accent); margin-bottom:5px">ĐIỀU KIỆN HỆ THỐNG</div>
              <div style="font-size:12px; font-weight:700">${r.conditions}</div>
            </div>
          </div>

          <!-- Vertical Timeline -->
          <div class="synthetic-path">
            ${r.steps.map((s, idx) => `
              <div class="path-step">
                <div class="path-marker"></div>
                <div class="path-card">
                  <div class="hud-corner corner-tl"></div>
                  <div class="hud-corner corner-tr"></div>
                  <div class="hud-corner corner-bl"></div>
                  <div class="hud-corner corner-br"></div>
                  
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px">
                    <span style="font-family:'Orbitron', sans-serif; font-size:10px; color:var(--lib-accent)">GIAI ĐOẠN 0${idx + 1}</span>
                    <span class="mechanism-tag">${s.mechanism}</span>
                  </div>

                  <div class="path-eq">
                    <span>${formatFormula(s.label)}</span>
                    <span class="arrow">→</span>
                    <span style="color:var(--lib-accent)">${formatFormula(s.product)}</span>
                  </div>

                  <div style="display:flex; gap:20px; font-size:11px; opacity:0.7; margin-top:15px; border-top:1px solid rgba(255,255,255,0.05); padding-top:10px">
                    <span><b style="color:var(--lib-accent)">Hiệu suất:</b> ${s.yield}</span>
                    <span><b style="color:var(--lib-accent)">Nhiệt độ:</b> ${s.temp}</span>
                    <span><b style="color:var(--lib-accent)">Sản phẩm:</b> ${s.name}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Application Footer -->
          <div style="background:rgba(56, 189, 248, 0.05); padding:20px; border-radius:8px; border:1px solid rgba(56,189,248,0.1); margin-top:20px">
             <div style="font-family:'Orbitron', sans-serif; font-size:10px; color:var(--lib-accent); margin-bottom:10px; letter-spacing:1px">ỨNG DỤNG THỰC TIỄN</div>
             <div style="font-size:13px; color:#cbd5e1; line-height:1.6">
               <span style="color:#f472b6; font-weight:800; margin-right:8px">●</span> ${r.application}
             </div>
             <div style="font-size:11px; color:#94a3b8; margin-top:10px; font-style:italic">Ghi chú: ${r.note}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderThermal() {
  return `
    <div class="lib-section-title">
      <div style="display:flex; align-items:center; gap:12px">
        <span style="color:#fbbf24">${LIB_ICONS.flame}</span>
        Biểu đồ Phân tích Nhiệt lượng
      </div>
    </div>
    <div class="lib-section-desc">Theo dõi sự biến đổi hóa học của các hợp chất dưới tác dụng của nhiệt độ cao.</div>

    <div style="margin-top:30px">
      ${THERMAL_DECOMP_LIST.map(d => `
        <div class="thermal-block" style="margin-bottom:50px; border-bottom:1px solid rgba(251,191,36,0.1); padding-bottom:30px">
          <div class="cluster-header" style="color:#fbbf24; background:rgba(251,191,36,0.1); padding:12px 20px; border-radius:8px; display:inline-flex; align-items:center; gap:12px; margin-bottom:25px">
             <span style="font-size:24px">🌡️</span> 
             <span style="font-family:'Orbitron', sans-serif; font-weight:700">${d.compound.toUpperCase()}</span>
          </div>

          ${d.reactions.map(r => `
            <div class="spec-plate" style="border-color:rgba(251,191,36,0.3); background:rgba(251,191,36,0.03); padding:25px; margin-bottom:20px">
              <div style="display:flex; justify-content:space-between; align-items:flex-start">
                <div class="spec-info">
                  <div style="font-size:10px; color:#fbbf24; font-weight:800; margin-bottom:5px; font-family:'Orbitron', sans-serif">DIỄN BIẾN PHẢN ỨNG</div>
                  <div style="font-size:26px; font-weight:800; color:#fff; letter-spacing:1px">${formatFormula(r.equation)}</div>
                  <div style="font-size:13px; color:var(--lib-accent); margin-top:10px; font-weight:700">${r.type}</div>
                  <div style="font-size:12px; opacity:0.8; color:#cbd5e1; margin-top:5px">— ${r.note}</div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:10px; color:#fbbf24; opacity:0.6; margin-bottom:4px">NHIỆT ĐỘ</div>
                  <div style="font-size:16px; font-weight:800; color:#fbbf24">${r.temp}</div>
                </div>
              </div>
            </div>
          `).join('')}

          <div style="background:rgba(244,63,94,0.08); padding:20px; border-radius:8px; border:1px solid rgba(244,63,94,0.2)">
            <div style="color:#fb7185; font-weight:800; font-size:11px; margin-bottom:10px; display:flex; align-items:center; gap:8px; font-family:'Orbitron', sans-serif">
              <span style="font-size:18px">⚠️</span> GIAO THỨC NGUY HIỂM: BÁO ĐỘNG
            </div>
            <ul style="margin:0; padding-left:20px; font-size:12px; color:#fecdd3; line-height:1.6">
              ${d.hazards.map(h => `<li style="margin-bottom:5px">${h}</li>`).join('')}
            </ul>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderNomenclature() {
  return `
    <div class="lib-section-title">
      <div style="display:flex; align-items:center; gap:12px">
        <span style="color:#38bdf8">${LIB_ICONS.tag}</span>
        Danh pháp IUPAC Phân tử
      </div>
    </div>
    <div class="lib-section-desc">Cách gọi tên chuẩn hóa cho các hợp chất vô cơ phi kim theo danh pháp quốc tế.</div>
    <div class="rule-grid" style="margin-top:20px">
      ${NONIONIC_NOMENCLATURE.map(n => `
      <div class="rule-tag" style="padding:16px; border-left:3px solid #38bdf8">
        <div style="font-family:monospace; font-size:22px; color:#38bdf8; margin-bottom:4px">${n.formula}</div>
        <div style="font-size:13px; font-weight:700; color:#f8fafc">${n.name}</div>
      </div>`).join('')}
    </div>
  `;
}

// ——— PHENOMENA RENDERS ———

function renderPhenPrecipitate() {
  if (!window.PHENOMENA_DB) return '<div style="padding:20px;color:#94a3b8">Đang tải dữ liệu...</div>';
  const db = window.PHENOMENA_DB.precipitates;
  return `
    <div class="lib-section-title">
      <div style="display:flex; align-items:center; gap:12px">
        <span style="color:#94a3b8">${LIB_ICONS.cube}</span>
        Cơ sở dữ liệu Kết tủa
      </div>
    </div>
    <div class="lib-section-desc">Tra cứu màu sắc và điều kiện hình thành các pha rắn trong dung dịch.</div>
    <div style="margin-top:24px">
      ${db.map(p => `
      <div class="analytic-profile" style="border-left:5px solid ${p.colorHex}">
        <div class="profile-id">
          <div style="width:40px; height:40px; border-radius:12px; background:${p.colorHex}; border:2px solid rgba(255,255,255,0.1); box-shadow:0 0 15px ${p.colorHex}44"></div>
          <div class="profile-ion" style="font-size:20px; margin-top:8px">${p.formula}</div>
        </div>
        <div class="profile-section">
          <h4>Nhận diện Vật lý</h4>
          <div class="profile-val"><b>Tên gọi:</b> ${p.name}</div>
          <div class="profile-val" style="margin-top:8px"><b>Màu đặc trưng:</b> ${p.colorName}</div>
        </div>
        <div class="profile-section">
          <h4>Bối cảnh Phản ứng</h4>
          <div class="profile-val">${p.situation}</div>
        </div>
        <div class="profile-eq">
          <div style="font-size:9px; color:#64748b; margin-bottom:4px">CƠ CHẾ KẾT TỦA</div>
          ${p.equation}
        </div>
      </div>`).join('')}
    </div>
  `;
}

function renderPhenIon() {
  if (!window.PHENOMENA_DB) return '<div style="padding:20px;color:#94a3b8">Đang tải dữ liệu...</div>';
  const db = window.PHENOMENA_DB.ionColors;
  return `
    <div class="lib-section-title">
      <div style="display:flex; align-items:center; gap:12px">
        <span style="color:#38bdf8">${LIB_ICONS.palette}</span>
        Phổ màu Ion Dung dịch
      </div>
    </div>
    <div class="lib-section-desc">Màu sắc đặc trưng của các ion kim loại chuyển tiếp trong dung dịch.</div>
    <div style="margin-top:24px">
      ${db.map(ion => `
      <div class="analytic-profile" style="border-left:5px solid ${ion.colorHex}; background:linear-gradient(90deg, ${ion.colorHex}08, rgba(15,23,42,0.4))">
        <div class="profile-id">
          <div class="profile-ion" style="color:${ion.colorHex}">${ion.ion}</div>
          <div class="profile-name">${ion.name}</div>
        </div>
        <div class="profile-section">
          <h4>Thị giác</h4>
          <div class="profile-val" style="color:${ion.colorHex}; font-weight:700">${ion.colorName}</div>
        </div>
        <div class="profile-section">
          <h4>Ghi chú</h4>
          <div class="profile-val">${ion.note}</div>
        </div>
      </div>`).join('')}
    </div>
  `;
}

function renderPhenGas() {
  if (!window.PHENOMENA_DB) return '<div style="padding:20px;color:#94a3b8">Đang tải dữ liệu...</div>';
  return renderGasTests(); // Reuse improved Gas UI
}

function renderPhenFlame() {
  if (!window.PHENOMENA_DB) return '<div style="padding:20px;color:#94a3b8">Đang tải dữ liệu...</div>';
  const db = window.PHENOMENA_DB.flameTests;
  return `
    <div class="lib-section-title">
      <div style="display:flex; align-items:center; gap:12px">
        <span style="color:#fbbf24">${LIB_ICONS.flame}</span>
        Phân tích Quang phổ Ngọn lửa
      </div>
    </div>
    <div class="lib-section-desc">Xác định kim loại dựa trên bước sóng ánh sáng phát xạ.</div>
    <div style="margin-top:24px">
      ${db.map(f => `
      <div class="analytic-profile" style="border-left:5px solid ${f.colorHex}">
        <div class="profile-id">
          <div style="width:40px; height:50px; border-radius:50% 50% 20% 20%; background:radial-gradient(circle at 50% 50%, ${f.colorHex}, transparent); filter:blur(2px) drop-shadow(0 0 10px ${f.colorHex})"></div>
          <div class="profile-ion" style="margin-top:10px; font-size:18px">${f.ion}</div>
        </div>
        <div class="profile-section">
          <h4>Đặc tính phát xạ</h4>
          <div class="profile-val" style="color:${f.colorHex}; font-weight:800">${f.colorName}</div>
          <div style="font-size:11px; font-family:monospace; margin-top:4px">BƯỚC SÓNG (λ): ${f.wavelength}</div>
        </div>
        <div class="profile-section">
          <h4>Biểu tượng</h4>
          <div style="font-size:30px">${f.icon}</div>
        </div>
      </div>`).join('')}
    </div>
  `;
}

function renderPhenOrganic() {
  if (!window.PHENOMENA_DB) return '<div style="padding:20px;color:#94a3b8">Đang tải dữ liệu...</div>';
  const db = window.PHENOMENA_DB.organicTests;
  return `
    <div class="lib-section-title">
      <div style="display:flex; align-items:center; gap:12px">
        <span style="color:var(--lib-accent)">${LIB_ICONS.biohazard}</span>
        Hồ sơ Phản ứng Nhóm chức
      </div>
    </div>
    <div class="lib-section-desc">Dấu hiệu nhận biết định tính các hợp chất hữu cơ quan trọng.</div>
    <div style="margin-top:24px">
      ${db.map(t => `
      <div class="analytic-profile" style="border-left:5px solid var(--lib-accent)">
        <div class="profile-id">
           <div class="profile-ion">${t.icon}</div>
           <div class="profile-name" style="opacity:1">${t.group}</div>
        </div>
        <div class="profile-section">
            <h4>Thí nghiệm & Thuốc thử</h4>
            <div class="profile-val"><b>Tên:</b> ${t.name}</div>
            <div class="profile-val" style="margin-top:8px"><b>Thuốc thử:</b> ${t.reagent}</div>
        </div>
        <div class="profile-section">
            <h4>Hiện tượng đặc trưng</h4>
            <div style="display:flex; align-items:center; gap:10px; margin:5px 0">
                <div style="width:20px; height:20px; border-radius:4px; background:${t.colorBefore}; border:1px solid rgba(255,255,255,0.1)"></div>
                <div style="color:#38bdf8">➔</div>
                <div style="width:20px; height:20px; border-radius:4px; background:${t.colorAfter}; border:1px solid rgba(255,255,255,0.1)"></div>
                <div style="font-size:12px; font-weight:700">${t.phenomenon}</div>
            </div>
        </div>
        <div class="profile-eq">
            <div style="font-size:9px; color:#64748b; margin-bottom:4px">CƠ CHẾ PHẢN ỨNG</div>
            ${t.equation}
        </div>
      </div>`).join('')}
    </div>
  `;
}

function renderSafety() {
  return `
    <div class="lib-section-title">
      <div style="display:flex; align-items:center; gap:12px">
        <span style="color:var(--lib-accent)">${LIB_ICONS.shield}</span>
        An toàn Phòng thí nghiệm (GHS)
      </div>
    </div>
    <div class="lib-section-desc">Hệ thống phân loại quốc tế GHS về mức độ nguy hại của hóa chất. Hãy luôn tuân thủ bảo hộ lao động.</div>
    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:20px; margin-top:30px">
      ${SAFETY_SIGNS.map(s => `
        <div class="rule-tag" style="padding: 25px; border-left: 4px solid #fb7185">
          <div style="display:flex; justify-content:space-between; align-items:flex-start">
            <div style="font-size:45px">${s.icon}</div>
            <div class="lib-badge badge-danger">${s.level} NGUY HIỂM</div>
          </div>
          <div style="font-family:'Orbitron', sans-serif; font-size:16px; font-weight:800; color:#fff; margin-top:15px">${s.title.toUpperCase()}</div>
          <div style="font-size:12px; opacity:0.7; line-height:1.6; margin-top:10px">${s.desc}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderEquipment() {
  return `
    <div class="lib-section-title">
      <div style="display:flex; align-items:center; gap:12px">
        <span style="color:var(--lib-accent)">${LIB_ICONS.tool}</span>
        Dụng cụ Thí nghiệm Quantum
      </div>
    </div>
    <div class="lib-section-desc">Hướng dẫn sử dụng và tên gọi chuẩn hóa của các dụng cụ thủy tinh trong PTN.</div>
    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:15px; margin-top:25px">
      ${LAB_EQUIPMENT.map(e => `
        <div class="spec-plate" style="height:100px; align-items:center; display:flex">
           <div style="font-size:32px; min-width:60px; display:flex; justify-content:center; color:var(--lib-accent)">
              ${LIB_ICONS[e.icon] || e.icon}
           </div>
           <div class="spec-info">
              <div class="spec-name" style="font-size:14px; color:var(--lib-accent); font-weight:800">${e.name}</div>
              <div class="spec-desc" style="font-size:11px; opacity:0.7">${e.use}</div>
           </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderPHIndicators() {
  return `
    <div class="lib-section-title">
      <div style="display:flex; align-items:center; gap:12px">
        <span style="color:var(--lib-accent)">${LIB_ICONS.activity}</span>
        Thang màu Chỉ thị pH
      </div>
    </div>
    <div class="lib-section-desc">Phân tích sự chuyển màu của thuốc thử trong các dải pH khác nhau.</div>
    <div style="margin-top:30px">
      ${PH_INDICATORS.map(p => `
        <div class="ph-indicator-card">
           <div style="display:flex; justify-content:space-between; align-items:center">
              <h3 style="margin:0; font-family:'Orbitron', sans-serif; color:var(--lib-accent)">${p.name}</h3>
              <div class="lib-badge badge-info">${p.range} pH</div>
           </div>
           <div class="ph-strip" style="background:${p.gradient}"></div>
           <div class="ph-labels">
              <span>${p.acid}</span>
              <span>${p.neutral}</span>
              <span>${p.base}</span>
           </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderConcAcids() {
  return `
    <div class="lib-section-title">
      <div style="display:flex; align-items:center; gap:12px">
        <span style="color:var(--lib-accent)">${LIB_ICONS.zap}</span>
        Phân tích Axit Đặc Oxy hóa
      </div>
    </div>
    <div class="lib-section-desc">Khám phá các phản ứng đặc thù của Axit H₂SO₄ 98% và HNO₃ 68%.</div>
    <div style="margin-top:25px">
      ${CONC_ACID_PROFILES.map(a => `
        <div class="analytic-profile" style="border-left: 5px solid #fb7185">
           <div class="profile-id">
              <div class="profile-ion" style="color:#fb7185; font-size:32px">${a.acid}</div>
           </div>
           <div class="profile-section">
              <h4>Tính chất Nổi bật</h4>
              <ul style="padding-left:20px; color:#cbd5e1; font-size:13px">
                 ${a.features.map(f => `<li>${f}</li>`).join('')}
              </ul>
           </div>
           <div class="profile-eq" style="background:rgba(0,0,0,0.2); padding:15px; border-radius:4px">
              <h4>Phản ứng điển hình</h4>
              ${a.reactions.map(r => `
                <div style="margin-bottom:12px">
                  <div style="font-family:monospace; font-size:14px; color:#fff">${r.eq}</div>
                  <div style="font-size:11px; opacity:0.6; color:#fb7185">⚠️ ${r.note}</div>
                </div>
              `).join('')}
           </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ——— INIT ON DOM READY ———
document.addEventListener('DOMContentLoaded', initLibrary);
