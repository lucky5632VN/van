/* ============================================================
   guided_lab.js — Chế Độ Thí Nghiệm Có Hướng Dẫn (Guided Lab Mode)
   Inspired by: ChemCollective, Yenka Chemistry, PhET Simulations
   ============================================================ */

// ——— COMPLETE GUIDED EXPERIMENT DEFINITIONS ———
const GUIDED_EXPERIMENTS = {

  'copper-cycle': {
    id: 'copper-cycle',
    title: 'Chu Trình Đồng (Copper Reaction Cycle)',
    subtitle: 'Bảo toàn khối lượng qua 5 bước biến đổi',
    icon: '🪙',
    difficulty: 'Trung bình',
    time: '45 phút',
    category: 'redox',
    objective: 'Minh chứng nguyên lý bảo toàn khối lượng qua chuỗi phản ứng biến đổi đồng kim loại qua nhiều dạng hợp chất rồi thu hồi lại đồng nguyên chất.',
    chemicals: ['cu', 'hno3', 'naoh', 'h2so4', 'zn', 'hcl'],
    equipment: ['beaker', 'goggles', 'gloves', 'bunsen', 'stirrer'],
    steps: [
      {
        n: 1, title: 'Chuẩn bị bảo hộ',
        desc: 'Đeo kính bảo hộ và găng tay. Tủ hút khí đã được hệ thống kích hoạt sẵn.',
        warning: '☠️ HNO₃ đặc tạo khí NO₂ cực độc!',
        action: 'setup_safety',
        checkItems: ['goggles', 'gloves'],
        theory: 'An toàn là điều kiện tiên quyết. KClO₃ hay HNO₃ đặc phát sinh khí độc làm tổn thương phổi ngay lập tức.',
      },
      {
        n: 2, title: 'Cu + HNO₃ → Cu(NO₃)₂ (dung dịch xanh)',
        desc: 'Cho ~1g đồng vào cốc. Nhỏ từ từ 5mL HNO₃ 65% vào trong tủ hút. Quan sát: đồng tan, dung dịch xanh lam, khói nâu NO₂ thoát lên.',
        action: 'add_chemical',
        chemPair: ['cu', 'hno3'],
        observation: '🟦 Dung dịch màu xanh lam rực (Cu²⁺). ☁️ Khói nâu NO₂ độc.',
        equation: 'Cu + 4HNO₃(đặc) → Cu(NO₃)₂ + 2NO₂↑ + 2H₂O',
        theory: 'HNO₃ đặc là chất oxy hóa mạnh, oxy hóa Cu(0) → Cu²⁺. NO₃⁻ bị khử → NO₂.',
        phChange: { from: 1, to: 3 },
      },
      {
        n: 3, title: 'Cu(NO₃)₂ + NaOH → Cu(OH)₂ (xanh lam) + CuO (đen)',
        desc: 'Thêm từ từ NaOH 6M vào dung dịch Cu(NO₃)₂ đến khi không còn kết tủa xanh. Đun nhẹ: kết tủa sẽ chuyển từ xanh → đen (CuO).',
        action: 'add_chemical',
        chemPair: ['cucl2', 'naoh'],
        observation: '🔵 Kết tủa xanh Cu(OH)₂ → 🖤 Đen sau khi đun: CuO.',
        equation: 'Cu(NO₃)₂ + 2NaOH → Cu(OH)₂↓\nCu(OH)₂ →(t°) CuO + H₂O',
        theory: 'Đun nóng phân hủy Cu(OH)₂ thành oxide. CuO bền hơn về nhiệt động lực học.',
        phChange: { from: 3, to: 10 },
      },
      {
        n: 4, title: 'CuO + H₂SO₄ → CuSO₄ (xanh lam)',
        desc: 'Thêm 10mL H₂SO₄ 3M. Bột đen CuO hòa tan tạo dung dịch xanh lam CuSO₄.',
        action: 'add_chemical',
        chemPair: ['cucl2', 'h2so4'],
        observation: '💙 Bột đen biến mất → dung dịch xanh lam trong suốt CuSO₄.',
        equation: 'CuO + H₂SO₄ → CuSO₄ + H₂O',
        theory: 'Phản ứng acid-base. CuO là oxide base, tan trong acid tạo muối.',
        phChange: { from: 10, to: 4 },
      },
      {
        n: 5, title: 'CuSO₄ + Zn → Cu (đồng thu hồi)',
        desc: 'Cho 0.5g kẽm vào dung dịch CuSO₄ (trong tủ hút). Khuấy đến khi mất màu xanh hoàn toàn. Thêm HCl 6M để hòa tan Zn dư.',
        action: 'add_chemical',
        chemPair: ['zn', 'cucl2'],
        observation: '🔶 Vụn đồng đỏ kết tủa. Dung dịch mất màu xanh. Sủi bọt H₂ khi thêm HCl.',
        equation: 'Zn + CuSO₄ → ZnSO₄ + Cu↓\nZn + 2HCl → ZnCl₂ + H₂↑',
        theory: 'E°(Zn²⁺/Zn) = -0.76V < E°(Cu²⁺/Cu) = +0.34V. Kẽm khử mạnh hơn → đẩy đồng ra.',
        phChange: { from: 4, to: 5 },
      },
      {
        n: 6, title: 'Thu hồi và cân đồng',
        desc: 'Lọc, rửa, sấy khô đồng thu được. Cân và tính % thu hồi so với khối lượng ban đầu.',
        action: 'complete',
        observation: '✅ Đồng đỏ gạch nguyên chất. % thu hồi lý tưởng ≥ 90%.',
        equation: '% Recovery = (m_Cu_thu_hồi / m_Cu_ban_đầu) × 100%',
        theory: 'Bảo toàn khối lượng: số mol Cu không đổi qua toàn bộ chu trình biến đổi.',
        phChange: null,
      },
    ],
    finalEquation: 'Cu → Cu²⁺ (xanh) → Cu(OH)₂ (xanh lam) → CuO (đen) → Cu²⁺ (xanh) → Cu (đỏ)',
    safetyNotes: ['HNO₃ đặc: tủ hút + kính + găng', 'Đun nóng: khuấy liên tục tránh sôi trào', 'Zn dư + HCl: sinh H₂ — tủ hút'],
  },

  'tollens-silver-mirror': {
    id: 'tollens-silver-mirror',
    title: 'Phản Ứng Tráng Gương (Silver Mirror / Tollens\')',
    subtitle: 'Nhận biết nhóm aldehyde — Tollens\' Test',
    icon: '🪞',
    difficulty: 'Trung bình',
    time: '30 phút',
    category: 'organic',
    objective: 'Quan sát hiện tượng kết tủa bạc kim loại bám thành ống nghiệm (gương bạc) khi glucose khử ion Ag⁺ trong phức Tollens.',
    chemicals: ['agno3', 'nh3', 'naoh', 'phenolphthalein'],
    equipment: ['test-tube', 'beaker', 'goggles', 'bunsen'],
    steps: [
      {
        n: 1, title: 'Chuẩn bị ống nghiệm',
        desc: 'Rửa sạch ống nghiệm bằng NaOH loãng, tráng nước cất. Ống phải CỰC KỲ sạch để bạc bám đều.',
        warning: '⚠️ Ống bẩn → bạc kết tủa không đều, không có gương đẹp.',
        action: 'setup_tube',
        theory: 'Kết tủa Ag yêu cầu bề mặt thủy tinh sạch làm "mầm" tinh thể.',
      },
      {
        n: 2, title: 'Pha thuốc thử Tollens',
        desc: 'Pha 2mL AgNO₃ 0.1M vào ống. Nhỏ từng giọt NaOH đến khi xuất hiện kết tủa Ag₂O nâu. Nhỏ tiếp NH₃ 2M đến khi kết tủa TAN HOÀN TOÀN → phức [Ag(NH₃)₂]⁺ trong suốt.',
        action: 'add_chemical',
        chemPair: ['agno3', 'nh3'],
        observation: '🤎 Kết tủa nâu Ag₂O → ➕ NH₃ → Dung dịch trong suốt [Ag(NH₃)₂]OH.',
        equation: '2Ag⁺ + 2OH⁻ → Ag₂O↓ + H₂O\nAg₂O + 4NH₃ + H₂O → 2[Ag(NH₃)₂]⁺ + 2OH⁻',
        theory: 'Phức diamminesilver(I) bảo vệ Ag⁺ khỏi kết tủa trong môi trường kiềm pH cao.',
      },
      {
        n: 3, title: 'Thêm dung dịch Glucose',
        desc: 'Nhỏ 1mL dung dịch glucose 5% vào thuốc thử Tollens. Đặt ống vào cốc nước nóng ~60°C (KHÔNG sôi). Chờ 5-10 phút.',
        warning: '⚠️ Không đun trực tiếp ngọn lửa — Ag₃N có thể tạo thành, nguy cơ nổ.',
        action: 'heat_reaction',
        observation: '✨ Lớp bạc trắng sáng bóng từ từ xuất hiện bám vào thành ống.',
        equation: 'RCHO + 2[Ag(NH₃)₂]OH →(t°) RCOONH₄ + 2Ag↓ + 3NH₃ + H₂O',
        theory: 'Nhóm CHO bị oxy hóa → COOH. Ag⁺ bị khử → Ag⁰. 1 mol glucose → 2 mol Ag.',
      },
      {
        n: 4, title: 'Quan sát và đánh giá',
        desc: 'Nghiêng ống quan sát lớp bạc gương. Tính 1 mol Glucose → 2 mol Ag theo tỷ lệ định lượng.',
        action: 'complete',
        observation: '🪞 Gương bạc lấp lánh bám thành ống nghiệm — phản ứng hoàn toàn.',
        equation: '1 C₆H₁₂O₆ ↔ 2 Ag (định lượng)',
        theory: 'Aldehyde có tính khử. Ketone (như Acetone) không phản ứng với Tollens — phân biệt 2 nhóm chức.',
      },
    ],
    finalEquation: 'C₆H₁₂O₆ + 2[Ag(NH₃)₂]OH → C₆H₁₁O₇-NH₄ + 2Ag↓ + 3NH₃ + H₂O',
    safetyNotes: ['Không đun sôi Tollens — Ag₃N nổ', 'Rửa ống bằng HNO₃ loãng sau thí nghiệm', 'NH₃ có mùi — thông gió tốt'],
  },

  'saponification': {
    id: 'saponification',
    title: 'Phản Ứng Xà Phòng Hóa (Saponification)',
    subtitle: 'Lipid + KOH → Xà phòng + Glycerin',
    icon: '🧼',
    difficulty: 'Trung bình',
    time: '40 phút',
    category: 'organic',
    objective: 'Thủy phân triglyceride với KOH để thu được muối acid béo (xà phòng) và glycerin, sau đó kiểm tra bằng NaCl ép muối kết tinh.',
    chemicals: ['ca_oh_2', 'naoh', 'ch3cooh', 'phenolphthalein'],
    equipment: ['flask', 'beaker', 'bunsen', 'stirrer', 'goggles', 'gloves'],
    steps: [
      {
        n: 1, title: 'Chuẩn bị nguyên liệu',
        desc: 'Cân 5g dầu thực vật (triglyceride). Pha 10mL KOH 40% trong cốc riêng. Đặt bình Erlenmeyer lên bếp đun cách thủy.',
        warning: '⚠️ KOH 40% ăn mòn cực mạnh — găng tay bắt buộc!',
        action: 'setup_flask',
        theory: 'KOH ion hóa hoàn toàn trong nước → OH⁻ tấn công liên kết ester trong triglyceride.',
      },
      {
        n: 2, title: 'Đun nóng thủy phân',
        desc: 'Trộn dầu + KOH + 10mL cồn etylic 95% (dung môi). Đun cách thủy 80°C, khuấy liên tục 20 phút. Dung dịch đặc dần thành hỗn hợp xà phòng.',
        action: 'heat_reaction',
        observation: '🫧 Hỗn hợp sệt, nhớt, có bọt — xà phòng đang hình thành.',
        equation: '(RCOO)₃C₃H₅ + 3KOH →(t°) 3R-COOK + C₃H₅(OH)₃',
        theory: 'R-COOK là muối kali của acid béo — đây chính là xà phòng lỏng. Glycerin (C₃H₅(OH)₃) là sản phẩm phụ có giá trị cao.',
      },
      {
        n: 3, title: 'Ép muối — Kết tinh xà phòng',
        desc: 'Thêm 50mL dung dịch NaCl bão hòa vào, khuấy đều. Muối NaCl giảm độ tan của xà phòng → xà phòng nổi lên, phân tách khỏi glycerin.',
        action: 'add_chemical',
        chemPair: ['nacl', 'naoh'],
        observation: '🧼 Lớp xà phòng trắng nổi trên lớp glycerin trong. Phân tách 2 pha rõ ràng.',
        equation: 'R-COO⁻K⁺ + NaCl → R-COO⁻Na⁺ (↑ xà phòng) + KCl (aq)',
        theory: 'Hiệu ứng "salting out": ion Na⁺ Cl⁻ cạnh tranh solvat hóa → xà phòng kết tinh.',
      },
      {
        n: 4, title: 'Kiểm tra bằng Phenolphthalein',
        desc: 'Lấy 1mL dung dịch phenolphthalein nhỏ vào lớp xà phòng. Xà phòng có môi trường kiềm nhẹ → chỉ thị hồng nhạt.',
        action: 'add_chemical',
        chemPair: ['phenolphthalein', 'naoh'],
        observation: '🩷 Phenolphthalein hồng nhạt — xà phòng môi trường kiềm pH≈9-10.',
        equation: 'R-COO⁻ + H₂O ⇌ R-COOH + OH⁻ (thủy phân yếu)',
        theory: 'Muối của acid yếu + base mạnh → môi trường kiềm yếu do ion RCOO⁻ thủy phân.',
      },
      {
        n: 5, title: 'Chuẩn độ KOH dư',
        desc: 'Lấy aliquot lớp glycerin 10mL, chuẩn độ với HCl 0.5M đến mất màu hồng. Tính chỉ số xà phòng hóa (Saponification Number).',
        action: 'complete',
        observation: '✅ Đương lượng KOH dư xác định. Tính %hiệu suất xà phòng hóa.',
        equation: 'SN = (mg KOH / g chất béo) để xà phòng hóa hoàn toàn',
        theory: 'Chỉ số xà phòng hóa = 56110 / M_triglyceride. Dầu ô liu: SN≈190, Dừa: SN≈250.',
      },
    ],
    finalEquation: '(RCOO)₃C₃H₅ + 3KOH → 3RCOOK + C₃H₅(OH)₃',
    safetyNotes: ['KOH 40% gây bỏng nghiêm trọng', 'Cồn dễ bắt cháy — không gần ngọn lửa', 'Đun cách thủy, không đun trực tiếp'],
  },

  'acid-base-titration': {
    id: 'acid-base-titration',
    title: 'Chuẩn Độ Acid-Base (Titrimetry)',
    subtitle: 'Xác định nồng độ HCl bằng NaOH chuẩn',
    icon: '🧫',
    difficulty: 'Cơ bản',
    time: '25 phút',
    category: 'analytical',
    objective: 'Xác định chính xác nồng độ dung dịch HCl bằng phương pháp chuẩn độ với NaOH 0.1M chuẩn, sử dụng phenolphthalein làm chỉ thị.',
    chemicals: ['hcl', 'naoh', 'phenolphthalein'],
    equipment: ['flask', 'pipette', 'goggles', 'gloves', 'stirrer'],
    steps: [
      {
        n: 1, title: 'Lấy mẫu HCl vào bình nón',
        desc: 'Dùng pipet bầu 25mL lấy chính xác 25.00mL dung dịch HCl cần xác định nồng độ. Cho vào bình Erlenmeyer. Sai số pipet: ±0.02mL.',
        action: 'measure_aliquot',
        observation: 'Dung dịch HCl không màu trong bình.',
        equation: 'V_HCl = 25.00 ± 0.02 mL',
        theory: 'Pipet bầu cho độ chính xác cao hơn ống đong nhiều lần. Sai số tương đối = 0.02/25 = 0.08%.',
      },
      {
        n: 2, title: 'Nhỏ chỉ thị Phenolphthalein',
        desc: 'Nhỏ 2-3 giọt phenolphthalein vào bình. Dung dịch HCl không đổi màu vì pH < 8.2.',
        action: 'add_indicator',
        observation: 'Dung dịch vẫn không màu — môi trường acid.',
        equation: 'pH(HCl) << 8.2 → Ph.ph không màu',
        theory: 'Phenolphthalein: không màu khi pH < 8.2; hồng khi pH 8.2–10; đỏ tím khi pH > 10.',
      },
      {
        n: 3, title: 'Chuẩn độ: Nhỏ NaOH từ buret',
        desc: 'Mở khóa buret, nhỏ NaOH 0.1M từng giọt một. Khuấy xoáy tròn liên tục. Chú ý: Màu hồng xuất hiện nhưng BIẾN MẤT khi khuấy — CH­ĐỐ chưa đạt điểm tương đương.',
        action: 'titrate',
        observation: '🩷 Màu hồng thoáng xuất hiện rồi mất khi khuấy — gần điểm tương đương.',
        equation: 'HCl + NaOH → NaCl + H₂O',
        theory: 'Mỗi giọt ~0.05mL. Khi gần cuối: nhỏ từng 1/2 giọt bằng cách cho tiếp xúc thành bình.',
        phChange: { from: 1, to: 7 },
      },
      {
        n: 4, title: 'Điểm cuối — Màu hồng bền 30s',
        desc: 'Điểm tương đương: Một giọt NaOH cuối cùng làm màu hồng nhạt BỀN ít nhất 30 giây. Đọc thể tích buret V_NaOH. Lặp lại 3 lần, lấy trung bình.',
        action: 'complete',
        observation: '🌸 Màu hồng nhạt bền vững 30 giây — điểm tương đương đạt.',
        equation: 'C_HCl = (C_NaOH × V_NaOH) / V_HCl',
        theory: 'Tại điểm tương đương: n_HCl = n_NaOH. pH ≈ 7 (muối NaCl trung tính). Chênh lệch giữa 3 lần ≤ 0.1mL.',
        phChange: { from: 7, to: 9 },
      },
    ],
    finalEquation: 'C_HCl = (0.1 × V_NaOH(mL)) / 25.00 (mol/L)',
    safetyNotes: ['HCl bốc hơi — thông thoáng', 'NaOH ăn mòn da', 'Buret: đọc từ phía dưới của meniscus'],
  },

  'precipitation-analysis': {
    id: 'precipitation-analysis',
    title: 'Phân Tích Định Tính Kết Tủa',
    subtitle: 'Nhận biết hỗn hợp ion bằng thuốc thử',
    icon: '🔬',
    difficulty: 'Cao',
    time: '50 phút',
    category: 'analytical',
    objective: 'Xác định các ion có mặt trong dung dịch hỗn hợp chứa Cl⁻, SO₄²⁻, Fe³⁺, Cu²⁺ thông qua phân tích kết tủa có hệ thống.',
    chemicals: ['hcl', 'h2so4', 'fecl3', 'cucl2', 'agno3', 'naoh'],
    equipment: ['test-tube', 'pipette', 'goggles', 'dropper'],
    steps: [
      {
        n: 1, title: 'Quan sát màu dung dịch ban đầu',
        desc: 'Dung dịch có màu gì? Xanh lam → Cu²⁺. Nâu vàng → Fe³⁺. Không màu → có thể có ion không màu.',
        action: 'observe',
        observation: '🔵 Màu xanh lam → có thể có Cu²⁺. 🟠 Nâu nhạt → có thể Fe³⁺.',
        equation: 'Quan sát màu sắc ban đầu là bước đầu tiên',
        theory: 'Màu sắc dung dịch bắt nguồn từ sự hấp thụ ánh sáng qua chuyển dịch d-d của ion kim loại chuyển tiếp.',
      },
      {
        n: 2, title: 'Thử Cl⁻ bằng AgNO₃',
        desc: 'Lấy 1mL mẫu vào ống 1. Thêm vài giọt HNO₃ loãng, nhỏ 5 giọt AgNO₃. Quan sát kết tủa.',
        action: 'add_chemical',
        chemPair: ['hcl', 'agno3'],
        observation: '⚪ Tủa trắng sữa AgCl → xác nhận Cl⁻. Tủa vàng → Br⁻/I⁻.',
        equation: 'Ag⁺ + Cl⁻ → AgCl↓ (trắng, không tan HNO₃)',
        theory: 'HNO₃ loãng loại bỏ CO₃²⁻, SO₃²⁻ có thể kết tủa Ag₂CO₃, Ag₂SO₃ gây nhầm lẫn.',
      },
      {
        n: 3, title: 'Thử SO₄²⁻ bằng BaCl₂',
        desc: 'Ống 2: Thêm BaCl₂ 0.5M + HCl loãng. Tủa trắng bền trong acid → SO₄²⁻.',
        action: 'add_chemical',
        chemPair: ['h2so4', 'agno3'],
        observation: '⚪ Tủa trắng BaSO₄ không tan trong HCl → SO₄²⁻ xác nhận.',
        equation: 'Ba²⁺ + SO₄²⁻ → BaSO₄↓ (trắng, bền trong mọi acid)',
        theory: 'BaSO₄ là kết tủa bền nhất trong các sulfate. Không tan trong HNO₃, HCl, hay H₂SO₄ loãng.',
      },
      {
        n: 4, title: 'Thử Fe³⁺ bằng NaOH và KSCN',
        desc: 'Ống 3: + NaOH → tủa nâu đỏ Fe(OH)₃. Ống 4: + KSCN vài giọt → màu đỏ máu ngay lập tức.',
        action: 'add_chemical',
        chemPair: ['fecl3', 'naoh'],
        observation: '🟤 Tủa nâu đỏ Fe(OH)₃. 🔴 KSCN → đỏ máu FeSCN²⁺ (rất nhạy).',
        equation: 'Fe³⁺ + 3OH⁻ → Fe(OH)₃↓\nFe³⁺ + SCN⁻ → FeSCN²⁺ (đỏ máu)',
        theory: 'KSCN nhạy hơn NaOH — phát hiện Fe³⁺ ở nồng độ ppm. Thuốc thử KSCN là tiêu chuẩn ngành thực phẩm.',
      },
      {
        n: 5, title: 'Thử Cu²⁺ bằng NH₃',
        desc: 'Ống 5: Nhỏ NH₃ từng giọt. Đầu tiên tủa xanh Cu(OH)₂, sau đó tiếp tục → tan thành xanh thẫm [Cu(NH₃)₄]²⁺.',
        action: 'add_chemical',
        chemPair: ['cucl2', 'nh3'],
        observation: '🔵 Tủa xanh nhạt → ➕ NH₃ dư → 🔷 Xanh thẫm rực rỡ [Cu(NH₃)₄]²⁺.',
        equation: 'Cu²⁺ + 2OH⁻ → Cu(OH)₂↓\nCu(OH)₂ + 4NH₃ → [Cu(NH₃)₄]²⁺ + 2OH⁻',
        theory: 'Phức tetraammine đồng(II) có màu xanh thẫm cực đặc trưng — phương pháp nhanh nhất nhận biết Cu²⁺.',
      },
      {
        n: 6, title: 'Tổng hợp kết quả',
        desc: 'Lập bảng kết quả. So sánh với lý thuyết. Tính % sai số nếu có chuẩn độ ngược.',
        action: 'complete',
        observation: '✅ Xác nhận đủ 4 ion: Cl⁻, SO₄²⁻, Fe³⁺, Cu²⁺.',
        equation: 'Báo cáo: Ion + Thuốc thử + Hiện tượng + Kết luận',
        theory: 'Phân tích hệ thống: luôn loại trừ ion gây nhiễu trước khi thêm thuốc thử chính.',
      },
    ],
    finalEquation: 'Hỗn hợp → Cl⁻(AgNO₃) + SO₄²⁻(BaCl₂) + Fe³⁺(KSCN) + Cu²⁺(NH₃)',
    safetyNotes: ['AgNO₃ để lại vết đen trên da', 'NH₃ mùi khai — thông gió', 'HNO₃ oxy hóa mạnh'],
  },
};

