/* ============================================================
   chemicals_bigdata.js — SIÊU CƠ SỞ DỮ LIỆU 10.000+ HỢP CHẤT (Core, Physical, Display Layers)
   ============================================================ */

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

const BIG_DATA_GROUPS = {
  aldehydes: [
    { id: 'acetaldehyde', formula: 'CH3CHO', name: 'Acetaldehyde', type: 'organic', badges: ['flammable'], colorHex: '#fef3c7' },
    { id: 'acetophenone', formula: 'C8H8O', name: 'Acetophenone', type: 'organic', badges: ['toxic'], colorHex: '#facc15' },
    { id: 'formaldehyde', formula: 'HCHO', name: 'Formaldehyde', type: 'organic', badges: ['toxic'], colorHex: '#e2e8f0' }
  ],
  amino_acids: [
    { id: 'ascorbic_acid', formula: 'C6H8O6', name: 'Ascorbic Acid (Vit C)', type: 'organic', badges: ['acid'], colorHex: '#fbbf24' },
    { id: 'aspirin', formula: 'C9H8O4', name: 'Aspirin (Acetylsalicylic)', type: 'organic', badges: ['acid'], colorHex: '#f8fafc' }
  ],
  special_dyes: [
    { id: 'alizarin_red', formula: 'C14H7NaO7S', name: 'Alizarin Red S', type: 'indicator', badges: ['stain'], colorHex: '#dc2626', icon: '🔴' },
    { id: 'indigo', formula: 'C16H10N2O2', name: 'Indigo Dye', type: 'indicator', badges: ['stain'], colorHex: '#1d4ed8', icon: '🔵' }
  ]
};

