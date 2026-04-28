/* ============================================================
   optimization_lab.js — Module Tối ưu hóa Đa phản ứng (IDCL)
   Mô phỏng cân bằng hóa học & Chuyển dịch Le Chatelier
   ============================================================ */

const OPT_REACTIONS = {
  haber: {
    id: 'haber',
    name: "TỔNG HỢP AMONIAC (HABER-BOSCH)",
    reactant: "N₂ + 3H₂",
    product: "2NH₃",
    delta: "ΔH < 0",
    yieldLabel: "HIỆU SUẤT NH₃",
    costLabel: "CHI PHÍ NĂNG LƯỢNG",
    explanation: "<b>Nguyên lý Le Chatelier:</b> Phản ứng có $\\Delta H < 0$ (tỏa nhiệt) và làm giảm thể tích khí (4 mol $\\rightarrow$ 2 mol). Do đó, tăng áp suất và hạ nhiệt độ sẽ làm cân bằng chuyển dịch theo chiều thuận (tạo $NH_3$). Tuy nhiên trong công nghiệp, cần duy trì $450^\\circ C$ làm điểm cân bằng giữa vận tốc phản ứng và hiệu suất.",
    controls: [
      { id: 'temp', label: 'NHIỆT ĐỘ', min: 200, max: 800, def: 450, step: 10, unit: '°C', hintMin: 'Lạnh (Thuận)', hintMax: 'Nóng (Nghịch)' },
      { id: 'press', label: 'ÁP SUẤT', min: 1, max: 500, def: 200, step: 10, unit: 'atm', hintMin: 'Thấp', hintMax: 'Cao (Thuận)' },
      { id: 'ratio', label: 'TỈ LỆ H₂/N₂', min: 1, max: 10, def: 3, step: 0.1, unit: '', hintMin: 'Ít H₂', hintMax: 'Nhiều H₂' }
    ],
    calc: (a, b, c) => {
      const tK = a + 273.15;
      const tempFactor = Math.exp(2500 / tK) / 20;
      const pressFactor = Math.pow(b / 200, 0.6);
      const ratioFactor = 1 - Math.abs(c - 3) / 5;
      let y = 15 * tempFactor * pressFactor * ratioFactor;
      y = Math.min(98, Math.max(1, y));
      const cost = (b * 0.5) + (a * 0.2);
      let msg = "Trạng thái tối ưu! Cân bằng hoàn hảo.";
      if (a < 350) msg = "Sản lượng cao nhưng tốc độ phản ứng cực chậm trong thực tế.";
      if (b > 400) msg = "CẢNH BÁO: Áp suất nguy hiểm! Chi phí năng lượng tăng vọt.";
      return { yield: y, cost, msg, costUnit: 'GJ/h' };
    }
  },
  ester: {
    id: 'ester',
    name: "PHẢN ỨNG ESTE HÓA",
    reactant: "CH₃COOH + C₂H₅OH",
    product: "CH₃COOC₂H₅ + H₂O",
    delta: "ΔH ≈ 0",
    yieldLabel: "HIỆU SUẤT TẠO ESTE",
    costLabel: "HAO PHÍ HÓA CHẤT",
    explanation: "<b>Nguyên lý Le Chatelier:</b> Phản ứng có $\\Delta H \\approx 0$ nên nhiệt độ không ảnh hưởng trực tiếp đến dịch chuyển cân bằng (chỉ làm tăng vận tốc đạt cân bằng). Vai trò của xúc tác $H_2SO_4$ đặc là cốt lõi: tăng tốc độ phản ứng và hút nước để phá vỡ thế cân bằng, dịch chuyển theo chiều thuận.",
    controls: [
      { id: 'temp', label: 'NHIỆT ĐỘ', min: 20, max: 150, def: 70, step: 5, unit: '°C', hintMin: 'Thường', hintMax: 'Đun sôi (Thuận)' },
      { id: 'cat', label: 'XÚC TÁC H₂SO₄', min: 0, max: 5, def: 2, step: 0.5, unit: 'ml', hintMin: 'Không phản ứng', hintMax: 'Đủ' },
      { id: 'ratio', label: 'TỈ LỆ Acid/Rượu', min: 0.2, max: 5, def: 1, step: 0.1, unit: '', hintMin: 'Dư Acid', hintMax: 'Dư Rượu' }
    ],
    calc: (a, b, c) => {
      const tempFactor = a > 60 ? 1.0 : a / 60;
      const catFactor = b > 0 ? Math.min(1.0, b / 2.0) : 0.05;
      const ratioFactor = 1 - Math.abs(c - 1) / 3;
      let y = 65 * tempFactor * catFactor * ratioFactor;
      y = Math.min(85, Math.max(1, y));
      const cost = (b * 10) + (a * 0.1);
      let msg = "Phản ứng este hóa cần đun nóng và có mặt H₂SO₄ đặc làm chất hút nước.";
      if (b === 0) msg = "Thiếu xúc tác H₂SO₄ đặc, phản ứng gần như không xảy ra.";
      return { yield: y, cost, msg, costUnit: 'g/h' };
    }
  },
  fescn: {
    id: 'fescn',
    name: "CÂN BẰNG PHỨC SẮT(III) THIOXYANAT",
    reactant: "Fe³⁺ + 3SCN⁻",
    product: "[Fe(SCN)]²⁺",
    delta: "ΔH < 0",
    yieldLabel: "ĐỘ ĐẬM MÀU ĐỎ MÁU",
    costLabel: "TIÊU HAO ION KIM LOẠI",
    explanation: "<b>Nguyên lý Le Chatelier:</b> Thêm ion $Fe^{3+}$ hoặc $SCN^-$ làm tăng nồng độ chất tham gia, cân bằng dịch chuyển mạnh theo chiều Thuận (màu đỏ đậm lên). Do phản ứng tỏa nhiệt, hạ thấp nhiệt độ cũng hỗ trợ tạo phức màu đỏ.",
    controls: [
      { id: 'fe', label: 'NỒNG ĐỘ Fe³⁺', min: 0.01, max: 0.5, def: 0.1, step: 0.01, unit: 'M', hintMin: 'Nhạt', hintMax: 'Đậm' },
      { id: 'scn', label: 'NỒNG ĐỘ SCN⁻', min: 0.01, max: 0.5, def: 0.1, step: 0.01, unit: 'M', hintMin: 'Nhạt', hintMax: 'Đậm' },
      { id: 'temp', label: 'NHIỆT ĐỘ', min: 0, max: 100, def: 25, step: 5, unit: '°C', hintMin: 'Làm lạnh (Thuận)', hintMax: 'Đun nóng (Nghịch)' }
    ],
    calc: (a, b, c) => {
      const concFactor = (a * 2) * (b * 5) * 20;
      const tempFactor = Math.exp(300 / (c + 273.15)) / 2.5;
      let y = 50 * concFactor * tempFactor;
      y = Math.min(99, Math.max(1, y));
      const cost = (a + b) * 100;
      let msg = "Tăng nồng độ chất tham gia làm cân bằng chuyển dịch theo chiều thuận.";
      if (c > 60) msg = "Nhiệt độ cao làm cân bằng dịch chuyển sang chiều nghịch (nhạt màu).";
      return { yield: y, cost, msg, costUnit: 'mmol' };
    }
  },
  no2: {
    id: 'no2',
    name: "CÂN BẰNG KHÍ NÂU ĐỎ: 2NO₂ ⇌ N₂O₄",
    reactant: "2NO₂ (Nâu đỏ)",
    product: "N₂O₄ (Không màu)",
    delta: "ΔH < 0",
    yieldLabel: "TỈ LỆ N₂O₄ (KHÔNG MÀU)",
    costLabel: "ÁP SUẤT HỆ THỐNG",
    explanation: "<b>Nguyên lý Le Chatelier:</b> Phản ứng giảm thể tích khí (2 mol $\\rightarrow$ 1 mol) và tỏa nhiệt. Tăng áp suất hoặc làm lạnh hệ thống sẽ ép cân bằng dịch chuyển sang bên Thuận, hấp thụ bớt màu nâu đỏ của $NO_2$, sinh ra $N_2O_4$ không màu.",
    controls: [
      { id: 'temp', label: 'NHIỆT ĐỘ', min: 0, max: 100, def: 25, step: 5, unit: '°C', hintMin: 'Lạnh (Thuận)', hintMax: 'Nóng (Nghịch)' },
      { id: 'press', label: 'ÁP SUẤT', min: 0.5, max: 5, def: 1, step: 0.1, unit: 'atm', hintMin: 'Thấp (Nghịch)', hintMax: 'Cao (Thuận)' },
      { id: 'conc', label: 'NỒNG ĐỘ NO₂', min: 0.1, max: 2.0, def: 0.5, step: 0.1, unit: 'M', hintMin: 'Loãng', hintMax: 'Đặc' }
    ],
    calc: (a, b, c) => {
      const tK = a + 273.15;
      const tempFactor = Math.exp(1500 / tK) / 150;
      const pressFactor = Math.pow(b, 0.8);
      let y = 40 * tempFactor * pressFactor * (c / 0.5);
      y = Math.min(95, Math.max(5, y));
      const cost = b * 20;
      let msg = "Nhiệt độ lạnh làm cân bằng dịch sang chiều Thuận, tạo N₂O₄ không màu.";
      if (a > 50) msg = "Nhiệt độ nóng làm khí chuyển sang màu nâu đỏ đậm của NO₂.";
      return { yield: y, cost, msg, costUnit: 'bar' };
    },
    reactantColor: "#A52A2A", // Nâu đỏ
    productColor: "#FFFFFF"   // Trắng (Không màu)
  }
};

