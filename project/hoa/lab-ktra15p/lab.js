/* ============================================================
   lab.js — Main Lab Controller & SVG Renderers
   ============================================================ */

// ——— AUDIO SYSTEM ———
const AudioSystem = {
  _alertAudio: null,
  _shatterAudio: null,
  _isMuted: false,
  _volume: 0.7,

  init() {
    try {
      this._alertAudio = new Audio('music/alert.mp3');
      this._alertAudio.preload = 'auto';
      this._alertAudio.volume = this._volume;

      this._shatterAudio = new Audio('music/shatter.mp3');
      this._shatterAudio.preload = 'auto';
      this._shatterAudio.volume = this._volume;

      this._explosionAudio = new Audio('music/explosion.mp3');
      this._explosionAudio.preload = 'auto';
      this._explosionAudio.volume = this._volume;
    } catch(e) {
      console.warn('[AudioSystem] Could not load audio files:', e);
    }
  },

  /**
   * Phát âm thanh cảnh báo
   * @param {number} level - 1: warning (ngắn), 2: danger (đầy đủ)
   */
  playAlert(level = 2) {
    if (this._isMuted || !this._alertAudio) return;
    try {
      this._alertAudio.currentTime = 0;
      this._alertAudio.volume = level >= 2 ? this._volume : this._volume * 0.4;
      // Dừng sau thời gian tương ứng level
      const duration = level >= 2 ? 4000 : 1500;
      this._alertAudio.play().catch(() => {});
      if (level < 2) {
        setTimeout(() => { try { this._alertAudio.pause(); } catch(e){} }, duration);
      }
    } catch(e) {
      console.warn('[AudioSystem] playAlert error:', e);
    }
  },

  stopAlert() {
    if (!this._alertAudio) return;
    try {
      this._alertAudio.pause();
      this._alertAudio.currentTime = 0;
    } catch(e) {}
  },

  /**
   * Phát âm thanh nổ và vỡ thủy tinh
   */
  playShatter() {
    if (this._isMuted || !this._shatterAudio) return;
    try {
      this._shatterAudio.currentTime = 0;
      this._shatterAudio.play().catch(() => {});
    } catch(e) {
      console.warn('[AudioSystem] playShatter error:', e);
    }
  },

  /**
   * Phát âm thanh nổ (không vỡ cốc)
   */
  playExplosion() {
    if (this._isMuted || !this._explosionAudio) return;
    try {
      this._explosionAudio.currentTime = 0;
      this._explosionAudio.play().catch(() => {});
    } catch(e) {
      console.warn('[AudioSystem] playExplosion error:', e);
    }
  },

  setMuted(muted) {
    this._isMuted = muted;
    if (muted) this.stopAlert();
  },

  setVolume(vol) {
    this._volume = Math.max(0, Math.min(1, vol));
    if (this._alertAudio) this._alertAudio.volume = this._volume;
  }
};

// Khởi tạo AudioSystem khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => AudioSystem.init());

// ——— STATE ———
let state = {
  currentExperiment: 'free',
  workspaceItems: [],
  safetyEquipped: new Set(),
  flameIntervals: {},
  selectedItem: null,
  stepIndex: 0,
  isDragging: false,
  dragData: null,
  nextId: 1,
  logCount: 0,
  pendingPlacement: null, // {type, id, x, y}
};

// ——— CHEMICAL UTILITIES (GLOBAL) ———
const ION_VALENCIES = {
  // Cations
  'H': 1, 'NA': 1, 'K': 1, 'AG': 1, 'NH4': 1, 'LI': 1,
  'MG': 2, 'CA': 2, 'BA': 2, 'ZN': 2, 'CU': 2, 'CU2': 2, 'FE2': 2, 'PB': 2, 'MG2': 2, 'CA2': 2, 'BA2': 2, 'ZN2': 2, 'PB2': 2, 'NI2': 2, 'CO2': 2, 'SN2': 2,
  'AL': 3, 'FE3': 3, 'CR3': 3, 'FE': 3, 
  // Anions
  'CL': 1, 'NO3': 1, 'OH': 1, 'BR': 1, 'I': 1, 'HCO3': 1, 'HSO4': 1, 'MNO4': 1, 'F': 1, 'CH3COO': 1, 'CLO4': 1, 'NO2': 1,
  'SO4': 2, 'CO3': 2, 'SO3': 2, 'S': 2, 'CRO4': 2, 'CR2O7': 2, 'C2O4': 2, 'O': 2, 'HPO4': 2,
  'PO4': 3, 'PO3': 3,
};

/**
 * Helper to format any chemical formula string with UTF-8 subscripts
 * @param {string} formula 
 * @returns {string}
 */
const formatFormulaSubscripts = (formula) => {
  if (!formula) return '';
  if (/[₀₁₂₃₄₅₆₇₈₉]/.test(formula)) return formula;
  return formula.replace(/\d+/g, (match) => 
    match.split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[d]).join('')
  );
};
window.formatFormulaSubscripts = formatFormulaSubscripts;

/**
 * Chuẩn hóa chuỗi tìm kiếm: Bỏ dấu Tiếng Việt, bỏ chỉ số dưới, bỏ khoảng trắng.
 */
function normalizeChemSearch(text) {
  if (!text) return '';
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (m) => '0123456789'['₀₁₂₃₄₅₆₇₈₉'.indexOf(m)]) // Bỏ chỉ số dưới
    .replace(/\s+/g, '') // Bỏ khoảng trắng
    .replace(/[đĐ]/g, 'd');
}

/**
 * Làm nổi bật phần văn bản khớp với tìm kiếm (Partial Highlight)
 * Sử dụng kỹ thuật Mapping Index để xử lý cả Subscripts và Khoảng trắng.
 */
function highlightMatch(text, query) {
  if (!query || !text) return text;
  const qNorm = normalizeChemSearch(query);
  if (!qNorm) return text;

  let normStr = "";
  const mapping = []; 

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const n = normalizeChemSearch(char);
    if (n) {
      for (let j = 0; j < n.length; j++) {
        normStr += n[j];
        mapping.push(i);
      }
    }
  }

  const matches = [];
  let pos = normStr.indexOf(qNorm);
  while (pos !== -1) {
    const start = mapping[pos];
    const end = mapping[pos + qNorm.length - 1] + 1;
    // Tránh trùng lặp range (nếu có)
    if (matches.length === 0 || start >= matches[matches.length - 1].end) {
      matches.push({ start, end });
    }
    pos = normStr.indexOf(qNorm, pos + 1);
  }

  if (matches.length === 0) return text;

  let result = "";
  let lastIdx = 0;
  matches.forEach(m => {
    result += text.substring(lastIdx, m.start) + 
              `<span class="search-highlight-hit">${text.substring(m.start, m.end)}</span>`;
    lastIdx = m.end;
  });
  result += text.substring(lastIdx);

  return result;
}

// ——— GENERAL UTILITIES ———
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}


/**
 * Cân bằng và định dạng công thức muối từ Cation và Anion
 * Ví dụ: Al + SO4 -> Al2(SO4)3
 */
function balanceAndFormatFormula(cationId, anionId) {
  if (!cationId || !anionId) return 'N/A';
  
  const cVal = ION_VALENCIES[cationId.toUpperCase()] || 1;
  const aVal = ION_VALENCIES[anionId.toUpperCase()] || 1;

  // Tính BCNN của hóa trị
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  const common = gcd(cVal, aVal);
  
  const cCount = aVal / common;
  const aCount = cVal / common;

  // Danh sách các ion đa nguyên tử cần dấu ngoặc
  const polyatomics = ['NH4', 'SO4', 'CO3', 'PO4', 'NO3', 'OH', 'HCO3', 'HSO4', 'CH3COO', 'CLO4', 'SO3', 'CRO4', 'CR2O7', 'HPO4', 'NO2'];
  
  const normalize = (id) => {
    if (polyatomics.includes(id.toUpperCase())) return id;
    // Loại bỏ số oxy hóa đứng cuối (ví dụ Fe3 -> Fe)
    return id.replace(/\d+$/, '');
  };

  const normC = normalize(cationId);
  const normA = normalize(anionId);

  let formattedC = (cCount > 1 && polyatomics.includes(normC.toUpperCase())) ? `(${normC})` : normC;
  if (cCount > 1) formattedC += cCount;

  let formattedA = (aCount > 1 && polyatomics.includes(normA.toUpperCase())) ? `(${normA})` : normA;
  if (aCount > 1) formattedA += aCount;
  
  return formatFormulaSubscripts(formattedC + formattedA);
}


// ——— WELCOME / SAFETY MODAL LOGIC ———
let welcomeSafetyState = {
  goggles: false,
  gloves: false,
  'lab-coat': false
};

function toggleSafetyGear(type) {
  welcomeSafetyState[type] = !welcomeSafetyState[type];
  const el = document.getElementById('setup-' + type);
  const statusEl = el.querySelector('.setup-status');
  
  if (welcomeSafetyState[type]) {
    el.classList.add('equipped');
    if (statusEl) statusEl.textContent = 'ĐÃ MẶC';
  } else {
    el.classList.remove('equipped');
    if (statusEl) statusEl.textContent = 'CHƯA MẶC';
  }
  
  const allReady = welcomeSafetyState.goggles && welcomeSafetyState.gloves && welcomeSafetyState['lab-coat'];
  const btn = document.getElementById('btnEnterLab');
  btn.disabled = !allReady;
}

function startExperience() {
  playQuantumSound(1200, 0.1, 'sine');
  const intro = document.getElementById('introOverlay');
  intro.classList.add('hide');
  
  // Show lab rules modal FIRST, then safety gear modal
  setTimeout(() => {
    const rulesModal = document.getElementById('labRulesModal');
    if (rulesModal) {
      rulesModal.classList.add('show');
    } else {
      document.getElementById('welcomeSetupModal').classList.add('show');
    }
    addLog('info', '[PROTOCOL_01] KHỞI CHẠY QUY TRÌNH KIỂM TRA NỘI QUY.');
  }, 500);
}

function confirmLabRules() {
  const rulesModal = document.getElementById('labRulesModal');
  if (rulesModal) rulesModal.classList.remove('show');
  setTimeout(() => {
    document.getElementById('welcomeSetupModal').classList.add('show');
    addLog('info', '[PROTOCOL_02] NỘI QUY ĐÃ ĐƯỢC XÁC NHẬN. KIỂM TRA BẢO HỘ...');
  }, 300);
}

function enterLab() {
  document.getElementById('welcomeSetupModal').classList.remove('show');
  
  // Equip safety items (fume-hood luôn bật mặc định khi vào lab)
  state.safetyEquipped.add('goggles');
  state.safetyEquipped.add('gloves');
  state.safetyEquipped.add('lab-coat');
  state.safetyEquipped.add('fume-hood');
  updateSafetyStatus();
  
  // Show header controls now that we are in the lab
  const controls = document.getElementById('headerControls');
  if (controls) controls.style.display = 'flex';
  
  addLog('success', '[HỆ_THỐNG] XÁC NHẬN AN TOÀN: THIẾT BỊ BẢO HỘ ĐÃ SẴN SÀNG.');
}