// ——— GUIDED LAB STATE ———
let guidedState = {
  active: false,
  currentExp: null,
  currentStep: 0,
  stepDone: [],
  phHistory: [],
  startPH: 7,
  currentPH: 7,
};

// ——— PH TRACKER ———
let phCanvas, phCtx;
const PH_COLORS = {
  0: '#dc2626', 1: '#ea580c', 2: '#f97316', 3: '#fb923c',
  4: '#fbbf24', 5: '#facc15', 6: '#a3e635', 7: '#4ade80',
  8: '#34d399', 9: '#2dd4bf', 10: '#22d3ee', 11: '#38bdf8',
  12: '#818cf8', 13: '#a78bfa', 14: '#c084fc',
};

function getPHColor(ph) {
  const rounded = Math.round(Math.max(0, Math.min(14, ph)));
  return PH_COLORS[rounded] || '#94a3b8';
}

// ——— INJECT GUIDED LAB UI ———
function initGuidedLab() {
  // Add button to header tabs
  const tabs = document.querySelector('.experiment-tabs');
  const btn = document.createElement('button');
  btn.className = 'tab-btn guided-btn';
  btn.id = 'guidedLabBtn';
  btn.innerHTML = '🎓 Lab Có Hướng Dẫn';
  btn.onclick = openGuidedLabSelector;
  tabs.appendChild(btn);

  // Inject guided lab selector modal
  const sel = document.createElement('div');
  sel.id = 'guidedLabSelector';
  sel.className = 'guided-selector-overlay';
  sel.innerHTML = buildSelectorHTML();
  document.body.appendChild(sel);

  // Inject guided panel
  const panel = document.createElement('div');
  panel.id = 'guidedPanel';
  panel.className = 'guided-panel';
  panel.innerHTML = buildGuidedPanelHTML();
  document.body.appendChild(panel);

  // Inject pH tracker
  const phTracker = document.createElement('div');
  phTracker.id = 'phTracker';
  phTracker.className = 'ph-tracker';
  phTracker.innerHTML = `
    <div class="ph-tracker-header">
      <span>📊 pH Tracker</span>
      <div class="ph-current" id="phCurrentDisplay">pH 7.0</div>
    </div>
    <canvas id="phCanvas" width="240" height="80"></canvas>
    <div class="ph-scale-bar">
      <span class="ph-acid">Acid</span>
      <div class="ph-scale-gradient"></div>
      <span class="ph-base">Base</span>
    </div>
  `;
  document.getElementById('workspace').appendChild(phTracker);

  // Init pH canvas
  setTimeout(() => {
    phCanvas = document.getElementById('phCanvas');
    phCtx = phCanvas.getContext('2d');
    guidedState.phHistory = [7];
    guidedState.currentPH = 7;
    drawPHGraph();
  }, 100);
}

