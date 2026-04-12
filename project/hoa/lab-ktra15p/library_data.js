/* ============================================================
   library_data.js — Thư Viện Tham Khảo Hóa Học Toàn Diện
   Nguồn: Cẩm Nang Thực Hành PTN Hóa Học QuantumLab
   ============================================================ */

// ——— ĐO LƯỜNG & SAI SỐ ———
const MEASUREMENT_INSTRUMENTS = [
  { name: 'Cân đĩa', uncertainty: '±0.50 g', use: 'Đo lường hóa chất thô' },
  { name: 'Cân kỹ thuật', uncertainty: '±0.01 g', use: 'Chuẩn bị chất tan rắn khối lượng lớn' },
  { name: 'Cân bán vi lượng', uncertainty: '±0.001 g', use: 'Thuốc thử phân tích định tính' },
  { name: 'Cân phân tích', uncertainty: '±0.0001 g', use: 'Hóa chất gốc chuẩn độ' },
  { name: 'Ống đong 100 mL', uncertainty: '±0.2 mL', use: 'Lấy thể tích dung môi phụ trợ' },
  { name: 'Ống đong 10 mL', uncertainty: '±0.1 mL', use: 'Định mức chất lỏng phản ứng' },
  { name: 'Buret 50 mL', uncertainty: '±0.02 mL', use: 'Chuẩn độ thể tích — dụng cụ cốt lõi' },
  { name: 'Pipet bầu 25 mL', uncertainty: '±0.02 mL', use: 'Lấy chính xác thể tích mẫu' },
  { name: 'Pipet bầu 10 mL', uncertainty: '±0.01 mL', use: 'Hút mẫu thuốc thử nồng độ cao' },
  { name: 'Nhiệt kế (1°C)', uncertainty: '±0.2°C', use: 'Theo dõi phản ứng tỏa/thu nhiệt' },
  { name: 'Áp kế thủy ngân', uncertainty: '±0.5 torr', use: 'Đo áp suất cho phản ứng sinh khí' },
];