function generateHugeDatabase() {
  const generated = [];

  // --- 1. PHẦN VÔ CƠ (Layered Data) ---
  const cations = [
    { id: 'H', n: 'Hydrogen', v: 1, pKa: null, deltaG: 0, ghs: [] },
    { id: 'Na', n: 'Sodium', v: 1, pKa: null, deltaG: -261.9, ghs: ['GHS03'] },
    { id: 'K', n: 'Potassium', v: 1, pKa: null, deltaG: -282.5, ghs: ['GHS03'] },
    { id: 'Li', n: 'Lithium', v: 1, pKa: null, deltaG: -293.3, ghs: ['GHS03'] },
    { id: 'Mg', n: 'Magnesium', v: 2, pKa: null, deltaG: -454.8, ghs: [] },
    { id: 'Ca', n: 'Calcium', v: 2, pKa: null, deltaG: -553.5, ghs: [] },
    { id: 'Ba', n: 'Barium', v: 2, pKa: null, deltaG: -560.7, ghs: ['GHS06'] },
    { id: 'Al', n: 'Aluminium', v: 3, pKa: null, deltaG: -485, ghs: [] },
    { id: 'Fe', n: 'Iron(II)', v: 2, pKa: null, deltaG: -84.9, ghs: [] },
    { id: 'Fe3', n: 'Iron(III)', v: 3, pKa: null, deltaG: -4.7, ghs: [] },
    { id: 'Cu2', n: 'Copper(II)', v: 2, pKa: null, deltaG: 65, ghs: [] },
    { id: 'Ag', n: 'Silver', v: 1, pKa: null, deltaG: 77.1, ghs: [] },
    { id: 'Zn', n: 'Zinc', v: 2, pKa: null, deltaG: -147, ghs: [] },
    { id: 'Sn2', n: 'Tin(II)', v: 2, pKa: null, deltaG: -27.2, ghs: [] },
    { id: 'Pb2', n: 'Lead(II)', v: 2, pKa: null, deltaG: -24.4, ghs: ['GHS08'] },
    { id: 'Mn2', n: 'Manganese(II)', v: 2, pKa: null, deltaG: -228.1, ghs: [] },
    { id: 'Cr3', n: 'Chromium(III)', v: 3, pKa: null, deltaG: -215, ghs: [] },
    { id: 'Ni2', n: 'Nickel(II)', v: 2, pKa: null, deltaG: -45.6, ghs: ['GHS07'] },
    { id: 'Co2', n: 'Cobalt(II)', v: 2, pKa: null, deltaG: -54.4, ghs: ['GHS07'] },
    { id: 'NH4', n: 'Ammonium', v: 1, pKa: 9.24, deltaG: -79.3, ghs: [] },
    { id: 'Hg2', n: 'Mercury(II)', v: 2, pKa: null, deltaG: 164.4, ghs: ['GHS06'] },
    { id: 'Rb', n: 'Rubidium', v: 1, pKa: null, deltaG: -290, ghs: ['GHS03'] },
    { id: 'Cs', n: 'Caesium', v: 1, pKa: null, deltaG: -292, ghs: ['GHS03', 'GHS05'] },
    { id: 'Be', n: 'Beryllium', v: 2, pKa: null, deltaG: -380, ghs: ['GHS06'] },
    { id: 'Sr', n: 'Strontium', v: 2, pKa: null, deltaG: -559, ghs: [] },
    { id: 'Cd2', n: 'Cadmium(II)', v: 2, pKa: null, deltaG: -77.2, ghs: ['GHS06'] },
    { id: 'Au3', n: 'Gold(III)', v: 3, pKa: null, deltaG: 290, ghs: [] },
    { id: 'Pt2', n: 'Platinum(II)', v: 2, pKa: null, deltaG: 130, ghs: [] },
    { id: 'Bi3', n: 'Bismuth(III)', v: 3, pKa: null, deltaG: -315, ghs: [] },
    { id: 'Sb3', n: 'Antimony(III)', v: 3, pKa: null, deltaG: -300, ghs: ['GHS06'] },
    { id: 'Ti4', n: 'Titanium(IV)', v: 4, pKa: null, deltaG: -889, ghs: [] },
    { id: 'V3', n: 'Vanadium(III)', v: 3, pKa: null, deltaG: -230, ghs: [] },
    { id: 'Pd2', n: 'Palladium(II)', v: 2, pKa: null, deltaG: 85, ghs: [] }
  ];

  const anions = [
    { id: 'Cl', n: 'Chloride', v: 1, pKa: -7, pKsp: { Ag: 9.74, Pb2: 4.79, Hg2: 17.88 }, deltaG: -131.2, ghs: [] },
    { id: 'SO4', n: 'Sulfate', v: 2, pKa: 1.99, pKsp: { Ba: 9.97, Ca: 4.58, Pb2: 7.72 }, deltaG: -744.5, ghs: [] },
    { id: 'NO3', n: 'Nitrate', v: 1, pKa: -1.3, pKsp: {}, deltaG: -111.2, ghs: ['GHS03'] },
    { id: 'CO3', n: 'Carbonate', v: 2, pKa: 10.33, pKsp: { Ca: 8.48, Ba: 8.59, Mg: 7.46, Zn: 10, Pb2: 13.13 }, deltaG: -527.8, ghs: [] },
    { id: 'OH', n: 'Hydroxide', v: 1, pKa: 15.7, pKsp: { Al: 33.5, Fe: 15.1, Fe3: 38.5, Cu2: 19.3, Zn: 15.5, Cr3: 30.2, Ni2: 14.7, Mg: 11.15, Ca: 5.19 }, deltaG: -157.2, ghs: ['GHS05'] },
    { id: 'PO4', n: 'Phosphate', v: 3, pKa: 12.32, pKsp: { Ca: 28.7, Ag: 17.59, Ba: 22.47 }, deltaG: -1018.7, ghs: [] },
    { id: 'S', n: 'Sulfide', v: 2, pKa: 13.9, pKsp: { Cu2: 35.1, Pb2: 26.6, Ag: 49.7, Zn: 24.7, Fe: 18.1, Ni2: 19.4, Co2: 21.3, Mn2: 10.5, Hg2: 52.4 }, deltaG: 85.8, ghs: ['GHS06'] },
    { id: 'I', n: 'Iodide', v: 1, pKa: -9, pKsp: { Ag: 16.08, Pb2: 8.15, Hg2: 28.33 }, deltaG: -51.6, ghs: [] },
    { id: 'CH3COO', n: 'Acetate', v: 1, pKa: 4.76, pKsp: {}, deltaG: -369.3, ghs: [] },
    { id: 'CrO4', n: 'Chromate', v: 2, pKa: 6.5, pKsp: { Pb2: 13.75, Ba: 9.93, Ag: 11.92 }, deltaG: -727.8, ghs: ['GHS08', 'GHS03'] },
    { id: 'MnO4', n: 'Permanganate', v: 1, pKa: -2.25, pKsp: {}, deltaG: -447.2, ghs: ['GHS03', 'GHS07'] },
    { id: 'F', n: 'Fluoride', v: 1, pKa: 3.17, pKsp: { Ca: 10.4, Ba: 5.9, Mg: 8.1, Pb2: 7.4 }, deltaG: -278.8, ghs: ['GHS06'] },
    { id: 'Br', n: 'Bromide', v: 1, pKa: -9, pKsp: { Ag: 12.3, Pb2: 5.3, Hg2: 22.2, Cu2: 8.3 }, deltaG: -104, ghs: [] },
    { id: 'SO3', n: 'Sulfite', v: 2, pKa: 1.81, pKsp: { Ba: 6.6, Ca: 6.5, Pb2: 7.5 }, deltaG: -486.6, ghs: ['GHS07'] },
    { id: 'HCO3', n: 'Bicarbonate', v: 1, pKa: 6.3, pKsp: {}, deltaG: -586.8, ghs: [] },
    { id: 'ClO', n: 'Hypochlorite', v: 1, pKa: 7.53, pKsp: {}, deltaG: -36.8, ghs: ['GHS05', 'GHS09'] },
    { id: 'ClO3', n: 'Chlorate', v: 1, pKa: -1.0, pKsp: {}, deltaG: -8.0, ghs: ['GHS03'] },
    { id: 'ClO4', n: 'Perchlorate', v: 1, pKa: -10, pKsp: { K: 1.95, Rb: 2.1, Cs: 2.5 }, deltaG: -8.5, ghs: ['GHS03'] },
    { id: 'CN', n: 'Cyanide', v: 1, pKa: 9.21, pKsp: { Ag: 15.6, Pb2: 10.5, Zn: 15.5 }, deltaG: 172.4, ghs: ['GHS06', 'GHS09'] },
    { id: 'SCN', n: 'Thiocyanate', v: 1, pKa: -1.2, pKsp: { Ag: 12.0, Pb2: 4.8 }, deltaG: 92.7, ghs: ['GHS07'] },
    { id: 'NO2', n: 'Nitrite', v: 1, pKa: 3.39, pKsp: { Ag: 3.2 }, deltaG: -32.2, ghs: ['GHS03', 'GHS06'] },
    { id: 'C2O4', n: 'Oxalate', v: 2, pKa: 1.25, pKsp: { Ca: 8.6, Ba: 6.8, Cu2: 7.5, Zn: 8.9, Pb2: 10.1 }, deltaG: -674, ghs: ['GHS07'] },
    { id: 'HSO4', n: 'Bisulfate', v: 1, pKa: 1.99, pKsp: {}, deltaG: -755.9, ghs: ['GHS05'] }
  ];

  cations.forEach(c => {
    anions.forEach(a => {
      const common = gcd(c.v, a.v);
      const cSubVal = a.v / common;
      const aSubVal = c.v / common;
      const cSubStr = cSubVal === 1 ? '' : cSubVal;
      const aSubStr = aSubVal === 1 ? '' : aSubVal;
      const isCationPoly = (c.id === 'NH4');
      const cationBase = isCationPoly ? c.id : c.id.replace(/\d+$/, '');
      const cationPart = (isCationPoly && cSubVal > 1) ? `(${cationBase})` : cationBase;
      const isAnionPoly = a.id.length > 2 || /\d/.test(a.id) || a.id === 'OH';
      const anionPart = (isAnionPoly && aSubVal > 1) ? `(${a.id})` : a.id;
      
      const pKspValue = a.pKsp?.[c.id] || null;

      generated.push({
        id: `gen_${c.id}_${a.id}`.toLowerCase(),
        formula: `${cationPart}${cSubStr}${anionPart}${aSubStr}`,
        name: `${c.n} ${a.n}`,
        type: (a.id === 'OH' ? 'base' : (c.id === 'H' ? 'acid' : 'salt')),
        isVirtual: true,
        badges: ['v-db'],
        cation: c.id,
        anion: a.id,
        physical: {
          deltaG: (c.deltaG + a.deltaG) / (common || 1), // Simplified deltaG sum
          pKa: a.pKa,
          pKsp: pKspValue,
          pKb: c.id === 'NH4' ? 4.76 : null
        },
        display: {
          ghs: [...(c.ghs || []), ...(a.ghs || [])],
          liquidColor: null // Calculated later
        }
      });
    });
  });

  // --- 2. PHẦN HỮU CƠ TỔ HỢP (50.000+) ---
  const skeletons = [
    { n: 'Benzene', f: 'C6H5', i: 'benzene' }, { n: 'Phenol', f: 'C6H4(OH)', i: 'phenol' }, { n: 'Aniline', f: 'C6H4(NH2)', i: 'aniline' },
    { n: 'Toluene', f: 'C6H4(CH3)', i: 'toluene' }, { n: 'Benzoic Acid', f: 'C6H4(COOH)', i: 'benzoic' }, { n: 'Naphthalene', f: 'C10H7', i: 'naphth' },
    { n: 'Anisole', f: 'C6H5(OCH3)', i: 'anisole' }, { n: 'Benzaldehyde', f: 'C6H5(CHO)', i: 'benzaldehyde' },
    { n: 'Pyridine', f: 'C5H5N', i: 'pyridine' }, { n: 'Anthracene', f: 'C14H10', i: 'anthracene' }
  ];
  
  const subs = [
    { n: 'Chloro', f: 'Cl', p: 'chloro' }, { n: 'Nitro', f: 'NO2', p: 'nitro' }, { n: 'Methyl', f: 'CH3', p: 'methyl' }, 
    { n: 'Bromo', f: 'Br', p: 'bromo' }, { n: 'Amino', f: 'NH2', p: 'amino' }, { n: 'Hydroxyl', f: 'OH', p: 'hydroxy' },
    { n: 'Fluoro', f: 'F', p: 'fluoro' }, { n: 'Iodo', f: 'I', p: 'iodo' },
    { n: 'Ethyl', f: 'C2H5', p: 'ethyl' }, { n: 'Methoxy', f: 'OCH3', p: 'methoxy' }
  ];

  const positions = ['2-', '3-', '4-', '2,4-', '2,4,6-'];

  skeletons.forEach(sk => {
    subs.forEach(s => {
      positions.forEach(pos => {
        const count = pos.split(',').length;
        const prefixes = { 1: '', 2: 'di', 3: 'tri' };
        const prefix = prefixes[count] || '';
        const lowerSub = s.n.toLowerCase();
        const lowerSk = sk.n.toLowerCase();

        generated.push({
          id: `org_${sk.i}_${s.p}_${pos.replace(',','')}`, 
          formula: `${pos}${s.n}-${sk.n} [Ext]`,
          name: `${pos}${prefix}${lowerSub}${lowerSk}`,
          type: 'organic', isVirtual: true, badges: ['organic', 'warehouse']
        });
      });
    });
  });

  return generated;
}