// ——— INIT ———
function initLab() {
  initIntroParticles();
  initCanvas();
  renderTools();
  renderChemicals();
  setupWorkspaceDrop();
  loadExperiment('electrolysis');
  addLog('info', '[HỆ_THỐNG] KHỞI CHẠY QUANTUM LAB CORE v2.5... TRẠNG THÁI: SẴN SÀNG.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLab);
} else {
  initLab();
}

// ——— TOOL RENDERING (SVG) ———
const SVG_RENDERERS = {
  testTube: (item) => {
    const liq = item.liquidColor || 'transparent';
    const liqH = item.liquidLevel || 0; // 0 to 120
    const precCol = item.precipitateColor || null;
    return `
    <svg width="40" height="150" viewBox="0 0 40 150" class="test-tube-svg">
      <!-- Highlighting rim -->
      <rect x="4" y="2" width="32" height="6" rx="3" fill="rgba(186,230,253,0.4)" stroke="rgba(186,230,253,0.6)" stroke-width="1.5"/>
      <!-- Glass body -->
      <path d="M 8 8 L 8 130 Q 8 142 20 142 Q 32 142 32 130 L 32 8" 
        fill="rgba(224,242,254,0.1)" stroke="rgba(186,230,253,0.5)" stroke-width="1.5"/>
      
      <!-- Content (Solid or Liquid) -->
      ${liqH > 0 ? (item.contentForm === 'solid' ? `
        <!-- Solid Powder Pile -->
        <path d="M 8 130 Q 8 142 20 142 Q 32 142 32 130 L 32 ${142 - liqH} Q 20 ${142 - liqH - 8} 8 ${142 - liqH} Z" 
          fill="${liq}" opacity="1"/>
      ` : `
        <!-- Liquid Fill -->
        <path d="M 8 ${142 - liqH} L 8 130 Q 8 142 20 142 Q 32 142 32 130 L 32 ${142 - liqH} Z" 
          fill="${liq}" opacity="0.85"/>
        <ellipse cx="20" cy="${142 - liqH}" rx="12" ry="3" fill="${liq}"/>
      `) : ''}

      <!-- Sediment Layer (Kết tủa) -->
      ${precCol ? `
        <path d="M 8 135 L 8 130 Q 8 142 20 142 Q 32 142 32 130 L 32 135 Z"
          fill="${precCol}" opacity="0.95"/>
        <ellipse cx="20" cy="135" rx="12" ry="4" fill="${precCol}"/>
      ` : ''}
      
      <!-- Reflections -->
      <line x1="12" y1="15" x2="12" y2="120" stroke="rgba(255,255,255,0.15)" stroke-width="2" stroke-linecap="round"/>
      
      <!-- Gas bubbles (Only if liquid) -->
      ${(item.effervescing && item.contentForm !== 'solid') ? `
        <circle cx="16" cy="${142 - liqH/2}" r="1.5" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
        <circle cx="22" cy="${92 - liqH/2}" r="2" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
        <circle cx="32" cy="${88 - liqH/2}" r="1.5" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
      ` : ''}
      
      <!-- Broken state overlay -->
      ${item.state === 'broken' ? `
        <path d="M20 40 L30 60 L25 80" stroke="#f87171" stroke-width="2" fill="none" opacity="0.7"/>
        <path d="M35 35 L28 55" stroke="#f87171" stroke-width="1.5" fill="none" opacity="0.7"/>
      ` : ''}
    </svg>`;
  },

  beaker: (item) => {
    const liq = item.liquidColor || 'transparent';
    const liqH = item.liquidLevel || 0;
    const precCol = item.precipitateColor || null;
    const precH = precCol ? 8 : 0; // 8px sediment height
    return `
    <svg width="80" height="90" viewBox="0 0 80 90" class="beaker-svg">
      <!-- Body -->
      <path d="M 12 10 L 6 82 Q 6 88 40 88 Q 74 88 74 82 L 68 10 Z"
        fill="rgba(224,242,254,0.1)" stroke="rgba(186,230,253,0.5)" stroke-width="1.5"/>
      
      <!-- Content (Solid or Liquid) -->
      ${liqH > 0 ? (item.contentForm === 'solid' ? `
        <!-- Solid Powder Pile -->
        <path d="M 6 82 Q 6 88 40 88 Q 74 88 74 82 L 74 ${90 - liqH} Q 40 ${90 - liqH - 12} 6 ${90 - liqH} Z" 
          fill="${liq}" opacity="1"/>
      ` : `
        <!-- Liquid Fill -->
        <path d="M ${12 + (60*(90-10-liqH)/80)} ${90 - liqH}
                 L ${6 + 2*(90-liqH-10)/8} ${90 - liqH}
                 Q 6 ${90-liqH} 6 ${90-liqH+4}
                 L 6 82 Q 6 88 40 88 Q 74 88 74 82 L 74 ${90-liqH+4}
                 Q 74 ${90-liqH} 74 ${90-liqH} L ${68-(60*(90-10-liqH)/80)} ${90-liqH} Z"
          fill="${liq}" opacity="0.9"/>
        <ellipse cx="40" cy="${90 - liqH}" rx="${28 + (liqH/90)*5}" ry="4" fill="${liq}"/>
        <ellipse cx="40" cy="${90 - liqH}" rx="${28 + (liqH/90)*5}" ry="4" fill="rgba(255,255,255,0.12)"/>
      `) : ''}

      <!-- Sediment Layer (Kết tủa) -->
      ${precCol ? `
        <path d="M 6.3 78 L 6 82 Q 6 88 40 88 Q 74 88 74 82 L 73.7 78 Z"
          fill="${precCol}" opacity="0.95"/>
        <ellipse cx="40" cy="78" rx="33.5" ry="4" fill="${precCol}"/>
      ` : ''}
      <!-- Rim -->
      <rect x="10" y="6" width="60" height="7" rx="2"
        fill="rgba(186,230,253,0.3)" stroke="rgba(186,230,253,0.5)" stroke-width="1.5"/>
      <!-- Graduation marks -->
      <line x1="20" y1="30" x2="25" y2="30" stroke="rgba(148,163,184,0.5)" stroke-width="1"/>
      <line x1="20" y1="50" x2="25" y2="50" stroke="rgba(148,163,184,0.5)" stroke-width="1"/>
      <line x1="20" y1="70" x2="25" y2="70" stroke="rgba(148,163,184,0.5)" stroke-width="1"/>
      <!-- Spout -->
      <path d="M 68 18 L 78 12 M 68 14 L 78 10" stroke="rgba(186,230,253,0.5)" stroke-width="2" stroke-linecap="round"/>
      <!-- Shine -->
      <line x1="18" y1="10" x2="14" y2="80" stroke="rgba(255,255,255,0.2)" stroke-width="3" stroke-linecap="round"/>
    </svg>`;
  },

  flask: (item) => {
    const liq = item.liquidColor || 'transparent';
    const liqH = item.liquidLevel || 0;
    const precCol = item.precipitateColor || null;
    return `
    <svg width="80" height="110" viewBox="0 0 80 110" class="flask-svg">
      <defs>
        <clipPath id="fc-${item.uid}">
          <path d="M 30 40 L 10 100 Q 10 108 40 108 Q 70 108 70 100 L 50 40 Z"/>
        </clipPath>
      </defs>
      <!-- Flask body -->
      <path d="M 30 40 L 10 100 Q 10 108 40 108 Q 70 108 70 100 L 50 40 Z"
        fill="rgba(224,242,254,0.08)" stroke="rgba(186,230,253,0.5)" stroke-width="1.5"/>
      
      <!-- Content (Solid or Liquid) -->
      ${liqH > 0 ? (item.contentForm === 'solid' ? `
        <!-- Solid Powder Pile -->
        <path d="M 12 104 Q 10 108 40 108 Q 70 108 68 104 L 56 ${108 - liqH} Q 40 ${108 - liqH - 12} 24 ${108 - liqH} Z" 
          fill="${liq}" opacity="1" clip-path="url(#fc-${item.uid})"/>
      ` : `
        <!-- Liquid Fill -->
        <rect x="10" y="${108 - liqH}" width="60" height="${liqH}" 
          fill="${liq}" clip-path="url(#fc-${item.uid})"/>
        <ellipse cx="40" cy="${108 - liqH}" rx="30" ry="4" fill="${liq}" 
          clip-path="url(#fc-${item.uid})" opacity="0.8"/>
      `) : ''}

      <!-- Sediment Layer (Kết tủa) -->
      ${precCol ? `
        <path d="M 12 95 L 10 100 Q 10 108 40 108 Q 70 108 70 100 L 68 95 Z"
          fill="${precCol}" opacity="0.95"/>
        <ellipse cx="40" cy="95" rx="27" ry="4" fill="${precCol}"/>
      ` : ''}
      <!-- Neck -->
      <rect x="28" y="10" width="24" height="32" rx="2"
        fill="rgba(224,242,254,0.1)" stroke="rgba(186,230,253,0.5)" stroke-width="1.5"/>
      <!-- Rim -->
      <rect x="24" y="6" width="32" height="8" rx="2"
        fill="rgba(186,230,253,0.3)" stroke="rgba(186,230,253,0.5)" stroke-width="1.5"/>
      <!-- Shine -->
      <line x1="35" y1="42" x2="18" y2="100" stroke="rgba(255,255,255,0.15)" stroke-width="3" stroke-linecap="round"/>
    </svg>`;
  },

  bunsenBurner: (item) => {
    const on = item.state === 'on';
    return `
    <svg width="60" height="80" viewBox="0 0 60 80">
      <!-- Glass Bottle Body -->
      <path d="M 12 75 Q 10 75 10 70 L 10 45 Q 10 30 30 30 Q 50 30 50 45 L 50 70 Q 50 75 48 75 Z"
        fill="rgba(224,242,254,0.15)" stroke="rgba(186,230,253,0.5)" stroke-width="1.5"/>
      
      <!-- Alcohol Liquid (Violet tint) -->
      <path d="M 10 70 Q 10 75 30 75 Q 50 75 50 70 L 50 50 Q 30 45 10 50 Z"
        fill="rgba(139,92,246,0.3)" opacity="0.8"/>
      
      <!-- Metallic Cap -->
      <rect x="24" y="25" width="12" height="8" rx="2" fill="#64748b" stroke="#475569" stroke-width="1"/>
      
      ${on ? `
        <!-- Flame (Spirit Lamp Flame) -->
        <g class="heating">
          <path d="M 30 25 Q 22 15 30 0 Q 38 15 30 25 Z" fill="rgba(251,191,36,0.4)"/>
          <path d="M 30 25 Q 26 18 30 8 Q 34 18 30 25 Z" fill="rgba(251,191,36,0.8)"/>
          <path d="M 30 25 Q 28 20 30 15 Q 32 20 30 25 Z" fill="#fff" opacity="0.9"/>
        </g>
      ` : `
        <!-- Wick -->
        <rect x="28" y="15" width="4" height="12" rx="1" fill="#e2e8f0" stroke="#94a3b8" stroke-width="0.5"/>
        <line x1="30" y1="15" x2="30" y2="10" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/>
      `}
      
      <!-- Reflections -->
      <path d="M 15 45 Q 15 35 25 35" stroke="rgba(255,255,255,0.2)" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`;
  },

  litmusPaper: (item) => {
    const colorMap = {
      red: '#ef4444',
      blue: '#3b82f6',
      purple: '#8b5cf6',
    };
    const col = colorMap[item.litmusState || 'purple'];
    return `
    <svg width="40" height="70" viewBox="0 0 40 70">
      <!-- Paper -->
      <rect x="5" y="2" width="30" height="60" rx="2"
        fill="${col}" opacity="0.85"
        stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
      <!-- Texture lines -->
      <line x1="12" y1="10" x2="28" y2="10" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
      <line x1="12" y1="18" x2="28" y2="18" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
      <line x1="12" y1="26" x2="28" y2="26" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
      <line x1="12" y1="34" x2="28" y2="34" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
      <line x1="12" y1="42" x2="28" y2="42" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
      <!-- Shine -->
      <rect x="7" y="4" width="8" height="56" rx="2" fill="rgba(255,255,255,0.1)"/>
      <!-- Handle -->
      <rect x="16" y="60" width="8" height="9" rx="1"
        fill="rgba(255,255,255,0.4)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
    </svg>`;
  },

  dropper: (item) => {
    const col = item.holdingColor || 'rgba(186,230,253,0.3)';
    return `
    <svg width="40" height="90" viewBox="0 0 40 90" class="dropper-svg">
      <!-- Bulb -->
      <ellipse cx="20" cy="20" rx="14" ry="18" fill="rgba(64,64,64,0.9)" stroke="#475569" stroke-width="1.5"/>
      <ellipse cx="16" cy="14" rx="4" ry="6" fill="rgba(255,255,255,0.1)"/>
      <!-- Shaft -->
      <rect x="17" y="38" width="6" height="42" rx="3" fill="rgba(224,242,254,0.3)" stroke="rgba(186,230,253,0.5)" stroke-width="1.2"/>
      ${item.holdingColor ? `<rect x="18" y="45" width="4" height="30" fill="${col}" opacity="0.9"/>` : ''}
      <!-- Tip -->
      <path d="M 17 80 L 20 88 L 23 80" fill="rgba(186,230,253,0.7)"/>
    </svg>`;
  },

  stirrer: (item) => `
    <svg width="20" height="120" viewBox="0 0 20 120" class="${item.active ? 'stirring-anim' : ''}">
      <line x1="10" y1="5" x2="10" y2="115" stroke="rgba(186,230,253,0.8)" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="10" cy="10" rx="6" ry="4" fill="rgba(186,230,253,0.5)"/>
      <ellipse cx="10" cy="110" rx="6" ry="4" fill="rgba(186,230,253,0.5)"/>
    </svg>`,

  funnel: (item) => `
    <svg width="60" height="80" viewBox="0 0 60 80">
      <path d="M 4 6 L 56 6 L 35 50 L 35 74 L 25 74 L 25 50 Z"
        fill="rgba(224,242,254,0.15)" stroke="rgba(186,230,253,0.5)" stroke-width="1.5"/>
      <rect x="3" y="3" width="54" height="6" rx="3" fill="rgba(186,230,253,0.3)" stroke="rgba(186,230,253,0.5)" stroke-width="1"/>
      ${item.hasFilterPaper ? `<path d="M 12 12 L 48 12 L 30 45 Z" fill="#fff" opacity="0.6"/>` : ''}
    </svg>`,

  pipette: (item) => {
    const col = item.holdingColor || 'rgba(186,230,253,0.1)';
    return `
    <svg width="30" height="120" viewBox="0 0 30 120" class="pipette-svg">
      <rect x="12" y="30" width="6" height="70" rx="3" fill="rgba(224,242,254,0.2)" stroke="rgba(186,230,253,0.5)" stroke-width="1.2"/>
      ${item.holdingColor ? `<rect x="13.5" y="40" width="3" height="58" fill="${col}" opacity="0.9"/>` : ''}
      <line x1="12" y1="45" x2="18" y2="45" stroke="rgba(148,163,184,0.5)" stroke-width="1"/>
      <line x1="12" y1="65" x2="18" y2="65" stroke="rgba(148,163,184,0.5)" stroke-width="1"/>
      <line x1="12" y1="85" x2="18" y2="85" stroke="rgba(148,163,184,0.5)" stroke-width="1"/>
      <!-- Bulb -->
      <ellipse cx="15" cy="15" rx="12" ry="14" fill="rgba(244,63,94,0.6)" stroke="#e11d48" stroke-width="1.5"/>
      <path d="M 13 100 L 15 118 L 17 100" fill="rgba(186,230,253,0.5)"/>
    </svg>`;
  },

  goggles: (item) => `
    <svg width="70" height="45" viewBox="0 0 70 45">
      <!-- Frame -->
      <rect x="3" y="10" width="64" height="28" rx="8" fill="rgba(30,41,59,0.9)" stroke="${item.equipped ? '#34d399' : '#475569'}" stroke-width="2"/>
      <!-- Left lens -->
      <ellipse cx="20" cy="24" rx="13" ry="10" fill="rgba(56,189,248,0.2)" stroke="${item.equipped ? '#34d399' : '#60a5fa'}" stroke-width="1.5"/>
      <ellipse cx="16" cy="20" rx="4" ry="3" fill="rgba(255,255,255,0.15)"/>
      <!-- Right lens -->
      <ellipse cx="50" cy="24" rx="13" ry="10" fill="rgba(56,189,248,0.2)" stroke="${item.equipped ? '#34d399' : '#60a5fa'}" stroke-width="1.5"/>
      <ellipse cx="46" cy="20" rx="4" ry="3" fill="rgba(255,255,255,0.15)"/>
      <!-- Bridge -->
      <rect x="33" y="21" width="4" height="6" rx="2" fill="#334155"/>
      <!-- Strap -->
      <rect x="1" y="18" width="4" height="12" rx="2" fill="#475569"/>
      <rect x="65" y="18" width="4" height="12" rx="2" fill="#475569"/>
      ${item.equipped ? '<text x="35" y="42" text-anchor="middle" fill="#34d399" font-size="8" font-family="Inter">✓ Đang đeo</text>' : ''}
    </svg>`,

  gloves: (item) => `
    <svg width="65" height="60" viewBox="0 0 65 60">
      <!-- Left glove -->
      <path d="M 5 55 L 5 30 C 5 20 12 15 18 15 L 22 15 
               M 22 15 L 22 5 C 22 2 26 2 26 5 L 26 15
               M 26 15 L 26 8 C 26 5 30 5 30 8 L 30 15
               M 30 15 L 30 10 C 30 7 34 7 34 10 L 34 15
               L 35 30 C 36 40 35 55 35 55 Z"
        fill="${item.equipped ? 'rgba(52,211,153,0.3)' : 'rgba(30,41,59,0.8)'}"
        stroke="${item.equipped ? '#34d399' : '#475569'}" stroke-width="1.5"/>
      <!-- Right glove -->
      <path d="M 60 55 L 60 30 C 60 20 53 15 47 15 L 43 15 
               M 43 15 L 43 5 C 43 2 39 2 39 5 L 39 15
               L 39 8 C 39 5 35 5 35 8 L 35 15 L 35 55 Z"
        fill="${item.equipped ? 'rgba(52,211,153,0.3)' : 'rgba(30,41,59,0.8)'}"
        stroke="${item.equipped ? '#34d399' : '#475569'}" stroke-width="1.5"/>
      ${item.equipped ? '<text x="32" y="58" text-anchor="middle" fill="#34d399" font-size="7" font-family="Inter">✓ Đã đeo</text>' : ''}
    </svg>`,

  fumeHood: (item) => `
    <svg width="120" height="100" viewBox="0 0 120 100">
      <!-- Cabinet -->
      <rect x="5" y="20" width="110" height="75" rx="4"
        fill="rgba(15,23,42,0.9)" stroke="${item.active ? '#34d399' : '#334155'}" stroke-width="2"/>
      <!-- Window -->
      <rect x="15" y="28" width="90" height="50" rx="2"
        fill="rgba(56,189,248,0.07)" stroke="${item.active ? 'rgba(52,211,153,0.5)' : 'rgba(56,189,248,0.2)'}" stroke-width="1.5"/>
      <!-- Sash handle -->
      <rect x="50" y="52" width="20" height="6" rx="3" fill="#334155" stroke="#475569" stroke-width="1"/>
      <!-- Flow indicator -->
      ${item.active ? `
        <path d="M 20 40 Q 60 35 100 40" stroke="rgba(52,211,153,0.5)" stroke-width="1.5" fill="none" stroke-dasharray="4 3"/>
        <path d="M 20 50 Q 60 45 100 50" stroke="rgba(52,211,153,0.4)" stroke-width="1.5" fill="none" stroke-dasharray="4 3"/>
        <text x="60" y="75" text-anchor="middle" fill="#34d399" font-size="9" font-family="Inter" font-weight="600">✓ ĐANG HÚT</text>
      ` : `
        <text x="60" y="75" text-anchor="middle" fill="#64748b" font-size="9" font-family="Inter">Tủ hút khí</text>
      `}
      <!-- Top panel -->
      <rect x="5" y="10" width="110" height="12" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
      <circle cx="20" cy="16" r="3" fill="${item.active ? '#34d399' : '#374151'}"/>
      <text x="35" y="19" fill="#94a3b8" font-size="8" font-family="Inter">TỦ HÚT KHÍ</text>
    </svg>`,

  dropperIndicator: (item) => {
    const colMap = { colorless: 'rgba(255,255,255,0.15)', pink: 'rgba(244,63,94,0.5)', red: 'rgba(220,38,38,0.7)' };
    const col = colMap[item.indicatorState || 'colorless'];
    return `
    <svg width="34" height="80" viewBox="0 0 34 80">
      <!-- Bulb -->
      <ellipse cx="17" cy="18" rx="14" ry="16" fill="${col}" stroke="rgba(186,230,253,0.5)" stroke-width="1.5"/>
      <ellipse cx="12" cy="12" rx="5" ry="7" fill="rgba(255,255,255,0.15)"/>
      <!-- Tip -->
      <rect x="15" y="33" width="4" height="40" rx="2" fill="rgba(224,242,254,0.2)" stroke="rgba(186,230,253,0.4)" stroke-width="1"/>
      <path d="M 15 73 L 17 80 L 19 73" fill="rgba(186,230,253,0.6)"/>
      <!-- Label -->
      <text x="17" y="22" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="7" font-family="Inter" font-weight="600">Ph.ph</text>
    </svg>`;
  },

  electrolysisCell: (item) => `
    <svg width="100" height="110" viewBox="0 0 100 110">
      <!-- Container -->
      <path d="M10 20 L10 80 Q10 100 50 100 Q90 100 90 80 L90 20" fill="rgba(224,242,254,0.15)" stroke="rgba(186,230,253,0.5)" stroke-width="2"/>
      <!-- Liquid -->
      <path d="M10 40 L10 80 Q10 100 50 100 Q90 100 90 80 L90 40 Z" fill="${item.liquidColor || 'rgba(56,189,248,0.2)'}"/>
      <!-- U-Tube partition -->
      <rect x="45" y="20" width="10" height="70" fill="rgba(186,230,253,0.2)" stroke="rgba(186,230,253,0.4)" stroke-width="1"/>
      <text x="50" y="105" text-anchor="middle" fill="#94a3b8" font-size="8">Bình điện phân</text>
    </svg>`,

  electronicScale: (item) => {
    const weight = item.displayedWeight || '0.0';
    return `
    <svg width="100" height="60" viewBox="0 0 100 60">
      <!-- Base -->
      <rect x="5" y="30" width="90" height="25" rx="4" fill="#1e293b" stroke="#334155" stroke-width="2"/>
      <!-- Top Platter -->
      <rect x="10" y="20" width="80" height="8" rx="2" fill="#94a3b8" stroke="#475569" stroke-width="1"/>
      <!-- LCD Screen -->
      <rect x="25" y="38" width="50" height="12" rx="2" fill="#020617"/>
      <text x="68" y="48" text-anchor="end" fill="#4ade80" font-family="Orbitron" font-size="10">${weight}</text>
      <text x="73" y="48" fill="#4ade80" font-family="Inter" font-size="6">g</text>
      <!-- Buttons -->
      <circle cx="15" cy="44" r="3" fill="#ef4444"/>
      <circle cx="85" cy="44" r="3" fill="#3b82f6"/>
    </svg>`;
  },

  electrode: (item) => {
    const col = item.toolId === 'electrode-graphite' ? '#1e293b' : '#b45309';
    return `
    <svg width="20" height="90" viewBox="0 0 20 90">
      <rect x="7" y="5" width="6" height="80" rx="3" fill="${col}" stroke="rgba(255,255,255,0.1)"/>
      <rect x="4" y="2" width="12" height="6" rx="2" fill="#475569"/>
    </svg>`;
  },

  powerSupply: (item) => {
    const on = item.active;
    const volt = item.voltage || 12;
    return `
    <svg width="80" height="65" viewBox="0 0 80 65" class="power-supply-svg">
      <!-- Body -->
      <rect x="5" y="10" width="70" height="45" rx="4" fill="#0f172a" stroke="${on ? '#34d399' : '#334155'}" stroke-width="2"/>
      <!-- Screen -->
      <rect x="30" y="20" width="40" height="15" rx="2" fill="#020617"/>
      <text x="50" y="32" text-anchor="middle" fill="${on ? '#4ade80' : '#1e293b'}" font-size="12" font-family="Orbitron">${volt}.0V</text>
      <!-- Buttons -->
      <circle cx="15" cy="22" r="4" fill="${on ? '#ef4444' : '#7f1d1d'}" class="btn-pow-toggle" style="cursor:pointer"/>
      <text x="15" y="29" text-anchor="middle" fill="#94a3b8" font-size="5" font-family="Inter">PWR</text>
      
      <rect x="35" y="40" width="30" height="10" rx="2" fill="#1e293b" stroke="#334155" class="btn-volt-cycle" style="cursor:pointer"/>
      <text x="50" y="47" text-anchor="middle" fill="#94a3b8" font-size="6" font-family="Inter">CHANGE V</text>
      
      <!-- Terminals -->
      <circle cx="15" cy="40" r="3" fill="#ef4444" stroke="#7f1d1d" stroke-width="1"/>
      <circle cx="15" cy="48" r="3" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
      
      <!-- Status Light -->
      <circle cx="70" cy="18" r="1.5" fill="${on ? '#34d399' : '#374151'}" />
    </svg>`;
  },
  labcoat: (item) => {
    return `
    <svg width="60" height="70" viewBox="0 0 60 70">
      <path d="M 15 5 L 45 5 L 55 20 L 55 65 L 5 65 L 5 20 Z" fill="rgba(248, 250, 252, 0.2)" stroke="#94a3b8" stroke-width="2"/>
      <path d="M 30 5 L 30 65" stroke="#94a3b8" stroke-width="1.5" />
      <path d="M 22 5 L 30 15 L 38 5" fill="none" stroke="#94a3b8" stroke-width="1.5" />
      <rect x="35" y="40" width="8" height="10" rx="1" fill="none" stroke="#94a3b8" stroke-width="1.5" />
    </svg>`;
  }
};

// ——— RENDER SIDEBAR TOOLS ———
function renderTools() {
  const grid = document.getElementById('toolsGrid');
  grid.innerHTML = '';
  
  const mode = state.currentExperiment;
  const filtered = TOOLS.filter(tool => {
    if (tool.isPersonalSafety) return false;
    if (mode === 'free') return true;
    // If no tags, consider it general equipment
    if (!tool.tags || tool.tags.length === 0) return true;
    return tool.tags.includes(mode) || tool.tags.includes('general');
  });

  filtered.forEach(tool => {
    const div = document.createElement('div');
    div.className = 'tool-item';
    div.setAttribute('draggable', 'true');
    div.dataset.toolId = tool.id;
    div.dataset.type = 'tool';
    const renderer = SVG_RENDERERS[tool.render];
    const svgHTML = (typeof renderer === 'function') 
      ? renderer({ state: 'idle', equipped: false, active: false, liquidLevel: 0 }) 
      : `<span style="font-size: 24px;">${tool.icon || '📦'}</span>`;
    div.innerHTML = `
      <div class="premium-tool-icon" style="display:flex;align-items:center;justify-content:center; overflow:hidden;">
        <div style="transform: scale(0.35); transform-origin: center;">
          ${svgHTML}
        </div>
      </div>
      <span class="tool-name" style="font-size: 11px; text-align: center; margin-top: 4px;">${tool.name}</span>
    `;
    let hoverTimeout;
    let mouseEvt;
    let isShowing = false;
    
    const triggerTooltip = () => {
      let html = `<div style="font-size:15px; font-weight:700; color:var(--accent-blue); line-height:1.2; margin-bottom:4px;">${tool.name}</div>`;
      let tDesc = tool.tooltip || tool.desc;
      if (tDesc) {
        html += `<div style="font-size:11px; color:rgba(255,255,255,0.7); line-height:1.5; font-style: italic; border-top:1px solid rgba(255,255,255,0.05); padding-top:4px;">${tDesc}</div>`;
      }
      showTooltip(mouseEvt, html, tool);
      isShowing = true;
    };

    div.addEventListener('mouseenter', (e) => {
      mouseEvt = { clientX: e.clientX, clientY: e.clientY };
      hoverTimeout = setTimeout(triggerTooltip, 1000);
    });
    div.addEventListener('mousemove', (e) => {
      mouseEvt = { clientX: e.clientX, clientY: e.clientY };
      if (isShowing) { hideTooltip(); isShowing = false; }
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(triggerTooltip, 1000);
    });
    div.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
      hideTooltip();
      isShowing = false;
    });

    div.addEventListener('dragstart', (e) => {
      clearTimeout(hoverTimeout); hideTooltip(); isShowing = false;
      startDragFromSidebar(e, 'tool', tool.id);
    });
    div.addEventListener('click', () => {
      clearTimeout(hoverTimeout); hideTooltip(); isShowing = false;
      const surface = document.getElementById('workspaceSurface');
      const rect = surface.getBoundingClientRect();
      // Adjust center to account for the 380px right panel
      const x = (rect.width - 400) / 2;
      const y = rect.height / 2 - 30;
      placeItemOnWorkspace('tool', tool.id, x, y);
    });
    grid.appendChild(div);
  });
}

// ——— RENDER CHEMICALS ———
let _chemTypeFilter = 'all';

// Danh sách các ID hóa chất phổ biến, thường dùng để đưa lên đầu
const COMMON_CHEM_IDS = [
  'h2o', 'hcl', 'h2so4', 'hno3', 'ch3cooh',
  'naoh', 'ca_oh_2', 'koh',
  'nacl', 'cuso4', 'caco3', 'na2co3', 'agno3',
  'na_metal', 'fe', 'cu', 'zn', 'al', 'mg',
  'o2', 'h2', 'co2_gas',
  'phenolphthalein', 'litmus-neutral'
];

function getChemIconSVG(chem) {
  const c = chem.colorHex || '#38bdf8';
  if (chem.type === 'acid' || chem.type === 'base') {
    return `<div class="premium-chem-icon" style="display:flex; justify-content:center; align-items:center;">
      <svg width="40" height="40" viewBox="0 0 24 24"><path d="M7 2v2h10V2H7zm4 10v6h2v-6h-2zm-3 8h8v2H8v-2zm-2.8-5.6l3.8-9.4h6l3.8 9.4c.5 1.2-.4 2.6-1.7 2.6H6.9c-1.3 0-2.2-1.4-1.7-2.6z" fill="rgba(255,255,255,0.1)" stroke="${c}" stroke-width="2"/><path d="M7 15l2-5h6l2 5v5H7v-5z" fill="${c}" opacity="0.6"/></svg>
    </div>`;
  }
  if (chem.form === 'solid' || chem.type === 'salt' || chem.type === 'oxide' || chem.type === 'metal') {
    return `<div class="premium-chem-icon" style="display:flex; justify-content:center; align-items:center;">
      <svg width="36" height="36" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 7.5L3.5 6 12 1.5 20.5 6 12 9.5zM2 9v10l10 5v-10L2 9zm10 10l-8-4v-7l8 4v7zm10-10L12 14v10l10-5V9z" fill="${c}" opacity="0.9"/></svg>
    </div>`;
  }
  if (chem.type === 'gas') {
    return `<div class="premium-chem-icon" style="display:flex; justify-content:center; align-items:center;">
      <svg width="36" height="36" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-5.5c0 .83-.67 1.5-1.5 1.5S7 15.33 7 14.5 7.67 13 8.5 13s1.5.67 1.5 1.5zM15.5 13c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-3.5-3c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" fill="${c}"/></svg>
    </div>`;
  }
  // default drops
  return `<div class="premium-chem-icon" style="display:flex; justify-content:center; align-items:center;">
    <svg width="36" height="36" viewBox="0 0 24 24"><path d="M12 2c-5.33 4.55-8 8.48-8 11.8C4 18.22 8.03 22 12 22s8-3.78 8-8.2c0-3.31-2.67-7.25-8-11.8z" fill="${c}" opacity="0.8"/></svg>
  </div>`;
}