// ——— BẢNG NHẬN BIẾT CATION ———
const CATION_ID = [
  {
    ion: 'Li⁺', name: 'Liti',
    reagent: 'Thử ngọn lửa (dây Pt)',
    observation: 'Ngọn lửa màu đỏ tía (carmine)',
    color: '#dc2626',
    equation: 'Kích thích electron → phát photon đỏ tía',
    note: 'Bức xạ lượng tử, không phải phản ứng hóa học',
    precipitateColor: null,
  },
  {
    ion: 'Na⁺', name: 'Natri',
    reagent: 'Thử ngọn lửa',
    observation: 'Ngọn lửa vàng cam chói (đặc trưng nhất)',
    color: '#f59e0b',
    equation: 'Bức xạ photon vạch kép D (589 nm)',
    note: 'Màu vàng rất mạnh, che lấp các ion khác',
    precipitateColor: null,
  },
  {
    ion: 'K⁺', name: 'Kali',
    reagent: 'Thử ngọn lửa (qua kính cobalt)',
    observation: 'Ngọn lửa tím nhạt',
    color: '#7c3aed',
    equation: 'Bức xạ tử ngoại gần — violet',
    note: 'Dùng kính cobalt xanh để lọc màu vàng Natri',
    precipitateColor: null,
  },
  {
    ion: 'NH₄⁺', name: 'Amôni',
    reagent: 'NaOH đặc, đun nhẹ',
    observation: 'Khí NH₃ không màu, mùi khai xốc mũi',
    color: '#6b7280',
    equation: 'NH₄⁺ + OH⁻ → NH₃↑ + H₂O',
    note: 'Dùng giấy quỳ ẩm — quỳ hóa xanh để xác nhận',
    precipitateColor: null,
  },
  {
    ion: 'Ba²⁺', name: 'Bari',
    reagent: 'H₂SO₄ loãng hoặc Na₂SO₄',
    observation: 'Kết tủa trắng BaSO₄, không tan trong axit',
    color: '#f8fafc',
    equation: 'Ba²⁺ + SO₄²⁻ → BaSO₄↓',
    note: 'BaSO₄ bền vững nhất trong các sunfat kết tủa',
    precipitateColor: '#e2e8f0',
  },
  {
    ion: 'Ca²⁺', name: 'Canxi',
    reagent: 'Na₂CO₃ hoặc (NH₄)₂C₂O₄',
    observation: 'Kết tủa trắng CaCO₃ (tan sủi bọt trong HCl)',
    color: '#f8fafc',
    equation: 'Ca²⁺ + CO₃²⁻ → CaCO₃↓',
    note: 'Ngọn lửa: màu đỏ cam (gạch)',
    precipitateColor: '#f1f5f9',
  },
  {
    ion: 'Mg²⁺', name: 'Magie',
    reagent: 'NaOH',
    observation: 'Kết tủa trắng vô định hình Mg(OH)₂',
    color: '#f8fafc',
    equation: 'Mg²⁺ + 2OH⁻ → Mg(OH)₂↓',
    note: 'Tan trong dung dịch NH₄⁺ do tạo phức amoniac',
    precipitateColor: '#f1f5f9',
  },
  {
    ion: 'Cu²⁺', name: 'Đồng(II)',
    reagent: 'NaOH hoặc NH₃(dư)',
    observation: 'Tủa xanh lam Cu(OH)₂; tan trong NH₃ dư → xanh thẫm [Cu(NH₃)₄]²⁺',
    color: '#3b82f6',
    equation: 'Cu²⁺ + 2OH⁻ → Cu(OH)₂↓\nCu(OH)₂ + 4NH₃ → [Cu(NH₃)₄]²⁺ + 2OH⁻',
    note: 'Phức tetraammine đồng(II) màu xanh thẫm đặc trưng',
    precipitateColor: '#1d4ed8',
  },
  {
    ion: 'Fe²⁺', name: 'Sắt(II)',
    reagent: 'NaOH',
    observation: 'Tủa trắng xanh Fe(OH)₂, nhanh chóng bị oxy hóa → nâu',
    color: '#a3e635',
    equation: 'Fe²⁺ + 2OH⁻ → Fe(OH)₂↓\n4Fe(OH)₂ + O₂ + 2H₂O → 4Fe(OH)₃',
    note: 'Kết tủa biến màu trong không khí là dấu hiệu của Fe²⁺',
    precipitateColor: '#84cc16',
  },
  {
    ion: 'Fe³⁺', name: 'Sắt(III)',
    reagent: 'NaOH hoặc KSCN',
    observation: 'Tủa nâu đỏ Fe(OH)₃; KSCN → dung dịch đỏ máu FeSCN²⁺',
    color: '#b45309',
    equation: 'Fe³⁺ + 3OH⁻ → Fe(OH)₃↓\nFe³⁺ + SCN⁻ → FeSCN²⁺ (đỏ máu)',
    note: 'Thuốc thử KSCN rất nhạy, dùng để nhận biết vết sắt',
    precipitateColor: '#92400e',
  },
  {
    ion: 'Ag⁺', name: 'Bạc',
    reagent: 'HCl hoặc NaCl',
    observation: 'Tủa trắng sữa AgCl, sẫm thành tím nâu ngoài sáng',
    color: '#94a3b8',
    equation: 'Ag⁺ + Cl⁻ → AgCl↓',
    note: 'AgCl tan trong NH₃ dư tạo phức tan không màu',
    precipitateColor: '#e2e8f0',
  },
  {
    ion: 'Pb²⁺', name: 'Chì',
    reagent: 'H₂S hoặc Na₂S',
    observation: 'Tủa đen PbS',
    color: '#1e293b',
    equation: 'Pb²⁺ + S²⁻ → PbS↓ (đen)',
    note: 'Với OH⁻ dư: tủa Pb(OH)₂ trắng → tan thành plumbit (lưỡng tính)',
    precipitateColor: '#0f172a',
  },
  {
    ion: 'Al³⁺', name: 'Nhôm',
    reagent: 'NaOH (từng lượng nhỏ)',
    observation: 'Tủa keo trắng Al(OH)₃, tan khi dư NaOH → AlO₂⁻',
    color: '#f8fafc',
    equation: 'Al³⁺ + 3OH⁻ → Al(OH)₃↓\nAl(OH)₃ + OH⁻ → AlO₂⁻ + 2H₂O',
    note: 'Tính lưỡng tính: tan cả trong axit và kiềm mạnh',
    precipitateColor: '#f1f5f9',
  },
  {
    ion: 'Zn²⁺', name: 'Kẽm',
    reagent: 'NaOH (từng lượng nhỏ)',
    observation: 'Tủa trắng Zn(OH)₂, tan nhanh khi dư OH⁻ → ZnO₂²⁻',
    color: '#94a3b8',
    equation: 'Zn²⁺ + 2OH⁻ → Zn(OH)₂↓\nZn(OH)₂ + 2OH⁻ → ZnO₂²⁻ + 2H₂O',
    note: 'Zn(OH)₂ còn tan được trong dung dịch amoniac dư',
    precipitateColor: '#e2e8f0',
  },
  {
    ion: 'Cr³⁺', name: 'Crôm(III)',
    reagent: 'NaOH (từng lượng nhỏ)',
    observation: 'Tủa xanh xám Cr(OH)₃, tan thành xanh lục trong kiềm dư → CrO₂⁻',
    color: '#16a34a',
    equation: 'Cr³⁺ + 3OH⁻ → Cr(OH)₃↓\nCr(OH)₃ + OH⁻ → CrO₂⁻ + 2H₂O',
    note: 'Lưỡng tính; oxy hóa CrO₂⁻ trong kiềm → CrO₄²⁻ vàng',
    precipitateColor: '#15803d',
  },
  {
    ion: 'Cd²⁺', name: 'Cadimi',
    reagent: 'H₂S',
    observation: 'Tủa vàng chanh CdS',
    color: '#facc15',
    equation: 'Cd²⁺ + S²⁻ → CdS↓ (vàng)',
    note: 'Sản phẩm trung gian quan trọng trong phân tích định tính',
    precipitateColor: '#eab308',
  },
];

