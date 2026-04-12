/* ============================================================
   lab.js — Main Lab Controller & SVG Renderers
   ============================================================ */

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
  if (welcomeSafetyState[type]) {
    el.classList.add('equipped');
  } else {
    el.classList.remove('equipped');
  }
  
  const allReady = welcomeSafetyState.goggles && welcomeSafetyState.gloves && welcomeSafetyState['lab-coat'];
  const btn = document.getElementById('btnEnterLab');
  btn.disabled = !allReady;
}

function startExperience() {
  playQuantumSound(1200, 0.1, 'sine');
  const intro = document.getElementById('introOverlay');
  intro.classList.add('hide');
  
  // Show setup modal after a short delay for cinematic transition
  setTimeout(() => {
    document.getElementById('welcomeSetupModal').classList.add('show');
    addLog('info', '🛡️ Bước 1: Trang bị bảo hộ cá nhân.');
  }, 500);
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
  
  addLog('success', '🛡️ Trang bị bảo hộ hoàn tất! Tủ hút khí đã bật sẵn.');
}

// ——— INIT ———
document.addEventListener('DOMContentLoaded', () => {
  initIntroParticles();
  initCanvas();
  renderTools();
  renderChemicals();
  setupWorkspaceDrop();
  loadExperiment('electrolysis');
  addLog('info', '🔬 Phòng thí nghiệm sẵn sàng. Chào mừng bạn!');
});

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
      <!-- Liquid -->
      ${liqH > 0 ? `
        <path d="M 8 ${142 - liqH} L 8 130 Q 8 142 20 142 Q 32 142 32 130 L 32 ${142 - liqH} Z" 
          fill="${liq}" opacity="0.85"/>
        <ellipse cx="20" cy="${142 - liqH}" rx="12" ry="3" fill="${liq}"/>
      ` : ''}
      <!-- Sediment Layer (Kết tủa) -->
      ${precCol ? `
        <path d="M 8 135 L 8 130 Q 8 142 20 142 Q 32 142 32 130 L 32 135 Z"
          fill="${precCol}" opacity="0.95"/>
        <ellipse cx="20" cy="135" rx="12" ry="4" fill="${precCol}"/>
      ` : ''}
      <!-- Reflections -->
      <line x1="12" y1="15" x2="12" y2="120" stroke="rgba(255,255,255,0.15)" stroke-width="2" stroke-linecap="round"/>
      <!-- Gas bubbles (if active) -->
      ${item.effervescing ? `
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
      ${liqH > 0 ? `
        <path d="M ${12 + (60*(90-10-liqH)/80)} ${90 - liqH}
                 L ${6 + 2*(90-liqH-10)/8} ${90 - liqH}
                 Q 6 ${90-liqH} 6 ${90-liqH+4}
                 L 6 82 Q 6 88 40 88 Q 74 88 74 82 L 74 ${90-liqH+4}
                 Q 74 ${90-liqH} 74 ${90-liqH} L ${68-(60*(90-10-liqH)/80)} ${90-liqH} Z"
          fill="${liq}" opacity="0.9"/>
        <ellipse cx="40" cy="${90 - liqH}" rx="${28 + (liqH/90)*5}" ry="4" fill="${liq}"/>
        <ellipse cx="40" cy="${90 - liqH}" rx="${28 + (liqH/90)*5}" ry="4" fill="rgba(255,255,255,0.12)"/>
      ` : ''}
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
      ${liqH > 0 ? `
        <rect x="10" y="${108 - liqH}" width="60" height="${liqH}" 
          fill="${liq}" clip-path="url(#fc-${item.uid})"/>
        <ellipse cx="40" cy="${108 - liqH}" rx="30" ry="4" fill="${liq}" 
          clip-path="url(#fc-${item.uid})" opacity="0.8"/>
      ` : ''}
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
      <!-- Base -->
      <rect x="10" y="65" width="40" height="10" rx="4"
        fill="#334155" stroke="#475569" stroke-width="1.5"/>
      <!-- Barrel -->
      <rect x="24" y="20" width="12" height="48" rx="3"
        fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
      <!-- Air holes -->
      <circle cx="30" cy="40" r="2" fill="#0f172a"/>
      <circle cx="30" cy="50" r="2" fill="#0f172a"/>
      <!-- Nozzle -->
      <ellipse cx="30" cy="20" rx="8" ry="3" fill="#334155" stroke="#475569" stroke-width="1"/>
      ${on ? `
        <!-- Flame (animated via CSS class) -->
        <ellipse cx="30" cy="16" rx="6" ry="8" fill="rgba(251,191,36,0.3)"
          class="heating"/>
        <ellipse cx="30" cy="14" rx="4" ry="6" fill="rgba(251,191,36,0.6)"/>
        <ellipse cx="30" cy="11" rx="3" ry="5" fill="rgba(254,240,138,0.8)"/>
        <ellipse cx="30" cy="8" rx="2" ry="3" fill="#fff" opacity="0.9"/>
      ` : `
        <!-- Wick -->
        <line x1="30" y1="20" x2="30" y2="14" stroke="#6b7280" stroke-width="2"/>
      `}
      <!-- Gas valve -->
      <circle cx="42" cy="62" r="4" fill="#374151" stroke="#4b5563" stroke-width="1"/>
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
    const svgHTML = SVG_RENDERERS[tool.render] ? SVG_RENDERERS[tool.render]({ state: 'idle', equipped: false, active: false, liquidLevel: 0 }) : tool.icon;
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
      const x = rect.width / 2;
      const y = rect.height / 2;
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
      'acid': 'Axit', 'base': 'Bazơ', 'salt': 'Muối', 'oxide': 'Oxit', 
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
          addLog('info', `🧪 ${selected.name} đã lấy trực tiếp ${chem.formula}.`);
          refreshWorkspaceItem(selected);
          return;
        }
      }
      
      const surface = document.getElementById('workspaceSurface');
      const rect = surface.getBoundingClientRect();
      const x = rect.width / 2;
      const y = rect.height / 2;
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
function addChemicalToContainer(container, chemItem) {
  if (container.isReacting) {
    addLog('warning', '⚠️ Phản ứng đang chuẩn bị diễn ra, không thể thêm chất lúc này!');
    return;
  }

  const chem = CHEMICALS.find(c => c.id === chemItem.chemId) || window.ALL_ITEMS?.find(c => c.id === chemItem.chemId);
  if (!chem) return;

  // --- NEW: FUNNEL FILTRATION CHECK ---
  const attachedFunnel = state.workspaceItems.find(it => it.toolId === 'funnel' && it.attachedTo === container.uid);
  if (attachedFunnel) {
    if (chem.type === 'solid' || chem.type === 'metal' || chem.id.includes('solid')) {
      attachedFunnel.hasFilterPaper = true;
      attachedFunnel.precipitates = (attachedFunnel.precipitates || []);
      attachedFunnel.precipitates.push(chem.id);
      addLog('info', `📥 ${chem.name} bị giữ lại trên phễu lọc.`);
      refreshWorkspaceItem(attachedFunnel);
      return; // Solid does not enter container
    }
  }

  container.chemicals.push(chem);

  // --- NEW: CALCULATIVE ENGINE INTEGRATION ---
  if (window.ChemistryEngine) {
    // 1. Calculate new pH
    container.ph = window.ChemistryEngine.calculatePH(container.chemicals);
    
    // 2. Calculate new color
    container.liquidColor = window.ChemistryEngine.calculateSolutionColor(container.chemicals, container.ph);
    
    // 3. Update level
    container.liquidLevel = Math.min((container.liquidLevel || 0) + 20, 85);

    // 4. Safety Check
    const risk = window.ChemistryEngine.checkSafetyRisk(container.chemicals, container);
    if (risk) {
      addLog('danger', risk.message);
      if (risk.type === 'fire') {
        triggerReactionEffect('bubbles-intense', container.x + 40, container.y + 40, { color: '#f59e0b' });
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
        addLog('warning', `🔴 Quỳ chuyển ĐỎ — Môi trường AXIT (pH ≈ ${ph.toFixed(1)})`);
      } else if (ph > 7.5) { // Base range
        if (litmus.litmusState === 'blue') return;
        litmus.litmusState = 'blue';
        addLog('success', `🔵 Quỳ chuyển XANH — Môi trường BAZƠ (pH ≈ ${ph.toFixed(1)})`);
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

  if (contents.length < 2) return;

  // 3. COMBUSTION CHECK (O2 + Heat)
  if (window.ChemistryEngine) {
    const combustion = window.ChemistryEngine.checkCombustion(contents, state.environment);
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

  // 4. GUNPOWDER REACTION CHECK (3 agents)
  if (window.ChemistryEngine) {
    const gunpowder = window.ChemistryEngine.checkGunpowder(contents, state.environment);
    if (gunpowder) {
      if (gunpowder.type === 'gunpowder_explosion') {
        executeReaction(beaker, {
          equation: gunpowder.equation,
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
        return;
      } else if (gunpowder.type === 'gunpowder_mixture') {
        // Chỉ hiện lần đầu khi đủ 3 thành phần — KHÔNG dùng modal cảnh báo (chưa có nhiệt)
        const isAlreadyMixed = beaker._gunpowderMixed;
        if (!isAlreadyMixed) {
          beaker._gunpowderMixed = true;
          // Đổi màu sang đen xám như bột thuốc súng
          beaker.liquidColor = 'rgba(20,15,10,0.95)';
          beaker.liquidLevel = Math.max(beaker.liquidLevel || 0, 40);
          
          // Hiện synthesis banner + log — KHÔNG hiện modal nguy hiểm (hazardLevel=0)
          updateActiveReactionDisplay({
            equation: '2KNO₃ + S + 3C ⟶ Hỗn hợp thuốc súng đen',
            observation: '🧨 Hỗn hợp bột đen hình thành. Thêm nguồn NHIỆT để kích nổ!',
            synthesis: { name: '🧨 Đang điều chế: THUỐC SÚNG ĐEN', icon: '💣', category: 'Thuốc súng / Pháo hoa' }
          });
          addLog('danger', '💣 Đã tạo hỗn hợp thuốc súng đen! ĐỪNG đưa gần lửa!');
          refreshWorkspaceItem(beaker);
        }
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
      const flash = document.createElement('div');
      flash.style.position = 'fixed';
      flash.style.inset = '0';
      flash.style.backgroundColor = 'white';
      flash.style.zIndex = '9999';
      flash.style.opacity = '0.9';
      flash.style.transition = 'opacity 0.8s ease-out';
      flash.style.pointerEvents = 'none';
      document.body.appendChild(flash);
      
      // Kích hoạt nổ rung lắc mạnh
      document.body.classList.add('shake');
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          flash.style.opacity = '0';
        });
      });
      setTimeout(() => {
        flash.remove();
        document.body.classList.remove('shake');
      }, 800);
    }

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
    const cx = container.x + 40;
    const cy = container.y + (container.liquidLevel ? (100 - container.liquidLevel) : 40);
    triggerReactionEffect(reaction.effect, cx, cy, reaction);

    // Toxic gas overlay
    if (reaction.toxicGas) {
      showToxicOverlay(`⚠️ Khí ${reaction.toxicGas.formula} độc đang thoát ra! Bật tủ hút ngay!`);
      setTimeout(hideToxicOverlay, 5000);
    }

    // Thiết lập vỡ cốc
    if (reaction.shatter) {
        setTimeout(() => {
            addLog('danger', `💥 VỤ NỐ QUÁ LỚN! Dụng cụ chứa đã bị phá hủy!`);
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
    addLog(reaction.logType || 'info', `⚗️ ${reaction.equation}`);
    
    // Thermodynamic info
    if (window.ChemistryEngine) {
      const thermalDesc = window.ChemistryEngine.getThermalEffect(reaction);
      addLog('info', `🔥 Nhiệt động lực: ${thermalDesc}`);
    }

    if (reaction.observation) {
      addLog('warning', `👁️ ${reaction.observation}`);
    }

    // Cập nhật bảng hiển thị phản ứng persistent
    updateActiveReactionDisplay(reaction);

    // Refresh
    refreshWorkspaceItem(container);
  };

  if (isDangerous) {
    // Khóa tạm container vô thời hạn cho tới khi người dùng nhấn "Đã hiểu"
    container.isReacting = true;
    document.body.classList.add('shake'); // Rung nhẹ cảnh báo
    setTimeout(() => document.body.classList.remove('shake'), 400);

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
        titleType = '🔥 CẢNH BÁO: BỎNG HÓA CHẤT / VĂNG BẮN AXIT!';
        headerColor = '#ea580c'; // Orange for burn
    } else if (reaction.hazardType === 'explosion' || reaction.effect?.includes('explosion') || reaction.shatter) {
        titleType = '⚠️ CẢNH BÁO: NGUY CƠ CHÁY NỔ LỚN!';
        headerColor = '#dc2626'; // Red
    }

    showDanger(titleType, warnMsg, () => {
      container.isReacting = false;
      performEffects();
    }, headerColor);
  } else {
    performEffects();
  }
}


function updateActiveReactionDisplay(reaction) {

  const display = document.getElementById('activeReactionDisplay');
  const eqEl = document.getElementById('ardEquation');
  const obsEl = document.getElementById('ardObservation');
  
  if (!display || !eqEl || !obsEl) return;

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
      const surface = document.getElementById('workspaceSurface');
      if (!surface) return;
      const rect = surface.getBoundingClientRect();
      
      let newX = startLeft + (e2.clientX - startX);
      let newY = startTop + (e2.clientY - startY);
      
      // Clamp coordinates (using offsets to keep items mostly contained)
      newX = Math.max(-10, Math.min(newX, rect.width - 60));
      newY = Math.max(-10, Math.min(newY, rect.height - 100));

      item.x = newX;
      item.y = newY;
      el.style.left = item.x + 'px';
      el.style.top = item.y + 'px';
    };
    const onUp = () => {
      el.style.zIndex = '20';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      
      // Snap inside on drop for strictness
      const surface = document.getElementById('workspaceSurface');
      if (surface) {
        const rect = surface.getBoundingClientRect();
        item.x = Math.max(10, Math.min(item.x, rect.width - 70));
        item.y = Math.max(10, Math.min(item.y, rect.height - 100));
        el.style.left = item.x + 'px';
        el.style.top = item.y + 'px';
      }

      // Check if dropped onto another item for interaction
      handleDropInteractions(item);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
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

            // 1. Ưu tiên kiểm tra thuốc súng — hiện modal cảnh báo trước khi nổ
            if (window.ChemistryEngine) {
              const gp = window.ChemistryEngine.checkGunpowder(beaker.chemicals, env);
              if (gp && gp.type === 'gunpowder_explosion') {
                executeReaction(beaker, {
                  equation: '2KNO₃ + S + 3C → K₂S + N₂↑ + 3CO₂↑',
                  type: 'explosion',
                  effect: 'explosion-violent',
                  observation: '💣 THUỐC SÚNG ĐEN BẮT LỬA! Phản ứng nổ dây chuyền không thể dừng!',
                  synthesis: { name: '💣 THUỐC SÚNG ĐEN PHÁT NỔ!', icon: '💥', category: 'Vũ khí / Pháo hoa' },
                  logType: 'danger',
                  hazardLevel: 3,
                  hazardType: 'explosion',
                  shatter: true,
                  colorChange: { end: '#fbbf24' }
                });
                return;
              }
            }

            // 2. Kiểm tra HEAT_REACTIONS
            if (window.HEAT_REACTIONS) {
              for (const [key, rxn] of Object.entries(window.HEAT_REACTIONS)) {
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
    addLog('warning', `⚠️ Tủ hút khí: TẮT`);
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
        addLog('warning', `⚠️ ${combo.message}`);
      }
    }
  }
}

// ——— LOG SYSTEM ———
function addLog(type, message) {
  const entries = document.getElementById('logEntries');
  const div = document.createElement('div');
  div.className = `log-entry ${type}`;
  const now = new Date();
  const time = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  div.innerHTML = `<span class="log-time">${time}</span><span>${message}</span>`;
  entries.appendChild(div);
  entries.scrollTop = entries.scrollHeight;
  state.logCount++;
}

function clearLog() {
  document.getElementById('logEntries').innerHTML = '';
  state.logCount = 0;
}

// ——— DANGER OVERLAY ———
let _dangerCallback = null;

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

// ——— REACTION MODAL ———
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
    'neutralization': 'Trung hòa (Axit + Bazơ)',
    'acid-carbonate': 'Axit + Cacbonat → CO₂',
    'metal-acid': 'Kim loại + Axit',
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
  if (_configType === 'molarity') {
    return `
      <div class="config-grid">
        <button class="config-preset-btn" onclick="setPresetValue('0.1')">0.1 M</button>
        <button class="config-preset-btn selected" onclick="setPresetValue('1.0')">1.0 M</button>
        <button class="config-preset-btn" onclick="setPresetValue('2.0')">2.0 M</button>
        <button class="config-preset-btn" onclick="setPresetValue('5.0')">5.0 M</button>
        <button class="config-preset-btn" onclick="setPresetValue('10.0')">10.0 M</button>
        <button class="config-preset-btn" onclick="setPresetValue('18.0')">18.0 M</button>
      </div>
      <div class="custom-input-group">
        <label>Tùy chỉnh (M):</label>
        <input type="number" id="customChemValue" value="1.0" step="0.1" min="0">
      </div>
    `;
  } else {
    return `
      <div class="config-grid">
        <button class="config-preset-btn" onclick="setPresetValue('1')">1 g</button>
        <button class="config-preset-btn" onclick="setPresetValue('5')">5 g</button>
        <button class="config-preset-btn selected" onclick="setPresetValue('10')">10 g</button>
        <button class="config-preset-btn" onclick="setPresetValue('50')">50 g</button>
        <button class="config-preset-btn" onclick="setPresetValue('100')">100 g</button>
        <button class="config-preset-btn" onclick="setPresetValue('500')">500 g</button>
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
    
    addLog('info', `🧪 Đã thêm ${chem.formula} (${val}${_configType === 'molarity' ? 'M' : 'g'})`);
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
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) {
    loadExperiment(state.currentExperiment);
    renderToolManual();
  }
}

