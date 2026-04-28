/* ============================================================
   assessment_ai.js — IDCL Green Chemistry & AI Observer
   ============================================================ */

window.IDCL_State = {
  currentEnergy: 100,
  totalWaste: 0,
  safetyViolations: 0,
  currentTask: {
    requiredMass: 5.0
  }
};

// ——— SESSION LOG: mỗi entry là 1 lần đổ hóa chất ———
window.sessionLogs = [];

document.addEventListener('DOMContentLoaded', () => {
  const fill = document.getElementById('energy-bar-fill');
  if (fill) fill.style.width = '100%';
});

// ——— OBSERVER: chemistry:pour ———
window.addEventListener('chemistry:pour', (e) => {
  const { chemicalId, volume } = e.detail;
  const findChemical = (id) => {
    return (window.CHEMICALS || []).find(c => c.id === id) || 
           (window.ALL_ITEMS || []).find(c => c.id === id);
  };

  const chem = findChemical(chemicalId);
  if (!chem) {
    console.error(`[IDCL-SYSTEM] Chemical ID mismatch: ${chemicalId}. Check global databases.`);
    return;
  }

  // Nếu là nhập theo khối lượng (mass), ta lấy trực tiếp. Nếu là thể tích/nồng độ, mới nhân density.
  const density = (e.detail.configType === 'mass') ? 1.0 : (chem.density || 1.0);
  const safeVolume = parseFloat(volume) || 0;
  const m_actual = safeVolume * density;

  // Dynamic theoretical mass lookup
  let m_theoretical = window.IDCL_State.currentTask.requiredMass || 5.0;
  const targets = window.MISSION_TARGETS;
  if (targets) {
    for (const mKey in targets) {
      const mission = targets[mKey];
      if (mission.theoretical_masses && mission.theoretical_masses[chemicalId]) {
        m_theoretical = mission.theoretical_masses[chemicalId];
        console.log(`[IDCL-AI] Mission context found: Using ${m_theoretical}g for ${chemicalId}`);
        break;
      }
    }
  }

  const excess = Math.max(0, m_actual - m_theoretical);
  const penaltyMultiplier = (chem.green_metrics && chem.green_metrics.waste_penalty_multiplier) ? chem.green_metrics.waste_penalty_multiplier : 1.0;
  const penalty = excess * penaltyMultiplier;

  console.log(`[IDCL-WATCHER] Pouring ${chemicalId}: Actual=${m_actual}g, Target=${m_theoretical}g, Excess=${excess}g`);

  // Log entry
  window.sessionLogs.push({
    timestamp: new Date().toLocaleTimeString('vi-VN'),
    chemicalId,
    chemicalName: chem.formula || chem.name,
    m_actual,
    m_theoretical,
    excess,
    penalty,
    penaltyMultiplier,
    atomEconomy: null
  });

  if (excess > 0) {
    window.IDCL_State.totalWaste += excess;
    updateSustainabilityScore(penalty);
    if (window.addLog) {
      window.addLog('warning', `[ECO-WATCHER] LÃNG PHÍ: Thừa ${excess.toFixed(2)}g ${chem.formula || chem.name}. (Trừ ${penalty.toFixed(1)} điểm)`);
    }
  }
});

// ——— OBSERVER: chemistry:reaction-complete ———
window.addEventListener('chemistry:reaction-complete', (e) => {
  const { reactants, equation } = e.detail;
  if (!reactants || reactants.length < 2) return;
  if (!window.ChemistryEngine || !window.ChemistryEngine.calculateAtomEconomy) return;

  const findChemical = (id) => {
    return (window.CHEMICALS || []).find(c => c.id === id) || 
           (window.ALL_ITEMS || []).find(c => c.id === id);
  };
  
  const reactantChems = reactants.map(id => findChemical(id)).filter(Boolean);
  if (reactantChems.length < 2) return;

  const reactionObj = {
    reactants,
    reactantCoefficients: reactants.map(() => 1),
    products: [reactants[0]],
    productCoefficients: [1]
  };

  try {
    const economy = window.ChemistryEngine.calculateAtomEconomy(reactionObj, reactants[0]);
    // Cập nhật atomEconomy vào log entry gần nhất
    if (window.sessionLogs.length > 0) {
      window.sessionLogs[window.sessionLogs.length - 1].atomEconomy = economy;
    }
    if (economy > 0 && window.addLog) {
      const ecoLabel = economy >= 80 ? '🟢' : economy >= 50 ? '🟡' : '🔴';
      window.addLog('info', `[ATOM-ECONOMY] ${ecoLabel} Hiệu quả nguyên tử: ${economy}% | PT: ${equation || '—'}`);
    }
  } catch(err) { /* silent fail */ }
});