// ——— BẢNG NHẬN BIẾT ANION ———
const ANION_ID = [
  {
    ion: 'Cl⁻', name: 'Clorua',
    reagent: 'AgNO₃ (trong HNO₃ loãng)',
    observation: 'Tủa trắng sữa AgCl không tan trong HNO₃',
    color: '#f8fafc',
    equation: 'Ag⁺ + Cl⁻ → AgCl↓',
    note: 'AgCl tan nhanh trong NH₃ dư, dùng phân biệt với Bromua/Iodua',
    precipitateColor: '#e2e8f0',
  },
  {
    ion: 'Br⁻', name: 'Bromua',
    reagent: 'AgNO₃',
    observation: 'Tủa vàng nhạt (kem) AgBr',
    color: '#fef3c7',
    equation: 'Ag⁺ + Br⁻ → AgBr↓',
    note: 'AgBr tan chậm trong amoniac đặc, không tan trong axit nitơric',
    precipitateColor: '#fde68a',
  },
  {
    ion: 'I⁻', name: 'Iodua',
    reagent: 'AgNO₃',
    observation: 'Tủa vàng đậm AgI',
    color: '#eab308',
    equation: 'Ag⁺ + I⁻ → AgI↓',
    note: 'Hoàn toàn không tan trong amoniac; nhận biết nhờ màu sắc đậm',
    precipitateColor: '#ca8a04',
  },
  {
    ion: 'SO₄²⁻', name: 'Sunfat',
    reagent: 'BaCl₂ (trong HCl loãng)',
    observation: 'Tủa trắng BaSO₄, không tan trong axit',
    color: '#f8fafc',
    equation: 'Ba²⁺ + SO₄²⁻ → BaSO₄↓',
    note: 'Kết tủa bền vững nhất, dùng định lượng sunfat',
    precipitateColor: '#f1f5f9',
  },
  {
    ion: 'SO₃²⁻', name: 'Sunfit',
    reagent: 'HCl hoặc H₂SO₄ loãng',
    observation: 'Sủi bọt khí SO₂ mùi hắc khét như diêm sinh',
    color: '#fef9c3',
    equation: 'SO₃²⁻ + 2H⁺ → SO₂↑ + H₂O',
    note: 'Dùng giấy tẩm K₂Cr₂O₇: cam chuyển sang xanh lá để xác nhận',
    precipitateColor: null,
  },
  {
    ion: 'CO₃²⁻', name: 'Cacbonat',
    reagent: 'Axit mạnh (HCl)',
    observation: 'Sủi bọt khí CO₂ không màu, không mùi',
    color: '#e0f2fe',
    equation: 'CO₃²⁻ + 2H⁺ → CO₂↑ + H₂O',
    note: 'Sục khí thoát ra vào nước vôi trong gây vẩn đục',
    precipitateColor: null,
  },
  {
    ion: 'HCO₃⁻', name: 'Hiđrocacbonat',
    reagent: 'Axit mạnh (HCl)',
    observation: 'Sủi bọt nhẹ CO₂',
    color: '#e0f2fe',
    equation: 'HCO₃⁻ + H⁺ → CO₂↑ + H₂O',
    note: 'HCO₃⁻ không kết tủa với Ca²⁺ ở điều kiện thường',
    precipitateColor: null,
  },
  {
    ion: 'S²⁻', name: 'Sunfua',
    reagent: 'Pb(NO₃)₂ hoặc muối Bạc',
    observation: 'Tủa đen PbS hoặc Ag₂S tức thì',
    color: '#0f172a',
    equation: 'Pb²⁺ + S²⁻ → PbS↓',
    note: 'Trong môi trường axit giải phóng khí mùi trứng thối',
    precipitateColor: '#000000',
  },
  {
    ion: 'PO₄³⁻', name: 'Photphat',
    reagent: 'AgNO₃',
    observation: 'Tủa vàng Ag₃PO₄, tan được trong HNO₃',
    color: '#fbbf24',
    equation: '3Ag⁺ + PO₄³⁻ → Ag₃PO₄↓',
    note: 'Dùng hỗn hợp magiê (Mg²⁺ + NH₄⁺) tạo tủa trắng đặc trưng',
    precipitateColor: '#d97706',
  },
  {
    ion: 'NO₃⁻', name: 'Nitrat',
    reagent: 'Vụn Đồng + H₂SO₄ đặc',
    observation: 'Kim loại tan, khí nâu đỏ NO₂ độc, dung dịch xanh lam',
    color: '#7c3aed',
    equation: 'Cu + 4HNO₃(đặc) → Cu(NO₃)₂ + 2NO₂↑ + 2H₂O',
    note: 'Tiến hành trong tủ hút vì NO₂ rất độc',
    precipitateColor: null,
  },
];