function switchGuideTab(tab) {
  const tabs = document.querySelectorAll('.g-tab');
  const contents = document.querySelectorAll('.guide-tab-content');
  
  tabs.forEach(t => {
    const isTarget = (tab === 'steps' && t.textContent.includes('Thực hành')) || 
                     (tab === 'tools' && t.textContent.includes('Dụng cụ'));
    t.classList.toggle('active', isTarget);
  });
  
  document.getElementById('guideStepsContent').classList.toggle('active', tab === 'steps');
  document.getElementById('toolManualContent').classList.toggle('active', tab === 'tools');
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
    // If clicking a container
    const isContainer = TOOLS.find(t => t.id === tId)?.category === 'container';
    
    if (isContainer) {
      if (!source.holdingColor) {
        // HÚT (Suck up)
        if (target.chemicals.length > 0 && (target.liquidLevel || 0) > 0) {
          source.holdingColor = target.liquidColor || 'rgba(186,230,253,0.5)';
          source.holdingChemicals = [...target.chemicals];
          
          // Decrease liquid level in target
          target.liquidLevel = Math.max(0, (target.liquidLevel || 0) - 20);
          if (target.liquidLevel === 0) {
            target.chemicals = [];
            target.liquidColor = null;
            target.activePrecipitate = null;
          }
          
          addLog('info', `🧪 ${source.name} đã hút dung dịch.`);
          refreshWorkspaceItem(source);
          refreshWorkspaceItem(target);
        } else {
          addLog('warning', `⚠️ Không còn dung dịch để hút.`);
        }
      } else {
        // NHỎ (Drop)
        addChemicalToContainer(target, { chemId: source.holdingChemicals[0]?.id || 'water' }); 
        // Note: simplified to add the first chemical. Real engine would add the mixture.
        addLog('success', `💧 Đã nhỏ dung dịch từ ${source.name} vào ${target.name}.`);
        source.holdingColor = null;
        source.holdingChemicals = [];
        refreshWorkspaceItem(source);
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
      addLog('success', `🔌 Đã nối dây ${beamColor} vào điện cực.`);
      
      const cellId = target.attachedTo;
      if (cellId) {
        const cell = state.workspaceItems.find(it => it.uid === cellId);
        if (cell) checkElectrolysis(cell);
      }
    } else {
      addLog('warning', `⚠️ Bộ nguồn chỉ có 2 đầu ra. Hãy xóa bớt kết nối cũ.`);
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
    addLog('success', `🎨 Đã nhỏ chỉ thị ${indicatorId} vào ${target.name}.`);
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
      addLog('danger', `⚠️ CẢNH BÁO: Dòng điện 24V đang làm nóng bộ nguồn!`);
      supply.overloadWarningShown = true;
    }

    const conductivity = window.ChemistryEngine.checkConductivity(cell.chemicals);
    if (conductivity > 0) {
      cell.effervescing = true;
      const volt = supply.voltage || 12;
      const intensity = volt >= 24 ? 'bubbles-violent' : volt >= 12 ? 'bubbles-fast' : 'bubbles';
      
      addLog('warning', `⚡ Đang điện phân (${volt}V)... Xuất hiện bọt khí mạnh tại các điện cực.`);
      
      electrodes.forEach(e => {
        const prodColor = e.connectionType === 'positive' ? '#fff' : '#bae6fd';
        triggerReactionEffect(intensity, e.x + 10, e.y + 60, { color: prodColor });
      });
    } else {
      addLog('info', `ℹ️ Dung dịch không dẫn điện, bọt khí không xuất hiện.`);
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
    addLog('info', `🔌 Nguồn điện: ${item.active ? 'BẬT' : 'TẮT'}`);
  } else if (target.closest('.btn-volt-cycle')) {
    const volts = [6, 12, 24];
    const idx = volts.indexOf(item.voltage || 12);
    item.voltage = volts[(idx + 1) % volts.length];
    addLog('info', `⚡ Điện áp đã chỉnh thành: ${item.voltage}V`);
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
    addLog('info', `🌀 Đang khuấy...`);
    // Find nearby container
    const container = state.workspaceItems.find(it => 
      it.type === 'tool' && 
      TOOLS.find(t => t.id === it.toolId)?.category === 'container' &&
      Math.hypot(it.x - item.x, it.y - item.y) < 60
    );
    if (container && container.activePrecipitate) {
      // Logic hòa tan kết tủa cơ bản khi khuấy
      addLog('success', `✨ Việc khuấy giúp tăng tốc độ hòa tan.`);
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

  // Clear particles
  if (typeof particles !== 'undefined') particles.length = 0;

  hideToxicOverlay();
  updateDropHint();
  updateSafetyStatus();
  addLog('info', '🔄 Lab đã được đặt lại.');
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