// ——— UPDATE ENERGY BAR ———
function updateSustainabilityScore(penalty) {
  window.IDCL_State.currentEnergy = Math.max(0, window.IDCL_State.currentEnergy - penalty);
  const fill = document.getElementById('energy-bar-fill');
  const statusLabel = document.getElementById('eco-status');
  if (!fill) return;

  const e = window.IDCL_State.currentEnergy;
  fill.style.width = `${e}%`;

  if (e < 30) {
    fill.style.background = '#ff3131';
    if (statusLabel) { statusLabel.innerText = 'CRITICAL'; statusLabel.classList.add('glitch-text'); }
  } else if (e < 60) {
    fill.style.background = '#f59e0b';
    if (statusLabel) { statusLabel.innerText = 'WARNING'; statusLabel.classList.remove('glitch-text'); }
  } else {
    fill.style.background = 'linear-gradient(90deg, #00ffcc, #008877)';
    if (statusLabel) { statusLabel.innerText = 'STABLE'; statusLabel.classList.remove('glitch-text'); }
  }
}

// ——— DATA AGGREGATOR ———
function generateEcoReportData() {
  const logs = window.sessionLogs || [];
  let totalWaste = 0;
  let totalPenalty = 0;
  const economyScores = [];
  // Deduplicate: gộp theo tên hóa chất
  const chemMap = {};

  logs.forEach(log => {
    totalWaste += log.excess;
    totalPenalty += log.penalty;
    if (log.atomEconomy && log.atomEconomy > 0) economyScores.push(log.atomEconomy);
    const key = log.chemicalId;
    if (!chemMap[key]) {
      chemMap[key] = { name: log.chemicalName, m_actual: 0, m_theoretical: log.m_theoretical, excess: 0 };
    }
    chemMap[key].m_actual += log.m_actual;
    chemMap[key].excess += log.excess;
  });

  const summary = Object.values(chemMap).map(c => ({
    chemical: c.name,
    used: c.m_actual.toFixed(2) + 'g',
    ideal: c.m_theoretical.toFixed(2) + 'g',
    waste: c.excess.toFixed(2) + 'g',
    isWasted: c.excess > 0.01
  }));

  const avgEconomy = economyScores.length > 0
    ? (economyScores.reduce((a, b) => a + b, 0) / economyScores.length).toFixed(2)
    : 'N/A';

  return { summary, totalWaste, totalPenalty, avgEconomy };
}

// ——— RANK SYSTEM ———
function getRank(energy, violations) {
  if (energy > 90 && violations === 0)
    return { cls: 'rank-elite', title: 'NHÀ KHOA HỌC ƯU TÚ', emoji: '🏆', color: '#00ffcc',
             message: 'Xuất sắc. Bạn là tương lai của nền công nghiệp Hóa học trên Sao Hỏa. Trạm Genesis ghi nhận thành tích của bạn.' };
  if (energy >= 60 && violations < 2)
    return { cls: 'rank-success', title: 'NGƯỜI SỐNG SÓT', emoji: '✅', color: '#34d399',
             message: 'Nhiệm vụ hoàn thành, nhưng nguồn lực đang cạn kiệt. Hãy tiết kiệm hơn trong lần thực hành tiếp theo.' };
  if (energy >= 30)
    return { cls: 'rank-warning', title: 'TÂN BINH', emoji: '⚠️', color: '#f59e0b',
             message: 'Quá nhiều lãng phí. Trạm Genesis không thể nuôi dưỡng những sai lầm này. Cần cải thiện ngay tỉ lệ sử dụng nguyên tử.' };
  return { cls: 'rank-failure', title: 'THẤT BẠI NGHIÊM TRỌNG', emoji: '🚨', color: '#ff3131',
           message: 'NGUY HIỂM! Bạn đã bị đình chỉ nhiệm vụ vì đe dọa an toàn trạm và lãng phí tài nguyên ở mức không thể chấp nhận.' };
}