// ——— SELECTOR HTML ———
function buildSelectorHTML() {
  const expCards = Object.values(GUIDED_EXPERIMENTS).map(exp => `
    <div class="guided-exp-card" onclick="startGuidedExperiment('${exp.id}')">
      <div class="guided-exp-icon">${exp.icon}</div>
      <div class="guided-exp-info">
        <div class="guided-exp-title">${exp.title}</div>
        <div class="guided-exp-sub">${exp.subtitle}</div>
        <div class="guided-exp-meta">
          <span class="guided-meta-tag ${exp.difficulty === 'Cao' ? 'tag-hard' : exp.difficulty === 'Trung bình' ? 'tag-med' : 'tag-easy'}">${exp.difficulty}</span>
          <span class="guided-meta-time">⏱ ${exp.time}</span>
          <span class="guided-meta-cat">${exp.category}</span>
        </div>
      </div>
    </div>
  `).join('');

  return `
  <div class="guided-selector-box">
    <div class="guided-selector-header">
      <h2>Chọn Thí Nghiệm</h2>
      <button onclick="closeGuidedSelector()" class="lib-close">✕</button>
    </div>
    <div class="guided-exp-grid">${expCards}</div>
  </div>`;
}

// ——— GUIDED PANEL HTML ———
function buildGuidedPanelHTML() {
  return `
  <div class="guided-panel-header">
    <div id="guidedExpTitle" class="guided-active-title">—</div>
    <div class="guided-panel-actions">
      <button onclick="prevGuidedStep()" id="prevStepBtn" class="guided-nav-btn" disabled>◀</button>
      <span id="guidedStepCounter" class="guided-step-counter">0/0</span>
      <button onclick="nextGuidedStep()" id="nextStepBtn" class="guided-nav-btn">▶</button>
      <button onclick="closeGuidedPanel()" class="guided-close-btn">✕</button>
    </div>
  </div>
  <div class="guided-progress-bar" id="guidedProgressBar">
    <!-- Step dots injected -->
  </div>
  <div class="guided-step-content" id="guidedStepContent">
    <!-- Step content injected -->
  </div>
  <div class="guided-equations" id="guidedEquations">
    <!-- Equation panel -->
  </div>
  <div class="guided-safety" id="guidedSafety">
    <!-- Safety notes -->
  </div>`;
}