// ——— THỬ KHÍ (SPLINT TESTS) ———
const GAS_TESTS = [
  {
    gas: 'H₂',
    name: 'Hiđrô',
    color: '#f0f9ff',
    smell: 'Không màu, không mùi',
    test: 'Đưa tàn đốm đang cháy vào miệng ống — tiếng nổ "pop" dứt khoát',
    mechanism: 'H₂ kết hợp O₂ bùng cháy tạo nước',
    equation: '2H₂ + O₂ → 2H₂O',
    produce: 'Kẽm tác dụng axit: Zn + 2HCl → ZnCl₂ + H₂↑',
    safety: 'Nguy cơ nổ cao nếu nồng độ tập trung lớn',
    icon: '💥',
  },
  {
    gas: 'O₂',
    name: 'Oxi',
    color: '#e0f2fe',
    smell: 'Không màu, không mùi',
    test: 'Que đốm còn tàn đỏ bùng cháy rực sáng trở lại',
    mechanism: 'Oxi duy trì và tăng cường mãnh liệt sự cháy',
    equation: 'C + O₂ → CO₂ (và các phản ứng cháy khác)',
    produce: 'Nhiệt phân thuốc tím: 2KMnO₄ → K₂MnO₄ + MnO₂ + O₂↑',
    safety: 'Tránh xa các vật liệu dễ cháy khi nồng độ oxi cao',
    icon: '🔥',
  },
  {
    gas: 'CO₂',
    name: 'Cacbon Đioxit',
    color: '#dbeafe',
    smell: 'Không màu, không mùi, nặng hơn không khí',
    test: 'Dập tắt que đốm đang cháy. Sục vào Ca(OH)₂ vẩn đục',
    mechanism: 'Khí không duy trì sự cháy; phản ứng tạo canxi cacbonat',
    equation: 'CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O',
    produce: 'Đá vôi + Axit: CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑',
    safety: 'Gây ngạt nếu nồng độ cao trong không gian hẹp',
    icon: '🌫️',
  },
  {
    gas: 'Cl₂',
    name: 'Clo',
    color: '#bbf7d0',
    smell: 'Vàng lục nhạt, mùi hắc xốc cực kỳ khó chịu',
    test: 'Làm mất màu giấy quỳ ẩm hoặc xanh hóa hồ tinh bột-KI',
    mechanism: 'Tính oxy hóa mạnh đẩy Iod ra khỏi muối',
    equation: 'Cl₂ + 2KI → 2KCl + I₂',
    produce: 'Oxy hóa HCl: MnO₂ + 4HCl → MnCl₂ + Cl₂↑ + 2H₂O',
    safety: 'CỰC ĐỘC! Phá hủy niêm mạc hô hấp. Chỉ dùng trong tủ hút',
    icon: '☠️',
  },
  {
    gas: 'NH₃',
    name: 'Amoniac',
    color: '#d1fae5',
    smell: 'Không màu, mùi khai xốc đặc trưng',
    test: 'Giấy quỳ đỏ ẩm hóa xanh; khói trắng với axit HCl',
    mechanism: 'Tính bazơ yếu làm đổi màu chỉ thị',
    equation: 'NH₃ + HCl → NH₄Cl (khói trắng)',
    produce: 'Muối amôni + Kiềm đun nóng',
    safety: 'Gây kích ứng mạnh, dùng tủ hút',
    icon: '🟢',
  },
  {
    gas: 'SO₂',
    name: 'Lưu huỳnh Đioxit',
    color: '#fef9c3',
    smell: 'Mùi hắc khét diêm sinh nồng nặc',
    test: 'Làm mất màu dung dịch Brôm hoặc thuốc tím',
    mechanism: 'Tính khử mạnh khử halogen hoặc mangan',
    equation: 'SO₂ + Br₂ + 2H₂O → H₂SO₄ + 2HBr',
    produce: 'Na₂SO₃ + Axit loãng',
    safety: 'Độc, gây mưa axit và kích ứng hô hấp',
    icon: '🌫️',
  },
];