window.OptimizationLab = {
  currentReaction: 'haber',
  state: {
    a: 0,
    b: 0,
    c: 0,
    yield: 0,
    cost: 0
  },

  init() {
    // Tiêm phản ứng thuận nghịch vào database chính để hiện lên bảng trạng thái
    if (window.HEAT_REACTIONS) {
      window.HEAT_REACTIONS['n2+h2'] = {
        reactants: ['n2', 'h2'],
        products: ['NH₃'],
        equation: 'N₂ + 3H₂ ⇌ 2NH₃',
        type: 'equilibrium',
        synthesis: { name: 'Tổng hợp Amoniac (Haber-Bosch)', icon: '💨', category: 'Thuận nghịch' },
        particles: [{ type: 'bubble', color: '#38bdf8', count: 10 }],
        description: 'Phản ứng thuận nghịch điều chế Amoniac.',
        observation: '💨 Quá trình tổng hợp Amoniac đang diễn ra cân bằng.',
        requires: { heat: true }
      };
      window.HEAT_REACTIONS['n2_gas+h2_gas'] = {
        reactants: ['n2_gas', 'h2_gas'],
        products: ['NH₃'],
        equation: 'N₂ + 3H₂ ⇌ 2NH₃',
        type: 'equilibrium',
        synthesis: { name: 'Tổng hợp Amoniac (Haber-Bosch)', icon: '💨', category: 'Thuận nghịch' },
        particles: [{ type: 'bubble', color: '#38bdf8', count: 10 }],
        description: 'Phản ứng thuận nghịch điều chế Amoniac.',
        observation: '💨 Quá trình tổng hợp Amoniac đang diễn ra cân bằng.',
        requires: { heat: true }
      };
      window.HEAT_REACTIONS['n2+h2_gas'] = {
        reactants: ['n2', 'h2_gas'],
        products: ['NH₃'],
        equation: 'N₂ + 3H₂ ⇌ 2NH₃',
        type: 'equilibrium',
        synthesis: { name: 'Tổng hợp Amoniac (Haber-Bosch)', icon: '💨', category: 'Thuận nghịch' },
        particles: [{ type: 'bubble', color: '#38bdf8', count: 10 }],
        description: 'Phản ứng thuận nghịch điều chế Amoniac.',
        observation: '💨 Quá trình tổng hợp Amoniac đang diễn ra cân bằng.',
        requires: { heat: true }
      };
      window.HEAT_REACTIONS['n2_gas+h2'] = {
        reactants: ['n2_gas', 'h2'],
        products: ['NH₃'],
        equation: 'N₂ + 3H₂ ⇌ 2NH₃',
        type: 'equilibrium',
        synthesis: { name: 'Tổng hợp Amoniac (Haber-Bosch)', icon: '💨', category: 'Thuận nghịch' },
        particles: [{ type: 'bubble', color: '#38bdf8', count: 10 }],
        description: 'Phản ứng thuận nghịch điều chế Amoniac.',
        observation: '💨 Quá trình tổng hợp Amoniac đang diễn ra cân bằng.',
        requires: { heat: true }
      };

      window.HEAT_REACTIONS['ch3cooh+c2h5oh'] = {
        reactants: ['ch3cooh', 'c2h5oh'],
        products: ['CH₃COOC₂H₅', 'H₂O'],
        equation: 'CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O',
        type: 'equilibrium',
        synthesis: { name: 'Phản ứng Este hóa', icon: '🍏', category: 'Thuận nghịch' },
        particles: [{ type: 'bubble', color: '#38bdf8', count: 10 }],
        description: 'Tạo este mùi thơm táo.',
        observation: '🍏 Phản ứng este hóa đang diễn ra.',
        requires: { heat: true, catalyst: 'h2so4_conc' }
      };
      window.HEAT_REACTIONS['ch3cooh_glacial+c2h5oh'] = {
        reactants: ['ch3cooh_glacial', 'c2h5oh'],
        products: ['CH₃COOC₂H₅', 'H₂O'],
        equation: 'CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O',
        type: 'equilibrium',
        synthesis: { name: 'Phản ứng Este hóa', icon: '🍏', category: 'Thuận nghịch' },
        particles: [{ type: 'bubble', color: '#38bdf8', count: 10 }],
        description: 'Tạo este mùi thơm táo.',
        observation: '🍏 Phản ứng este hóa đang diễn ra.',
        requires: { heat: true, catalyst: 'h2so4_conc' }
      };
      window.HEAT_REACTIONS['ch3cooh+ethanol'] = {
        reactants: ['ch3cooh', 'ethanol'],
        products: ['CH₃COOC₂H₅', 'H₂O'],
        equation: 'CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O',
        type: 'equilibrium',
        synthesis: { name: 'Phản ứng Este hóa', icon: '🍏', category: 'Thuận nghịch' },
        particles: [{ type: 'bubble', color: '#38bdf8', count: 10 }],
        description: 'Tạo este mùi thơm táo.',
        observation: '🍏 Phản ứng este hóa đang diễn ra.',
        requires: { heat: true, catalyst: 'h2so4_conc' }
      };
    }

    this.createUI();
    this.switchReaction('haber');
    
    this.pouredChemicals = new Set();
    this.openedReactions = new Set();
    
    window.addEventListener('chemistry:pour', (e) => {
      const { chemicalId } = e.detail;
      if (!chemicalId) return;
      
      this.pouredChemicals.add(chemicalId);
      
      let detected = null;
      const pouredArr = Array.from(this.pouredChemicals).map(id => id.toLowerCase());
      
      const hasEster = pouredArr.some(id => id.includes('ch3cooh')) && 
                       pouredArr.some(id => id.includes('c2h5oh') || id.includes('ethanol'));
                       
      const hasHaber = pouredArr.some(id => id.includes('n2')) && 
                       pouredArr.some(id => id.includes('h2'));
                       
      const hasFeSCN = pouredArr.some(id => id.includes('fe')) && 
                       pouredArr.some(id => id.includes('scn'));
      
      if (hasEster) detected = 'ester';
      else if (hasFeSCN) detected = 'fescn';
      else if (hasHaber) detected = 'haber';
      
      if (detected && !this.openedReactions.has(detected)) {
        this.openedReactions.add(detected);
        this.switchReaction(detected);
        this.show();
        if (window.addLog) {
          window.addLog('info', `[CÂN BẰNG] Đã phát hiện tổ hợp hóa chất thuận nghịch! Đang tải Module Tối ưu hóa.`);
        }
      }
    });

    document.querySelector('.btn-reset')?.addEventListener('click', () => {
      this.pouredChemicals.clear();
      this.openedReactions.clear();
    });
  },

  createUI() {
    if (document.getElementById('opt-lab-overlay')) return;

    const style = document.createElement('style');
    style.innerHTML = `
      #opt-lab-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: rgba(15, 23, 42, 0.85);
        backdrop-filter: blur(8px);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Inter', sans-serif;
      }

      .opt-container.mars-hud {
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(0, 255, 204, 0.4);
        border-radius: 16px;
        width: 95vw;
        max-width: 1100px;
        max-height: 90vh;
        overflow-y: auto;
        padding: 25px;
        backdrop-filter: blur(16px) saturate(180%);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 255, 204, 0.15);
        color: #f8fafc;
        position: relative;
      }

      .opt-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(0, 255, 204, 0.3);
        padding-bottom: 15px;
        margin-bottom: 20px;
      }

      .opt-title .label {
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        color: #00ffcc;
        letter-spacing: 2px;
      }

      .opt-close {
        background: transparent;
        border: 1px solid #ff3131;
        color: #ff3131;
        padding: 6px 15px;
        border-radius: 6px;
        cursor: pointer;
        font-family: 'Orbitron', sans-serif;
        transition: all 0.2s;
      }
      .opt-close:hover {
        background: #ff3131;
        color: #fff;
        box-shadow: 0 0 10px rgba(255, 49, 49, 0.4);
      }

      .opt-main {
        display: flex;
        gap: 30px;
      }

      .opt-controls {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .control-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .control-group label {
        font-size: 14px;
        font-weight: 500;
        color: #94a3b8;
      }

      .control-group label span {
        color: #00ffcc;
        font-family: 'Orbitron', sans-serif;
        font-weight: 700;
      }

      .control-group input[type="range"] {
        -webkit-appearance: none;
        width: 100%;
        height: 8px;
        background: #334155;
        border-radius: 4px;
        outline: none;
      }

      .control-group input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 18px; height: 18px;
        background: #00ffcc;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 0 10px rgba(0, 255, 204, 0.6);
      }

      .control-hints {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: #64748b;
      }

      .opt-stats-box {
        background: rgba(30, 41, 59, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 15px;
        display: flex;
        flex-direction: row;
        gap: 20px;
        margin-top: 15px;
        box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.05);
      }

      .stat-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .stat-label {
        font-size: 12px;
        color: #94a3b8;
        font-family: 'Orbitron', sans-serif;
      }

      .stat-progress {
        background: #0f172a;
        height: 12px;
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #00f2fe 0%, #4facfe 100%);
        box-shadow: 0 0 10px rgba(0, 242, 254, 0.4);
        transition: width 0.3s ease;
      }

      .progress-fill.cost {
        background: linear-gradient(90deg, #ff0844 0%, #ffb199 100%);
        box-shadow: 0 0 10px rgba(255, 8, 68, 0.4);
      }

      .stat-val {
        font-size: 16px;
        color: #fff;
        font-weight: 700;
        font-family: 'Orbitron', sans-serif;
        text-align: right;
      }

      .opt-visualization {
        flex: 1;
        background: #0a0f1d;
        border: 1px solid rgba(0, 255, 204, 0.2);
        border-radius: 8px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .reaction-display {
        position: relative;
        flex: 1;
        min-height: 200px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
      }

      .molecule-chamber {
        position: relative;
        width: 100%;
        flex: 1;
        border-bottom: 1px dashed rgba(0, 255, 204, 0.2);
        margin-bottom: 15px;
      }

      .particle {
        position: absolute;
        width: 12px; height: 12px;
        border-radius: 50%;
        filter: blur(1px);
        animation: floatAround 4s ease-in-out infinite;
      }

      .particle.reactant {
        background: #4ade80;
        box-shadow: 0 0 8px rgba(74, 222, 128, 0.8);
      }

      .particle.product {
        background: #ff4d4d;
        box-shadow: 0 0 12px rgba(255, 77, 77, 1);
        width: 16px; height: 16px;
      }

      @keyframes floatAround {
        0%, 100% { transform: translate(0, 0); }
        25% { transform: translate(15px, -20px); }
        50% { transform: translate(-10px, 25px); }
        75% { transform: translate(20px, 10px); }
      }

      .chamber-legend {
        display: flex;
        gap: 20px;
        font-size: 12px;
        color: #94a3b8;
        margin-bottom: 15px;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .dot {
        display: inline-block;
        width: 10px; height: 10px;
        border-radius: 50%;
      }

      .dot.reactant { background: #4ade80; }
      .dot.product { background: #ff4d4d; }

      .reaction-equation {
        font-family: 'Orbitron', sans-serif;
        font-size: 18px;
        font-weight: bold;
        text-align: center;
        padding: 12px;
        background: rgba(15, 23, 42, 0.6);
        border-radius: 6px;
        border: 1px solid rgba(0, 255, 204, 0.2);
      }

      .reaction-equation .reactant { color: #4ade80; }
      .reaction-equation .arrow { color: #fff; margin: 0 10px; }
      .reaction-equation .product { color: #ff4d4d; }

      .ai-insight {
        background: rgba(0, 255, 204, 0.05);
        border-left: 3px solid #00ffcc;
        padding: 12px;
        font-size: 13px;
        color: #e2e8f0;
        font-style: italic;
        line-height: 1.5;
        border-radius: 0 6px 6px 0;
      }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = 'opt-lab-overlay';
    overlay.style.display = 'none';
    
    // Build options
    let optionsHtml = '';
    for (const key in OPT_REACTIONS) {
      optionsHtml += `<option value="${key}">${OPT_REACTIONS[key].name}</option>`;
    }

    overlay.innerHTML = `
      <div class="opt-container mars-hud">
        <div class="opt-header">
          <div class="opt-title">
            <span class="label">PHÒNG THÍ NGHIỆM TỐI ƯU HÓA</span>
            <select id="opt-reaction-select" onchange="OptimizationLab.handleReactionChange()" 
              style="background:#0f172a; color:#00ffcc; border:1px solid #00ffcc; padding:6px; font-family:'Orbitron'; font-size:16px; border-radius:4px; margin-top:4px;">
              ${optionsHtml}
            </select>
          </div>
          <button class="opt-close" onclick="OptimizationLab.hide()">✕ ĐÓNG</button>
        </div>

        <div class="opt-main">
          <div class="opt-controls" id="opt-sliders-container">
            <!-- Sliders generated dynamically -->
          </div>

          <div class="opt-visualization">
            <div class="reaction-display">
              <div class="molecule-chamber" id="chamber"></div>
              <div class="chamber-legend">
                <div class="legend-item"><span class="dot reactant"></span> Chất tham gia</div>
                <div class="legend-item"><span class="dot product"></span> Sản phẩm</div>
              </div>
              <div class="reaction-equation" id="opt-eq-box">
                <!-- Equation generated dynamically -->
              </div>
            </div>
            
            <div class="ai-insight" id="opt-ai-message"></div>
          </div>
        </div>
        <div id="opt-explanation-box" style="margin-top: 20px; padding: 15px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; box-shadow: inset 0 1px 1px rgba(255,255,255,0.02);">
          <h4 style="margin: 0 0 8px 0; font-family: 'Orbitron', sans-serif; color: #00ffcc; font-size: 13px; letter-spacing: 1px; display: flex; align-items: center; gap: 6px;">
            🧪 GIẢI THÍCH CHI TIẾT (CƠ CHẾ LE CHATELIER)
          </h4>
          <div id="opt-explanation-text" style="font-size: 13px; line-height: 1.6; color: #cbd5e1;"></div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  show() {
    this.createUI();
    const overlay = document.getElementById('opt-lab-overlay');
    if (overlay) overlay.style.display = 'flex';
    this.updateSimulation();
  },

  hide() {
    const overlay = document.getElementById('opt-lab-overlay');
    if (overlay) overlay.style.display = 'none';
  },

  handleReactionChange() {
    const select = document.getElementById('opt-reaction-select');
    this.switchReaction(select.value);
  },

  switchReaction(key) {
    if (!OPT_REACTIONS[key]) return;
    this.currentReaction = key;
    const rxn = OPT_REACTIONS[key];

    // Cập nhật Dropdown (nếu auto-switch)
    const select = document.getElementById('opt-reaction-select');
    if (select) select.value = key;

    // Render Sliders
    const container = document.getElementById('opt-sliders-container');
    if (container) {
      let html = '';
      rxn.controls.forEach((ctrl, idx) => {
        const stepAttr = ctrl.step ? `step="${ctrl.step}"` : '';
        html += `
          <div class="control-group">
            <label>${ctrl.label}: <span id="val-ctrl-${idx}">${ctrl.def}</span> ${ctrl.unit}</label>
            <input type="range" min="${ctrl.min}" max="${ctrl.max}" ${stepAttr} value="${ctrl.def}" id="slide-ctrl-${idx}" oninput="OptimizationLab.handleInput()">
            <div class="control-hints">
              <span>${ctrl.hintMin || ''}</span>
              <span>${ctrl.hintMax || ''}</span>
            </div>
          </div>
        `;
      });

      // Add Stats Box
      html += `
        <div class="opt-stats-box">
          <div class="stat-item">
            <span class="stat-label">${rxn.yieldLabel}</span>
            <div class="stat-progress">
              <div id="bar-yield" class="progress-fill"></div>
            </div>
            <span id="txt-yield" class="stat-val">0%</span>
          </div>
          
          <div class="stat-item">
            <span class="stat-label">${rxn.costLabel}</span>
            <div class="stat-progress">
              <div id="bar-cost" class="progress-fill cost"></div>
            </div>
            <span id="txt-cost" class="stat-val">0</span>
          </div>
        </div>
      `;
      container.innerHTML = html;
    }

    // Render Equation
    const eqBox = document.getElementById('opt-eq-box');
    if (eqBox) {
      const rColor = rxn.reactantColor || '#4ade80';
      const pColor = rxn.productColor || '#ff4d4d';
      eqBox.innerHTML = `
        <span class="reactant" style="color:${rColor}">${rxn.reactant}</span>
        <span class="arrow" id="eq-arrow">⇌</span>
        <span class="product" style="color:${pColor}">${rxn.product}</span>
        <span class="deltaH" style="display:block; font-size:12px; color:#ff3131; text-align:center; margin-top:10px;">${rxn.delta}</span>
      `;

      // Cập nhật legend dots ngay lập tức
      const legendReactantDot = document.querySelector('.chamber-legend .dot.reactant');
      const legendProductDot = document.querySelector('.chamber-legend .dot.product');
      if (legendReactantDot) legendReactantDot.style.background = rColor;
      if (legendProductDot) legendProductDot.style.background = pColor;
    }

    const expText = document.getElementById('opt-explanation-text');
    if (expText) {
      expText.innerHTML = rxn.explanation || 'Chưa có dữ liệu phân tích chuyên sâu cho phản ứng này.';
    }

    // Reset state to defaults
    this.state.a = rxn.controls[0].def;
    this.state.b = rxn.controls[1].def;
    this.state.c = rxn.controls[2].def;

    this.updateSimulation();
  },

  handleInput() {
    const rxn = OPT_REACTIONS[this.currentReaction];
    rxn.controls.forEach((ctrl, idx) => {
      const slider = document.getElementById(`slide-ctrl-${idx}`);
      if (slider) {
        const val = parseFloat(slider.value);
        document.getElementById(`val-ctrl-${idx}`).innerText = val;
        if (idx === 0) this.state.a = val;
        if (idx === 1) this.state.b = val;
        if (idx === 2) this.state.c = val;
      }
    });

    this.updateSimulation();
  },

  updateSimulation() {
    const rxn = OPT_REACTIONS[this.currentReaction];
    const result = rxn.calc(this.state.a, this.state.b, this.state.c);
    
    this.state.yield = result.yield;
    this.state.cost = result.cost;

    // Update UI
    const yieldBar = document.getElementById('bar-yield');
    const costBar = document.getElementById('bar-cost');
    const yieldTxt = document.getElementById('txt-yield');
    const costTxt = document.getElementById('txt-cost');

    if (yieldBar) yieldBar.style.width = `${this.state.yield}%`;
    if (costBar) costBar.style.width = `${Math.min(100, this.state.cost / 4)}%`;
    if (yieldTxt) yieldTxt.innerText = `${this.state.yield.toFixed(1)}%`;
    if (costTxt) costTxt.innerText = `${this.state.cost.toFixed(0)} ${result.costUnit}`;

    // Arrow color
    const arrow = document.getElementById('eq-arrow');
    if (arrow) {
      if (this.state.yield > 65) {
        arrow.innerText = '➞';
        arrow.style.color = '#00ffcc';
      } else if (this.state.yield < 20) {
        arrow.innerText = '⟵';
        arrow.style.color = '#ff3131';
      } else {
        arrow.innerText = '⇌';
        arrow.style.color = '#fff';
      }
    }

    // Insight
    const insight = document.getElementById('opt-ai-message');
    if (insight) insight.innerText = `"${result.msg}"`;

    this.updateParticles();
  },

  updateParticles() {
    const chamber = document.getElementById('chamber');
    if (!chamber) return;
    
    chamber.innerHTML = '';
    const rxn = OPT_REACTIONS[this.currentReaction];
    const particleCount = 20;
    const rColor = rxn.reactantColor || '#4ade80';
    const pColor = rxn.productColor || '#ff4d4d';
    
    // Cập nhật legend dots & text
    const legendReactantItem = document.querySelector('.chamber-legend .legend-item:nth-child(1)');
    const legendProductItem = document.querySelector('.chamber-legend .legend-item:nth-child(2)');
    const legendReactantDot = document.querySelector('.chamber-legend .dot.reactant');
    const legendProductDot = document.querySelector('.chamber-legend .dot.product');
    
    if (legendReactantDot) legendReactantDot.style.background = rColor;
    if (legendProductDot) legendProductDot.style.background = pColor;
    if (legendReactantItem) legendReactantItem.style.color = rColor;
    if (legendProductItem) legendProductItem.style.color = pColor;

    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      const isProduct = Math.random() * 100 < this.state.yield;
      p.className = isProduct ? 'particle product' : 'particle reactant';
      p.style.background = isProduct ? pColor : rColor;
      p.style.boxShadow = `0 0 10px ${isProduct ? pColor : rColor}`;
      p.style.left = Math.random() * 90 + '%';
      p.style.top = Math.random() * 90 + '%';
      p.style.animationDelay = Math.random() * 2 + 's';
      chamber.appendChild(p);
    }
  }
};

// Khởi tạo
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  window.OptimizationLab.init();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    window.OptimizationLab.init();
  });
}