// ——— OPEN / CLOSE ———
function openGuidedLabSelector() {
  document.getElementById('guidedLabSelector').classList.add('open');
}
function closeGuidedSelector() {
  document.getElementById('guidedLabSelector').classList.remove('open');
}
function closeGuidedPanel() {
  document.getElementById('guidedPanel').classList.remove('open');
  guidedState.active = false;
  document.getElementById('phTracker').classList.remove('show');
}

// ——— START EXPERIMENT ———
function startGuidedExperiment(expId) {
  closeGuidedSelector();
  const exp = GUIDED_EXPERIMENTS[expId];
  if (!exp) return;

  guidedState.active = true;
  guidedState.currentExp = exp;
  guidedState.currentStep = 0;
  guidedState.stepDone = new Array(exp.steps.length).fill(false);
  guidedState.phHistory = [7];
  guidedState.currentPH = 7;

  // Reset lab
  resetLab();
  addLog('info', `🎓 Bắt đầu thí nghiệm: ${exp.title}`);

  // Update title
  document.getElementById('guidedExpTitle').innerHTML =
    `${exp.icon} ${exp.title}`;

  // Progress bar
  const bar = document.getElementById('guidedProgressBar');
  bar.innerHTML = exp.steps.map((s, i) =>
    `<div class="guided-step-dot" id="gdot-${i}" title="${s.title}"></div>`
  ).join('');

  // Render step
  renderGuidedStep(0);

  // Show panel and pH tracker
  document.getElementById('guidedPanel').classList.add('open');
  document.getElementById('phTracker').classList.add('show');

  // Update experiment tab
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('guidedLabBtn').classList.add('active');
}