function renderChemicals(filter = '') {
  const list = document.getElementById('chemicalsList');
  if (!list) return;
  
  const q = filter.toLowerCase().trim();
  
  // Combine core list + matches from virtual db, then deduplicate by ID
  const seenIds = new Set();
  let pool = [];
  
  [...CHEMICALS, ...(window.ALL_ITEMS || [])].forEach(c => {
    if (!seenIds.has(c.id)) {
      seenIds.add(c.id);
      pool.push(c);
    }
  });

  const qNorm = normalizeChemSearch(filter);
  
  const filtered = pool.filter(c => {
    const matchSearch = !qNorm ||
      normalizeChemSearch(c.formula).includes(qNorm) ||
      normalizeChemSearch(c.name).includes(qNorm) ||
      (c.keywords || []).some(k => normalizeChemSearch(k).includes(qNorm));
      
    const matchType = _chemTypeFilter === 'all' || c.type === _chemTypeFilter;
    
    // Filter by module tag
    let matchModule = true;
    const mode = state.currentExperiment;
    if (mode !== 'free') {
      if (!c.tags || c.tags.length === 0) matchModule = true;
      else matchModule = c.tags.includes(mode) || c.tags.includes('general');
    }

    return matchSearch && matchType && matchModule;
  });

  // Sort: 
  // 1. Hệ thống tính điểm (Priority Scoring) để đưa kết quả khớp nhất lên đầu
  filtered.sort((a, b) => {
    const getScore = (item) => {
      if (!qNorm) return COMMON_CHEM_IDS.includes(item.id) ? 10 : 0;
      
      let score = 0;
      const fNorm = normalizeChemSearch(item.formula);
      const nNorm = normalizeChemSearch(item.name);
      const kNorms = (item.keywords || []).map(k => normalizeChemSearch(k));

      // Công thức khớp hoàn toàn
      if (fNorm === qNorm) score += 1000;
      // Đặc biệt ưu tiên công thức bắt đầu bằng query (VD: gõ HCl -> HClO3)
      else if (fNorm.startsWith(qNorm)) score += 800;
      // Tên bắt đầu bằng query
      else if (nNorm.startsWith(qNorm)) score += 600;
      // Công thức chứa query
      else if (fNorm.includes(qNorm)) score += 400;
      // Tên hoặc từ khóa chứa query
      else if (nNorm.includes(qNorm) || kNorms.some(kn => kn.includes(qNorm))) score += 200;

      // Cộng thêm điểm cho chất thông dụng để làm tie-breaker
      if (COMMON_CHEM_IDS.includes(item.id)) score += 50;

      return score;
    };

    const scoreA = getScore(a);
    const scoreB = getScore(b);

    if (scoreA !== scoreB) return scoreB - scoreA;
    // Nếu bằng điểm, ưu tiên chất ngắn hơn (thường là chất đơn giản hơn)
    return (a.formula || '').length - (b.formula || '').length || (a.formula || '').localeCompare(b.formula || '');
  });

  const finalItems = filtered.slice(0, 3000);

  // Update count from VIRTUAL_DB
  const countEl = document.getElementById('chemCount');
  if (countEl) {
    const dbTotal = window.ALL_ITEMS ? window.ALL_ITEMS.length : pool.length;
    countEl.textContent = `${filtered.length} / ${dbTotal} hợp chất`;
  }

  // Optimized Rendering with DocumentFragment
  const fragment = document.createDocumentFragment();

  if (finalItems.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'chem-empty-state';
    empty.innerHTML = `
      <div class="empty-icon">🔍</div>
      <p>Không tìm thấy chất nào khớp với "<strong>${filter}</strong>"</p>
      <button class="btn-clear-search" onclick="document.getElementById('chemSearch').value=''; filterChemicals('')">Xóa tìm kiếm</button>
    `;
    list.innerHTML = '';
    list.appendChild(empty);
    return;
  }

  finalItems.forEach(chem => {
    const rawF = (chem.formula || '').replace(/<[^>]*>?/gm, '');
    let fSize = '16px';
    if (rawF.length > 25) fSize = '8.5px';
    else if (rawF.length > 18) fSize = '10px';
    else if (rawF.length > 13) fSize = '11.5px';
    else if (rawF.length > 9) fSize = '13.5px';

    const div = document.createElement('div');
    div.className = 'chemical-item' + (chem.isVirtual ? ' virtual-item' : '');
    div.setAttribute('draggable', 'true');
    div.dataset.chemId = chem.id;
    div.style.borderLeft = `3px solid ${chem.colorHex || '#475569'}`;
    const badges = (chem.badges || []).slice(0, 2);
    const dispFormula = highlightMatch(chem.formula, filter);
    const dispName = highlightMatch(chem.name, filter);
    
    // Icon mapping for chemistry types
    const typeLabelMap = {
      'acid': 'Acid', 'base': 'Base', 'salt': 'Muối', 'oxide': 'Oxit', 
      'metal': 'Kim loại', 'nonmetal': 'Phi kim', 'organic': 'Hữu cơ', 
      'gas': 'Chất khí', 'special': 'Đặc biệt', 'indicator': 'Chỉ thị'
    };

    const isCommon = COMMON_CHEM_IDS.includes(chem.id);

    div.innerHTML = `
      <div class="chem-header">
        ${getChemIconSVG(chem)}
        <div class="chem-names">
          <div class="chem-formula" style="color: ${chem.colorHex || '#fff'}; font-size: ${fSize} !important;">
            ${dispFormula}
            ${isCommon ? '<span class="common-star" title="Phổ biến">⭐</span>' : ''}
          </div>
          <div class="chem-full-name">${dispName}</div>
        </div>
      </div>
      <div class="chem-item-footer">
        <span class="chem-type-tag tag-${chem.type}">${typeLabelMap[chem.type] || chem.type}</span>
        <div class="chem-badges">
          ${badges.map(b => `<span class="badge ${b}">${b}</span>`).join('')}
          ${chem.isVirtual ? '<span class="badge v-db">V-DB</span>' : ''}
        </div>
        <div class="chem-ghs-icons">
          ${(chem.hazards||[]).includes('corrosive') ? '<div class="ghs-diamond ghs-corrosive" title="Ăn mòn (GHS05)"><div class="ghs-symbol"></div></div>' : ''}
          ${(chem.hazards||[]).includes('toxic') ? '<div class="ghs-diamond ghs-toxic" title="Độc (GHS06)"><div class="ghs-symbol"></div></div>' : ''}
          ${(chem.hazards||[]).includes('flammable') ? '<div class="ghs-diamond ghs-flammable" title="Dễ cháy (GHS02)"><div class="ghs-symbol"></div></div>' : ''}
          ${(chem.hazards||[]).includes('oxidizer') ? '<div class="ghs-diamond ghs-oxidizer" title="Oxy hóa (GHS03)"><div class="ghs-symbol"></div></div>' : ''}
          ${(chem.hazards||[]).includes('explosive') ? '<div class="ghs-diamond ghs-explosive" title="Nổ (GHS01)"><div class="ghs-symbol"></div></div>' : ''}
          ${(chem.hazards||[]).includes('hazard') ? '<div class="ghs-diamond ghs-hazard" title="Nguy hiểm (GHS07)"><div class="ghs-symbol"></div></div>' : ''}
        </div>
      </div>
    `;
    let hoverTimeout;
    let mouseEvt;
    let isShowing = false;
    
    const triggerTooltip = () => {
      // Get Molar Mass directly if possible
      let molarMass = chem.molarMass;
      if (!molarMass && window.ChemistryEngine) {
        molarMass = window.ChemistryEngine.getMolarMass(chem.id).toFixed(2);
      }

      let html = `<div style="font-size:15px; font-weight:700; color:var(--accent-blue); line-height:1.2;">${chem.name}</div>`;
      html += `<div style="font-size:13px; font-weight:600; color:rgba(255,255,255,0.9); margin-top:4px; letter-spacing:0.5px;">CTPT: ${chem.formula}</div>`;
      
      if (molarMass && molarMass > 0) {
        html += `<div style="font-size:11px; font-weight:600; color:#fbbf24; margin-top:6px; padding-top:4px; border-top:1px solid rgba(255,255,255,0.05);">M = ${molarMass} g/mol</div>`;
      }
      
      if (chem.desc) {
        html += `<div style="font-size:11px; color:rgba(255,255,255,0.7); line-height:1.5; margin-top:6px; font-style: italic;">${chem.desc}</div>`;
      }
      
      showTooltip(mouseEvt, html, chem);
      isShowing = true;
    };

    div.addEventListener('mouseenter', (e) => {
      mouseEvt = { clientX: e.clientX, clientY: e.clientY };
      hoverTimeout = setTimeout(triggerTooltip, 1000);
    });
    div.addEventListener('mousemove', (e) => {
      mouseEvt = { clientX: e.clientX, clientY: e.clientY };
      if (isShowing) { 
        hideTooltip(); 
        isShowing = false; 
      }
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(triggerTooltip, 1000);
    });
    div.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
      hideTooltip();
      isShowing = false;
    });

    div.addEventListener('dragstart', (e) => {
      clearTimeout(hoverTimeout); hideTooltip(); isShowing = false;
      startDragFromSidebar(e, 'chemical', chem.id);
    });
    div.addEventListener('click', () => {
      clearTimeout(hoverTimeout); hideTooltip(); isShowing = false;
      // If a dropper/pipette is selected, fill it instead of placing bottle
      if (state.selectedItem) {
        const selected = state.workspaceItems.find(it => it.uid === state.selectedItem);
        if (selected && (selected.toolId === 'dropper' || selected.toolId === 'pipette')) {
          selected.holdingColor = chem.liquidColor || 'rgba(186,230,253,0.5)';
          selected.holdingChemicals = [chem];
          addLog('info', `[TÍN_HIỆU] ĐÃ LẤY TRỰC TIẾP ${chem.formula}.`);
          refreshWorkspaceItem(selected);
          return;
        }
      }
      
      const surface = document.getElementById('workspaceSurface');
      const rect = surface.getBoundingClientRect();
      // Adjust center to account for the 380px right panel
      const x = (rect.width - 400) / 2;
      const y = rect.height / 2 - 30;
      placeItemOnWorkspace('chemical', chem.id, x, y);
    });
    fragment.appendChild(div);
  });

  list.innerHTML = '';
  list.appendChild(fragment);
}

const _debouncedRenderChemicals = debounce((val) => renderChemicals(val), 250);
function filterChemicals(val) { _debouncedRenderChemicals(val); }


function filterByType(type) {
  _chemTypeFilter = type;
  document.querySelectorAll('.chem-filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.type === type);
  });
  renderChemicals(document.getElementById('chemSearch')?.value || '');
}

// ——— DRAG & DROP SYSTEM ———
let _dragSurfaceRect = null;
let _dragGhostRaf = null;

function startDragFromSidebar(e, type, id) {
  e.dataTransfer.setData('type', type);
  e.dataTransfer.setData('id', id);
  state.dragData = { type, id };
  state.isDragging = true;
  e.dataTransfer.effectAllowed = 'copy';

  // Cache surface rect for performance
  const surface = document.getElementById('workspaceSurface');
  if (surface) _dragSurfaceRect = surface.getBoundingClientRect();

  // --- IDCL: SAFETY INTERLOCK CHECK ---
  if (type === 'chemical') {
    if (window.ChemistryEngine && window.ChemistryEngine.SafetyWatcher) {
      const violations = window.ChemistryEngine.SafetyWatcher.checkViolation(id, {
        isFumeHoodOn: state.safetyEquipped.has('fume-hood'),
        equippedPPE: state.safetyEquipped
      });
      
      if (violations) {
        state.isDragging = false;
        triggerSystemFreeze(violations, id);
        return; // Dừng việc kéo thả ngay lập tức
      }
    }
  }

  // Create ghost
  ghostEl = document.createElement('div');
  ghostEl.className = 'drag-ghost';
  const data = type === 'tool' ? TOOLS.find(t => t.id === id) : (CHEMICALS.find(c => c.id === id) || window.ALL_ITEMS?.find(c => c.id === id));
  if (type === 'tool') {
    const svgHTML = SVG_RENDERERS[data.render] ? SVG_RENDERERS[data.render]({ state: 'idle', equipped: false, active: false, liquidLevel: 0 }) : `<span style="font-size:32px">${data.icon}</span>`;
    ghostEl.innerHTML = `<div class="premium-tool-icon" style="transform:scale(0.8);">${svgHTML}</div>`;
  } else {
    ghostEl.innerHTML = `<div style="transform:scale(1.3); pointer-events:none;">${getChemIconSVG(data)}</div>`;
  }
  document.body.appendChild(ghostEl);
  e.dataTransfer.setDragImage(new Image(), 0, 0);

  document.addEventListener('dragover', moveDragGhost);

  // cleanup on drag end
  const onDragEnd = () => {
    if (ghostEl) { ghostEl.remove(); ghostEl = null; }
    document.removeEventListener('dragover', moveDragGhost);
    document.removeEventListener('dragend', onDragEnd);
    state.isDragging = false;
    _dragSurfaceRect = null;
    if (_dragGhostRaf) cancelAnimationFrame(_dragGhostRaf);
  };
  document.addEventListener('dragend', onDragEnd);
}