// ——— QUY TẮC ĐỘ TAN ———
const SOLUBILITY_RULES = {
  soluble: [
    { anion: 'NO₃⁻ (Nitrat)', rule: 'Tất cả đều tan', exceptions: 'Không có ngoại lệ' },
    { anion: 'CH₃COO⁻ (Axetat)', rule: 'Tất cả đều tan', exceptions: 'Không có ngoại lệ' },
    { anion: 'Cl⁻, Br⁻, I⁻ (Halogenua)', rule: 'Đa số tan', exceptions: 'Không tan: Ag⁺, Pb²⁺, Hg₂²⁺' },
    { anion: 'SO₄²⁻ (Sunfat)', rule: 'Đa số tan', exceptions: 'Không tan: Ba²⁺, Pb²⁺; Ít tan: Ca²⁺, Ag⁺' },
    { anion: 'Kim loại kiềm & NH₄⁺', rule: 'Tất cả đều tan', exceptions: 'Không có ngoại lệ' },
  ],
  insoluble: [
    { anion: 'S²⁻ (Sunfua)', rule: 'Đa số không tan', exceptions: 'Tan: Kiềm, Kiềm thổ, NH₄⁺' },
    { anion: 'CO₃²⁻, PO₄³⁻', rule: 'Đa số không tan', exceptions: 'Tan: Kiềm, NH₄⁺' },
    { anion: 'OH⁻ (Hiđrôxit)', rule: 'Đa số không tan', exceptions: 'Tan: Kiềm; Ít tan: Ca²⁺, Ba²⁺' },
  ],
};

// ——— HỢP CHẤT LƯỠNG TÍNH ———
const AMPHOTERIC_COMPOUNDS = [
  {
    formula: 'Al(OH)₃', name: 'Nhôm hiđrôxit',
    withAcid: 'Al(OH)₃ + 3HCl → AlCl₃ + 3H₂O',
    withBase: 'Al(OH)₃ + NaOH → NaAlO₂ + 2H₂O',
    note: 'Tan trong dư kiềm tạo aluminat không màu.',
  },
  {
    formula: 'Zn(OH)₂', name: 'Kẽm hiđrôxit',
    withAcid: 'Zn(OH)₂ + 2HCl → ZnCl₂ + 2H₂O',
    withBase: 'Zn(OH)₂ + 2NaOH → Na₂ZnO₂ + 2H₂O',
    note: 'Dễ tan trong dung dịch amoniac dư do tạo phức.',
  },
  {
    formula: 'Cr(OH)₃', name: 'Crôm(III) hiđrôxit',
    withAcid: 'Cr(OH)₃ + 3HCl → CrCl₃ + 3H₂O',
    withBase: 'Cr(OH)₃ + NaOH → NaCrO₂ + 2H₂O',
    note: 'Kết tủa màu xanh xám, tan trong kiềm dư tạo dung dịch xanh lục.',
  },
  {
    formula: 'Pb(OH)₂', name: 'Chì(II) hiđrôxit',
    withAcid: 'Pb(OH)₂ + 2HNO₃ → Pb(NO₃)₂ + 2H₂O',
    withBase: 'Pb(OH)₂ + 2NaOH → Na₂PbO₂ + 2H₂O',
    note: 'Chất rắn màu trắng, ít tan trong nước.',
  },
  {
    formula: 'Al₂O₃', name: 'Nhôm oxit (Alumina)',
    withAcid: 'Al₂O₃ + 6HCl → 2AlCl₃ + 3H₂O',
    withBase: 'Al₂O₃ + 2NaOH → 2NaAlO₂ + H₂O',
    note: 'Thành phần chính của quặng bôxit, nhiệt độ nóng chảy rất cao.',
  },
  {
    formula: 'ZnO', name: 'Kẽm oxit',
    withAcid: 'ZnO + 2HCl → ZnCl₂ + H₂O',
    withBase: 'ZnO + 2NaOH → Na₂ZnO₂ + H₂O',
    note: 'Dùng trong y tế và mỹ phẩm (kem chống nắng).',
  },
  {
    formula: 'NaHCO₃', name: 'Natri hiđrocacbonat',
    withAcid: 'NaHCO₃ + HCl → NaCl + H₂O + CO₂↑',
    withBase: 'NaHCO₃ + NaOH → Na₂CO₃ + H₂O',
    note: 'Muối axit nhưng có tính lưỡng tính yếu, dùng làm bột nở.',
  },
];