// ——— RENDER STEP ———
function renderGuidedStep(idx) {
  const exp = guidedState.currentExp;
  const step = exp.steps[idx];
  guidedState.currentStep = idx;

  // Update dots
  exp.steps.forEach((_, i) => {
    const dot = document.getElementById(`gdot-${i}`);
    if (!dot) return;
    dot.className = 'guided-step-dot' +
      (guidedState.stepDone[i] ? ' done' : '') +
      (i === idx ? ' active' : '');
  });

  // Counter
  document.getElementById('guidedStepCounter').textContent = `${idx+1}/${exp.steps.length}`;
  document.getElementById('prevStepBtn').disabled = idx === 0;
  document.getElementById('nextStepBtn').disabled = idx === exp.steps.length - 1;

  // Step content
  document.getElementById('guidedStepContent').innerHTML = `
    <div class="guided-step-num">Bước ${step.n}</div>
    <div class="guided-step-title">${step.title}</div>
    <div class="guided-step-desc">${step.desc}</div>
    ${step.warning ? `<div class="guided-step-warning">⚠️ ${step.warning}</div>` : ''}
    ${step.observation ? `<div class="guided-step-obs">👁️ <strong>Quan sát:</strong> ${step.observation}</div>` : ''}
    ${step.theory ? `<div class="guided-step-theory">🔬 <em>${step.theory}</em></div>` : ''}
    <button onclick="markStepDone(${idx})" class="guided-mark-btn ${guidedState.stepDone[idx] ? 'done' : ''}">
      ${guidedState.stepDone[idx] ? '✅ Đã hoàn thành' : '☐ Đánh dấu hoàn thành'}
    </button>
  `;

  // Equation
  document.getElementById('guidedEquations').innerHTML = step.equation ? `
    <div class="guided-eq-label">⚗️ Phương trình phản ứng</div>
    <div class="guided-eq-box">${step.equation.replace(/\n/g, '<br>')}</div>
  ` : '';

  // Update pH if step has phChange
  if (step.phChange) {
    animatePHChange(step.phChange.from, step.phChange.to);
  }

  // Safety notes (only on step 1)
  if (idx === 0 && exp.safetyNotes) {
    document.getElementById('guidedSafety').innerHTML = `
      <div class="guided-safety-header">🦺 An Toàn</div>
      ${exp.safetyNotes.map(n => `<div class="guided-safety-item">⚠️ ${n}</div>`).join('')}
    `;
  } else {
    document.getElementById('guidedSafety').innerHTML = '';
  }

  // Auto-trigger lab interaction hints
  triggerStepInteraction(step);
}