function moveDragGhost(e) {
  if (!ghostEl) return;
  
  if (_dragGhostRaf) cancelAnimationFrame(_dragGhostRaf);
  _dragGhostRaf = requestAnimationFrame(() => {
    if (!ghostEl) return;
    
    // Efficient GPU-accelerated repositioning
    // We keep left/top at 0 in CSS, and only update transform.
    if (_dragSurfaceRect) {
      const isOver = (
        e.clientX >= _dragSurfaceRect.left && e.clientX <= _dragSurfaceRect.right &&
        e.clientY >= _dragSurfaceRect.top && e.clientY <= _dragSurfaceRect.bottom
      );
      ghostEl.style.opacity = isOver ? '1' : '0.4';
      const scale = isOver ? 1.2 : 0.8;
      ghostEl.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%) scale(${scale})`;
    } else {
      ghostEl.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    }
  });
}



function setupWorkspaceDrop() {
  const surface = document.getElementById('workspaceSurface');

  surface.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    surface.classList.add('drag-over');
  });
  surface.addEventListener('dragleave', () => {
    surface.classList.remove('drag-over');
  });
  surface.addEventListener('drop', (e) => {
    e.preventDefault();
    surface.classList.remove('drag-over');
    if (ghostEl) { ghostEl.remove(); ghostEl = null; }
    document.removeEventListener('dragover', moveDragGhost);

    const type = e.dataTransfer.getData('type');
    const id = e.dataTransfer.getData('id');
    if (!type || !id) return;

    const rect = surface.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    placeItemOnWorkspace(type, id, x, y);
  });
}

// ——— PLACE ITEM ON WORKSPACE ———
function placeItemOnWorkspace(type, id, x, y) {
  const uid = 'item-' + (state.nextId++);
  let item = null;

  // ——— ANTI-CLUMPING & BOUNDARY LOGIC ———
  let targetX = x;
  let targetY = y;

  // Add small random jitter if dropping onto same spot as others
  const isOverlap = state.workspaceItems.some(it => 
    Math.abs(it.x - (targetX - 40)) < 20 && Math.abs(it.y - (targetY - 50)) < 20
  );
  if (isOverlap) {
    targetX += (Math.random() - 0.5) * 60;
    targetY += (Math.random() - 0.5) * 60;
  }

  // Constrain to workspace boundaries
  const surface = document.getElementById('workspaceSurface');
  if (surface) {
    const rect = surface.getBoundingClientRect();
    targetX = Math.max(50, Math.min(targetX, rect.width - 50));
    targetY = Math.max(60, Math.min(targetY, rect.height - 80));
  }

  if (type === 'tool') {
    const tool = TOOLS.find(t => t.id === id);
    if (!tool) return;
    item = {
      uid, type: 'tool', toolId: id,
      name: tool.name, icon: tool.icon,
      render: tool.render,
      x: targetX - 40, y: targetY - 50,
      state: tool.states ? tool.states[0] : 'idle',
      liquidColor: null, liquidLevel: 0,
      chemicals: [],
      isHeating: false,
      litmusState: 'purple',
      indicatorState: 'colorless',
      equipped: false,
    };
    // Safety items auto-equip
    if (tool.isSafety) {
      item.equipped = true;
      state.safetyEquipped.add(id);
      updateSafetyStatus();
      addLog('success', `✅ ${tool.name}: Đã trang bị bảo hộ!`);
    }
  } else if (type === 'chemical') {
    const chem = CHEMICALS.find(c => c.id === id) || window.ALL_ITEMS?.find(c => c.id === id);
    if (!chem) return;
    
    // Show configuration modal instead of immediate placement
    showChemicalConfig(chem, targetX, targetY);
    return;
  }

  if (!item) return;
  state.workspaceItems.push(item);
  renderWorkspaceItem(item);
  updateDropHint();
  checkInteractions(item);

  if (type === 'chemical') {
    // Check if dropped onto container
    tryDropChemicalOnContainer(item, x, y);
  }
}

// ——— TRY TO DROP CHEMICAL ONTO A CONTAINER ———
function tryDropChemicalOnContainer(chemItem, dropX, dropY) {
  const containers = state.workspaceItems.filter(it =>
    it.type === 'tool' &&
    TOOLS.find(t => t.id === it.toolId)?.category === 'container' &&
    it.uid !== chemItem.uid
  );
  for (const container of containers) {
    const cRect = { x: container.x, y: container.y, w: 90, h: 110 };
    if (
      dropX >= cRect.x - 20 && dropX <= cRect.x + cRect.w + 20 &&
      dropY >= cRect.y - 20 && dropY <= cRect.y + cRect.h + 20
    ) {
      addChemicalToContainer(container, chemItem);
      // Remove floating chemical
      removeWorkspaceItem(chemItem.uid);
      return;
    }
  }
}

// ——— ADD CHEMICAL TO CONTAINER ———
function addChemicalToContainer(container, chemItem, customIncrement = null) {
  // Cho phép nạp chất ngay cả khi đang phản ứng (Realistic)

  const chem = CHEMICALS.find(c => c.id === chemItem.chemId) || window.ALL_ITEMS?.find(c => c.id === chemItem.chemId);
  if (!chem) return;

  // --- IDCL: EMIT POUR EVENT FOR OBSERVER ---
  // Lấy đúng lượng thực tế người dùng đã nhập (_configType = 'mass' hoặc 'molarity')
  const actualAmount = parseFloat(chemItem.mass || chemItem.molarity || 5);
  window.dispatchEvent(new CustomEvent('chemistry:pour', {
    detail: {
      chemicalId: chem.id,
      volume: actualAmount, // g nếu là mass, M nếu là molarity
      configType: chemItem.molarity ? 'molarity' : 'mass'
    }
  }));

  // --- NEW: FUNNEL FILTRATION CHECK ---
  const attachedFunnel = state.workspaceItems.find(it => it.toolId === 'funnel' && it.attachedTo === container.uid);
  if (attachedFunnel) {
    if (chem.type === 'solid' || chem.type === 'metal' || chem.id.includes('solid')) {
      attachedFunnel.hasFilterPaper = true;
      attachedFunnel.precipitates = (attachedFunnel.precipitates || []);
      attachedFunnel.precipitates.push(chem.id);
      addLog('info', `📥 ${chem.name} bị giữ lại trên phễu lọc.`);
      refreshWorkspaceItem(attachedFunnel);
      return; 
    }
  }

  container.chemicals.push(chem);

  // --- NEW: DETERMINE CONTENT FORM ---
  const isLiquidChem = (c) => {
    if (c.id === 'h2o') return true;
    if (c.form === 'liquid' || c.form === 'gas') return true;
    if (c.type === 'acid' || c.type === 'base') return c.form !== 'solid';
    return false;
  };

  const hasLiquid = container.chemicals.some(isLiquidChem);
  container.contentForm = hasLiquid ? 'liquid' : 'solid';

  // --- NEW: CALCULATIVE ENGINE INTEGRATION ---
  if (window.ChemistryEngine) {
    container.ph = window.ChemistryEngine.calculatePH(container.chemicals);
    container.liquidColor = window.ChemistryEngine.calculateSolutionColor(container.chemicals, container.ph);
    
    // Custom drop size for precision work
    const levelInc = customIncrement || (container.contentForm === 'solid' ? 12 : 20);
    container.liquidLevel = Math.min((container.liquidLevel || 0) + levelInc, 85);

    // 4. Safety Check
    const risk = window.ChemistryEngine.checkSafetyRisk(container.chemicals, container);
    if (risk) {
      addLog('danger', risk.message);
      if (risk.type === 'fire') {
        const scale = container.scale || 1;
        triggerReactionEffect('bubbles-intense', container.x + 40 * scale, container.y + 40 * scale, { color: '#f59e0b' }, scale);
        showDanger('⚠️ SỰ CỐ AN TOÀN', risk.message);
      }
    }
  } else {
    // Fallback if engine not loaded
    if (!container.liquidColor) {
      const ionColor = window.PHENOMENA_DB?.getLiquidColorForChem(chem.id);
      container.liquidColor = ionColor || chem.liquidColor;
      container.liquidLevel = Math.min((container.liquidLevel || 0) + 30, 70);
    } else {
      container.liquidLevel = Math.min((container.liquidLevel || 0) + 15, 75);
      container.liquidColor = mixLiquidColors(container.liquidColor, chem.liquidColor);
    }
  }

  // Check reactions
  checkReaction(container);

  // Litmus test
  checkLitmusInContainer(container, chem);

  // Refresh render
  refreshWorkspaceItem(container);
}

// ——— LITMUS TEST IN CONTAINER ———
function checkLitmusInContainer(container, addedChem) {
  const litmusInWS = state.workspaceItems.filter(i =>
    i.type === 'tool' && i.toolId === 'litmus-neutral'
  );
  // If litmus is close to container, change it
  litmusInWS.forEach(litmus => {
    const dx = Math.abs((litmus.x + 20) - (container.x + 40));
    const dy = Math.abs((litmus.y + 35) - (container.y + 50));
    if (dx < 60 && dy < 80) {
      const ph = window.ChemistryEngine?.calculatePH(container.chemicals) || 7;
      
      if (ph < 6.5) { // Acid range
        if (litmus.litmusState === 'red') return;
        litmus.litmusState = 'red';
        addLog('warning', `🔴 Quỳ chuyển ĐỎ — Môi trường ACID (pH ≈ ${ph.toFixed(1)})`);
      } else if (ph > 7.5) { // Base range
        if (litmus.litmusState === 'blue') return;
        litmus.litmusState = 'blue';
        addLog('success', `🔵 Quỳ chuyển XANH — Môi trường BASE (pH ≈ ${ph.toFixed(1)})`);
      } else { // Neutral range
        if (litmus.litmusState === 'purple') return;
        litmus.litmusState = 'purple';
        addLog('info', `🟣 Quỳ chuyển TÍM — Môi trường TRUNG TÍNH (pH ≈ 7.0)`);
      }
      const litmusEl = document.querySelector(`[data-uid="${litmus.uid}"] svg`);
      if (litmusEl) litmusEl.classList.add('litmus-changing');
      setTimeout(() => litmusEl && litmusEl.classList.remove('litmus-changing'), 700);
      refreshWorkspaceItem(litmus);
    }
  });
}

// ——— STANDALONE REACTION TYPE CHECKERS ———

function getNeutralization(chemA, chemB) {
  if ((chemA.type === 'acid' && chemB.type === 'base') || (chemA.type === 'base' && chemB.type === 'acid')) {
    const acid = chemA.type === 'acid' ? chemA : chemB;
    const base = chemA.type === 'base' ? chemA : chemB;
    
    const catId = base.cation || (base.id === 'nh3' ? 'NH4' : '');
    const aniId = acid.anion || '';
    
    if (!catId || !aniId) return null;

    const vAcid = ION_VALENCIES[aniId.toUpperCase()] || 1; // n in H_n A
    const vBase = ION_VALENCIES[catId.toUpperCase()] || 1; // m in B(OH)_m
    
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const g = gcd(vAcid, vBase);
    
    const coeffAcid = vBase / g;
    const coeffBase = vAcid / g;
    const coeffH2O = (vAcid * vBase) / g;
    
    const saltFormula = balanceAndFormatFormula(catId, aniId);
    
    let eq = "";
    const cA = coeffAcid > 1 ? coeffAcid : "";
    const cB = coeffBase > 1 ? coeffBase : "";
    const cH = coeffH2O > 1 ? coeffH2O : "";
    
    if (base.id === 'nh3') {
      eq = `${cA}${acid.formula} + ${cB}NH₃ → ${saltFormula}`;
    } else {
      eq = `${cA}${acid.formula} + ${cB}${base.formula} → ${saltFormula} + ${cH}H₂O`;
    }

    return {
      equation: eq, type: 'neutralization', effect: 'warm', 
      observation: '⚡ Phản ứng trung hòa tỏa nhiệt, dung dịch nóng lên.',
      colorChange: { end: 'rgba(230, 230, 230, 0.2)' },
      logType: 'success'
    };
  }
  return null;
}


function getGasEvolution(chemA, chemB) {
  const acid = [chemA, chemB].find(c => c.type === 'acid');
  const source = [chemA, chemB].find(c => c.type !== 'acid' && (c.anion === 'CO3' || c.anion === 'HCO3' || c.anion === 'SO3' || c.anion === 'S'));
  
  if (acid && source) {
    const gasType = (source.anion === 'CO3' || source.anion === 'HCO3') ? 'CO₂' : (source.anion === 'SO3' ? 'SO₂' : 'H₂S');
    const saltFormula = balanceAndFormatFormula(source.cation, acid.anion);
    const eq = (source.anion.includes('O')) 
      ? `${acid.formula} + ${source.formula} → ${saltFormula} + H₂O + ${gasType}↑`
      : `${acid.formula} + ${source.formula} → ${saltFormula} + ${gasType}↑`;
    const smell = source.anion === 'S' ? 'mùi trứng thối' : (source.anion === 'SO3' ? 'mùi hắc' : 'không mùi');
    return {
      equation: eq, type: 'gas-evolution', effect: 'bubbles-fast',
      particles: [{ type: 'bubble', color: '#fff', count: 40 }],
      observation: `🫧 Sủi bọt khí ${gasType} ${smell}.`,
      logType: 'warning'
    };
  }
  return null;
}

function getRedoxDisplacement(chemA, chemB) {
  const metal = [chemA, chemB].find(c => c.type === 'metal');
  const salt = [chemA, chemB].find(c => c.type === 'salt');
  if (metal && salt && salt.cation) {
    const series = ['Li','K','Ca','Na','Mg','Al','Zn','Fe','Sn','Pb','H','Cu','Hg','Ag','Au'];
    const mIdx = series.indexOf(metal.id.replace(/\d/g,'').replace('_metal',''));
    const sIdx = series.indexOf(salt.cation.replace(/\d/g,''));
    if (mIdx !== -1 && sIdx !== -1 && mIdx < sIdx) {
      const metalCation = metal.id.toUpperCase().replace('_METAL','') + (metal.id.includes('fe') || metal.id.includes('cu') || metal.id.includes('zn') ? '2' : '');
      const newSaltFormula = balanceAndFormatFormula(metalCation, salt.anion);
      return {
        equation: `${metal.formula} + ${salt.formula} → ${newSaltFormula} + ${salt.cation}`,
        type: 'redox', observation: `💎 Kim loại ${salt.cation} bám vào bề mặt ${metal.formula}.`,
        logType: 'success'
      };
    }
  }
  return null;
}

function getPrecipitation(chemA, chemB) {
  const precipInfo = detectPrecipitate(chemA, chemB);
  if (precipInfo) {
    const isAcatBani = (precipInfo.formula.toUpperCase().includes(chemA.cation?.toUpperCase()) && 
                        precipInfo.formula.toUpperCase().includes(chemB.anion?.toUpperCase()));
    const solubleSalt = isAcatBani ? balanceAndFormatFormula(chemB.cation, chemA.anion) : balanceAndFormatFormula(chemA.cation, chemB.anion);
    return {
      reactants: [chemA.id, chemB.id],
      products: [`${precipInfo.formula}\u2193`, solubleSalt],
      equation: `${chemA.formula} + ${chemB.formula} → ${precipInfo.formula}↓ + ${solubleSalt}`,
      type: 'precipitation',
      effect: 'precipitate-color',
      precipitateColor: precipInfo.particleColor,
      precipitateBg: precipInfo.colorHex,
      particles: [{ type: 'precipitate', color: precipInfo.particleColor, count: 35 }],
      observation: `${precipInfo.icon} Kết tủa **${precipInfo.formula}** xuất hiện — ${precipInfo.colorName}`,
      description: precipInfo.note,
      phenomenaEntry: precipInfo,
      logType: 'success'
    };
  }
  return null;
}

function checkReaction(beaker) {
  const contents = beaker.chemicals;
  if (contents.length < 1) return;

  // 1. THERMODYNAMIC PRECIPITATION CHECK (Global)
  if (window.ChemistryEngine) {
    const precip = window.ChemistryEngine.checkPrecipitation(contents);
    if (precip && beaker.activePrecipitate !== precip.formula) {
      executeReaction(beaker, {
        equation: `Q > Ksp \u2192 ${precip.formula}\u2193`,
        type: 'precipitation',
        precipitateColor: precip.particleColor,
        precipitateBg: precip.colorHex,
        observation: `${precip.icon} Xuất hiện kết tủa **${precip.formula}** (${precip.colorName})`,
        phenomenaEntry: precip,
        logType: 'success'
      });
      return;
    }
  }

  const newChem = contents[contents.length - 1];

  // 1.5 EXPLICIT REACTION CHECK (From data.js EXPLICIT_REACTIONS)
  if (contents.length >= 2 && window.EXPLICIT_REACTIONS) {
    for (let i = 0; i < contents.length - 1; i++) {
      const oldChemSum = contents[i];
      const key1 = `${oldChemSum.id}+${newChem.id}`;
      const key2 = `${newChem.id}+${oldChemSum.id}`;
      const rMatch = window.EXPLICIT_REACTIONS[key1] || window.EXPLICIT_REACTIONS[key2];
      
      if (rMatch) {
        // Rút gọi log phản ứng để tránh lặp
        executeReaction(beaker, rMatch);
        return;
      }
    }
  }

  // 2. DISSOLUTION CHECK (Against active precipitate)
  if (beaker.activePrecipitate) {
    const dissolution = checkDissolution(beaker, newChem);
    if (dissolution) {
      executeReaction(beaker, {
        equation: dissolution.equation,
        type: 'dissolution',
        effect: dissolution.effect || 'bubbles-fast',
        observation: `✨ ${dissolution.observation}`,
        clearPrecipitate: true,
        logType: 'info'
      });
      return;
    }
  }

  // --- NEW: ADVANCED 3-COMPONENT REACTION CHECK ---
  if (contents.length >= 3) {
    for (let i = 0; i < contents.length - 2; i++) {
      for (let j = i + 1; j < contents.length - 1; j++) {
        const ids = [contents[i].id, contents[j].id, newChem.id].sort();
        const key = ids.join('+');
        const rMatch = window.REACTIONS?.[key];
        if (rMatch) {
          executeReaction(beaker, rMatch);
          return;
        }
      }
    }
  }

  if (contents.length < 2) return;

  // 3. COMBUSTION CHECK (O2 + Heat)
  if (window.ChemistryEngine) {
    const localEnv = { ...(state.environment || {}), isHeating: beaker.isHeating };
    const combustion = window.ChemistryEngine.checkCombustion(contents, localEnv);
    if (combustion) {
      const effect = window.PHENOMENA_DB.getCombustionEffect(combustion.fuel.id);
      executeReaction(beaker, {
        equation: `${combustion.fuel.formula} + O₂ \u2192 Oxide`,
        type: 'combustion',
        effect: effect.effect,
        observation: effect.msg,
        logType: 'danger'
      });
      return;
    }
  }

  // --- NEW: SYNTHESIS / PREPARATION CHECK ---
  if (window.ChemistryEngine) {
    const localEnv = { ...(state.environment || {}), isHeating: beaker.isHeating };
    const synth = window.ChemistryEngine.checkSynthesisReactions(contents, localEnv);
    if (synth) {
      if (synth.type === 'hint') {
        // Chỉ log gợi ý nếu chưa log gần đây cho beaker này
        if (!beaker._lastHintId || beaker._lastHintId !== synth.id) {
          addLog('info', synth.message);
          beaker._lastHintId = synth.id;
        }
        return;
      }
      
      const rData = window.REACTIONS[synth.key] || window.HEAT_REACTIONS[synth.key];
      if (rData) {
        executeReaction(beaker, rData);
        // Reset hint khi phản ứng thật sự xảy ra
        beaker._lastHintId = null;
        return;
      }
    }
  }

  // 4. GUNPOWDER REACTION CHECK (3 agents)
  if (window.ChemistryEngine) {
    const localEnv = { ...(state.environment || {}), isHeating: beaker.isHeating };
    const gunpowder = window.ChemistryEngine.checkGunpowder(contents, localEnv);
    if (gunpowder) {
      // ƯU TIÊN hiển thị hỗn hợp trước nếu chưa mixed, trừ khi đang đun nóng thì nổ ngay
      if (gunpowder.type === 'gunpowder_mixture' || (gunpowder.type === 'gunpowder_explosion' && !beaker._gunpowderMixed)) {
        const isAlreadyMixed = beaker._gunpowderMixed;
        if (!isAlreadyMixed) {
          beaker._gunpowderMixed = true;
          // Đổi màu sang đen xám như bột thuốc súng
          beaker.liquidColor = 'rgba(20,15,10,0.95)';
          beaker.liquidLevel = Math.max(beaker.liquidLevel || 0, 40);
          
          updateActiveReactionDisplay({
            equation: '2KNO₃ + S + 3C ⟶ Hỗn hợp thuốc súng đen',
            observation: '🧨 Hỗn hợp bột đen hình thành. Thêm nguồn NHIỆT để kích nổ!',
            synthesis: { name: '🧨 Đang điều chế: THUỐC SÚNG ĐEN', icon: '💣', category: 'Thuốc súng / Pháo hoa' }
          });
          addLog('danger', '💣 Đã tạo hỗn hợp thuốc súng đen! ĐỪNG đưa gần lửa!');
          refreshWorkspaceItem(beaker);
          
          // Nếu đang đun nóng thì nổ ngay sau khi hiện thông báo
          if (localEnv.isHeating) {
            setTimeout(() => {
              triggerGunpowderExplosion(beaker, gunpowder);
            }, 1500);
            return;
          }
        }
      } 
      
      if (gunpowder.type === 'gunpowder_explosion' && beaker._gunpowderMixed) {
        triggerGunpowderExplosion(beaker, gunpowder);
        return;
      }
    }
  }

  // 5. MULTI-REACTION LOOP
  for (let i = 0; i < contents.length - 1; i++) {
    const oldChem = contents[i];
    
    // Check Metal Displacement
    if (window.ChemistryEngine) {
      const disp = window.ChemistryEngine.checkMetalDisplacement([oldChem, newChem]);
      if (disp) {
        executeReaction(beaker, {
          equation: `${oldChem.formula} + ${newChem.formula} \u2192 ...`,
          type: 'displacement',
          observation: disp.message,
          logType: 'info'
        });
        continue;
      }
    }

    // Check Neutralization
    const rNeut = getNeutralization(oldChem, newChem);
    if (rNeut) executeReaction(beaker, rNeut);

    // Check Gas Evolution
    const rGas = getGasEvolution(oldChem, newChem);
    if (rGas) executeReaction(beaker, rGas);

    // Check Redox Displacement
    const rRedox = getRedoxDisplacement(oldChem, newChem);
    if (rRedox) executeReaction(beaker, rRedox);

    // Check Precipitation (using DB)
    const rPrec = getPrecipitation(oldChem, newChem);
    if (rPrec) executeReaction(beaker, rPrec);
    
    // Check Fallback Salt-Salt
    if (!rPrec && oldChem.type === 'salt' && newChem.type === 'salt') {
      const catA = oldChem.cation, aniA = oldChem.anion;
      const catB = newChem.cation, aniB = newChem.anion;
      const insolubles = [
        { c: 'Ag', a: 'Cl' }, { c: 'Ag', a: 'Br' }, { c: 'Ag', a: 'I' },
        { c: 'Ba', a: 'SO4' }, { c: 'Pb', a: 'SO4' }, { c: 'Pb2', a: 'SO4' },
        { c: 'Ca', a: 'CO3' }, { c: 'Ba', a: 'CO3' }
      ];
      const pot1 = insolubles.find(ins =>
        (catA?.includes(ins.c) && aniB === ins.a) || (catB?.includes(ins.c) && aniA === ins.a)
      );
      if (pot1) {
        const pStr = balanceAndFormatFormula(pot1.c, pot1.a);
        const soluble = balanceAndFormatFormula(catA?.includes(pot1.c) ? catB : catA, aniA === pot1.a ? aniB : aniA);
        executeReaction(beaker, {
          equation: `${oldChem.formula} + ${newChem.formula} → ${pStr}↓ + ${soluble}`,
          type: 'precipitation', effect: 'precipitate-color',
          precipitateColor: 'rgba(241,245,249,0.9)',
          precipitateBg: '#f1f5f9',
          observation: `⚪ Kết tủa trắng ${pStr} xuất hiện.`,
          logType: 'info'
        });
      }
    }
  }

  // 4. GLOBAL INDICATOR PHENOMENA
  const indicator = contents.find(c => c.type === 'indicator');
  if (indicator) {
    const acidBase = contents.find(c => c.type === 'acid' || c.type === 'base');
    if (acidBase) {
      let newColor = 'rgba(230, 230, 230, 0.2)';
      let obs = '';
      if (indicator.id === 'litmus') {
        newColor = acidBase.type === 'acid' ? 'rgba(255, 0, 0, 0.4)' : 'rgba(0, 0, 255, 0.4)';
        obs = `🎨 Quỳ tím chuyển ${acidBase.type === 'acid' ? 'ĐỎ' : 'XANH'}.`;
      } else if (indicator.id === 'phenolphthalein') {
        newColor = acidBase.type === 'base' ? 'rgba(255, 0, 150, 0.6)' : 'rgba(255, 255, 255, 0.1)';
        obs = `🎨 Phenolphthalein chuyển ${acidBase.type === 'base' ? 'HỒNG CÁNH SEN' : 'KHÔNG MÀU'}.`;
      }
      if (obs) {
        executeReaction(beaker, { equation: 'Chỉ thị + pH', type: 'indicator-change', observation: obs, colorChange: { end: newColor }, logType: 'info' });
      }
    }
  }
}

// ——— PHÁT HIỆN KẾT TỦA TỪ PHENOMENA_DB ———
function detectPrecipitate(chemA, chemB) {
  if (!window.PHENOMENA_DB) return null;
  const db = window.PHENOMENA_DB.precipitates;

  // Trình chuẩn hóa (giữ nguyên số để phân biệt Fe2/Fe3)
  const norm = (s) => (s || '').toUpperCase().trim();

  // Lấy cation/anion của mỗi chất
  const catA = (chemA.cation || '');
  const aniA = (chemA.anion || '');
  const catB = (chemB.cation || '');
  const aniB = (chemB.anion || '');

  // Kiểm tra cặp catA + aniB và catB + aniA
  const pairs = [
    { cat: catA, ani: aniB },
    { cat: catB, ani: aniA },
  ];

  for (const { cat, ani } of pairs) {
    if (!cat || !ani) continue;
    const nCat = norm(cat);
    const nAni = norm(ani);

    const match = db.find(p => {
      if (!p.trigger) return false;
      const pc = norm(p.trigger.cation);
      const pa = norm(p.trigger.anion);
      // So khớp chính xác ID hoặc tiền tố (ví dụ Ag match Ag)
      return nCat === pc && nAni === pa;
    });
    
    if (match) return match;
  }

  // Luôn kiểm tra thêm NaOH + muối kim loại (tạo OH kết tủa)
  const base = [chemA, chemB].find(c => c.type === 'base' || c.anion === 'OH');
  const salt = [chemA, chemB].find(c => (c.type === 'salt' || c.type === 'oxide') && c !== base);

  if (base && salt && salt.cation) {
    const metalCat = norm(salt.cation);
    const ohMatch = db.find(p =>
      p.trigger && norm(p.trigger.anion) === 'OH' &&
      norm(p.trigger.cation) === metalCat
    );
    if (ohMatch) return ohMatch;
  }

  return null;
}

/** Kiểm tra xem chất mới thêm vào có hòa tan được kết tủa hiện tại không */
function checkDissolution(container, reagent) {
  if (!window.PHENOMENA_DB.dissolutions || !container.activePrecipitate) return null;
  const active = container.activePrecipitate;
  
  return window.PHENOMENA_DB.dissolutions.find(d => {
    const isMatchingPrecipitate = Array.isArray(d.precipitates) 
      ? d.precipitates.includes(active) 
      : d.precipitates === active;
    
    if (!isMatchingPrecipitate) return false;

    // So khớp theo loại reagent (acid/base/NH3)
    if (d.reagent === 'acid' && reagent.type === 'acid') return true;
    if (d.reagent === 'base' && reagent.type === 'base') return true;
    if (d.reagent === 'NH3' && reagent.id === 'nh3') return true;
    if (d.reagent === reagent.id) return true;

    return false;
  });
}

// ——— EXECUTE REACTION ———
function executeReaction(container, reaction) {
  // Clear old display info before starting new one
  const rd = document.getElementById('activeReactionDisplay');
  if (rd) rd.style.opacity = '1';

  const isDangerous = (reaction.hazardLevel >= 2);
  let missingSafety = [];

  // Check if dangerous and no safety
  if (isDangerous && reaction.requiresSafety) {
    missingSafety = reaction.requiresSafety.filter(s => !state.safetyEquipped.has(s));
  }

  // Hàm thực thi hiệu ứng (đẩy lùi thời gian nếu nguy hiểm)
  const performEffects = () => {
    // Ngăn chặn nếu người dùng đã reset beaker trong lúc chờ
    if (!container || !container.chemicals) return;

    // Flash màn hình nếu phản ứng chân thực (nổ/cháy)
    if (isDangerous) {
      if (typeof window.triggerFlash === 'function') window.triggerFlash();
      
      // Kích hoạt nổ rung lắc mạnh
      document.body.classList.add('shake');
      setTimeout(() => {
        document.body.classList.remove('shake');
      }, 1000);
    }

    // Bật trạng thái phản ứng để vẽ Ma trận Phân tử
    container.isReacting = true;
    setTimeout(() => { if(container) container.isReacting = false; }, 8000);

    // Apply color change
    if (reaction.colorChange?.end) {
      container.liquidColor = reaction.colorChange.end;
    }

    // Apply precipitate color to liquid
    if (reaction.precipitateBg) {
      const pColor = reaction.precipitateBg;
      container.precipitateColor = reaction.precipitateColor || pColor;
      if (reaction.phenomenaEntry) {
        container.activePrecipitate = reaction.phenomenaEntry.formula;
      }
    }

    // Clear precipitate if requested (Dissolution)
    if (reaction.clearPrecipitate) {
      container.precipitateColor = null;
      container.activePrecipitate = null;
    }

    // Particle effects
    const scale = container.scale || 1;
    const cx = container.x + 40 * scale;
    const cy = container.y + (container.liquidLevel ? (100 - container.liquidLevel) : 40) * scale;
    triggerReactionEffect(reaction.effect, cx, cy, reaction, scale);

    // Âm thanh nổ (nếu không vỡ)
    if (reaction.type === 'explosion' && !reaction.shatter) {
        AudioSystem.playExplosion();
    }

    // Toxic gas overlay
    if (reaction.toxicGas) {
      showToxicOverlay(`⚠️ Khí ${reaction.toxicGas.formula} độc đang thoát ra! Bật tủ hút ngay!`);
      setTimeout(hideToxicOverlay, 5000);
    }

    // Thiết lập vỡ cốc
    if (reaction.shatter) {
        setTimeout(() => {
            addLog('danger', `💥 VỤ NỔ QUÁ LỚN! Dụng cụ chứa đã bị phá hủy!`);
            // Phát âm thanh vỡ
            AudioSystem.playShatter();
            // Xóa cốc
            const index = state.workspaceItems.findIndex(it => it.uid === container.uid);
            if (index !== -1) {
                state.workspaceItems.splice(index, 1);
                const el = document.querySelector(`[data-uid="${container.uid}"]`);
                if (el) el.remove();
            }
        }, 100);
    }

    // Log
    addLog(reaction.logType || 'info', `[PHẢN_ỨNG] ${reaction.equation}`);
    
    // Thermodynamic info
    if (window.ChemistryEngine) {
      const thermalDesc = window.ChemistryEngine.getThermalEffect(reaction);
      addLog('info', `[NHIỆT_ĐỘNG] ${thermalDesc}`);
    }

    if (reaction.observation) {
      addLog('warning', `[QUAN_SÁT] ${reaction.observation}`);
    }

    // Cập nhật bảng hiển thị phản ứng persistent
    updateActiveReactionDisplay(reaction);

    // --- IDCL: EMIT REACTION COMPLETE EVENT (Observer Pattern) ---
    window.dispatchEvent(new CustomEvent('chemistry:reaction-complete', {
      detail: {
        equation: reaction.equation,
        type: reaction.type,
        reactants: container.chemicals.map(c => c.id),
        container: { uid: container.uid }
      }
    }));

    // Refresh
    refreshWorkspaceItem(container);
  };

  if (isDangerous) {
    // Khóa tạm container vô thời hạn cho tới khi người dùng nhấn "Đã hiểu"
    container.isReacting = true;
    document.body.classList.add('shake'); // Rung nhẹ cảnh báo
    setTimeout(() => document.body.classList.remove('shake'), 400);

    // 🔊 Phát âm thanh cảnh báo mức độ nguy hiểm cao
    AudioSystem.playAlert(2);

    const safetyDict = { 'goggles': 'Kính bảo hộ', 'gloves': 'Găng tay', 'lab-coat': 'Áo Blouse', 'fume-hood': 'Tủ hút khí độc' };
    const translatedMissing = missingSafety.map(s => safetyDict[s] || s);

    const warnMsg = (reaction.observation || 'Phản ứng này tạo ra các chất cực kỳ nguy hiểm hoặc có rủi ro cháy nổ cao.') + 
                    (missingSafety.length > 0 ? `\n\n⚠️ BẠN ĐANG THIẾU BẢO HỘ: ${translatedMissing.join(', ')}` : '');

    let titleType = 'PHẢN ỨNG MÃNH LIỆT SẮP XẢY RA!';
    let headerColor = '#dc2626'; // Red default
    
    if (reaction.hazardType === 'toxic' || reaction.toxicGas) {
        titleType = '☠️ NGUY HIỂM: KHÍ ĐỘC CHẾT NGƯỜI!';
        headerColor = '#9333ea'; // Purple for toxic
    } else if (reaction.hazardType === 'burn' || reaction.effect === 'acid-splatter') {
        titleType = '🔥 CẢNH BÁO: BỎNG HÓA CHẤT / VĂNG BẮN ACID!';
        headerColor = '#ea580c'; // Orange for burn
    } else if (reaction.hazardType === 'explosion' || reaction.effect?.includes('explosion') || reaction.shatter) {
        titleType = '⚠️ CẢNH BÁO: NGUY CƠ CHÁY NỔ LỚN!';
        headerColor = '#dc2626'; // Red
    }

    showDanger(titleType, warnMsg, () => {
      // Dừng cảnh báo khi người dùng đã xác nhận
      AudioSystem.stopAlert();
      container.isReacting = false;
      // Đợi một chút sau khi tắt cảnh báo mới nổ (tạo độ kịch tính)
      setTimeout(performEffects, 500);
    }, headerColor);
  } else {
    performEffects();
  }
}



/**
 * Tự động tạo cơ chế giải thích học thuật dựa trên loại phản ứng
 * @param {Object} reaction Đối tượng phản ứng từ data.js
 * @returns {string} Chuỗi văn bản cơ chế đã được format
 */
function generateAcademicMechanism(reaction) {
  const type = reaction.type || 'general';
  const r = reaction.reactants || [];
  const p = reaction.products || [];
  
  const templates = {
    'precipitation': () => {
      const p1 = p[0] || 'Chất mới';
      return `Phản ứng trao đổi ion trong dung dịch. Các ion tự do di chuyển và va chạm với nhau. Ion dương và ion âm có ái lực mạnh kết hợp tạo thành mạng tinh thể của $${p1}$ không tan. Chất rắn này tách ra khỏi pha lỏng dưới dạng kết tủa.`;
    },
    'neutralization': () => {
      return `Đây là phản ứng đặc trưng giữa acid và base. Các ion $H^+$ từ acid kết hợp với ion $OH^-$ từ base theo tỉ lệ 1:1. Sản phẩm tạo thành là phân tử nước ($H_2O$) rất bền vững, đồng thời giải phóng nhiệt lượng (phản ứng tỏa nhiệt).`;
    },
    'acid-metal': () => {
      const m = r[0] || 'Kim loại';
      return `Phản ứng oxy hóa - khử. Kim loại nhường electron cho các ion $H^+$ trong dung dịch acid. Ion $H^+$ bị khử thành các nguyên tử $H$, sau đó kết hợp thành phân tử khí $H_2$ bay ra ngoài. Kim loại bị oxy hóa thành ion dương và tan vào dung dịch.`;
    },
    'acid-carbonate': () => {
      return `Acid mạnh tấn công vào gốc carbonate ($CO_3^{2-}$). Phản ứng tạo ra acid yếu $H_2CO_3$ không bền. Ngay lập tức, $H_2CO_3$ phân hủy thành nước và khí $CO_2$. Sự thoát khí mạnh mẽ tạo ra hiện tượng sủi bọt đặc trưng.`;
    },
    'thermal-decomposition': () => {
      return `Dưới tác dụng của nhiệt năng, các liên kết hóa học trong phân tử bị bẻ gãy. Cấu trúc phức tạp ban đầu bị phân tách thành các chất đơn giản hơn. Phản ứng này thường hấp thụ nhiệt lượng từ môi trường để phá vỡ các liên kết nội phân tử.`;
    },
    'displacement': () => {
      return `Phản ứng thế giữa kim loại mạnh và dung dịch muối. Kim loại mạnh hơn nhường electron cho ion kim loại yếu hơn trong dung dịch. Kim loại mạnh tan ra thành ion, còn kim loại yếu bị khử thành nguyên tử tự do và bám vào bề mặt chất rắn.`;
    },
    'gas-evolution': () => {
      return `Các chất tham gia phản ứng tạo ra một sản phẩm ở trạng thái khí ở điều kiện thường. Do nồng độ khí vượt quá độ hòa tan trong chất lỏng, các phân tử khí tụ lại tạo thành bọt khí và thoát ra khỏi bề mặt dung dịch.`;
    },
    'combustion': () => {
      return `Phản ứng oxy hóa mạnh với Oxy. Các liên kết trong chất cháy bị phá vỡ hoàn toàn, kết hợp với Oxy giải phóng lượng nhiệt và ánh sáng rất lớn. Sản phẩm thường là các oxide cao nhất của các nguyên tố thành phần.`;
    },
    'esterification': () => {
      return `Xúc tác $H^+$ proton hóa nhóm carbonyl của acid, làm tăng hoạt tính điện tử. Phân tử rượu tấn công nucleophile vào carbon carbonyl tạo phức trung gian. Sau khi tách nước và loại proton, liên kết Ester được hình thành.`;
    },
    'saponification': () => {
      return `Sự thủy phân Este trong môi trường kiềm. Ion $OH^-$ tấn công vào carbon của nhóm chức este. Liên kết $C-O$ bị đứt gãy, giải phóng rượu và tạo muối của acid béo (xà phòng). Đây là phản ứng một chiều.`;
    },
    'complexation': () => {
      return `Sự hình thành liên kết phối trí. Ion kim loại trung tâm có các orbital trống nhận cặp electron tự do từ các ligand (như $NH_3$, $OH^-$). Kết quả tạo thành một ion phức có cấu trúc hình học xác định và màu sắc đặc trưng.`;
    },
    'halogen-replacement': () => {
      return `Dựa trên độ hoạt động hóa học của các phi kim Halogen. Halogen mạnh hơn (ở trên trong nhóm VIIA) sẽ đẩy Halogen yếu hơn ra khỏi dung dịch muối của nó bằng cách chiếm lấy electron để trở thành ion âm bền vững hơn.`;
    },
    'hydrolysis': () => {
      return `Sự phân hủy chất hóa học dưới tác dụng của phân tử nước. Nước tấn công vào các liên kết nhạy cảm (như liên kết peptide, este, hoặc muối của acid/base yếu) làm đứt gãy mạch phân tử ban đầu thành các mảnh nhỏ hơn.`;
    },
    'gunpowder_mixture': () => {
      return `Hỗn hợp thuốc súng đen cơ bản gồm chất oxy hóa ($KNO_3$), chất khử ($C$) và chất nhạy nhiệt ($S$). Ở trạng thái tĩnh, các hạt chất rắn chỉ tiếp xúc bề mặt và chưa có phản ứng hóa học xảy ra.`;
    },
    'gunpowder_explosion': () => {
      return `Khi có nhiệt độ kích hoạt, $KNO_3$ bị nhiệt phân giải phóng Oxy. Oxy nguyên tử cực kỳ hoạt động tấn công Carbon và Lưu huỳnh tạo ra phản ứng cháy chuỗi. Thể tích khí ($N_2, CO_2$) giãn nở đột ngột tạo ra áp suất cực lớn dẫn đến tiếng nổ.`;
    },
    'starch_test': () => {
      return `Phân tử Amylase trong tinh bột có cấu trúc xoắn rỗng. Các phân tử Iot ($I_2$) chui vào bên trong các vòng xoắn này tạo thành phức chất màu xanh tím đặc trưng. Đây là hiện tượng vật lý hấp phụ, màu sẽ biến mất khi đun nóng.`;
    },
    'glucose+yeast': () => {
      return `Dưới tác dụng của các enzyme trong men rượu, phân tử đường Glucose ($C_6H_{12}O_6$) bị phân giải. Quá trình chuyển hóa kỵ khí này giải phóng Ethanol ($C_2H_5OH$) và sủi bọt khí Carbon dioxide ($CO_2$).`;
    },
    'cac2+h2o': () => {
      return `Canxi carbide ($CaC_2$) tác dụng mạnh với nước. Liên kết Carbide bị đứt gãy, nguyên tử Carbon kết hợp với Hydro tạo khí Acetylene ($C_2H_2$) có liên kết ba linh động. Đồng thời tạo ra vôi tôi ($Ca(OH)_2$) làm vẩn đục dung dịch.`;
    },
    'synthesis': () => {
      return `Quá trình kết hợp các đơn chất hoặc hợp chất đơn giản để tạo thành một hợp chất mới phức tạp hơn. Phản ứng này thường yêu cầu điều kiện khơi mào như nhiệt độ cao hoặc xúc tác để phá vỡ các liên kết cũ.`;
    },
    'nitration': () => {
      return `Phản ứng thế vào vòng thơm. Acid $H_2SO_4$ đặc đóng vai trò tách nước từ $HNO_3$ tạo ion nitronium ($NO_2^+$) cực kỳ hoạt động. Ion này tấn công vào các vị trí giàu mật độ electron để gắn nhóm $-NO_2$.`;
    },
    'oxidation': () => {
      return `Sự tăng số oxy hóa của nguyên tố. Tác nhân oxy hóa mạnh (như $KMnO_4, K_2Cr_2O_7$) chiếm electron của chất khử, làm đứt gãy liên kết hoặc thay đổi bậc của nhóm chức trong hợp chất hữu cơ.`;
    },
    'redox-oxidizer': () => {
      return `Phản ứng oxy hóa - khử mạnh. Chất oxy hóa mạnh chiếm electron từ chất khử (như $Cl^-$, kim loại), làm thay đổi trạng thái oxy hóa và tạo ra các sản phẩm mới như khí độc hoặc thay đổi màu sắc rõ rệt.`;
    },
    'redox-titration': () => {
      return `Phản ứng chuẩn độ Oxy hóa - Khử. Phản ứng xảy ra định lượng và nhanh chóng. Điểm tương đương thường được nhận biết bằng sự mất màu của thuốc tím hoặc sự thay đổi màu sắc của các chỉ thị redox.`;
    },
    'complex-formation': () => {
      return `Sự hình thành liên kết phối trí giữa ion kim loại trung tâm và các phối tử (Ligand). Các cặp electron tự do của phối tử đi vào các orbital trống của ion kim loại tạo thành phức chất tan có màu sắc rực rỡ.`;
    },
    'organic-redox': () => {
      return `Sự thay đổi số oxy hóa trong các hợp chất hữu cơ. Ví dụ: nhóm Aldehyde bị oxy hóa thành nhóm Carboxyl, đồng thời ion kim loại ($Ag^+, Cu^{2+}$) bị khử thành kim loại hoặc oxide hóa trị thấp hơn.`;
    },
    'indicator-complex': () => {
      return `Sự tương tác giữa chất chỉ thị và cơ chất (như Tinh bột và Iot). Đây thường là quá trình hấp phụ vật lý hoặc tạo phức bao bọc, tạo ra màu sắc đặc trưng giúp nhận biết sự có mặt của chất.`;
    },
    'amphoteric-reaction': () => {
      return `Phản ứng của chất lưỡng tính (như $Al_2O_3, ZnO$). Chất này có khả năng phản ứng với cả acid mạnh và base mạnh để tạo ra muối tan, thể hiện tính chất hóa học linh hoạt.`;
    },
    'amphoteric-dissolution': () => {
      return `Sự hòa tan kết tủa lưỡng tính trong kiềm dư. Kết tủa ban đầu (như $Al(OH)_3, Zn(OH)_2$) phản ứng tiếp với ion $OH^-$ dư để tạo thành các phức tan (Aluminate, Zincat), làm trong suốt dung dịch.`;
    },
    'color-test': () => {
      return `Phản ứng định tính đặc trưng để nhận biết ion. Sự tạo thành một hợp chất có hằng số bền lớn và màu sắc cực kỳ nổi bật (như phức đỏ máu Fe(SCN)₃) giúp phát hiện vết của chất trong dung dịch.`;
    },
    'alkyne-recognition': () => {
      return `Phản ứng thế nguyên tử $H$ linh động ở liên kết ba đầu mạch bằng ion kim loại ($Ag^+$). Phản ứng tạo ra kết tủa màu vàng đặc trưng, dùng để phân biệt Alkyne-1 với các hydrocarbon khác.`;
    },
    'addition': () => {
      return `Phản ứng cộng vào liên kết bội ($C=C$ hoặc $C≡C$). Các tác nhân như $H_2, HCl, H_2O$ phá vỡ liên kết pi để gắn vào các nguyên tử carbon, làm bão hòa mạch hydrocarbon.`;
    },
    'hydration': () => {
      return `Phản ứng cộng nước vào liên kết bội (thường cần xúc tác acid hoặc muối thủy ngân). Quá trình này biến alkene thành rượu hoặc alkyne thành aldehyde/ketone tương ứng.`;
    },
    'addition-halogen': () => {
      return `Phản ứng cộng Halogen ($Br_2, Cl_2$) vào liên kết pi. Hiện tượng mất màu đặc trưng của dung dịch Halogen là dấu hiệu nhận biết các hợp chất hữu cơ không no.`;
    },
    'acid-base-gas': () => {
      return `Phản ứng giữa acid và base ở trạng thái khí hoặc tạo sản phẩm khí ngay lập tức. Sự kết hợp tạo ra các hạt tinh thể muối siêu nhỏ lơ lửng trong không khí, tạo ra hiện tượng khói trắng ngoạn mục.`;
    },
    'metal-base': () => {
      return `Phản ứng của kim loại lưỡng tính (như $Al, Zn$) với dung dịch kiềm mạnh. Kim loại vừa phá vỡ lớp oxide bảo vệ, vừa phản ứng giải phóng khí $H_2$ và tạo muối tan của kim loại trong base.`;
    },
    'acid-dilution-error': () => {
      return `Phản ứng tỏa nhiệt cực lớn khi hòa tan các oxide acid đậm đặc (như $SO_3, H_2SO_4$ đặc) vào nước. Nhiệt lượng giải phóng làm nước sôi đột ngột và bắn ra ngoài cùng acid, cực kỳ nguy hiểm.`;
    },
    'no-reaction': () => {
      return `Hệ thống không ghi nhận phản ứng hóa học xảy ra. Có thể do kim loại đứng sau Hydro trong dãy hoạt động, hoặc các chất tham gia không có ái lực hóa học đủ mạnh ở điều kiện hiện tại.`;
    },
    'acid-base': () => `Phản ứng trung hòa giữa acid và base tạo thành muối và nước. Các ion $H^+$ và $OH^-$ kết hợp tạo thành phân tử nước bền vững.`,
    'acid-displacement': () => `Kim loại mạnh đẩy ion $H^+$ ra khỏi acid để giải phóng khí Hydro. Đây là phản ứng oxy hóa - khử điển hình.`,
    'acid-oxide': () => `Acid tác dụng với oxide base tạo thành muối và nước. Đây là phản ứng trao đổi đặc trưng giúp hòa tan các oxide kim loại.`,
    'oxide-acid': () => `Acid tác dụng với oxide base tạo thành muối và nước. Đây là phản ứng trao đổi đặc trưng giúp hòa tan các oxide kim loại.`,
    'acid-salt': () => `Acid mạnh đẩy acid yếu ra khỏi muối, hoặc phản ứng tạo thành chất kết tủa/bay hơi. Đây là điều kiện để phản ứng trao đổi xảy ra.`,
    'base-salt': () => `Base tác dụng với muối tạo thành base mới và muối mới. Điều kiện là ít nhất một trong hai sản phẩm phải là chất kết tủa hoặc bay hơi.`,
    'salt-base': () => `Base tác dụng với muối tạo thành base mới và muối mới. Điều kiện là ít nhất một trong hai sản phẩm phải là chất kết tủa hoặc bay hơi.`,
    'base-oxide': () => `Base (kiềm) tác dụng với oxide acid tạo thành muối và nước. Đây là phản ứng đặc trưng của các oxide phi kim.`,
    'oxide-base': () => `Base (kiềm) tác dụng với oxide acid tạo thành muối và nước. Đây là phản ứng đặc trưng của các oxide phi kim.`,
    'oxide-oxide': () => `Sự kết hợp giữa oxide base và oxide acid để tạo thành muối tương ứng ở nhiệt độ cao.`,
    'oxide-water': () => `Oxide tác dụng với nước. Oxide base tan tạo thành dung dịch kiềm, oxide acid tan tạo thành dung dịch acid.`,
    'metal-oxygen': () => `Kim loại phản ứng với Oxy tạo thành oxide kim loại. Phản ứng thường tỏa nhiều nhiệt và có thể kèm theo hiện tượng phát sáng (cháy).`,
    'metal-water': () => `Kim loại mạnh (kiềm/kiềm thổ) tác dụng với nước ở nhiệt độ thường giải phóng khí $H_2$ và tạo thành dung dịch base mạnh.`,
    'decomposition': () => `Sự phân tách một chất thành hai hay nhiều chất đơn giản hơn dưới tác dụng của nhiệt, điện hoặc ánh sáng.`,
    'catalytic-decomposition': () => `Sự phân hủy chất dưới tác dụng của chất xúc tác (như $MnO_2$ cho $H_2O_2$). Chất xúc tác làm giảm năng lượng hoạt hóa, giúp phản ứng xảy ra nhanh hơn.`,
    'equilibrium': () => `Phản ứng thuận nghịch. Ở trạng thái cân bằng, tốc độ phản ứng thuận bằng tốc độ phản ứng nghịch, nồng độ các chất trong hệ không thay đổi.`,
    'dehydration': () => `Quá trình tách phân tử nước ra khỏi hợp chất. Acid $H_2SO_4$ đặc thường được dùng làm tác nhân hút nước mạnh trong các phản ứng này.`,
    'hydrogenation': () => `Phản ứng cộng Hydro ($H_2$) vào liên kết bội dưới tác dụng của xúc tác ($Ni, Pd, Pt$) và nhiệt độ, biến hợp chất không no thành hợp chất no.`,
    'ester': () => `Phản ứng giữa acid hữu cơ và rượu tạo thành este và nước. Đây là phản ứng thuận nghịch, thường cần acid mạnh làm xúc tác.`,
    'ester-hydrolysis': () => `Sự thủy phân este trong môi trường acid (thuận nghịch) hoặc kiềm (một chiều - xà phòng hóa) để tái tạo lại rượu và acid/muối tương ứng.`,
    'alkane-substitution': () => `Phản ứng đặc trưng của hydrocarbon no. Dưới tác dụng của ánh sáng, nguyên tử Halogen thế chỗ nguyên tử Hydro trong mạch carbon.`,
    'high-temp-reduction': () => `Sự khử oxide kim loại bằng các chất khử mạnh ($C, CO, H_2, Al$) ở nhiệt độ cao để thu được kim loại tự do.`,
    'redox': () => `Phản ứng oxy hóa - khử tổng quát, trong đó có sự chuyển dịch electron giữa các chất phản ứng, làm thay đổi số oxy hóa của các nguyên tố.`,
    'organic-complex': () => `Sự hình thành phức chất hữu cơ (như phức đồng-saccarozo). Các nhóm chức hữu cơ đóng vai trò phối tử tạo liên kết phối trí với ion kim loại.`,
    'organic-oxidation': () => `Sự oxy hóa các hợp chất hữu cơ bởi các tác nhân mạnh, thường dẫn đến sự thay đổi nhóm chức hoặc đứt gãy mạch carbon.`,
    'organic-substitution': () => `Phản ứng thế trong hóa hữu cơ, nơi một nguyên tử hoặc nhóm nguyên tử được thay thế bằng một nhóm chức khác.`,
    'organic-saponification': () => `Phản ứng thủy phân chất béo hoặc este trong môi trường kiềm để tạo ra xà phòng và glycerol.`,
    'addition-polymerization': () => `Quá trình kết hợp nhiều monome thành polyme bằng cách đứt gãy liên kết pi mà không giải phóng phân tử nhỏ.`,
    'elimination': () => `Phản ứng tách các nguyên tử từ hai carbon cạnh nhau để hình thành liên kết bội, thường kèm theo sự giải phóng phân tử nhỏ như nước hoặc $HX$.`,
    'halide-hydrolysis': () => `Sự thủy phân dẫn xuất halogen trong môi trường kiềm để tạo thành rượu hoặc muối tương ứng.`,
    'dissolution': () => `Quá trình hòa tan chất rắn vào dung dịch. Các phân tử dung môi bao quanh và tách các hạt chất tan ra khỏi khối chất rắn.`,
    'diffusion': () => `Sự khuếch tán của các phân tử khí hoặc chất tan từ vùng có nồng độ cao đến vùng có nồng độ thấp do chuyển động nhiệt.`,
    'gas-reaction': () => `Phản ứng xảy ra giữa các chất ở trạng thái khí, thường có tốc độ phản ứng rất nhanh do các phân tử va chạm dễ dàng.`,
    'Nhiệt phân đá vôi': () => `Sự phân hủy $CaCO_3$ ở nhiệt độ cao (khoảng $900^\circ C$) để tạo thành vôi sống ($CaO$) và khí $CO_2$. Đây là phản ứng thu nhiệt mạnh.`,
    'Nhiệt phân muối kiềm': () => `Sự phân hủy các muối nitrate hoặc chlorate của kim loại kiềm giải phóng Oxy, tạo ra môi trường oxy hóa cực mạnh.`,
    'Phân hủy base không tan': () => `Các base không tan (như $Cu(OH)_2, Fe(OH)_3$) bị nhiệt phân tạo thành oxide kim loại và nước.`,
    'Phân hủy giải phóng Oxi': () => `Phản ứng phân hủy các hợp chất giàu Oxy (như $KClO_3, KMnO_4$) để thu khí Oxy trong phòng thí nghiệm.`
  };

  const genFn = templates[type] || (() => {
    if (reaction.description) return reaction.description;
    return 'Cơ chế phản ứng đang được hệ thống phân tích. Vui lòng quan sát hiện tượng thực tế và phương trình hóa học hiển thị bên phải.';
  });
  return genFn();
}

function updateActiveReactionDisplay(reaction) {

  const display = document.getElementById('activeReactionDisplay');
  const eqEl = document.getElementById('ardEquation');
  const obsEl = document.getElementById('ardObservation');
  
  if (!display || !eqEl || !obsEl) return;

  // Notify Chatbot AI
  if (window.chatbot) window.chatbot.notify('reaction', reaction);

  // Format equation with subscripts if needed
  let displayEq = (reaction.equation || '').replace(/->/g, '→');
  if (window.formatFormulaSubscripts) {
    // Basic heuristic: if it doesn't already have Unicode subscripts, apply them
    if (!/[₀₁₂₃₄₅₆₇₈₉]/.test(displayEq)) {
       displayEq = window.formatFormulaSubscripts(displayEq);
    }
  }

  eqEl.textContent = displayEq;
  obsEl.innerHTML = (reaction.observation || '').replace(/\*\*/g, '<strong>').replace(/<strong>/g, '</strong>');

  // Remove old ardExplanation logic, redirect to new panel
  let textToShow = reaction.mechanism || generateAcademicMechanism(reaction);
  const acaDisplay = document.getElementById('academicExplanationDisplay');
  const acaText = document.getElementById('academicExplanationText');
  
  if (acaDisplay && acaText) {
    if (textToShow) {
      let formattedText = textToShow.replace(/\$([^\$]+)\$/g, (match, formula) => {
        let res = formula.replace(/_\{([^}]+)\}/g, '<sub>$1</sub>');
        res = res.replace(/_([a-zA-Z0-9]+)/g, '<sub>$1</sub>');
        res = res.replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>');
        res = res.replace(/\^([a-zA-Z0-9+\-]+)/g, '<sup>$1</sup>');
        res = res.replace(/\\circ/g, '°');
        res = res.replace(/\\Delta/g, 'Δ');
        res = res.replace(/\\approx/g, '≈');
        res = res.replace(/\\rightarrow/g, '→');
        return `<span style="font-family:'Orbitron',sans-serif; color:#38bdf8; font-weight:500;">${res}</span>`;
      });
      // Split into steps based on ". "
      let steps = formattedText.split('. ').filter(s => s.trim().length > 0);
      steps = steps.map(s => s.endsWith('.') ? s : s + '.');
      
      window.acaCurrentSteps = steps;
      window.acaCurrentIndex = 0;
      
      window.acaRenderStep = () => {
         const idx = window.acaCurrentIndex;
         acaText.innerHTML = window.acaCurrentSteps[idx];
         document.getElementById('acaStepIndicator').innerText = `Bước ${idx + 1} / ${window.acaCurrentSteps.length}`;
         
         const btnPrev = document.getElementById('acaBtnPrev');
         const btnNext = document.getElementById('acaBtnNext');
         
         btnPrev.style.opacity = idx === 0 ? '0.3' : '1';
         btnPrev.style.pointerEvents = idx === 0 ? 'none' : 'auto';
         
         btnNext.style.opacity = idx === window.acaCurrentSteps.length - 1 ? '0.3' : '1';
         btnNext.style.pointerEvents = idx === window.acaCurrentSteps.length - 1 ? 'none' : 'auto';
      };
      
      window.acaNextStep = () => {
        if (window.acaCurrentIndex < window.acaCurrentSteps.length - 1) {
          window.acaCurrentIndex++;
          window.acaRenderStep();
          if (window._acaTimeout) {
            clearTimeout(window._acaTimeout); // stop auto-hide when user interacts
          }
        }
      };
      
      window.acaPrevStep = () => {
        if (window.acaCurrentIndex > 0) {
          window.acaCurrentIndex--;
          window.acaRenderStep();
          if (window._acaTimeout) {
            clearTimeout(window._acaTimeout);
          }
        }
      };
      
      window.acaRenderStep();
      acaDisplay.style.display = 'flex';
      
      // Auto-hide the academic panel along with the main one (only if user doesn't interact)
      if (window._acaTimeout) clearTimeout(window._acaTimeout);
      window._acaTimeout = setTimeout(() => {
        acaDisplay.style.display = 'none';
      }, 15000);
      
      // Initialize Draggable Logic
      const dragHandle = document.getElementById('acaDragHandle');
      if (dragHandle && !dragHandle.dataset.draggableInitialized) {
        dragHandle.dataset.draggableInitialized = 'true';
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;
        
        dragHandle.addEventListener('mousedown', (e) => {
          isDragging = true;
          startX = e.clientX;
          startY = e.clientY;
          const rect = acaDisplay.getBoundingClientRect();
          initialLeft = rect.left;
          initialTop = rect.top;
          
          acaDisplay.style.bottom = 'auto';
          acaDisplay.style.right = 'auto';
          acaDisplay.style.left = initialLeft + 'px';
          acaDisplay.style.top = initialTop + 'px';
          acaDisplay.style.transform = 'none';
          
          dragHandle.style.cursor = 'grabbing';
          if (window._acaTimeout) clearTimeout(window._acaTimeout); // stop auto hide when dragged
        });
        
        document.addEventListener('mousemove', (e) => {
          if (!isDragging) return;
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;
          acaDisplay.style.left = (initialLeft + dx) + 'px';
          acaDisplay.style.top = (initialTop + dy) + 'px';
        });
        
        document.addEventListener('mouseup', () => {
          if (isDragging) {
            isDragging = false;
            dragHandle.style.cursor = 'grab';
          }
        });
      }
      
    } else {
      acaDisplay.style.display = 'none';
    }
  }
  
  // --- Hiển thị Synthesis (Ang đang điều chế gì) ---
  const synthEl = document.getElementById('ardSynthesis');
  if (synthEl) {
    if (reaction.synthesis) {
      const s = reaction.synthesis;
      synthEl.innerHTML = `
        <span class="ard-synth-badge">
          <span class="ard-synth-icon">${s.icon || '⚗️'}</span>
          Đang điều chế: <strong>${s.name}</strong>
          ${s.category ? `<span class="ard-synth-cat">${s.category}</span>` : ''}
        </span>`;
      synthEl.style.display = 'block';
    } else if (reaction.products && reaction.products.length > 0) {
      // nếu không có synthesis, lấy product đầu tiên
      const mainProduct = reaction.products[0].replace(/↓/g,'').replace(/↑/g,'').trim();
      synthEl.innerHTML = `<span class="ard-synth-badge"><span class="ard-synth-icon">⚗️</span> Sản phẩm: <strong>${mainProduct}</strong></span>`;
      synthEl.style.display = 'block';
    } else {
      synthEl.style.display = 'none';
    }
  }

  display.classList.add('show');

  // Auto-hide after 15 seconds
  if (window._ardTimeout) clearTimeout(window._ardTimeout);
  window._ardTimeout = setTimeout(() => {
    display.classList.remove('show');
  }, 15000);
}






// ——— COLOR MIXING ———
function mixLiquidColors(c1, c2) {
  if (!c1) return c2;
  if (!c2) return c1;

  // Extract RGBA
  const extract = (c) => {
    const match = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), parseFloat(match[4] || 1)] : [255, 255, 255, 0.2];
  };

  const [r1, g1, b1, a1] = extract(c1);
  const [r2, g2, b2, a2] = extract(c2);

  // Simple weighted blend
  const r = Math.round((r1 * 0.6) + (r2 * 0.4));
  const g = Math.round((g1 * 0.6) + (g2 * 0.4));
  const b = Math.round((b1 * 0.6) + (b2 * 0.4));
  const a = Math.min((a1 + a2) * 0.7, 0.8);

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// ——— RENDER WORKSPACE ITEM ———
function renderWorkspaceItem(item) {
  const container = document.getElementById('workspaceItems');
  const el = document.createElement('div');
  el.className = 'ws-item';
  el.dataset.uid = item.uid;
  el.style.left = item.x + 'px';
  el.style.top = item.y + 'px';
  // Apply scale if set (zoom feature)
  if (item.scale && item.scale !== 1) {
    el.style.transformOrigin = 'top left';
    el.style.setProperty('--item-scale', item.scale);
  } else {
    el.style.setProperty('--item-scale', '1');
  }

  const svgFn = SVG_RENDERERS[item.render];
  let svgHtml = '';
  if (item.type === 'tool') {
    svgHtml = svgFn ? svgFn(item) : `<span style="font-size:40px">${item.icon}</span>`;
  } else {
    svgHtml = `<div style="transform:scale(1.2); pointer-events:none; margin-bottom:8px;">${getChemIconSVG(item)}</div>`;
  }
  const isLarge = TOOLS.find(t => t.id === item.toolId)?.isLarge;

  el.innerHTML = `
    <div class="ws-item-inner">
      ${svgHtml}
      <span class="ws-item-label">${item.name}</span>
      ${item.molarity ? `<span class="ws-item-property">${item.molarity}M</span>` : ''}
      ${item.mass ? `<span class="ws-item-property">${item.mass}g</span>` : ''}
      ${item.chemicals?.length ? `<span style="font-size:10px;color:#94a3b8;margin-top:2px">${item.chemicals.map(id => {
        const c = CHEMICALS.find(ch => ch.id === id); return c?.formula;
      }).filter(Boolean).join(' + ')}</span>` : ''}
    </div>
    <button class="ws-item-delete" onclick="removeWorkspaceItem('${item.uid}')">✕</button>
  `;

  // Drag to move
  makeDraggable(el, item);

  // Click to select / interact
  el.addEventListener('click', (e) => {
    if (e.target.classList.contains('ws-item-delete')) return;
    
    // Check if we are interacting WITH another tool
    if (state.selectedItem && state.selectedItem !== item.uid) {
      const source = state.workspaceItems.find(it => it.uid === state.selectedItem);
      if (source && source.type === 'tool') {
        if (handleToolInteraction(source, item)) {
          e.stopPropagation();
          return;
        }
      }
    }

    selectItem(item.uid);
    if (item.toolId === 'bunsen') toggleBunsen(item);
    if (item.toolId === 'fume-hood') toggleFumeHood(item);
    if (item.toolId === 'stirrer') toggleStirrer(item);
    if (item.toolId === 'power-supply') handlePowerSupplyClick(item, e);
  });

  // Contextmenu for info
  el.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (item.type === 'tool') {
      const tool = TOOLS.find(t => t.id === item.toolId);
      showTooltip(e, tool?.tooltip || item.name);
      setTimeout(hideTooltip, 3000);
    }
  });

  container.appendChild(el);

  // Apply heating class if needed
  if (item.isHeating) el.classList.add('heating');
}

function refreshWorkspaceItem(item) {
  const el = document.querySelector(`[data-uid="${item.uid}"]`);
  if (el) {
    // Basic weight logic if scale
    if (item.toolId === 'electronic-scale') {
      updateScaleWeight(item);
    }
    
    el.remove();
    renderWorkspaceItem(item);
  }
}

function updateScaleWeight(scale) {
  let totalWeight = 0;
  state.workspaceItems.forEach(it => {
    if (it.uid === scale.uid) return;
    // Check if item is on top of scale
    const dist = Math.hypot((it.x + 40) - (scale.x + 50), (it.y + 80) - (scale.y + 25));
    if (dist < 40) {
      // Base tool weight
      totalWeight += 50; 
      // Chemical weight
      if (it.chemicals) {
        it.chemicals.forEach(c => {
          totalWeight += (c.mass || 10);
        });
      }
      if (it.mass) totalWeight += parseFloat(it.mass);
    }
  });
  scale.displayedWeight = totalWeight.toFixed(1);
}

function removeWorkspaceItem(uid) {
  state.workspaceItems = state.workspaceItems.filter(i => i.uid !== uid);
  const el = document.querySelector(`[data-uid="${uid}"]`);
  if (el) el.remove();
  // Clear flame if bunsen
  if (state.flameIntervals[uid]) {
    clearInterval(state.flameIntervals[uid]);
    delete state.flameIntervals[uid];
  }
  // Clear safety
  const item = state.workspaceItems.find(i => i.uid === uid);
  if (item?.toolId) state.safetyEquipped.delete(item.toolId);
  updateDropHint();
  updateSafetyStatus();
}

// ——— DRAG TO MOVE WITHIN WORKSPACE ———
function makeDraggable(el, item) {
  let startX, startY, startLeft, startTop;
  el.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('ws-item-delete')) return;
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;
    startLeft = item.x;
    startTop = item.y;
    el.style.zIndex = '50';

    const onMove = (e2) => {
      let newX = startLeft + (e2.clientX - startX);
      let newY = startTop + (e2.clientY - startY);

      item.x = newX;
      item.y = newY;
      el.style.left = item.x + 'px';
      el.style.top = item.y + 'px';
    };
    const onUp = () => {
      el.style.zIndex = '20';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      
      handleDropInteractions(item);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  // ——— SCROLL WHEEL ZOOM (All items) ———
  el.addEventListener('wheel', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    const oldScale = item.scale || 1.0;
    const newScale = Math.min(2.0, Math.max(0.5, +(oldScale + delta).toFixed(1)));
    if (newScale === oldScale) return;
    item.scale = newScale;
    
    // Apply scale via CSS variable for consistency with selection effects
    el.style.transformOrigin = 'top left';
    el.style.setProperty('--item-scale', newScale);
    
    // Show scale badge
    let badge = el.querySelector('.scale-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'scale-badge';
      el.appendChild(badge);
    }
    badge.textContent = Math.round(newScale * 100) + '%';
    badge.style.opacity = '1';
    clearTimeout(el._scaleBadgeTimer);
    el._scaleBadgeTimer = setTimeout(() => { if(badge) badge.style.opacity = '0'; }, 1200);
  }, { passive: false });
}

// Kiểm tra va chạm giữa hai vật thể dựa trên vùng bao (AABB)
function isOverlapping(item1, item2, padding = 20) {
  const rect1 = {
    left: item1.x,
    right: item1.x + 80,
    top: item1.y,
    bottom: item1.y + 110
  };
  const rect2 = {
    left: item2.x - padding,
    right: item2.x + 80 + padding,
    top: item2.y - padding,
    bottom: item2.y + 110 + padding
  };

  return !(rect1.right < rect2.left || 
           rect1.left > rect2.right || 
           rect1.bottom < rect2.top || 
           rect1.top > rect2.bottom);
}

// Handle interactions when one item is dropped on another
function handleDropInteractions(movedItem) {
  const targets = state.workspaceItems.filter(it => it.uid !== movedItem.uid);

  for (const target of targets) {
    if (isOverlapping(movedItem, target, 30)) {
      // 1. Chemical -> Tool (Container)
      if (movedItem.type === 'chemical' && target.type === 'tool' && TOOLS.find(t => t.id === target.toolId)?.category === 'container') {
        addChemicalToContainer(target, movedItem);
        removeWorkspaceItem(movedItem.uid);
        emitSparks(target.x + 40, target.y + 40, 10);
        return;
      }
      
      // 2. Tool -> Tool Interaction (Two-way)
      if (movedItem.type === 'tool' && target.type === 'tool') {
        const handled = handleToolInteraction(movedItem, target) || handleToolInteraction(target, movedItem);
        if (handled) {
          emitSparks(target.x + 40, target.y + 40, 8);
          refreshWorkspaceItem(movedItem);
          refreshWorkspaceItem(target);
          return;
        }
      }
    }
  }
}

// ——— SELECT ITEM ———
function selectItem(uid) {
  document.querySelectorAll('.ws-item.selected').forEach(el => el.classList.remove('selected'));
  state.selectedItem = uid;
  const el = document.querySelector(`[data-uid="${uid}"]`);
  if (el) el.classList.add('selected');
}

// ——— BUNSEN BURNER TOGGLE ———
function toggleBunsen(item) {
  item.state = item.state === 'on' ? 'off' : 'on';
  item.isHeating = item.state === 'on';

  if (item.state === 'on') {
    state.environment = state.environment || {};
    // Chỉ set flag môi trường nếu cần thiết cho UI chung, 
    // không dùng làm tham số chính cho phản ứng của cốc
    state.environment.isHeating = true; 
    addLog('warning', `🔥 Đèn cồn bật — Cẩn thận lửa hở!`);
    const intervalId = setInterval(() => {
      emitFlameParticle(item.x + 28, item.y + 10);
    }, 60);
    state.flameIntervals[item.uid] = intervalId;
    // Heat nearby containers
    heatNearbyContainers(item);
  } else {
    state.environment = state.environment || {};
    state.environment.isHeating = false;
    addLog('info', `💨 Đèn cồn tắt`);
    if (state.flameIntervals[item.uid]) {
      clearInterval(state.flameIntervals[item.uid]);
      delete state.flameIntervals[item.uid];
    }
    // Stop heating containers
    stopHeatingContainers(item);
  }
  refreshWorkspaceItem(item);
}

function emitFlameParticle(x, y) {
  const p = new FlameParticle(x, y);
  particles.push(p);
}

function heatNearbyContainers(bunsen) {
  state.workspaceItems.forEach(it => {
    if (it.type === 'tool' && TOOLS.find(t => t.id === it.toolId)?.category === 'container') {
      if (isOverlapping(bunsen, it, 40)) {
        it.isHeating = true;
        refreshWorkspaceItem(it);
        if (it.chemicals.length > 0) {
          addLog('warning', `🌡️ ${it.name} đang được đun nóng — Cẩn thận!`);
          emitBubbles(it.x + 40, it.y + 40, '#bae6fd', 20, 2000);
          setTimeout(() => {
            const beaker = it;
            const env = { ...(state.environment || {}), isHeating: true };

            // 1. Ưu tiên kiểm tra thuốc súng — chỉ nổ nếu đã trộn xong
            if (window.ChemistryEngine) {
              const gp = window.ChemistryEngine.checkGunpowder(beaker.chemicals, env);
              if (gp && gp.type === 'gunpowder_explosion' && beaker._gunpowderMixed) {
                triggerGunpowderExplosion(beaker, gp);
                return;
              }
            }

            // 2. Kiểm tra HEAT_REACTIONS
            if (window.HEAT_REACTIONS) {
              const sortedEntries = Object.entries(window.HEAT_REACTIONS).sort((a, b) => (b[1].reactants?.length || 0) - (a[1].reactants?.length || 0));
              for (const [key, rxn] of sortedEntries) {
                const needed = rxn.reactants || [];
                const presentIds = beaker.chemicals.map(c => c.id);
                if (needed.length > 0 && needed.every(r => presentIds.includes(r))) {
                  executeReaction(beaker, { ...rxn, isHeatTriggered: true });
                  return;
                }
              }
            }

            // 3. Fallback checkReaction
            if (typeof checkReaction === 'function' && beaker.chemicals.length > 0) {
              checkReaction(beaker);
            }
          }, 800);
        }
      }
    }
  });
}


function stopHeatingContainers(bunsen) {
  state.workspaceItems.forEach(it => {
    if (it.isHeating) {
      it.isHeating = false;
      refreshWorkspaceItem(it);
    }
  });
}

// ——— FUME HOOD TOGGLE ———
function toggleFumeHood(item) {
  item.active = !item.active;
  if (item.active) {
    state.safetyEquipped.add('fume-hood');
    addLog('success', `💨 Tủ hút khí: BẬT — An toàn hơn!`);
    hideToxicOverlay();
  } else {
    state.safetyEquipped.delete('fume-hood');
    addLog('warning', '[CẢNH_BÁO] HỆ THỐNG HÚT KHÍ: STANDBY (TẮT)');
  }
  refreshWorkspaceItem(item);
  updateSafetyStatus();
  item.equipped = item.active;
}

// ——— UPDATE DROP HINT ———
function updateDropHint() {
  const surface = document.getElementById('workspaceSurface');
  if (state.workspaceItems.length > 0) {
    surface.classList.add('has-items');
  } else {
    surface.classList.remove('has-items');
  }
}

// ——— SAFETY STATUS ———
function updateSafetyStatus() {
  // Badge đã bị xóa theo yêu cầu
}

// ——— CHECK INTERACTIONS ———
function checkInteractions(newItem) {
  // Check dangerous combos on workspace
  const chemIds = state.workspaceItems
    .filter(i => i.type === 'chemical')
    .map(i => i.chemId);
  for (const combo of DANGEROUS_COMBOS) {
    const hasAll = combo.chemicals.every(c => chemIds.includes(c));
    if (hasAll) {
      if (combo.level === 'danger') {
        document.body.classList.add('shake');
        setTimeout(() => document.body.classList.remove('shake'), 600);
        showDanger('NGUY HIỂM!', combo.message);
      } else {
        addLog('warning', `[PHÂN_TÍCH] ${combo.message}`);
      }
    }
  }
}

// ——— LOG SYSTEM ———
// ——— LOG SYSTEM (QUANTUM HUD) ———
const LOG_ICONS = {
  info: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  success: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  danger: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
};

function addLog(type, message) {
  const entries = document.getElementById('logEntries');
  const div = document.createElement('div');
  div.className = `log-entry ${type}`;
  
  const now = new Date();
  const time = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const icon = LOG_ICONS[type] || LOG_ICONS.info;
  
  div.innerHTML = `
    <span class="log-time">${time}</span>
    <span class="log-icon">${icon}</span>
    <span class="log-msg">${message}</span>
  `;
  
  entries.appendChild(div);
  entries.scrollTop = entries.scrollHeight;
  state.logCount++;
}

function clearLog() {
  document.getElementById('logEntries').innerHTML = '';
  state.logCount = 0;
  addLog('info', '[HỆ_THỐNG] NHẬT KÝ ĐÃ ĐƯỢC LÀM SẠCH. SẴN SÀNG TIẾP NHẬN DỮ LIỆU.');
}

function showDanger(title, message, callback, headerColor = '#dc2626') {
  document.getElementById('dangerTitle').textContent = title;
  document.getElementById('dangerTitle').style.color = headerColor; // Appplying color
  document.getElementById('dangerMessage').textContent = message;
  document.getElementById('dangerOverlay').classList.add('show');
  _dangerCallback = callback;
}
function dismissDanger() {
  document.getElementById('dangerOverlay').classList.remove('show');
  if (typeof _dangerCallback === 'function') {
    _dangerCallback();
    _dangerCallback = null;
  }
}

// ——— MARS GENESIS SAFETY QUIZ (IDCL) ———
function triggerSystemFreeze(violations, chemicalId) {
  state.isDragging = false; // Ngừng mọi thao tác kéo thả

  const overlay = document.getElementById('safety-overlay');
  const quizContent = document.getElementById('quiz-content');
  overlay.style.display = 'block';

  // Chơi âm thanh báo động
  if (window.AudioSystem) window.AudioSystem.playAlert(2);

  const chem = window.CHEMICALS ? window.CHEMICALS.find(c => c.id === chemicalId) : null;
  const chemName = chem ? (chem.formula || chem.name) : chemicalId;
  const violationMsg = violations.map(v => v.message).join('<br>');

  let html = `
    <div style="margin-bottom: 20px; padding: 15px; border: 1px dashed #ff3131; background: rgba(255, 0, 0, 0.1);">
      <h3 style="color: #ff3131; margin-top: 0;">LỖI NGHIÊM TRỌNG</h3>
      <p style="margin-bottom: 0;">${violationMsg}</p>
    </div>
    <p>TRÌNH QUẢN TRỊ VIÊN ĐÃ KHÓA HỆ THỐNG ĐỂ ĐẢM BẢO AN TOÀN CHO TRẠM MARS-GENESIS.</p>
    <p>Hãy hoàn thành bài kiểm tra an toàn về <strong>${chemName}</strong> để tiếp tục.</p>
  `;

  // Câu hỏi cứng hoặc lấy từ SAFETY_QUIZZES nếu có
  const quizzes = window.SAFETY_QUIZZES || {
    "cl2": [
      {
        q: `Khí Cl₂ có đặc điểm nhận dạng nào sau đây trong môi trường phòng thí nghiệm?`,
        opts: ["Không màu, mùi thơm nhẹ.", "Màu vàng lục, mùi hắc đặc trưng, cực độc.", "Màu nâu đỏ, không mùi."],
        ans: 1
      },
      {
        q: `Tại sao phải sử dụng tủ hút (Fume Hood) khi thí nghiệm với Cl₂?`,
        opts: ["Để khí phản ứng với không khí nhanh hơn.", "Để giữ nhiệt độ phản ứng ổn định.", "Ngăn chặn khí độc khuếch tán vào hệ thống hô hấp."],
        ans: 2
      },
      {
        q: `Nếu lỡ hít phải một lượng nhỏ khí Cl₂, hành động sơ cứu đầu tiên là gì?`,
        opts: ["Uống nhiều nước ngay lập tức.", "Di chuyển ngay ra nơi thoáng khí và hít thở sâu.", "Tiếp tục hoàn thành thí nghiệm rồi đi kiểm tra."],
        ans: 1
      }
    ]
  };

  const quizSet = quizzes[chemicalId] || quizzes["cl2"]; // Fallback to cl2 if not found
  let currentQ = 0;

  function renderQ() {
    if (currentQ >= quizSet.length) {
      quizContent.innerHTML = `
        <h3 style="color: #34d399; text-align: center;">ĐÃ XÁC MINH AN TOÀN</h3>
        <p style="text-align: center;">Hệ thống đã được mở khóa. Hãy nhớ tuân thủ quy tắc an toàn!</p>
        <button class="quiz-btn-submit" style="background: #34d399;" id="btn-unlock-sys">TIẾP TỤC SỨ MỆNH</button>
      `;
      document.getElementById('btn-unlock-sys').onclick = () => {
        overlay.style.display = 'none';
        if (window.AudioSystem) window.AudioSystem.stopAlert();
      };
      return;
    }

    const qData = quizSet[currentQ];
    html = `
      <div class="quiz-question"><strong>Câu ${currentQ + 1}/${quizSet.length}:</strong> ${qData.q}</div>
      <div class="quiz-options" id="quiz-options">
        ${qData.opts.map((opt, i) => `<div class="quiz-option" data-idx="${i}">${opt}</div>`).join('')}
      </div>
      <div class="quiz-feedback" id="quiz-feedback"></div>
      <button class="quiz-btn-submit" id="quiz-submit" disabled>XÁC NHẬN</button>
    `;
    quizContent.innerHTML = html;

    let selectedIdx = -1;
    document.querySelectorAll('.quiz-option').forEach(el => {
      el.onclick = () => {
        document.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
        el.classList.add('selected');
        selectedIdx = parseInt(el.dataset.idx);
        document.getElementById('quiz-submit').disabled = false;
      };
    });

    document.getElementById('quiz-submit').onclick = () => {
      const btn = document.getElementById('quiz-submit');
      const fb = document.getElementById('quiz-feedback');
      btn.disabled = true;

      if (selectedIdx === qData.ans) {
        fb.textContent = "CHÍNH XÁC!";
        fb.className = "quiz-feedback success";
        setTimeout(() => { currentQ++; renderQ(); }, 1000);
      } else {
        fb.textContent = "SAI. VUI LÒNG ĐỌC KỸ LẠI TÀI LIỆU AN TOÀN.";
        fb.className = "quiz-feedback error";
        setTimeout(() => {
          fb.textContent = "";
          btn.disabled = false;
          document.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
          selectedIdx = -1;
        }, 2000);
      }
    };
  }

  renderQ();
}

// ——— TOXIC OVERLAY ———
function showToxicOverlay(message) {
  document.getElementById('toxicOverlay').classList.add('show');
  document.getElementById('toxicMessage').classList.add('show');
  document.getElementById('toxicText').textContent = message;
  addLog('danger', `☣️ ${message}`);
}
function hideToxicOverlay() {
  document.getElementById('toxicOverlay').classList.remove('show');
  document.getElementById('toxicMessage').classList.remove('show');
}

// ——— TOOLTIP ———
function showTooltip(e, html, data = null) {
  const tt = document.getElementById('tooltip');
  
  let ghsSection = '';
  if (data && data.hazards && data.hazards.length > 0) {
    ghsSection = `<div class="tooltip-ghs">
      ${data.hazards.map(h => `<div class="ghs-icon ghs-${h}" title="${h}"></div>`).join('')}
    </div>`;
  }

  tt.innerHTML = `<div class="tooltip-content">${html}</div>${ghsSection}`;

  tt.classList.add('visible');
  positionTooltip(e);
}
function positionTooltip(e) {
  const tt = document.getElementById('tooltip');
  let x = e.clientX + 14, y = e.clientY - 10;
  if (x + 230 > window.innerWidth) x = e.clientX - 230;
  if (y + 100 > window.innerHeight) y = e.clientY - 100;
  tt.style.left = x + 'px';
  tt.style.top = y + 'px';
}
function hideTooltip() {
  document.getElementById('tooltip').classList.remove('visible');
}

/**
 * Kích hoạt hiệu ứng nổ Thuốc súng đen
 */
function triggerGunpowderExplosion(beaker, data) {
  executeReaction(beaker, {
    equation: data.equation || '2KNO₃ + S + 3C → K₂S + N₂↑ + 3CO₂↑',
    type: 'explosion',
    effect: 'explosion-violent',
    observation: '💣 THUỐC SÚNG ĐEN PHÁT NỔ! Phòng thí nghiệm bị phá hủy!',
    synthesis: { name: '💣 THUỐC SÚNG ĐEN PHÁT NỔ!', icon: '💥', category: 'Vũ khí / Pháo hoa' },
    logType: 'danger',
    hazardLevel: 3,
    hazardType: 'explosion',
    shatter: true,
    colorChange: { end: '#fbbf24' }
  });
}

// ——— REACTION EXECUTION ———
function showReactionModal(reaction) {
  const modal = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');
  const c1 = CHEMICALS.find(c => c.id === reaction.reactants[0]);
  const c2 = CHEMICALS.find(c => c.id === reaction.reactants[1]);

  content.innerHTML = `
    <h3 style="color:#38bdf8">⚗️ Phản ứng Hóa học</h3>
    <p>${reaction.description}</p>
    <div class="reaction-result">
      <h4>Phương trình phản ứng</h4>
      <div class="reaction-eq">${reaction.equation}</div>
      <p><strong>Quan sát:</strong> ${reaction.observation}</p>
      <p><strong>Loại phản ứng:</strong> ${getReactionTypeName(reaction.type)}</p>
      ${reaction.temperature === 'exothermic' ? '<p style="color:#fbbf24">🌡️ Phản ứng <strong>tỏa nhiệt</strong></p>' : ''}
      <div class="products-list">
        ${reaction.products.map(p => {
          const cls = p.includes('↓') ? 'precipitate' : p.includes('↑') ? 'gas' : p.includes('H₂O') ? 'water' : 'salt';
          return `<span class="product-tag ${cls}">${p}</span>`;
        }).join('')}
      </div>
    </div>
  `;
  modal.classList.add('show');
}

function getReactionTypeName(type) {
  const map = {
    'neutralization': 'Trung hòa (Acid + Base)',
    'acid-carbonate': 'Acid + Cacbonat → CO₂',
    'metal-acid': 'Kim loại + Acid',
    'precipitation': 'Tạo kết tủa',
    'indicator': 'Chỉ thị màu',
    'redox': 'Oxy hóa khử',
  };
  return map[type] || type;
}

// ——— CHEMICAL PROPERTY MODAL ———
let _configType = 'molarity'; // 'molarity' or 'mass'

function showChemicalConfig(chem, x, y) {
  state.pendingPlacement = { chem, x, y };
  const modal = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');
  
  _configType = chem.type === 'special' ? 'molarity' : (chem.type === 'solid' || chem.type === 'metal' ? 'mass' : 'molarity');

  content.innerHTML = `
    <div class="chem-config-container">
      <div class="chem-config-header">
        <span class="chem-config-icon" style="display:flex; justify-content:center; align-items:center; transform:scale(1.2); pointer-events:none;">${getChemIconSVG(chem)}</span>
        <div class="chem-config-title">
          <h2>Thiết lập ${chem.formula}</h2>
          <p>${chem.name}</p>
        </div>
      </div>
      
      <div class="chem-config-tabs">
        <button class="config-tab-btn ${_configType === 'molarity' ? 'active' : ''}" onclick="setConfigType('molarity')">Nồng độ (M)</button>
        <button class="config-tab-btn ${_configType === 'mass' ? 'active' : ''}" onclick="setConfigType('mass')">Khối lượng (g)</button>
      </div>

      <div id="configSection" class="config-section">
        ${renderConfigInputs()}
      </div>

      <div class="config-actions">
        <button class="btn-config-cancel" onclick="closeModal()">Hủy</button>
        <button class="btn-config-confirm" onclick="confirmChemicalPlacement()">Xác nhận</button>
      </div>
    </div>
  `;
  
  modal.classList.add('show');
}

function setConfigType(type) {
  _configType = type;
  document.querySelectorAll('.config-tab-btn').forEach(b => b.classList.toggle('active', b.textContent.includes(type === 'molarity' ? 'Nồng độ' : 'Khối lượng')));
  document.getElementById('configSection').innerHTML = renderConfigInputs();
}

function renderConfigInputs() {
  const chem = state.pendingPlacement?.chem;
  if (!chem) return '';

  if (_configType === 'molarity') {
    const presets = chem.molarityPresets || ['0.1', '1.0', '2.0', '5.0', '10.0', '18.0'];
    const range = chem.molarityRange || [0.1, 18.0];
    const defaultVal = presets.includes('2.0') ? '2.0' : (presets.includes('1.0') ? '1.0' : presets[0]);
    
    return `
      <div class="config-grid">
        ${presets.map(p => `
          <button class="config-preset-btn ${p == defaultVal ? 'selected' : ''}" onclick="setPresetValue('${p}')">${p} M</button>
        `).join('')}
      </div>
      <div class="custom-input-group">
        <label>Tùy chỉnh (M):</label>
        <input type="number" id="customChemValue" value="${defaultVal}" step="0.1" min="${range[0]}" max="${range[1]}">
        <div style="font-size: 11px; color: var(--accent-blue); opacity: 0.8; margin-top: 6px; letter-spacing: 0.5px;">
          RANGE: ${range[0]}M — ${range[1]}M
        </div>
      </div>
    `;
  } else {
    const standardMasses = ['1', '5', '10', '50', '100', '500'];
    return `
      <div class="config-grid">
        ${standardMasses.map(m => `
          <button class="config-preset-btn ${m === '10' ? 'selected' : ''}" onclick="setPresetValue('${m}')">${m} g</button>
        `).join('')}
      </div>
      <div class="custom-input-group">
        <label>Tùy chỉnh (g):</label>
        <input type="number" id="customChemValue" value="10" step="1" min="0">
      </div>
    `;
  }
}

function setPresetValue(val) {
  document.getElementById('customChemValue').value = val;
  document.querySelectorAll('.config-preset-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.textContent.includes(val));
  });
}

function confirmChemicalPlacement() {
  const val = document.getElementById('customChemValue').value;
  const { chem, x, y } = state.pendingPlacement;
  const uid = 'item-' + (state.nextId++);
  
  const item = {
    uid, type: 'chemical', chemId: chem.id,
    name: chem.formula, icon: chem.icon || '🧪',
    x: x - 25, y: y - 50,
    liquidColor: chem.liquidColor,
    colorHex: chem.colorHex,
    [_configType]: val // Store as 'molarity' or 'mass'
  };

  try {
    state.workspaceItems.push(item);
    renderWorkspaceItem(item);
    updateDropHint();
    checkInteractions(item);
    
    // Try drop onto container if it's a direct place near one
    tryDropChemicalOnContainer(item, x, y);
    
    addLog('info', `[TÍN_HIỆU] ĐÃ NẠP ${chem.formula} (Lượng: ${val}${_configType === 'molarity' ? 'M' : 'g'})`);
  } catch (err) {
    console.error("Error during chemical placement:", err);
    addLog('danger', `❌ Lỗi khi thêm ${chem.formula}: ${err.message}`);
  } finally {
    state.pendingPlacement = null;
    closeModal();
  }
}


function closeModal() {
  document.getElementById('modalOverlay').classList.remove('show');
}

// ——— EXPERIMENT SYSTEM ———
function switchExperiment(id) {
  state.currentExperiment = id;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-experiment="${id}"]`)?.classList.add('active');
  loadExperiment(id);
  if (document.getElementById('guidePanel').classList.contains('open')) {
    loadExperiment(id);
  }
  addLog('info', `🔬 Chuyển sang thí nghiệm: ${EXPERIMENTS[id]?.title}`);
}

function loadExperiment(id) {
  const exp = EXPERIMENTS[id];
  if (!exp) return;
  state.stepIndex = 0;

  const title = document.getElementById('guideTitle');
  const steps = document.getElementById('guideSteps');
  const theory = document.getElementById('guideTheory');

  // Guard: các element này có thể không tồn tại tùy layout
  if (!title || !steps || !theory) return;

  title.innerHTML = `<h4>${exp.title}</h4><p>${exp.objective}</p>`;
  steps.innerHTML = exp.steps.map((step, i) => `
    <div class="guide-step ${i === 0 ? 'active' : ''}" id="step-${i}">
      <div class="step-num">${i + 1}</div>
      <div class="step-content">
        <div class="step-title">${step.title}</div>
        <div class="step-desc">${step.desc}</div>
        ${step.warning ? `<div class="step-warning">${step.warning}</div>` : ''}
      </div>
    </div>
  `).join('');

  theory.innerHTML = `
    <h5>Lý thuyết cơ bản</h5>
    <p>${exp.theory}</p>
    ${exp.equation ? `<div class="equation-box">${exp.equation}</div>` : ''}
  `;

  // Refresh sidebars for the mode
  renderTools();
  renderChemicals();
}

function toggleGuide() {
  const panel = document.getElementById('guidePanel');
  const isOpen = panel.classList.contains('open');
  
  if (!isOpen) {
    if (window.initKnowledgeTerminal) {
      initKnowledgeTerminal();
    }
    panel.classList.add('open');
  } else {
    panel.classList.remove('open');
  }
}

function renderToolManual() {
  const list = document.getElementById('toolManualList');
  if (!list || !window.TOOL_MANUAL) return;

  list.innerHTML = window.TOOL_MANUAL.map(group => `
    <div class="manual-group">
      <h4>${group.group}</h4>
      ${group.items.map(tool => `
        <div class="manual-item">
          <div class="manual-tool-header">
            <span class="manual-icon">${tool.icon}</span>
            <span class="manual-name">${tool.name}</span>
          </div>
          <div class="manual-desc">${tool.desc}</div>
          <div class="manual-tips"><strong>Mẹo:</strong> ${tool.tips}</div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

// ——— TOOL INTERACTION LOGIC ———
function handleToolInteraction(source, target) {
  const sId = source.toolId;
  const tId = target.toolId;

  // 1. Dropper / Pipette interactions
  if (sId === 'dropper' || sId === 'pipette') {
    // A. Click a chemical card on workspace to load dropper
    if (target.type === 'chemical') {
      const chem = CHEMICALS.find(c => c.id === target.chemId) || window.ALL_ITEMS?.find(c => c.id === target.chemId);
      if (chem) {
        source.holdingColor = chem.liquidColor || 'rgba(186,230,253,0.5)';
        source.holdingChemicals = [{ ...chem }];
        addLog('info', `[HÀNH_ĐỘNG] ĐÃ CHIẾT XUẤT MẪU THỬ: ${chem.formula}.`);
        refreshWorkspaceItem(source);
        return true;
      }
    }

    // B. Interaction with containers
    const isContainer = TOOLS.find(t => t.id === tId)?.category === 'container';
    
    if (isContainer) {
      if (!source.holdingColor) {
        // HÚT (Suck up from container)
        if (target.chemicals.length > 0 && (target.liquidLevel || 0) > 0) {
          source.holdingColor = target.liquidColor || 'rgba(186,230,253,0.5)';
          source.holdingChemicals = [...target.chemicals];
          
          target.liquidLevel = Math.max(0, (target.liquidLevel || 0) - 10); // Small suck
          if (target.liquidLevel === 0) {
            target.chemicals = [];
            target.liquidColor = null;
            target.activePrecipitate = null;
          }
          
          addLog('info', `[HÀNH_ĐỘNG] ĐÃ HÚT DUNG DỊCH TỪ ${target.name}.`);
          refreshWorkspaceItem(source);
          refreshWorkspaceItem(target);
        } else {
          addLog('warning', '[LỖI] KHÔNG CÒN DUNG DỊCH ĐỂ CHIẾT XUẤT.');
        }
      } else {
        // NHỎ (Drop into container - Precision step)
        const chemId = source.holdingChemicals[0]?.id || 'water';
        addChemicalToContainer(target, { chemId }, 3); // ONLY 3 units level increase
        addLog('success', `[HÀNH_ĐỘNG] BƠM GIỌT MẪU: ${source.name} -> ${target.name}.`);
        
        // Clear for simplicity or keep for multiple drops? Let's keep for multi drops
        // We assume dropper has infinite small drops for UX, or we could handle quantity
        refreshWorkspaceItem(target);
      }
      return true;
    }
  }

  // 2. Funnel + Container
  if (sId === 'funnel' && TOOLS.find(t => t.id === tId)?.category === 'container') {
    source.x = target.x + (tId === 'beaker' ? 10 : 8);
    source.y = target.y - 45;
    source.attachedTo = target.uid;
    addLog('info', `📎 Đã gắn phễu lên ${target.name}.`);
    refreshWorkspaceItem(source);
    return true;
  }

  // 3. Electrolysis Cell + Electrodes
  if (tId === 'electrolysis-cell' && sId.startsWith('electrode')) {
    source.x = target.x + (target.electrodes?.length ? 60 : 20);
    source.y = target.y + 10;
    source.attachedTo = target.uid;
    if (!target.electrodes) target.electrodes = [];
    target.electrodes.push(source.uid);
    addLog('info', `⚡ Đã đặt điện cực vào bình điện phân.`);
    refreshWorkspaceItem(source);
    checkElectrolysis(target);
    return true;
  }

  // 4. Power Supply + Electrode
  if (sId === 'power-supply' && tId.startsWith('electrode')) {
    if (!source.connections) source.connections = [];
    
    if (source.connections.includes(target.uid)) return true;

    if (source.connections.length < 2) {
      source.connections.push(target.uid);
      target.powered = true;
      target.connectionType = source.connections.length === 1 ? 'positive' : 'negative';
      
      const beamColor = target.connectionType === 'positive' ? '🔴 ĐỎ (Dương)' : '⚫ ĐEN (Âm)';
      addLog('success', `[KẾT_NỐI] THIẾT LẬP ĐƯỜNG TRUYỀN DẪN ĐIỆN (${beamColor}).`);
      
      const cellId = target.attachedTo;
      if (cellId) {
        const cell = state.workspaceItems.find(it => it.uid === cellId);
        if (cell) checkElectrolysis(cell);
      }
    } else {
      addLog('warning', `[CẢNH_BÁO] GIỚI HẠN KÝ TỰ KẾT NỐI VẬT LÝ: BỘ NGUỒN ĐÃ ĐẦY.`);
    }
    
    refreshWorkspaceItem(source);
    refreshWorkspaceItem(target);
    return true;
  }

  // 5. Litmus Paper + Container
  const isContainer = TOOLS.find(t => t.id === tId)?.category === 'container';
  if (sId === 'litmus-neutral' && isContainer) {
    checkLitmusInContainer(target, {}); // Trigger check for this specific container
    return true;
  }

  // 5. Indicator Dropper + Container
  if (sId === 'ph-indicator' && TOOLS.find(t => t.id === tId)?.category === 'container') {
    const indicatorId = source.indicatorId || 'phenolphthalein';
    addChemicalToContainer(target, { chemId: indicatorId });
    addLog('success', `[CHỈ_THỊ] ĐÃ NẠP CHỈ THỊ ${indicatorId} VÀO ${target.name}.`);
    return true;
  }

  return false;
}

function checkElectrolysis(cell) {
  if (!cell.electrodes || cell.electrodes.length < 2) return;
  
  const electrodes = state.workspaceItems.filter(it => cell.electrodes.includes(it.uid));
  
  // Find a supply that has BOTH electrodes connected
  const supply = state.workspaceItems.find(it => 
    it.toolId === 'power-supply' && 
    it.active &&
    it.connections &&
    it.connections.length >= 2 &&
    it.connections.every(id => cell.electrodes.includes(id))
  );
  
  if (supply && window.ChemistryEngine) {
    // Overload check
    if (supply.voltage >= 24 && !supply.overloadWarningShown) {
      addLog('danger', `[NGUY_CƠ] PHÁT HIỆN TÌNH TRẠNG QUÁ NHIỆT DO DÒNG 24V.`);
      supply.overloadWarningShown = true;
    }

    const conductivity = window.ChemistryEngine.checkConductivity(cell.chemicals);
    if (conductivity > 0) {
      cell.effervescing = true;
      const volt = supply.voltage || 12;
      const intensity = volt >= 24 ? 'bubbles-violent' : volt >= 12 ? 'bubbles-fast' : 'bubbles';
      
      addLog('warning', `[ĐIỆN_PHÂN] QUÁ TRÌNH PHÂN TÁCH ION ĐANG DIỄN RA (${volt}V).`);
      
      electrodes.forEach(e => {
        const prodColor = e.connectionType === 'positive' ? '#fff' : '#bae6fd';
        const eScale = e.scale || 1;
        triggerReactionEffect(intensity, e.x + 10 * eScale, e.y + 60 * eScale, { color: prodColor }, eScale);
      });
    } else {
      addLog('warning', `[CẢNH_BÁO] DỮ LIỆU DÒNG ĐIỆN KHÔNG PHÁT HIỆN ĐỘ DẪN ĐIỆN.`);
      cell.effervescing = false;
    }
  } else {
    cell.effervescing = false;
  }
  refreshWorkspaceItem(cell);
}

function handlePowerSupplyClick(item, e) {
  const target = e.target;
  if (target.classList.contains('btn-pow-toggle')) {
    item.active = !item.active;
    addLog('info', `[NGUỒN_ĐIỆN] CHUYỂN TRẠNG THÁI: ${item.active ? 'BẬT (ACTIVE)' : 'TẮT (STANDBY)'}`);
  } else if (target.closest('.btn-volt-cycle')) {
    const volts = [6, 12, 24];
    const idx = volts.indexOf(item.voltage || 12);
    item.voltage = volts[(idx + 1) % volts.length];
    addLog('info', `[NGUỒN_ĐIỆN] XÁC LẬP GIÁ TRỊ ĐIỆN ÁP: ${item.voltage}V`);
  }
  
  // Re-check electrolysis for any cell it might be connected to
  if (item.connections && item.connections.length > 0) {
    item.connections.forEach(connId => {
      const electrode = state.workspaceItems.find(it => it.uid === connId);
      if (electrode && electrode.attachedTo) {
        const cell = state.workspaceItems.find(it => it.uid === electrode.attachedTo);
        if (cell) checkElectrolysis(cell);
      }
    });
  }
  refreshWorkspaceItem(item);
}

function toggleStirrer(item) {
  item.active = !item.active;
  if (item.active) {
    addLog('info', `[HỆ_THỐNG] KÍCH HOẠT QUÁ TRÌNH KHUẤY TRỘN CƠ HỌC.`);
    // Find nearby container
    const container = state.workspaceItems.find(it => 
      it.type === 'tool' && 
      TOOLS.find(t => t.id === it.toolId)?.category === 'container' &&
      Math.hypot(it.x - item.x, it.y - item.y) < 60
    );
    if (container && container.activePrecipitate) {
      // Logic hòa tan kết tủa cơ bản khi khuấy
      addLog('success', `[DỮ_LIỆU] QUÁ TRÌNH KHUẤY GIÚP TĂNG TỐC ĐỘ HÒA TAN.`);
    }
  }
  refreshWorkspaceItem(item);
}

// ——— RESET LAB ———
function resetLab() {
  // Clear workspace
  document.getElementById('workspaceItems').innerHTML = '';
  state.workspaceItems = [];
  
  // Preserve personal safety (goggles, gloves, lab-coat)
  const personal = ['goggles', 'gloves', 'lab-coat'];
  const preserved = new Set([...state.safetyEquipped].filter(item => personal.includes(item)));
  state.safetyEquipped = preserved;
  
  state.stepIndex = 0;
  state.selectedItem = null;

  // Clear flame intervals
  Object.values(state.flameIntervals).forEach(clearInterval);
  state.flameIntervals = {};

  // Clear Synthesis Display
  const rd = document.getElementById('activeReactionDisplay');
  if (rd) rd.style.display = 'none';

  // Clear particles
  if (typeof particles !== 'undefined') particles.length = 0;
  state.flameIntervals = {};

  // Reset visual effects
  if (typeof particles !== 'undefined') particles.length = 0;
  if (typeof window.triggerFlash === 'function') {
    // Reset flash intensity
    window.triggerFlash(0); 
  }
  state.flameIntervals = {};

  // Clear particles
  if (typeof particles !== 'undefined') particles.length = 0;

  hideToxicOverlay();
  updateDropHint();
  updateSafetyStatus();
  addLog('info', '[HỆ_THỐNG] KHỞI TẠO LẠI TOÀN BỘ CẤU CẤU HÌNH PHÒNG THÍ NGHIỆM.');
}

// ——— KEYBOARD SHORTCUTS ———
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    dismissDanger();
    closeModal();
    document.querySelectorAll('.ws-item.selected').forEach(el => el.classList.remove('selected'));
    state.selectedItem = null;
  }
  if (e.key === 'Delete' && state.selectedItem) {
    removeWorkspaceItem(state.selectedItem);
    state.selectedItem = null;
  }
});