// ——— PHẢN ỨNG HỮU CƠ TIÊU BIỂU ———
const ORGANIC_REACTIONS = [
  {
    category: 'Ankan — Thế Clo',
    title: 'Clo hóa Metan',
    application: 'Sản xuất dung môi công nghiệp và chất tẩy rửa.',
    conditions: 'Ánh sáng khuếch tán (askt)',
    steps: [
      { 
        label: 'CH4 + Cl2', 
        product: 'CH3Cl + HCl', 
        name: 'Metyl clorua',
        mechanism: 'SR (Thế gốc tự do)',
        yield: '85%',
        temp: '25°C'
      },
      { 
        label: 'CH3Cl + Cl2', 
        product: 'CH2Cl2 + HCl', 
        name: 'Metylen clorua',
        mechanism: 'SR (Thế gốc tự do)',
        yield: '12%',
        temp: '25°C'
      }
    ],
    note: 'Tạo hỗn hợp sản phẩm tùy theo tỉ lệ Cl2.',
  },
  {
    category: 'Anken — Cộng Nước',
    title: 'Hiđrat hóa Etilen',
    application: 'Sản xuất Etanol cho công nghiệp dược phẩm và nhiên liệu sinh học.',
    conditions: 'Axit H2SO4 loãng, t°',
    steps: [
      { 
        label: 'CH2=CH2 + H2O', 
        product: 'C2H5OH', 
        name: 'Rượu Etylic (Etanol)',
        mechanism: 'AE (Cộng Electrophin)',
        yield: '92%',
        temp: '300°C'
      },
    ],
    note: 'Sản xuất theo quy trình liên tục trong công nghiệp.',
  },
  {
    category: 'Ankin — Trime hóa',
    title: 'Trime hóa Axetilen',
    application: 'Sản xuất Benzen — nguyên liệu nền tảng cho công nghiệp hóa dầu.',
    conditions: 'Bột C, 600°C',
    steps: [
      { 
        label: '3C2H2', 
        product: 'C6H6', 
        name: 'Benzen',
        mechanism: 'Trime hóa (Trimerization)',
        yield: '65%',
        temp: '600°C'
      },
    ],
    note: 'Phản ứng vòng hóa quan trọng bậc nhất trong hóa hữu cơ sơ cấp.',
  },
];

// ——— NHIỆT PHÂN (THERMAL DECOMPOSITION) ———
const THERMAL_DECOMP_LIST = [
  {
    compound: 'Kali Clorat (KClO3)',
    reactions: [
      {
        temp: '~500°C (có xúc tác MnO2)',
        equation: '2KClO3 → 2KCl + 3O2↑',
        type: 'Điều chế Oxi trong phòng thí nghiệm',
        note: 'Giải phóng khí O2 mạnh mẽ, duy trì sự cháy.',
      },
    ],
    hazards: [
      'Nguy cơ nổ cực cao nếu lẫn tạp chất hữu cơ, lưu huỳnh hoặc photpho.',
      'Dụng cụ phải sạch tuyệt đối trước khi tiến hành.',
    ],
  },
  {
    compound: 'Kali Pemanganat (KMnO4)',
    reactions: [
      {
        temp: '> 240°C',
        equation: '2KMnO4 → K2MnO4 + MnO2 + O2↑',
        type: 'Phân hủy giải phóng Oxi',
        note: 'Chất rắn màu tím chuyển sang đen xám.',
      },
    ],
    hazards: [
      'KMnO4 là chất oxy hóa mạnh, tránh tiếp xúc với da và quần áo.',
      'Nên đặt một miếng bông ở đầu ống nghiệm để chặn bụi thuốc tím.',
    ],
  },
  {
    compound: 'Natri Hidrocacbonat (NaHCO3)',
    reactions: [
      {
        temp: '> 100°C',
        equation: '2NaHCO3 → Na2CO3 + H2O + CO2↑',
        type: 'Nhiệt phân muối kiềm',
        note: 'Tạo hơi nước và khí làm đục nước vôi trong.',
      },
    ],
    hazards: [
      'Muối Na2CO3 nóng có tính ăn mòn nhẹ.',
      'Cần lắp ống nghiệm hơi nghiêng để tránh nước chảy ngược lại đáy gây vỡ ống.',
    ],
  },
  {
    compound: 'Canxi Cacbonat (CaCO3)',
    reactions: [
      {
        temp: '~900 - 1000°C',
        equation: 'CaCO3 ⇌ CaO + CO2↑',
        type: 'Nhiệt phân đá vôi (Sản xuất vôi sống)',
        note: 'Phản ứng thu nhiệt mạnh, cần cung cấp nhiệt liên tục.',
      },
    ],
    hazards: [
      'Nhiệt độ cực cao, nguy cơ bỏng nhiệt nặng.',
      'CaO (vôi sống) phản ứng rất mạnh với nước tỏa nhiệt lớn.',
    ],
  },
  {
    compound: 'Đồng (II) Hidroxit (Cu(OH)2)',
    reactions: [
      {
        temp: 'Nhiệt độ thấp',
        equation: 'Cu(OH)2 → CuO + H2O',
        type: 'Phân hủy bazơ không tan',
        note: 'Kết tủa xanh lơ chuyển dần sang bột đen.',
      },
    ],
    hazards: [
      'CuO là oxit kim loại nặng, cần xử lý chất thải đúng quy trình.',
    ],
  },
];