// ——— MARK STEP ———
function markStepDone(idx) {
  guidedState.stepDone[idx] = !guidedState.stepDone[idx];
  renderGuidedStep(idx);
  if (guidedState.stepDone[idx]) {
    addLog('success', `✅ Bước ${idx+1}: ${guidedState.currentExp.steps[idx].title}`);
    // Auto-advance
    if (idx < guidedState.currentExp.steps.length - 1) {
      setTimeout(() => nextGuidedStep(), 500);
    } else {
      // Experiment complete
      showExperimentComplete();
    }
  }
}

function nextGuidedStep() {
  if (guidedState.currentStep < guidedState.currentExp.steps.length - 1) {
    renderGuidedStep(guidedState.currentStep + 1);
  }
}
function prevGuidedStep() {
  if (guidedState.currentStep > 0) {
    renderGuidedStep(guidedState.currentStep - 1);
  }
}

// ——— EXPERIMENT COMPLETE ———
function showExperimentComplete() {
  const exp = guidedState.currentExp;
  const doneCount = guidedState.stepDone.filter(Boolean).length;
  const total = exp.steps.length;
  const score = Math.round((doneCount / total) * 100);

  document.getElementById('modalContent').innerHTML = `
    <div style="text-align:center">
      <div style="font-size:56px;margin-bottom:16px">🏆</div>
      <h3 style="color:#34d399;font-size:20px;margin-bottom:8px">Thí Nghiệm Hoàn Tất!</h3>
      <p style="color:#94a3b8;margin-bottom:16px">${exp.title}</p>
      <div style="background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.3);border-radius:12px;padding:16px;margin-bottom:16px">
        <div style="font-size:36px;font-weight:700;color:#34d399">${score}%</div>
        <div style="color:#94a3b8;font-size:13px">${doneCount}/${total} bước hoàn thành</div>
      </div>
      <div style="background:var(--bg-card);border-radius:12px;padding:14px;text-align:left">
        <div style="font-size:12px;color:#a78bfa;margin-bottom:6px;text-transform:uppercase;font-weight:600">Phương trình tổng</div>
        <div style="font-family:monospace;font-size:13px;color:#34d399">${exp.finalEquation}</div>
      </div>
    </div>
  `;
  document.getElementById('modalOverlay').classList.add('show');
  addLog('success', `🏆 Hoàn thành: ${exp.title} — ${score}%`);
}