// ——— WINDOW RESIZE ———
window.addEventListener('resize', () => {
  if (typeof resizeCanvas === 'function') resizeCanvas();
});

// ——— TOGGLE ALERT SOUND ———
function toggleAlertSound() {
  const isMuted = AudioSystem._isMuted;
  AudioSystem.setMuted(!isMuted);

  const newMuted = AudioSystem._isMuted;
  const btn = document.getElementById('btnMuteAlert');
  const iconSound = document.getElementById('iconSound');
  const iconMute = document.getElementById('iconMute');
  const lbl = document.getElementById('lblSound');

  if (newMuted) {
    if (btn) btn.style.background = 'rgba(107,114,128,0.15)';
    if (btn) btn.style.borderColor = 'rgba(107,114,128,0.4)';
    if (btn) btn.style.color = '#6b7280';
    if (iconSound) iconSound.style.display = 'none';
    if (iconMute) iconMute.style.display = 'inline';
    if (lbl) lbl.textContent = 'Tắt tiếng';
    addLog('info', '🔇 Đã tắt âm thanh cảnh báo.');
  } else {
    if (btn) btn.style.background = 'rgba(251,191,36,0.15)';
    if (btn) btn.style.borderColor = 'rgba(251,191,36,0.4)';
    if (btn) btn.style.color = '#fbbf24';
    if (iconSound) iconSound.style.display = 'inline';
    if (iconMute) iconMute.style.display = 'none';
    if (lbl) lbl.textContent = 'Âm thanh';
    addLog('info', '🔊 Đã bật âm thanh cảnh báo.');
    // Test nhanh 0.5s
    AudioSystem.playAlert(1);
  }
}
window.toggleAlertSound = toggleAlertSound;

