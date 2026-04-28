/* ============================================================
   qa_system.js — Trung Tâm Tri Thức & Hệ Thống Điều Chế
   QuantumLab - Digital Chemical Engineering
   ============================================================ */

const QA_DATA = [
  {
    question: "Làm thế nào để bắt đầu một thí nghiệm?",
    answer: "Để bắt đầu, bạn hãy chọn Tab <b>Dụng cụ</b> ở thanh bên trái, kéo một dụng cụ vào khu vực làm việc. Sau đó, chuyển sang Tab <b>Hóa chất</b> và kéo hóa chất bạn muốn thả trực tiếp vào dụng cụ đó."
  },
  {
    question: "Làm sao để biết phản ứng hóa học đã xảy ra?",
    answer: "Hãy quan sát trực quan dụng cụ (đổi màu, kết tủa, bọt khí) và đồng thời theo dõi bảng <b>HUD (Nhật ký)</b> ở góc phải. Hệ thống sẽ ghi lại mọi phản ứng theo thời gian thực."
  },
  {
    question: "Tại sao phải vào Phòng Chuẩn Bị?",
    answer: "An toàn là ưu tiên số 1. Bạn cần trang bị Kính, Găng tay và Áo Blouse để đạt trạng thái 'An toàn tuyệt đối' trước khi hệ thống mở cửa phòng Lab."
  },
  {
    question: "Sử dụng Thư viện như thế nào?",
    answer: "Nhấn nút <b>Thư viện</b> ở Header để tra cứu tính chất vật lý, hóa học và các cảnh báo nguy hiểm của hàng trăm loại hóa chất."
  }
];

const SYNTHESIS_DATA = [
  {
    category: "1. ĐIỀU CHẾ KIM LOẠI",
    description: "Nguyên tắc chung: Khử ion kim loại thành kim loại tự do (Mn+ + ne -> M).",
    methods: [
      { 
        name: "Nhiệt luyện", 
        detail: "Khử oxit kim loại trung bình/yếu (Zn -> Cu) bằng C, CO, H2, Al.",
        eq: "Fe2O3 + 2Al --(to)--> 2Fe + Al2O3 (Nhiệt nhôm)" 
      },
      { 
        name: "Thủy luyện", 
        detail: "Dùng kim loại mạnh đẩy kim loại yếu ra khỏi dung dịch muối.",
        eq: "Fe + CuSO4 --> FeSO4 + Cu" 
      },
      { 
        name: "Điện phân nóng chảy", 
        detail: "Dùng cho kim loại mạnh (IA, IIA, Al).",
        eq: "2Al2O3 --(dpnc, criolit)--> 4Al + 3O2" 
      }
    ]
  },
  {
    category: "2. ĐIỀU CHẾ PHI KIM",
    description: "Thường oxi hóa các hợp chất hoặc phân tách từ tự nhiên.",
    methods: [
      { 
        name: "Clo (Cl2)", 
        detail: "Oxi hóa HCl đặc (PTN) hoặc điện phân NaCl dung dịch (CN).",
        eq: "MnO2 + 4HCl --(to)--> MnCl2 + Cl2 + 2H2O" 
      },
      { 
        name: "Oxi (O2)", 
        detail: "Nhiệt phân chất giàu oxi (PTN) hoặc chưng cất không khí lỏng (CN).",
        eq: "2KMnO4 --(to)--> K2MnO4 + MnO2 + O2" 
      }
    ]
  },
  {
    category: "3. HỢP CHẤT VÔ CƠ",
    description: "Sản xuất các hóa chất công nghiệp trọng tâm.",
    methods: [
      { 
        name: "Acid Sunfuric (H2SO4)", 
        detail: "Phương pháp tiếp xúc (3 giai đoạn).",
        eq: "2SO2 + O2 --(V2O5, to)--> 2SO3" 
      },
      { 
        name: "Amoniac (NH3)", 
        detail: "Tổng hợp Haber (N2 + H2) ở áp suất cao.",
        eq: "N2 + 3H2 <==> 2NH3 (Fe, to, P)" 
      }
    ]
  },
  {
    category: "4. HỢP CHẤT HỮU CƠ",
    description: "Điều chế các chất nền tảng từ nguồn thiên nhiên hoặc tổng hợp.",
    methods: [
      { 
        name: "Metan (CH4)", 
        detail: "Phản ứng vôi tôi xút.",
        eq: "CH3COONa + NaOH --(CaO, to)--> CH4 + Na2CO3" 
      },
      { 
        name: "Etilen (C2H4)", 
        detail: "Tách nước từ Ancol Etylic.",
        eq: "C2H5OH --(H2SO4 đặc, 170oC)--> C2H4 + H2O" 
      },
      { 
        name: "Este", 
        detail: "Phản ứng este hóa (thuận nghịch).",
        eq: "RCOOH + R'OH <==> RCOOR' + H2O (H2SO4 đặc, to)" 
      }
    ]
  }
];