// ——— TRIGGER INTERACTION HINTS ———
function triggerStepInteraction(step) {
  // Flash relevant chemicals/tools in sidebar
  if (step.chemPair) {
    step.chemPair.forEach(chemId => {
      const el = document.querySelector(`[data-chem-id="${chemId}"]`) ||
                 document.querySelector(`[data-tool-id="${chemId}"]`);
      if (el) {
        el.classList.add('guided-highlight');
        setTimeout(() => el.classList.remove('guided-highlight'), 2000);
      }
    });
  }
  if (step.checkItems) {
    step.checkItems.forEach(toolId => {
      const el = document.querySelector(`[data-tool-id="${toolId}"]`);
      if (el) {
        el.classList.add('guided-highlight');
        setTimeout(() => el.classList.remove('guided-highlight'), 2000);
      }
    });
  }
}

// ——— PH GRAPH ———
function drawPHGraph() {
  if (!phCtx || !phCanvas) return;
  const w = phCanvas.width, h = phCanvas.height;
  phCtx.clearRect(0, 0, w, h);

  // Background
  phCtx.fillStyle = 'rgba(0,0,0,0.3)';
  phCtx.fillRect(0, 0, w, h);

  // Grid lines
  for (let ph = 0; ph <= 14; ph += 2) {
    const y = h - (ph / 14) * h;
    phCtx.setLineDash([2, 4]);
    phCtx.strokeStyle = 'rgba(255,255,255,0.1)';
    phCtx.lineWidth = 1;
    phCtx.beginPath();
    phCtx.moveTo(0, y);
    phCtx.lineTo(w, y);
    phCtx.stroke();
  }
  phCtx.setLineDash([]);

  // Neutral line (pH 7)
  const neutral = h - (7 / 14) * h;
  phCtx.strokeStyle = 'rgba(74,222,128,0.4)';
  phCtx.lineWidth = 1;
  phCtx.beginPath();
  phCtx.moveTo(0, neutral);
  phCtx.lineTo(w, neutral);
  phCtx.stroke();

  // pH curve
  const hist = guidedState.phHistory;
  if (hist.length < 2) return;
  const stepW = w / (Math.max(hist.length - 1, 1));

  for (let i = 0; i < hist.length - 1; i++) {
    const x1 = i * stepW, x2 = (i + 1) * stepW;
    const y1 = h - (hist[i] / 14) * h;
    const y2 = h - (hist[i+1] / 14) * h;
    const grad = phCtx.createLinearGradient(x1, 0, x2, 0);
    grad.addColorStop(0, getPHColor(hist[i]));
    grad.addColorStop(1, getPHColor(hist[i+1]));
    phCtx.strokeStyle = grad;
    phCtx.lineWidth = 2.5;
    phCtx.lineCap = 'round';
    phCtx.beginPath();
    phCtx.moveTo(x1, y1);
    phCtx.lineTo(x2, y2);
    phCtx.stroke();
  }

  // Current pH dot
  const lastX = (hist.length - 1) * stepW;
  const lastY = h - (hist[hist.length-1] / 14) * h;
  phCtx.beginPath();
  phCtx.arc(lastX, lastY, 4, 0, Math.PI*2);
  phCtx.fillStyle = getPHColor(hist[hist.length-1]);
  phCtx.fill();
  phCtx.strokeStyle = 'white';
  phCtx.lineWidth = 1.5;
  phCtx.stroke();

  // Update display
  const cur = hist[hist.length-1];
  const disp = document.getElementById('phCurrentDisplay');
  if (disp) {
    disp.textContent = `pH ${cur.toFixed(1)}`;
    disp.style.color = getPHColor(cur);
    disp.style.background = getPHColor(cur) + '22';
    disp.style.border = `1px solid ${getPHColor(cur)}55`;
  }
}