// ——— MUSIC SYSTEM ———
const MusicSystem = {
  _ctx: null,
  _gainNode: null,
  _oscillators: [],
  _isMuted: false,
  _isPlaying: false,
  _currentTrack: 'science',
  _volume: 0.8,
  _arpTimer: null,
  _audioElement: null,

  _tracks: {
    'science': 'music/science.mp3',
    'ly_keo_chai': 'music/ly_keo_chai.mp3',
    'da_lab_album': 'music/da_lab_instrumental.mp3',
    'son_tung': 'music/son_tung_remix.mp3',
    'thanh_xuan': 'music/thanh_xuan.mp3',
    'concentration': 'synthesized'
  },

  init() {
    if (this._audioElement) return;
    try {
      this._audioElement = new Audio();
      this._audioElement.loop = true;
      
      this._audioElement.onplay = () => addLog('info', '🔊 Nhạc đang phát (Trực tiếp)...');
      this._audioElement.onerror = (e) => {
        const error = this._audioElement.error;
        let msg = 'Lỗi không xác định';
        if (error) {
          switch(error.code) {
            case 1: msg = 'Người dùng hủy'; break;
            case 2: msg = 'Lỗi file / Mạng'; break;
            case 3: msg = 'Lỗi giải mã'; break;
            case 4: msg = 'Không thấy file music/'; break;
          }
        }
        addLog('danger', `❌ Lỗi Audio: ${msg}`);
      };

      // AudioContext dành cho Drone
      try {
        this._ctx = new (window.AudioContext || window.webkitAudioContext)();
        this._gainNode = this._ctx.createGain();
        this._gainNode.connect(this._ctx.destination);
      } catch(e) {}
    } catch(e) {
      console.warn('[MusicSystem] Init error:', e);
    }
  },

  play(trackId) {
    this.init();
    if (this._isPlaying) return;
    
    if (trackId) this._currentTrack = trackId;
    this._isPlaying = true;
    
    this._startTrack(this._currentTrack);
  },

  playNext() {
    const keys = Object.keys(this._tracks);
    const available = keys.filter(k => k !== this._currentTrack);
    const next = available[Math.floor(Math.random() * available.length)];
    this.play(next);
  },

  _startTrack(id) {
    this._stopGenerators();
    const trackFile = this._tracks[id];

    if (trackFile === 'synthesized' || !trackFile) {
      if (!this._ctx) return;
      if (this._ctx.state === 'suspended') this._ctx.resume();
      this._gainNode.gain.setValueAtTime(this._volume, this._ctx.currentTime);
      
      // Classic Drone Mode
      const freqs = [55, 82.4, 110, 41.2, 164.8];
      freqs.forEach((freq, i) => {
        const osc = this._ctx.createOscillator();
        const g = this._ctx.createGain();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this._ctx.currentTime);
        const lfo = this._ctx.createOscillator();
        const lfoGain = this._ctx.createGain();
        lfo.frequency.value = 0.1 + Math.random() * 0.1;
        lfoGain.gain.value = 0.5;
        lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
        lfo.start();
        g.gain.value = i === 0 ? 0.6 : 0.3;
        osc.connect(g); g.connect(this._gainNode);
        osc.start();
        this._oscillators.push({ osc, lfo });
      });
    } else {
      // Local MP3 Mode - Phát trực tiếp qua Audio Element để ổn định nhất
      this._audioElement.src = trackFile;
      this._audioElement.volume = this._volume;
      
      const trackName = id.replace(/_/g, ' ').toUpperCase();
      addLog('info', `📡 Đang nạp: ${trackName} (${trackFile})...`);
      
      this._audioElement.play().catch(err => {
        if (err.name === 'NotAllowedError') {
          addLog('warning', '⚠️ Trình duyệt chặn tự động phát. Hãy nhấn vào màn hình!');
        } else {
          addLog('danger', `❌ Không thể phát: ${err.message}`);
        }
      });
    }
  },

  _stopGenerators() {
    clearTimeout(this._arpTimer);
    if (this._audioElement) this._audioElement.pause();
    this._oscillators.forEach(obj => {
      if (obj.osc) try { obj.osc.stop(); } catch(e) {}
      if (obj.lfo) try { obj.lfo.stop(); } catch(e) {}
    });
    this._oscillators = [];
  },

  stop() {
    if (!this._isPlaying) return;
    this._isPlaying = false;
    this._stopGenerators();
  },

  setVolume(v) {
    this._volume = parseFloat(v);
    if (this._audioElement) {
      this._audioElement.volume = this._volume;
    }
    if (this._gainNode && this._ctx) {
      this._gainNode.gain.setTargetAtTime(this._volume, this._ctx.currentTime, 0.1);
    }
  }
};