// ——— DANH PHÁP HỢP CHẤT (IUPAC & COMMON NAMES) ———
const NONIONIC_NOMENCLATURE = [
  { formula: 'CO₂', name: 'Cacbon Đioxit (Khí cacbonic)' },
  { formula: 'SO₂', name: 'Lưu huỳnh Đioxit' },
  { formula: 'NH₃', name: 'Amoniac (Nitơ Trihiđrua)' },
  { formula: 'CH₄', name: 'Metan' },
  { formula: 'CCl₄', name: 'Cacbon Tetraclorua' },
  { formula: 'P₂O₅', name: 'Điphotpho Pentoxit' },
  { formula: 'NO₂', name: 'Nitơ Đioxit' },
  { formula: 'HCl', name: 'Hiđro Clorua' },
  { formula: 'H₂S', name: 'Hiđro Sunfua' },
  // ——— TÊN THÔNG DỤNG ———
  { formula: 'NaHCO₃', name: 'Baking Soda (Thuốc muối)' },
  { formula: 'Na₂CO₃', name: 'Soda Ash (Sô-đa)' },
  { formula: 'Ca(OH)₂', name: 'Vôi tôi (Nước vôi trong)' },
  { formula: 'CaO', name: 'Vôi sống' },
  { formula: 'CaSO₄.2H₂O', name: 'Thạch cao sống' },
  { formula: 'C₂H₅OH', name: 'Cồn (Ethanol/Rượu etylic)' },
  { formula: 'CH₃COOH', name: 'Giấm ăn (Axit axetic 5%)' },
  { formula: 'C₆H₈O₆', name: 'Vitamin C (Axit ascorbic)' },
  { formula: 'C₉H₈O₄', name: 'Aspirin' },
  { formula: 'C₆H₁₂O₆', name: 'Đường Glucozơ' },
  { formula: 'NaCl', name: 'Muối ăn' },
];
// ——— AN TOÀN HÓA HỌC (GHS & PPE) ———
const SAFETY_SIGNS = [
  { icon: '☣️', title: 'Nguy hiểm Sinh học', desc: 'Chứa vi sinh vật, virus hoặc vật liệu lây nhiễm.', level: 'Cao' },
  { icon: '☢️', title: 'Nguy hiểm Phóng xạ', desc: 'Phát xạ tia alpha, beta hoặc gamma ion hóa.', level: 'Cực Cao' },
  { icon: '🔥', title: 'Chất Dễ cháy', desc: 'Có thể tự bốc cháy hoặc cháy mạnh khi gặp lửa.', level: 'Trung bình' },
  { icon: '🧪', title: 'Chất Ăn mòn', desc: 'Phá hủy kim loại và mô sống (da, mắt) khi tiếp xúc.', level: 'Cao' },
  { icon: '💀', title: 'Độc tính Cấp tính', desc: 'Gây chết người hoặc tổn thương nghiêm trọng nếu hít/nuốt.', level: 'Cực Cao' },
  { icon: 'goggles', title: 'Kính Bảo hộ', desc: 'Bảo vệ mắt khỏi hóa chất văng bắn và hơi độc.', level: 'Bắt buộc' },
  { icon: 'gloves', title: 'Găng tay chịu hóa chất', desc: 'Bảo vệ da tay khi tiếp xúc với axit/kiềm mạnh.', level: 'Bắt buộc' },
  { icon: 'hood', title: 'Tủ hút (Fume Hood)', desc: 'Tiến hành các phản ứng sinh khí độc hoặc bay hơi mạnh.', level: 'Khuyên dùng' },
];

// ——— CHỈ THỊ PH (GRADIENTS) ———
const PH_INDICATORS = [
  {
    name: 'Giấy Quỳ Tím (Litmus)',
    range: '5.0 — 8.0',
    gradient: 'linear-gradient(90deg, #ef4444 0%, #a855f7 50%, #3b82f6 100%)',
    acid: 'Đỏ (Acid)',
    neutral: 'Tím (Neutral)',
    base: 'Xanh (Base)',
  },
  {
    name: 'Phenolphthalein',
    range: '8.2 — 10.0',
    gradient: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.4) 70%, #f472b6 100%)',
    acid: 'Không màu (< 8.2)',
    neutral: 'Không màu',
    base: 'Hồng/Tím (> 10.0)',
  },
  {
    name: 'Methyl Da Cam',
    range: '3.1 — 4.4',
    gradient: 'linear-gradient(90deg, #dc2626 0%, #f97316 50%, #facc15 100%)',
    acid: 'Đỏ',
    neutral: 'Da cam',
    base: 'Vàng',
  }
];

// ——— DỤNG CỤ THÍ NGHIỆM ———
const LAB_EQUIPMENT = [
  { name: 'Beaker (Cốc có mỏ)', icon: 'beaker', use: 'Đựng, pha chế và đun nóng dung dịch chất lỏng.' },
  { name: 'Erlenmeyer (Bình tam giác)', icon: 'flask', use: 'Lắc trộn dung dịch, dùng trong chuẩn độ thể tích.' },
  { name: 'Buret (Ống chuẩn độ)', icon: 'buret', use: 'Xả chính xác thể tích dung dịch thuốc thử từng giọt một.' },
  { name: 'Pipet Bầu', icon: 'pipet', use: 'Lấy một thể tích chất lỏng cố định với độ chính xác cực cao.' },
  { name: 'Test Tube (Ống nghiệm)', icon: 'test_tube', use: 'Thực hiện các phản ứng quy mô nhỏ, quan sát hiện tượng.' },
  { name: 'Graduate Cylinder (Ống đong)', icon: 'cylinder', use: 'Đo thể tích chất lỏng với độ chính xác trung bình.' },
  { name: 'Bunsen Burner (Đèn cồn)', icon: 'burner', use: 'Cung cấp nguồn nhiệt cho các phản ứng cần đun nóng.' },
  { name: 'Mortar & Pestle (Cối chày)', icon: 'mortar', use: 'Nghiền nhỏ các chất rắn thành dạng bột mịn.' },
  { name: 'Condenser (Ống ngưng)', icon: 'condenser', use: 'Làm lạnh hơi nước chuyển thành lỏng trong quá trình chưng cất.' },
];