function animatePHChange(fromPH, toPH) {
  const steps = 30;
  const delta = (toPH - fromPH) / steps;
  let current = fromPH;
  let count = 0;
  guidedState.phHistory.push(fromPH);

  const iv = setInterval(() => {
    current += delta;
    count++;
    guidedState.phHistory.push(parseFloat(current.toFixed(2)));
    guidedState.currentPH = current;
    drawPHGraph();
    if (count >= steps) {
      clearInterval(iv);
      guidedState.phHistory.push(toPH);
      guidedState.currentPH = toPH;
      drawPHGraph();
    }
  }, 50);
}

// ——— UPDATE PH ON REACTION ———
function updatePHFromReaction(reaction) {
  const phMap = {
    'neutralization': 7,
    'acid-carbonate': 6.5,
    'metal-acid': 3,
    'precipitation': 6,
    'indicator': 8.5,
  };
  const targetPH = phMap[reaction.type] || 7;
  if (Math.abs(targetPH - guidedState.currentPH) > 0.5) {
    animatePHChange(guidedState.currentPH, targetPH);
  }
}

// ——— STOCKROOM MODAL ———
let _stockSelectedTab = 'all';

function renderStockItems(type = 'all') {
  _stockSelectedTab = type;
  const list = CHEMICALS.filter(c => type === 'all' || c.type === type);
  const container = document.getElementById('stockItemsGrid');
  if (!container) return;
  
  container.innerHTML = list.map(c => `
    <div class="stock-card" style="border-left: 3px solid ${c.colorHex || '#475569'}">
      <div class="stock-info">
        <span class="stock-icon">${c.icon || '🧪'}</span>
        <div class="stock-text">
          <div class="stock-formula">${c.formula}</div>
          <div class="stock-name">${c.name}</div>
        </div>
      </div>
      <div class="stock-inputs">
        <div class="stock-input-row">
          <label>Nồng độ (M)</label>
          <input type="number" id="sc_${c.id}" value="${c.ph < 7 ? 0.1 : 1.0}" min="0.01" max="18" step="0.1">
        </div>
        <div class="stock-input-row">
          <label>Thể tích (mL)</label>
          <input type="number" id="sv_${c.id}" value="25" min="1" max="1000" step="5">
        </div>
        <button onclick="addFromStockroom('${c.id}')" class="stock-add-btn">Lấy Ra 🧪</button>
      </div>
    </div>
  `).join('');

  // Update tabs
  document.querySelectorAll('.stock-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.type === type);
  });
}

function openStockroom() {
  const content = document.getElementById('modalContent');
  content.innerHTML = `
    <div class="stockroom-modal">
      <div class="stock-side-nav">
        <div class="stock-nav-header">📁 Phân Loại</div>
        <button class="stock-tab active" data-type="all" onclick="renderStockItems('all')">Tất cả</button>
        <button class="stock-tab" data-type="acid" onclick="renderStockItems('acid')">🧪 Acid</button>
        <button class="stock-tab" data-type="base" onclick="renderStockItems('base')">🔷 Base</button>
        <button class="stock-tab" data-type="salt" onclick="renderStockItems('salt')">🧂 Muối</button>
        <button class="stock-tab" data-type="metal" onclick="renderStockItems('metal')">⚙️ Kim loại</button>
        <button class="stock-tab" data-type="organic" onclick="renderStockItems('organic')">🧬 Hữu cơ</button>
      </div>
      <div class="stock-main">
        <div class="stock-header">
          <h3>🏪 Warehouse & Stockroom</h3>
          <p>Thiết lập nồng độ (Molarity) và thể tích (Volume) trước khi làm thí nghiệm.</p>
        </div>
        <div class="stock-grid" id="stockItemsGrid"></div>
      </div>
    </div>
  `;
  document.getElementById('modalOverlay').classList.add('show');
  renderStockItems('all');
}

function addFromStockroom(chemId) {
  const cEl = document.getElementById(`sc_${chemId}`);
  const vEl = document.getElementById(`sv_${chemId}`);
  const conc = cEl ? parseFloat(cEl.value) : 1;
  const vol = vEl ? parseFloat(vEl.value) : 25;
  
  const chem = CHEMICALS.find(c => c.id === chemId);
  if (!chem) return;

  // Simulate placing on workspace
  const surface = document.getElementById('workspaceSurface');
  const rect = surface.getBoundingClientRect();
  const x = 300 + (Math.random() * 200);
  const y = 200 + (Math.random() * 100);

  // In a real system, we'd store conc/vol in the workspace item state
  placeItemOnWorkspace('chemical', chemId, x, y);
  
  addLog('success', `📦 Đã lấy ${vol}mL ${chem.formula} ${conc}M từ kho.`);
  // closeModal(); // Optional: keep open for multiple items
}

// Add stockroom button to header
function addStockroomButton() {
  const hr = document.querySelector('.header-right');
  const btn = document.createElement('button');
  btn.className = 'btn-guide';
  btn.innerHTML = '🏪 Kho';
  btn.onclick = openStockroom;
  hr.insertBefore(btn, hr.firstChild);
}

// ——— INIT ———
document.addEventListener('DOMContentLoaded', () => {
  initGuidedLab();
  addStockroomButton();
});