function initMusicSystem() {
  MusicSystem.init();
}



function toggleMusic() {
  if (!MusicSystem._ctx) MusicSystem.init();
  
  if (MusicSystem._isPlaying) {
    MusicSystem.stop();
  } else {
    // Mỗi lần bật lại sẽ đổi 1 bài ngẫu nhiên
    MusicSystem.playNext();
  }
  
  const btn = document.getElementById('btnToggleMusic');
  const lbl = document.getElementById('lblMusic');
  const sel = document.getElementById('selMusicTrack');
  const vol = document.getElementById('volumeControl');
  const iconOn = document.getElementById('iconMusicOn');
  const iconOff = document.getElementById('iconMusicOff');
  
  const isPlaying = MusicSystem._isPlaying;
  
  if (btn) {
    btn.style.background = isPlaying ? 'rgba(52,211,153,0.15)' : 'rgba(107,114,128,0.15)';
    btn.style.borderColor = isPlaying ? 'rgba(52,211,153,0.4)' : 'rgba(107,114,128,0.3)';
    btn.style.color = isPlaying ? '#34d399' : '#6b7280';
  }
  
  if (iconOn) iconOn.style.display = isPlaying ? 'inline' : 'none';
  if (iconOff) iconOff.style.display = isPlaying ? 'none' : 'inline';
  if (lbl) lbl.textContent = isPlaying ? 'Nhạc: BẬT' : 'Nhạc: TẮT';
  if (sel) {
    sel.style.display = isPlaying ? 'inline-block' : 'none';
    if (isPlaying) sel.value = MusicSystem._currentTrack;
  }
  if (vol) vol.style.display = isPlaying ? 'flex' : 'none';
  
  addLog('info', isPlaying ? '🎵 Nhạc nền Lab đã bật.' : '🔇 Nhạc nền đã tắt.');
}