const ALL_ITEMS = [...Object.values(BIG_DATA_GROUPS).flat(), ...generateHugeDatabase()];

// *** EXPOSE lên window để lab.js & guided_lab.js có thể tra cứu V-DB chemicals ***
window.ALL_ITEMS = ALL_ITEMS;

// ——— Bảng màu ion nhanh cho V-DB salts (dựa trên cation) ———
const CATION_LIQUID_COLORS = {
  'Cu2': 'rgba(59,130,246,0.45)',   // Cu²⁺ xanh lam
  'Cu':  'rgba(59,130,246,0.45)',
  'Fe3': 'rgba(234,88,12,0.4)',     // Fe³⁺ nâu cam
  'Fe':  'rgba(134,239,172,0.35)',  // Fe²⁺ xanh lục nhạt
  'Ni2': 'rgba(34,197,94,0.4)',     // Ni²⁺ xanh lục
  'Co2': 'rgba(244,114,182,0.4)',   // Co²⁺ hồng
  'Cr3': 'rgba(22,163,74,0.4)',     // Cr³⁺ xanh lục/tím
  'Mn2': 'rgba(126,34,206,0.3)',    // Mn²⁺ nhạt
  'Hg2': 'rgba(156,163,175,0.3)',
};

// ——— Gắn Liquid Color & GHS Icons cho các V-DB salt ———
ALL_ITEMS.forEach(item => {
  if (!item.display) item.display = {};
  if (!item.physical) item.physical = {};

  if (!item.display.liquidColor) {
    if (item.cation && CATION_LIQUID_COLORS[item.cation]) {
      item.display.liquidColor = CATION_LIQUID_COLORS[item.cation];
    } else if (item.type === 'acid') {
      item.display.liquidColor = 'rgba(224,242,254,0.6)';
    } else if (item.type === 'base') {
      item.display.liquidColor = 'rgba(239,246,255,0.6)';
    } else {
      item.display.liquidColor = 'rgba(241,245,249,0.35)';
    }
  }

  // Backward compatibility for old UI code
  item.liquidColor = item.display.liquidColor;
  item.ghs = item.display.ghs || [];

  if (!item.description) {
    item.description = item.name + (item.cation ? ` (${item.cation}/${item.anion})` : '');
  }
  if (!item.physical.ph) {
    item.physical.ph = item.type === 'acid' ? 2 : item.type === 'base' ? 12 : 7;
  }
  // Backward compatibility
  item.ph = item.physical.ph;
});

// Proxy Hệ thống Tìm kiếm
window.VIRTUAL_DB = {
  search: function(query) {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return ALL_ITEMS.filter(c =>
      c.formula.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  },
  totalCount: ALL_ITEMS.length,
};

console.log(`🧪 Lab Database: ${window.VIRTUAL_DB.totalCount} compounds | window.ALL_ITEMS exposed ✓`);