// ——— HỒ SƠ AXIT ĐẶC (CONC. ACIDS) ———
const CONC_ACID_PROFILES = [
  {
    acid: 'H₂SO₄ Đặc (98%)',
    features: ['Tính oxy hóa cực mạnh', 'Tính háo nước (tỏa nhiệt lớn)', 'Làm than hóa hợp chất hữu cơ'],
    reactions: [
      { eq: 'Cu + 2H₂SO₄(đ) → CuSO₄ + SO₂↑ + 2H₂O', note: 'SO₂ mùi hắc, độc.' },
      { eq: 'C₁₂H₂₂O₁₁ → 12C + 11H₂O', note: 'Than hóa đường Glucozơ — tỏa nhiệt mạnh.' }
    ]
  },
  {
    acid: 'HNO₃ Đặc (68%)',
    features: ['Oxy hóa hầu hết kim loại (trừ Au, Pt)', 'Tạo khí NO₂ màu nâu đỏ', 'Thụ động hóa Al, Fe (lạnh)'],
    reactions: [
      { eq: 'Cu + 4HNO₃(đ) → Cu(NO₃)₂ + 2NO₂↑ + 2H₂O', note: 'Khí nâu đỏ xuất hiện ngay.' },
      { eq: 'Fe + HNO₃(đ, nguội) → Bị thụ động', note: 'Tạo lớp màng oxit bền vững.' }
    ]
  },
  {
    acid: 'HF (Axit Flohiđric)',
    features: ['Ăn mòn thủy tinh mạnh mẽ', 'Cực độc, thấm qua da hủy hoại xương', 'Axit yếu về điện ly nhưng cực mạnh về hoạt tính'],
    reactions: [
      { eq: 'SiO₂ + 4HF → SiF₄↑ + 2H₂O', note: 'Phản ứng dùng để khắc chữ lên thủy tinh.' },
      { eq: 'CaF₂ + H₂SO₄ → CaSO₄ + 2HF', note: 'Phương pháp điều chế HF trong công nghiệp.' }
    ]
  }
];
// ——— DÃY HOẠT ĐỘNG HÓA HỌC (METAL REACTIVITY SERIES) ———
const METAL_REACTIVITY = [
  { symbol: 'K', name: 'Kali', note: 'Phản ứng mãnh liệt với nước lạnh' },
  { symbol: 'Na', name: 'Natri', note: 'Phản ứng mạnh với nước lạnh' },
  { symbol: 'Ca', name: 'Canxi', note: 'Phản ứng với nước ở nhiệt độ thường' },
  { symbol: 'Mg', name: 'Magie', note: 'Phản ứng chậm với nước lạnh, nhanh với nước nóng' },
  { symbol: 'Al', name: 'Nhôm', note: 'Có lớp oxit bảo vệ, phản ứng với axit mạnh' },
  { symbol: 'Zn', name: 'Kẽm', note: 'Phản ứng với axit giải phóng H2' },
  { symbol: 'Fe', name: 'Sắt', note: 'Phản ứng với axit loãng và hơi nước nóng' },
  { symbol: 'Ni', name: 'Niken', note: 'Phản ứng chậm với axit' },
  { symbol: 'Sn', name: 'Thiếc', note: 'Phản ứng với axit khi đun nóng' },
  { symbol: 'Pb', name: 'Chì', note: 'Phản ứng yếu với axit loãng' },
  { symbol: 'H', name: '(Hidro)', note: 'Mốc so sánh hoạt động hóa học', isDivider: true },
  { symbol: 'Cu', name: 'Đồng', note: 'Không phản ứng với axit loãng (HCl, H2SO4 loãng)' },
  { symbol: 'Hg', name: 'Thủy ngân', note: 'Kim loại lỏng, hoạt động yếu' },
  { symbol: 'Ag', name: 'Bạc', note: 'Kim loại quý, chỉ tan trong axit oxy hóa mạnh' },
  { symbol: 'Pt', name: 'Bạch kim', note: 'Kim loại rất trơ, chỉ tan trong nước cường toan' },
  { symbol: 'Au', name: 'Vàng', note: 'Kim loại trơ nhất, không bị oxy hóa trong không khí' },
];