function changeMusicTrack(trackId) {
  if (MusicSystem._isPlaying) {
    // Cross-fade track switch
    MusicSystem.stop();
    setTimeout(() => MusicSystem.play(trackId), 1000);
  } else {
    MusicSystem._currentTrack = trackId;
  }
}
window.toggleMusic = toggleMusic;
window.changeMusicTrack = changeMusicTrack;

// Update pH widget when container selected
function updatePHWidget(chemicals) {
  const widget = document.getElementById('phWidget');
  if (!widget) return;
  const ph = window.ChemistryEngine ? window.ChemistryEngine.calculatePH(chemicals || []) : 7.0;
  const clampedPH = Math.max(0, Math.min(14, ph));
  const pct = (clampedPH / 14) * 100;
  const marker = document.getElementById('phMarker');
  const label = document.getElementById('phValue');
  
  if (marker) {
    marker.style.left = pct + '%';
    // Dynamically change marker color to match pH
    const colors = [
      '#ff1a1a','#ff4d1a','#ff801a','#ffb31a','#ffe61a',
      '#e6ff1a','#b3ff1a','#66ff1a','#1aff66','#1affb3',
      '#1affff','#1a80ff','#1a1aff','#801aff','#b31aff'
    ];
    const phIdx = Math.round(clampedPH);
    marker.style.background = colors[phIdx] || '#fff';
    marker.style.boxShadow = `0 0 10px ${colors[phIdx]}aa, 0 0 2px rgba(0,0,0,0.5)`;
  }
  
  if (label) label.textContent = 'pH ' + (ph === 7 ? '7.0' : ph.toFixed(1));
  widget.style.opacity = chemicals && chemicals.length > 0 ? '1' : '0.4';
}
window.updatePHWidget = updatePHWidget;