/* ============================================================
   IDCL SAFETY QUIZZES — Mars Genesis Protocol Database
   Mỗi key tương ứng với chemical.id trong CHEMICAL_DATABASE
   ============================================================ */
const SAFETY_QUIZZES = {
  "cl2": [
    { q: "Khí Cl₂ có đặc điểm nhận dạng nào sau đây?", opts: ["Không màu, mùi thơm nhẹ.", "Màu vàng lục, mùi hắc đặc trưng, cực độc.", "Màu nâu đỏ, không mùi."], ans: 1 },
    { q: "Tại sao phải dùng tủ hút (Fume Hood) khi thí nghiệm với Cl₂?", opts: ["Để khí phản ứng với không khí nhanh hơn.", "Để giữ nhiệt độ phản ứng ổn định.", "Ngăn chặn khí độc khuếch tán vào hệ thống hô hấp."], ans: 2 },
    { q: "Nếu lỡ hít phải Cl₂, hành động sơ cứu đầu tiên là gì?", opts: ["Uống nhiều nước ngay lập tức.", "Di chuyển ngay ra nơi thoáng khí và hít thở sâu.", "Tiếp tục thí nghiệm rồi mới đi kiểm tra."], ans: 1 }
  ],
  "cl2_gas": [
    { q: "Khí Cl₂ có đặc điểm nhận dạng nào sau đây?", opts: ["Không màu, mùi thơm nhẹ.", "Màu vàng lục, mùi hắc đặc trưng, cực độc.", "Màu nâu đỏ, không mùi."], ans: 1 },
    { q: "Tại sao phải dùng tủ hút (Fume Hood) khi thí nghiệm với Cl₂?", opts: ["Để khí phản ứng nhanh hơn.", "Để giữ nhiệt độ ổn định.", "Ngăn chặn khí độc khuếch tán vào hệ thống hô hấp."], ans: 2 }
  ],
  "h2so4_con": [
    { q: "Khi pha loãng H₂SO₄ đậm đặc, thao tác nào đúng nhất để tránh nổ nhiệt?", opts: ["Đổ nhanh nước vào axit.", "Rót từ từ axit vào nước và khuấy đều.", "Đổ cả hai cùng lúc vào bình."], ans: 1 },
    { q: "Tính chất nguy hiểm nhất của H₂SO₄ đặc khi tiếp xúc da là gì?", opts: ["Tính oxy hóa mạnh.", "Tính háo nước — gây bỏng sâu và than hóa tức thì.", "Tính acid yếu."], ans: 1 },
    { q: "PPE tối thiểu bắt buộc khi thao tác H₂SO₄ đặc là gì?", opts: ["Chỉ cần kính bảo hộ.", "Kính bảo hộ + Găng tay cao su chịu acid + Áo Blouse.", "Không cần vì H₂SO₄ là chất lỏng không bay hơi."], ans: 1 }
  ],
  "h2so4_oleum": [
    { q: "Oleum nguy hiểm hơn H₂SO₄ thông thường vì lý do gì?", opts: ["Oleum có tính acid yếu hơn.", "Oleum liên tục phóng thích khói SO₃ độc khi tiếp xúc không khí ẩm.", "Oleum có nhiệt độ sôi thấp hơn."], ans: 1 },
    { q: "Khi làm việc với Oleum, điều kiện môi trường nào là BẮT BUỘC nhất?", opts: ["Nhiệt độ phòng cao.", "Tủ hút kín có hệ thống xử lý khí thải (Scrubber).", "Ánh sáng đủ để quan sát."], ans: 1 }
  ],
  "hf": [
    { q: "Tại sao tuyệt đối không được đựng HF trong bình thủy tinh?", opts: ["HF làm thủy tinh bị giòn.", "HF ăn mòn SiO₂ trong thủy tinh — bình sẽ bị thủng.", "Thủy tinh làm HF mất hoạt tính."], ans: 1 },
    { q: "HF nguy hiểm vì khả năng xâm nhập sâu và phá hủy cấu trúc nào?", opts: ["Hệ tiêu hóa.", "Hệ thần kinh.", "Xương và nồng độ Canxi trong máu — gây ngừng tim."], ans: 2 },
    { q: "Bình đựng HF phải được làm bằng vật liệu gì?", opts: ["Thủy tinh borosilicate.", "Nhựa PTFE (Teflon) hoặc Polyethylene.", "Thép không gỉ (Inox)."], ans: 1 }
  ],
  "nh3": [
    { q: "Khi phát hiện rò rỉ NH₃, tại sao cần dùng khăn ướt che mũi?", opts: ["NH₃ không tan trong nước.", "NH₃ tan rất tốt trong nước — khăn ướt hấp thụ và lọc khí hiệu quả.", "Nước làm NH₃ cháy nhanh hơn."], ans: 1 },
    { q: "Dung dịch NH₃ đậm đặc có dấu hiệu nhận biết đặc trưng nào?", opts: ["Màu xanh lam, không mùi.", "Không màu, mùi khai nồng cực mạnh — gây bỏng mắt và đường hô hấp.", "Màu vàng nhạt, mùi trứng thối."], ans: 1 }
  ],
  "nh3_conc": [
    { q: "Khi phát hiện rò rỉ NH₃ đặc, tại sao cần dùng khăn ướt che mũi?", opts: ["NH₃ không tan trong nước.", "NH₃ tan rất tốt trong nước — khăn ướt hấp thụ và lọc khí.", "Nước làm NH₃ cháy nhanh hơn."], ans: 1 },
    { q: "Điều kiện bảo quản NH₃ đặc là gì?", opts: ["Để ngoài trời cho thoáng khí.", "Bình kín, nơi thoáng mát, xa nhiệt độ cao và chất oxy hóa mạnh.", "Giữ trong tủ lạnh ở 0°C."], ans: 1 }
  ],
  "no2": [
    { q: "Khí NO₂ có màu gì và nguy hiểm như thế nào?", opts: ["Không màu, ít độc.", "Màu nâu đỏ đặc trưng — cực độc, gây phù phổi.", "Màu xanh nhạt, mùi thơm."], ans: 1 },
    { q: "Biện pháp bảo vệ cơ bản nhất khi có rò rỉ NO₂ trong phòng là gì?", opts: ["Mở cửa phòng cho thoáng.", "Sơ tán ngay lập tức và kích hoạt hệ thống thông gió khẩn cấp.", "Đứng yên và chờ khí tan."], ans: 1 }
  ],
  "h2s": [
    { q: "H₂S có mùi đặc trưng nào và ngưỡng gây chết người là bao nhiêu?", opts: ["Mùi táo, ngưỡng gây chết là 10,000 ppm.", "Mùi trứng thối đặc trưng, ngưỡng gây chết là khoảng 700 ppm.", "Không mùi, vô hại."], ans: 1 }
  ],
  "na_metal": [
    { q: "Tại sao phải bảo quản Natri kim loại trong dầu hỏa?", opts: ["Dầu làm Natri sáng hơn.", "Natri phản ứng mãnh liệt với hơi nước và oxy trong không khí — dầu cách ly hoàn toàn.", "Dầu làm Natri mềm hơn để cắt."], ans: 1 },
    { q: "Khi xảy ra cháy Natri kim loại, tuyệt đối KHÔNG được dùng gì để dập lửa?", opts: ["Cát khô.", "Bình CO₂.", "Nước — vì sẽ tạo H₂ và NaOH, phản ứng dữ dội hơn."], ans: 2 }
  ],
  "k_metal": [
    { q: "Kali kim loại nguy hiểm hơn Natri kim loại như thế nào khi tiếp xúc nước?", opts: ["Giống hệt nhau.", "Kali phản ứng mạnh hơn — ngọn lửa tím có thể bùng phát tự phát.", "Kali phản ứng chậm hơn."], ans: 1 }
  ],
  "benzene": [
    { q: "Tại sao Benzen là hóa chất thuộc nhóm đặc biệt nguy hiểm?", opts: ["Vì Benzen có giá đắt.", "Vì Benzen là chất GÂY UNG THƯ (carcinogen) — phơi nhiễm lâu dài gây bệnh bạch cầu.", "Vì Benzen có mùi khó chịu."], ans: 1 }
  ],
  "hcho": [
    { q: "Formaldehyde (HCHO / Formalin) thuộc nhóm nguy hiểm nào?", opts: ["Không độc, dùng trong thực phẩm.", "Chất GÂY UNG THƯ bảng 1 (IARC), độc qua đường hô hấp và da.", "Chỉ kích ứng nhẹ mắt."], ans: 1 }
  ],
  "hcn": [
    { q: "HCN nguy hiểm ở cơ chế nào trong cơ thể người?", opts: ["Ăn mòn da như axit.", "Ức chế enzyme Cytochrome c Oxidase — ngừng hô hấp tế bào, chết nhanh.", "Gây dị ứng ngoài da."], ans: 1 }
  ],
  "methanol": [
    { q: "Methanol (CH₃OH) cực kỳ nguy hiểm vì lý do gì so với Ethanol?", opts: ["Methanol không cháy.", "Methanol được cơ thể chuyển hóa thành Formaldehyde và Formic Acid — gây mù và tử vong chỉ với 10–30mL.", "Methanol đắt hơn Ethanol."], ans: 1 }
  ]
};