// ——— EXPORT JSON ———
function exportSessionData() {
  const data = {
    exportedAt: new Date().toISOString(),
    idclVersion: '4.0',
    sustainability: {
      finalEnergy: window.IDCL_State.currentEnergy.toFixed(1) + '%',
      totalWaste: window.IDCL_State.totalWaste.toFixed(2) + 'g',
      safetyViolations: window.IDCL_State.safetyViolations
    },
    rank: getRank(window.IDCL_State.currentEnergy, window.IDCL_State.safetyViolations).title,
    sessionLogs: window.sessionLogs
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `IDCL_Report_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ——— RENDER ECO-REPORT MODAL ———
window.generateGreenReport = function() {
  const data = generateEcoReportData();
  const energy = window.IDCL_State.currentEnergy;
  const violations = window.IDCL_State.safetyViolations;
  const rankInfo = getRank(energy, violations);

  // Tạo bảng summary
      const tableRows = data.summary.length > 0
    ? data.summary.map(item => `
        <tr>
          <td>${item.chemical}</td>
          <td>${item.used}</td>
          <td>${item.ideal}</td>
          <td style="color:${item.isWasted ? '#ff3131' : '#00ffcc'}; font-weight:bold;">${item.waste}</td>
          <td><span class="eco-badge ${item.isWasted ? 'eco-badge-waste' : 'eco-badge-ok'}">${item.isWasted ? 'LÃNG PHÍ' : 'TỐI ƯU'}</span></td>
        </tr>`)
      .join('')
    : `<tr><td colspan="5" style="text-align:center; color:#64748b; padding: 20px;">Chưa có dữ liệu thí nghiệm trong phiên này.</td></tr>`;

  const html = `
    <div id="eco-report-modal">
      <div class="eco-report-header">
        <div class="eco-title">
          <span style="color:#00ffcc; font-size:11px; letter-spacing:3px; display:block;">NHIỆM VỤ SAO HỎA — IDCL v4.0</span>
          <h2 style="margin:4px 0 0; color:#fff; font-size:20px;">BÁO CÁO NHIỆM VỤ: CHỈ SỐ SINH THÁI</h2>
        </div>
        <button onclick="document.getElementById('eco-report-overlay').style.display='none'"
          style="background:none; border:1px solid #ff3131; color:#ff3131; padding:6px 14px; cursor:pointer; border-radius:4px; font-family:'Orbitron',sans-serif; font-size:11px;">
          ✕ ĐÓNG
        </button>
      </div>

      <div class="eco-metrics-row">
        <div class="eco-metric-card">
          <div class="eco-metric-value" style="color:${energy < 30 ? '#ff3131' : energy < 60 ? '#f59e0b' : '#00ffcc'}">${energy.toFixed(1)}%</div>
          <div class="eco-metric-label">DỰ TRỮ SINH THÁI</div>
        </div>
        <div class="eco-metric-card">
          <div class="eco-metric-value" style="color:#f59e0b">${data.totalWaste.toFixed(2)}g</div>
          <div class="eco-metric-label">TỔNG LÃNG PHÍ</div>
        </div>
        <div class="eco-metric-card">
          <div class="eco-metric-value" style="color:#38bdf8">${data.avgEconomy}%</div>
          <div class="eco-metric-label">HIỆU QUẢ NGUYÊN TỬ</div>
        </div>
        <div class="eco-metric-card">
          <div class="eco-metric-value" style="color:${violations > 0 ? '#ff3131' : '#00ffcc'}">${violations}</div>
          <div class="eco-metric-label">VI PHẠM AN TOÀN</div>
        </div>
      </div>

      <table class="report-table">
        <thead>
          <tr>
            <th>Hóa chất</th>
            <th>Thực tế</th>
            <th>Lý thuyết</th>
            <th>Lãng phí</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>

      <div class="verdict-box" style="border-color:${rankInfo.color}; background: rgba(0,0,0,0.4);">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom: 10px;">
          <span style="font-size:28px;">${rankInfo.emoji}</span>
          <div>
            <div style="font-size:11px; color:#64748b; letter-spacing:2px;">KẾT LUẬN CỦA CHỈ HUY AI</div>
            <h3 class="${rankInfo.cls}" style="margin:2px 0; font-size:18px; color:${rankInfo.color}; text-shadow:0 0 10px ${rankInfo.color};">${rankInfo.title}</h3>
          </div>
        </div>
        <p style="color:#cbd5e1; font-style:italic; margin:0; line-height:1.6;">"${rankInfo.message}"</p>
      </div>

      <div style="display:flex; gap:10px; margin-top:20px;">
        <button onclick="exportSessionData()"
          style="flex:1; background:rgba(0,255,204,0.1); border:1px solid #00ffcc; color:#00ffcc; padding:10px; cursor:pointer; border-radius:4px; font-family:'Orbitron',sans-serif; font-size:12px; transition:all 0.2s;">
          📥 XUẤT JSON
        </button>
        <button onclick="exportSessionTxt()"
          style="flex:1; background:rgba(56,189,248,0.1); border:1px solid #38bdf8; color:#38bdf8; padding:10px; cursor:pointer; border-radius:4px; font-family:'Orbitron',sans-serif; font-size:12px; transition:all 0.2s;">
          📄 XUẤT TXT
        </button>
      </div>
    </div>
  `;

  const overlay = document.getElementById('eco-report-overlay');
  if (!overlay) {
    // Tự tạo overlay nếu chưa có trong DOM (fallback safety)
    const el = document.createElement('div');
    el.id = 'eco-report-overlay';
    el.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:9998; align-items:center; justify-content:center; backdrop-filter:blur(6px);';
    document.body.appendChild(el);
    setTimeout(() => window.generateGreenReport(), 50); // Retry sau khi append
    return;
  }
  overlay.innerHTML = html;
  overlay.style.display = 'flex';

  if (window.addLog) {
    window.addLog('info', `[ECO-REPORT] 📊 Cấp bậc: ${rankInfo.title} | Năng lượng: ${energy.toFixed(1)}% | Lãng phí: ${data.totalWaste.toFixed(2)}g`);
  }
};

// ——— EXPORT TXT ———
function exportSessionTxt() {
  const data = generateEcoReportData();
  const energy = window.IDCL_State.currentEnergy;
  const violations = window.IDCL_State.safetyViolations;
  const rankInfo = getRank(energy, violations);

  const lines = [
    `╔══════════════════════════════════════════════════╗`,
    `║       IDCL v4.0 — BÁO CÁO TỔNG KẾT NHIỆM VỤ      ║`,
    `╚══════════════════════════════════════════════════╝`,
    `Thời gian xuất báo cáo: ${new Date().toLocaleString('vi-VN')}`,
    ``,
    `── TỔNG KẾT ──────────────────────────────────────`,
    `  DỰ TRỮ SINH THÁI (Năng lượng bền vững): ${energy.toFixed(1)}%`,
    `  Tổng lãng phí hóa chất:            ${data.totalWaste.toFixed(2)}g`,
    `  Hiệu quả nguyên tử trung bình:     ${data.avgEconomy}%`,
    `  Số lần vi phạm an toàn:            ${violations}`,
    ``,
    `── CHI TIẾT HÓA CHẤT ─────────────────────────────`,
    `  Hóa chất           | Thực tế    | Lý thuyết | Lãng phí  | Trạng thái`,
    `  -------------------+------------+-----------+-----------+---------`,
    ...data.summary.map(s =>
      `  ${s.chemical.padEnd(19)}| ${s.used.padEnd(10)} | ${s.ideal.padEnd(9)} | ${s.waste.padEnd(9)} | ${s.isWasted ? 'LÃNG PHÍ' : 'TỐI ƯU'}`
    ),
    ``,
    `── PHÁN QUYẾT CỦA AI COMMANDER ──────────────────`,
    `  CẤP BẬC: ${rankInfo.title}`,
    `  "${rankInfo.message}"`,
    ``,
    `════════════════════════════════════════════════════`,
    `  Hệ thống IDCL — Intelligent Digital Chemistry Lab`,
    `  QuantumLab v4.0 | Tổ 2 - Hồ Hoàng Anh`,
    `════════════════════════════════════════════════════`
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `IDCL_Report_${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