window.SAFETY_QUIZZES = SAFETY_QUIZZES;

/* ============================================================
   IDCL MISSION TARGETS — Reaction Stoichiometry Matrix
   Dùng để tính m_theoretical cho từng nhiệm vụ thí nghiệm
   ============================================================ */
const MISSION_TARGETS = {
  "mission_01_cl2_synthesis": {
    name: "Điều chế khí Clo (PTN)",
    equation: "MnO₂ + 4HCl → MnCl₂ + Cl₂↑ + 2H₂O",
    stoichiometry: { "mno2": 1, "hcl": 4 },
    ideal_yield: 0.85,
    target_product: "cl2_gas",
    theoretical_masses: { "mno2": 86.94, "hcl": 145.84 }
  },
  "mission_02_nacl_neutralization": {
    name: "Chuẩn độ Acid-Base (HCl + NaOH)",
    equation: "HCl + NaOH → NaCl + H₂O",
    stoichiometry: { "hcl": 1, "naoh": 1 },
    ideal_yield: 1.0,
    target_product: "nacl",
    theoretical_masses: { "hcl": 36.46, "naoh": 40.0 }
  },
  "mission_03_h2so4_dilution": {
    name: "Pha loãng H₂SO₄ đặc",
    equation: "H₂SO₄ (đặc) + H₂O → H₂SO₄ (loãng)",
    stoichiometry: { "h2so4_con": 1, "h2o": 10 },
    ideal_yield: 1.0,
    target_product: "h2so4_dil",
    theoretical_masses: { "h2so4_con": 1.84 }
  },
  "mission_04_naoh_synthesis": {
    name: "Trung hòa NaOH + HCl",
    equation: "NaOH + HCl → NaCl + H₂O",
    stoichiometry: { "naoh": 1, "hcl": 1 },
    ideal_yield: 0.95,
    target_product: "nacl",
    theoretical_masses: { "naoh": 40.0, "hcl": 36.46 }
  }
};

window.MISSION_TARGETS = MISSION_TARGETS;

function initKnowledgeTerminal() {
  // Call this once on lab bootup or panel open
  renderKnowledgeTabs();
  switchKnowledgeTab('qa');
}

function renderKnowledgeTabs() {
  const panel = document.getElementById('guidePanel');
  if (!panel) return;

  panel.querySelector('.guide-header').innerHTML = `
    <div class="guide-tabs">
      <button class="g-tab active" id="tab-qa" onclick="switchKnowledgeTab('qa')">❓ Hỏi Đáp</button>
      <button class="g-tab" id="tab-synth" onclick="switchKnowledgeTab('synth')">🧪 Điều Chế</button>
    </div>
    <button onclick="toggleGuide()" class="btn-close-guide">✕</button>
  `;
}

function switchKnowledgeTab(tabId) {
  document.getElementById('tab-qa').classList.toggle('active', tabId === 'qa');
  document.getElementById('tab-synth').classList.toggle('active', tabId === 'synth');

  const container = document.getElementById('guideStepsContent');
  if (tabId === 'qa') {
    renderQAInPanel(container);
  } else {
    renderSynthesisInPanel(container);
  }
}

function renderQAInPanel(container) {
  let html = `
    <div class="knowledge-header">
      <h3>HỎI ĐÁP & HỖ TRỢ</h3>
      <div class="terminal-line"></div>
    </div>
    <div class="qa-list-panel">
  `;

  QA_DATA.forEach((item, index) => {
    html += `
      <div class="qa-item-panel" id="qa-p-${index}">
        <div class="qa-q" onclick="toggleQAAccordion(${index})">
          <span class="q-marker">Q:</span> ${item.question}
        </div>
        <div class="qa-a">
          <div class="qa-a-inner">${item.answer}</div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

function renderSynthesisInPanel(container) {
  let html = `
    <div class="knowledge-header">
      <h3>HỆ THỐNG ĐIỀU CHẾ</h3>
      <div class="terminal-line"></div>
    </div>
    <div class="synth-scroll-area">
  `;

  SYNTHESIS_DATA.forEach(cat => {
    html += `
      <div class="synth-category">
        <div class="cat-label">${cat.category}</div>
        <p class="cat-desc">${cat.description}</p>
        <div class="cat-grid">
    `;

    cat.methods.forEach(m => {
      // Use formatFormulaSubscripts if available globally
      const formattedEq = window.formatFormulaSubscripts ? formatFormulaSubscripts(m.eq) : m.eq;
      html += `
        <div class="synth-card">
          <div class="card-title">${m.name}</div>
          <div class="card-detail">${m.detail}</div>
          <div class="card-eq">${formattedEq}</div>
        </div>
      `;
    });

    html += `</div></div>`;
  });

  html += `</div>`;
  container.innerHTML = html;
}

function toggleQAAccordion(index) {
  const item = document.getElementById(`qa-p-${index}`);
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.qa-item-panel').forEach(i => i.classList.remove('open'));
  if (!wasOpen) item.classList.add('open');
}

// Keep legacy toggle for potential header button use
function toggleQA() { toggleGuide(); } 
