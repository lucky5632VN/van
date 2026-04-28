/* ============================================================
   chemicals_conc_reactions.js
   Phản ứng phân biệt NỒNG ĐỘ ĐẶC vs LOÃNG — thêm vào REACTIONS
   Load sau data.js và chemicals_extended.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof REACTIONS === 'undefined') return;

  const CONC_DILUTE_REACTIONS = {

    // ——— H₂SO₄ đặc (98%) vs Loãng (10%) ———

    // H₂SO₄ đặc + Cu → CuSO₄ + SO₂ ĐỘC (chỉ đặc mới làm được)
    'h2so4+cu': {
      reactants: ['h2so4', 'cu'], products: ['CuSO₄', 'SO₂↑', 'H₂O'],
      equation: 'Cu + 2H₂SO₄(đặc) →[đun] CuSO₄ + SO₂↑ + 2H₂O',
      type: 'metal-acid', effect: 'toxic-gas-brown',
      synthesis: { name: 'CuSO₄ (xanh lam) + Khí SO₂ Độc', icon: '☠️', category: 'H₂SO₄ đặc + Kim loại' },
      colorChange: { end: 'rgba(30,64,175,0.5)' },
      toxicGas: { formula: 'SO₂', color: '#78350f', smell: 'mùi hắc diêm sinh' },
      particles: [{ type: 'bubble', color: '#92400e', count: 25 }],
      description: 'H₂SO₄ ĐẶC (98%) mới oxy hóa được Cu! H₂SO₄ loãng KHÔNG phản ứng với Cu. SO₂ gây tổn thương phổi ngay lập tức.',
      observation: '🔵 Xanh lam CuSO₄. ☠️ Khí SO₂ mùi hắc — RẤT ĐỘC! Đây là lý do phải dùng H₂SO₄ đặc 98%.',
      hazardLevel: 3, hazardType: 'toxic', logType: 'danger',
      requiresSafety: ['goggles', 'gloves'],
    },

    // H₂SO₄ loãng + Cu → KHÔNG PHẢN ỨNG (bài học phân biệt đặc/loãng)
    'h2so4_dil+cu': {
      reactants: ['h2so4_dil', 'cu'], products: ['Không phản ứng'],
      equation: 'H₂SO₄(loãng) + Cu → ✗ Không xảy ra phản ứng!',
      type: 'no-reaction', effect: 'neutral',
      synthesis: { name: '🚫 Không phản ứng! H₂SO₄ loãng không oxy hóa Cu', icon: '🚫', category: 'Không phản ứng' },
      particles: [],
      description: 'H₂SO₄ loãng không oxy hóa Cu vì thế oxy hóa SO₄²⁻ trong môi trường loãng không đủ mạnh (E < E°(Cu²⁺/Cu)).',
      observation: '🚫 Đồng không tan trong H₂SO₄ loãng. Thử H₂SO₄ đặc 98% để thấy sự khác biệt!',
      hazardLevel: 0, logType: 'info',
    },

    // H₂SO₄ loãng + Fe → FeSO₄ + H₂ (Fe²⁺, không phải Fe³⁺)
    'h2so4_dil+fe': {
      reactants: ['h2so4_dil', 'fe'], products: ['FeSO₄', 'H₂↑'],
      equation: 'Fe + H₂SO₄(loãng) → FeSO₄ + H₂↑',
      type: 'metal-acid', effect: 'bubbles-fast',
      synthesis: { name: 'Sắt(II) Sunfat FeSO₄ + Khí H₂', icon: '⚗️', category: 'Kim loại + Acid Loãng' },
      colorChange: { end: 'rgba(134,239,172,0.3)' },
      particles: [{ type: 'bubble', color: '#fff', count: 40 }],
      description: 'H₂SO₄ loãng + Fe cho FeSO₄ (Fe²⁺ xanh lục nhạt). H₂SO₄ đặc + Fe khi đun sẽ cho Fe₂(SO₄)₃ (Fe³⁺) + SO₂.',
      observation: '🟢 Sắt tan, dung dịch màu lục nhạt FeSO₄. Bọt H₂ thoát ra.',
      hazardLevel: 1, logType: 'info',
    },

    // ——— HNO₃ loãng vs Đặc với Kim loại ———

    // HNO₃ loãng + Cu → NO không màu (khác HNO₃ đặc cho NO₂ nâu)
    'hno3_dil+cu': {
      reactants: ['hno3_dil', 'cu'], products: ['Cu(NO₃)₂', 'NO↑', 'H₂O'],
      equation: '3Cu + 8HNO₃(loãng) → 3Cu(NO₃)₂ + 2NO↑ + 4H₂O',
      type: 'metal-acid', effect: 'bubbles-fast',
      synthesis: { name: 'Cu(NO₃)₂ xanh lam + Khí NO (không màu → hóa nâu)', icon: '🔵', category: 'HNO₃ loãng + Cu' },
      colorChange: { end: 'rgba(29,78,216,0.5)' },
      toxicGas: { formula: 'NO', color: '#94a3b8', smell: 'không mùi → chuyển NO₂ nâu khi gặp O₂' },
      particles: [{ type: 'bubble', color: '#e0f2fe', count: 30 }],
      description: 'HNO₃ loãng → khí NO KHÔNG MÀU (thấy ngay biến thành nâu khi ra không khí = NO₂). HNO₃ đặc → NO₂ NÂU thẳng.',
      observation: '🔵 Cu²⁺ xanh lam. Bọt NO không màu thoát ra → NÂU ngay khi tiếp xúc không khí!',
      hazardLevel: 2, hazardType: 'toxic', logType: 'warning',
      requiresSafety: ['goggles'],
    },

    // HNO₃ loãng + Fe → Fe(NO₃)₂ (loãng) / Fe bị thụ động trong đặc
    'hno3_dil+fe': {
      reactants: ['hno3_dil', 'fe'], products: ['Fe(NO₃)₂', 'NH₄NO₃', 'H₂O'],
      equation: '4Fe + 10HNO₃(rất loãng) → 4Fe(NO₃)₂ + NH₄NO₃ + 3H₂O',
      type: 'metal-acid', effect: 'bubbles-light',
      synthesis: { name: 'Fe(NO₃)₂ (xanh lục nhạt) — Khác Fe(NO₃)₃', icon: '🟢', category: 'HNO₃ loãng + Fe' },
      colorChange: { end: 'rgba(134,239,172,0.35)' },
      particles: [{ type: 'bubble', color: '#e0f2fe', count: 20 }],
      description: 'HNO₃ RẤT LOÃNG + Fe → Fe²⁺ (xanh lục). HNO₃ LOÃNG + Fe → Fe³⁺ (vàng/cam). HNO₃ ĐẶC → Fe bị thụ động không tan!',
      observation: '🟢 Dung dịch xanh lục nhạt Fe²⁺. Fe tan chậm trong HNO₃ rất loãng.',
      hazardLevel: 1, logType: 'info',
    },

    // ——— NH₃ đặc ———

    // NH₃ đặc + HCl → khói trắng NH₄Cl ngoạn mục
    'nh3_conc+hcl': {
      reactants: ['nh3_conc', 'hcl'], products: ['NH₄Cl (khói trắng)'],
      equation: 'NH₃(k) + HCl(k) → NH₄Cl↑   [KHÓI TRẮNG DÀY ĐẶC]',
      type: 'acid-base-gas', effect: 'smoke-white',
      synthesis: { name: 'NH₄Cl — Thí Nghiệm Hai Bình Khói Trắng', icon: '☁️', category: 'Acid + Base Khí' },
      particles: [{ type: 'smoke', color: 'rgba(255,255,255,0.85)', count: 70 }],
      colorChange: { end: 'rgba(248,250,252,0.5)' },
      description: 'NH₃(k) + HCl(k) tác dụng ngay trên bề mặt lọ → tinh thể NH₄Cl siêu nhỏ lơ lửng = KHÓI TRẮNG. Thí nghiệm nhận biết acid/base đẹp nhất.',
      observation: '☁️ KHÓI TRẮNG DÀY ĐẶC bùng ra từ cổ bình ngay lập tức! Thí nghiệm "Hai Bình Khói" kinh điển!',
      hazardLevel: 2, hazardType: 'toxic', logType: 'warning',
      requiresSafety: ['goggles'],
    },

    // NH₃ đặc + CuSO₄ → phức [Cu(NH₃)₄]²⁺ XANH DỰC RỠ  
    'nh3_conc+cuso4': {
      reactants: ['nh3_conc', 'cuso4'], products: ['[Cu(NH₃)₄]²⁺', 'SO₄²⁻'],
      equation: 'Cu²⁺ + 4NH₃(đặc) → [Cu(NH₃)₄]²⁺   [xanh thẫm rực rỡ]',
      type: 'complex-formation', effect: 'color-change-deep-blue',
      synthesis: { name: 'Phức Tetramin Đồng(II) [Cu(NH₃)₄]²⁺ — Xanh Thẫm', icon: '🔷', category: 'Tạo Phức - Nhận biết Cu²⁺' },
      colorChange: { start: 'rgba(29,78,216,0.4)', end: 'rgba(29,78,216,0.9)' },
      particles: [{ type: 'bubble', color: '#1e3a8a', count: 20 }],
      description: 'NH₃ đặc tạo phức với Cu²⁺ → [Cu(NH₃)₄]²⁺ màu xanh thẫm CỰC ĐẸP. Phương pháp cực nhạy để nhận biết Cu²⁺ trong nước, thực phẩm.',
      observation: '🔷 Màu xanh lam nhạt chuyển thành XANH THẪM RỰC RỠ! Phức tetramin đồng đặc trưng!',
      hazardLevel: 1, logType: 'success',
    },

    // ——— NaOH đặc ———

    // NaOH đặc + Al → phá hủy nhôm (tính lưỡng tính)
    'naoh_conc+al': {
      reactants: ['naoh_conc', 'al'], products: ['NaAlO₂', 'H₂↑'],
      equation: '2Al + 2NaOH(đặc) + 2H₂O → 2NaAlO₂ + 3H₂↑',
      type: 'metal-base', effect: 'bubbles-intense',
      synthesis: { name: 'Natri Aluminat NaAlO₂ + Khí H₂', icon: '⚗️', category: 'Kim loại Lưỡng Tính + Base' },
      particles: [{ type: 'bubble', color: '#e0f2fe', count: 60 }],
      description: 'NaOH đặc phá lớp Al₂O₃ bảo vệ, rồi tác dụng Al tạo H₂. Đây là lý do bình nhôm không đựng được NaOH đặc. Al là kim loại lưỡng tính!',
      observation: '⬆️ Bọt H₂ dữ dội! Nhôm biến mất dần. Kim loại lưỡng tính — tan trong cả acid lẫn base!',
      hazardLevel: 2, hazardType: 'burn', logType: 'warning',
      requiresSafety: ['goggles', 'gloves'],
    },

    // KOH đặc + Al (tương tự NaOH)
    'koh_conc+al': {
      reactants: ['koh_conc', 'al'], products: ['KAlO₂', 'H₂↑'],
      equation: '2Al + 2KOH(đặc) + 2H₂O → 2KAlO₂ + 3H₂↑',
      type: 'metal-base', effect: 'bubbles-intense',
      synthesis: { name: 'Kali Aluminat KAlO₂ + Khí H₂', icon: '⚗️', category: 'Kim loại Lưỡng Tính + Base' },
      particles: [{ type: 'bubble', color: '#e0f2fe', count: 60 }],
      description: 'KOH đặc phản ứng với Al tương tự NaOH. Bọt H₂ bùng phát ngay khi tiếp xúc.',
      observation: '⬆️ Bọt H₂ dữ dội khi nhôm gặp KOH đặc. Al tan trong kiềm mạnh!',
      hazardLevel: 2, hazardType: 'burn', logType: 'warning',
      requiresSafety: ['goggles', 'gloves'],
    },

    // ——— Oleum ———

    // Oleum + H₂O → nổ bình (còn nguy hơn H₂SO₄ đặc + H₂O)
    'h2so4_oleum+h2o': {
      reactants: ['h2so4_oleum', 'h2o'], products: ['H₂SO₄ (đặc)'],
      equation: 'SO₃ + H₂O → H₂SO₄   [tỏa nhiệt CỰC ĐẠI → NỔ]',
      type: 'acid-dilution-error', effect: 'explosion-violent', shatter: true,
      synthesis: { name: '💥 OLEUM + NƯỚC = THẢM HỌA! TUYỆT ĐỐI KHÔNG LÀM!', icon: '💥', category: 'NGUY HIỂM TUYỆT ĐỐI' },
      particles: [{ type: 'bubble', color: '#fef3c7', count: 80 }, { type: 'spark', color: '#dc2626', count: 50 }],
      description: 'SO₃ + H₂O tỏa nhiệt khổng lồ — mạnh gấp nhiều lần H₂SO₄ 98%+H₂O. Bình vỡ tức khắc, khói H₂SO₄+SO₃ phun ra xung quanh.',
      observation: '💥 OLEUM NỔ BÌNH! Khói SO₃/H₂SO₄ phun ra — NGUY HIỂM CHẾT NGƯỜI tức thì!',
      hazardLevel: 3, hazardType: 'explosion', logType: 'danger',
      requiresSafety: ['goggles', 'gloves'],
    },

    // ——— Acid Axetic Băng ———

    // CH₃COOH băng + NaOH → Na Axetat (trung hòa)
    'ch3cooh_glacial+naoh': {
      reactants: ['ch3cooh_glacial', 'naoh'], products: ['CH₃COONa', 'H₂O'],
      equation: 'CH₃COOH(băng) + NaOH → CH₃COONa + H₂O',
      type: 'neutralization', effect: 'neutral',
      synthesis: { name: 'Natri Axetat CH₃COONa (muối giấm đậm đặc)', icon: '🫙', category: 'Trung hòa Acid Băng' },
      colorChange: { end: 'rgba(248,250,252,0.4)' },
      particles: [],
      description: 'Tương tự trung hòa CH₃COOH thường nhưng nồng độ cực cao → CH₃COONa đặc. Tỏa nhiệt đáng kể do nồng độ cao.',
      observation: '✅ Trung hòa hoàn toàn. CH₃COONa dung dịch kiềm yếu (muối xà phòng giấm).',
      hazardLevel: 0, logType: 'success',
    },

    // CH₃COOH băng + Na → phản ứng mãnh liệt
    'ch3cooh_glacial+na_metal': {
      reactants: ['ch3cooh_glacial', 'na_metal'], products: ['CH₃COONa', 'H₂↑'],
      equation: '2CH₃COOH(băng) + 2Na → 2CH₃COONa + H₂↑',
      type: 'metal-acid', effect: 'explosion-small',
      synthesis: { name: 'CH₃COONa (muối giấm) + H₂ bùng cháy', icon: '🫙', category: 'Acid Băng + Kim loại' },
      particles: [{ type: 'bubble', color: '#fde68a', count: 40 }, { type: 'spark', color: '#fbbf24', count: 15 }],
      description: 'CH₃COOH băng 100% + Na: phản ứng mãnh liệt hơn nhiều so với giấm 5%. H₂ bốc cháy lửa vàng ngay.',
      observation: '🔥 Na tan nhanh trong acid băng! H₂ bốc cháy ngọn lửa vàng cam!',
      hazardLevel: 2, hazardType: 'explosion', logType: 'warning',
      requiresSafety: ['goggles', 'gloves'],
    },

    // ——— HF đặc biệt ———

    // HF + NaOH → trung hòa (cách xử lý khi nhiễm HF)
    'hf+naoh': {
      reactants: ['hf', 'naoh'], products: ['NaF', 'H₂O'],
      equation: 'HF + NaOH → NaF + H₂O',
      type: 'neutralization', effect: 'neutral',
      synthesis: { name: 'Natri Florua NaF + H₂O — Trung hòa HF', icon: '⚗️', category: 'Xử lý Nhiễm Độc HF' },
      particles: [],
      description: 'Trung hòa HF bằng NaOH — bước sơ cứu đầu tiên khi bị nhiễm HF. Tốt nhất là dùng canxi gluconate để kết tủa F⁻ thành CaF₂ không độc.',
      observation: '⚗️ Phản ứng yên lặng. NaF ít độc hơn HF. Rửa ngay bằng Ca²⁺ nếu bị nhiễm HF nặng!',
      hazardLevel: 1, logType: 'info',
    },

    // NH₄NO₃ + NaOH → NH₃↑ (nhận biết ion NH₄⁺)
    'nh4no3+naoh': {
      reactants: ['nh4no3', 'naoh'], products: ['NaNO₃', 'NH₃↑', 'H₂O'],
      equation: 'NH₄NO₃ + NaOH →[đun] NaNO₃ + NH₃↑ + H₂O',
      type: 'salt-base', effect: 'toxic-gas-white',
      synthesis: { name: 'Khí NH₃ thoát ra — Nhận biết Ion NH₄⁺', icon: '☁️', category: 'Nhận biết NH₄⁺' },
      toxicGas: { formula: 'NH₃', color: '#a7f3d0', smell: 'mùi khai nồng' },
      particles: [{ type: 'bubble', color: '#d1fae5', count: 25 }],
      description: 'Muối amoni + kiềm mạnh → NH₃ bay ra khi đun. Nhận biết: giấy quỳ ẩm hóa xanh, mùi khai đặc trưng.',
      observation: '☁️ Khí NH₃ mùi khai thoát ra! Giấy quỳ ẩm hóa XANH — nhận biết ion NH₄⁺!',
      hazardLevel: 2, hazardType: 'toxic', logType: 'warning',
      requiresSafety: ['goggles'],
    },

    // ——— C₂H₂ Axetilen ———

    // C₂H₂ + AgNO₃/NH₃ → Ag₂C₂ kết tủa vàng (nhận biết ank-1-in)
    'c2h2+agno3': {
      reactants: ['c2h2', 'agno3'], products: ['Ag₂C₂↓ (vàng)', 'HNO₃'],
      equation: 'C₂H₂ + 2[Ag(NH₃)₂]OH → Ag₂C₂↓(vàng) + 2NH₃ + 2H₂O',
      type: 'alkyne-recognition', effect: 'precipitate-yellow',
      synthesis: { name: 'Bạc Axetilua Ag₂C₂ (kết tủa VÀNG) — Nhận biết C₂H₂', icon: '🟡', category: 'Nhận biết Ankin-1' },
      colorChange: { end: 'rgba(253,224,71,0.6)' },
      particles: [{ type: 'precipitate', color: '#fde047', count: 40 }],
      description: 'Phản ứng đặc trưng nhất của C₂H₂! Kết tủa VÀNG Ag₂C₂. Lưu ý: Ag₂C₂ khô rất nhạy nổ — KHÔNG ĐỂ KHÔ! C₂H₄, C₂H₆ không có phản ứng này.',
      observation: '🟡 Kết tủa VÀNG nhạt Ag₂C₂ xuất hiện ngay! Phản ứng nhận biết C₂H₂ kinh điển.',
      hazardLevel: 1, logType: 'success',
    },

    // C₂H₂ + HCl → CH₂=CHCl (vinyl clorua - monome PVC)
    'c2h2+hcl': {
      reactants: ['c2h2', 'hcl'], products: ['CH₂=CHCl (Vinyl Clorua)'],
      equation: 'C₂H₂ + HCl →[HgCl₂, 200°C] CH₂=CHCl',
      type: 'addition', effect: 'bubbles-light',
      synthesis: { name: 'Vinyl Clorua CH₂=CHCl — Monome PVC', icon: '🏭', category: 'Cộng HX vào Ankin' },
      colorChange: { end: 'rgba(248,250,252,0.4)' },
      particles: [{ type: 'bubble', color: '#e0f2fe', count: 20 }],
      description: 'C₂H₂ + HCl cộng theo Markovnikov. Vinyl clorua là monome sản xuất PVC (nhựa polyvinyl clorua) — loại nhựa phổ biến nhất thế giới.',
      observation: '⚗️ Phản ứng cộng. Sản phẩm CH₂=CHCl là tiền chất nhựa PVC quan trọng.',
      hazardLevel: 1, logType: 'info',
    },

    // C₂H₂ + H₂O → CH₃CHO (Acetaldehyde — phản ứng Kucherov)
    'c2h2+h2o': {
      reactants: ['c2h2', 'h2o'], products: ['CH₃CHO (Axetaldehyde)'],
      equation: 'C₂H₂ + H₂O →[H₂SO₄, HgSO₄, 80°C] CH₃CHO',
      type: 'hydration', effect: 'color-change-amber',
      synthesis: { name: 'Axetaldehyde CH₃CHO — Phản ứng Kucherov', icon: '🧪', category: 'Hiđrat hóa Ankin' },
      colorChange: { end: 'rgba(253,230,138,0.4)' },
      particles: [{ type: 'bubble', color: '#fef3c7', count: 15 }],
      description: 'Phản ứng Kucherov: C₂H₂ + H₂O (xúc tác HgSO₄, H₂SO₄) → CH₃CHO. Xúc tác thủy ngân RẤT ĐỘC. C₂H₂ là nguyên liệu quan trọng sản xuất Acetaldehyde công nghiệp.',
      observation: '🟡 Dung dịch nhẹ đục vàng — CH₃CHO hình thành. Sản phẩm có mùi táo đặc trưng.',
      hazardLevel: 2, hazardType: 'toxic', logType: 'warning',
      requiresSafety: ['goggles', 'gloves'],
    },

    // C₂H₂ + Br₂ → mất màu nâu cam (nhận biết liên kết bội)
    'c2h2+br2': {
      reactants: ['c2h2', 'br2_liquid'], products: ['CHBr₂-CHBr₂ (1,1,2,2-tetrabromoetan)'],
      equation: 'C₂H₂ + 2Br₂ → CHBr₂-CHBr₂ (MẤT MÀU)',
      type: 'addition-halogen', effect: 'color-fade',
      synthesis: { name: '1,1,2,2-Tetrabromoetan — Mất Màu Brom', icon: '🟤', category: 'Nhận biết Liên Kết Bội' },
      colorChange: { start: 'rgba(146,64,14,0.6)', end: 'rgba(248,250,252,0.3)' },
      particles: [{ type: 'bubble', color: '#92400e', count: 10 }],
      description: 'C₂H₂ có liên kết ba → cộng 2 mol Br₂ (mất màu nâu hoàn toàn). C₂H₄ cộng 1 mol Br₂. C₂H₆ KHÔNG làm mất màu Br₂.',
      observation: '🟤→⬜ Dung dịch brom màu nâu cam MẤT MÀU hoàn toàn! C₂H₂ có liên kết ≡ mạnh!',
      hazardLevel: 1, logType: 'success',
    },

    // C₂H₂ + O₂ → đốt cháy tỏa nhiệt cực lớn (hàn cắt)
    'c2h2+o2': {
      reactants: ['c2h2', 'o2_gas'], products: ['CO₂', 'H₂O'],
      equation: '2C₂H₂ + 5O₂ → 4CO₂ + 2H₂O  ΔH = -1300 kJ/mol  [3500°C]',
      type: 'combustion', effect: 'explosion-violent',
      synthesis: { name: 'Đốt Cháy Hoàn Toàn — Ngọn Lửa Axetylen 3500°C', icon: '🔥', category: 'Phản ứng Cháy — Hàn Cắt' },
      colorChange: { end: 'rgba(254,243,199,0.5)' },
      particles: [{ type: 'spark', color: '#fbbf24', count: 60 }, { type: 'smoke', color: 'rgba(30,30,30,0.5)', count: 20 }],
      description: 'C₂H₂ cháy với O₂ nguyên chất → ngọn lửa 3500°C (nóng nhất trong các khí đốt thông thường). Dùng trong hàn hơi, cắt thép. Hỗn hợp C₂H₂+O₂ trong bình → nổ cực mạnh.',
      observation: '🔥 NGỌN LỬA SÁNG TRẮNG CHÓI! Tỏa sáng + nhiệt CỰC LỚN 3500°C. Thép nóng chảy ngay!',
      hazardLevel: 3, hazardType: 'explosion', logType: 'danger',
      requiresSafety: ['goggles', 'gloves'],
    },

    // ——— C₂H₄ Etilen ———

    // C₂H₄ + Br₂ → mất màu (nhưng chỉ cộng 1 mol, khác C₂H₂)
    'c2h4+br2': {
      reactants: ['c2h4', 'br2_liquid'], products: ['CH₂Br-CH₂Br (1,2-Dibromoetan)'],
      equation: 'C₂H₄ + Br₂ → CH₂BrCH₂Br (MẤT MÀU)',
      type: 'addition-halogen', effect: 'color-fade',
      synthesis: { name: '1,2-Dibromoetan — Nhận biết C₂H₄', icon: '🟤', category: 'Nhận biết Liên Kết Đôi' },
      colorChange: { start: 'rgba(146,64,14,0.6)', end: 'rgba(248,250,252,0.3)' },
      particles: [],
      description: 'C₂H₄ + Br₂ → mất màu nhanh (cộng 1 mol Br₂, khác C₂H₂ cộng 2 mol). Test nhận biết anken: làm mất màu dung dịch brom.',
      observation: '🟤→⬜ Nâu cam mất màu nhanh! C₂H₄ (liên kết đôi) → cộng 1 mol Br₂.',
      hazardLevel: 1, logType: 'success',
    },

    // C₂H₄ + H₂O → C₂H₅OH (điều chế rượu etylic công nghiệp)
    'c2h4+h2o': {
      reactants: ['c2h4', 'h2o'], products: ['C₂H₅OH'],
      equation: 'C₂H₄ + H₂O →[H₂SO₄, 300°C, 70atm] C₂H₅OH',
      type: 'hydration', effect: 'neutral',
      synthesis: { name: 'Ethanol C₂H₅OH — Sản xuất Công nghiệp từ Etilen', icon: '🍺', category: 'Hiđrat hóa Anken' },
      colorChange: { end: 'rgba(248,250,252,0.4)' },
      particles: [],
      description: 'Phương pháp sản xuất ethanol tổng hợp (90% ethanol công nghiệp được làm bằng cách này). Điều kiện khắc nghiệt: nhiệt độ cao, áp suất cao, xúc tác H₂SO₄.',
      observation: '⚗️ C₂H₄ + H₂O → C₂H₅OH. Đây là cách sản xuất cồn công nghiệp (khác lên men sinh học).',
      hazardLevel: 1, logType: 'info',
    },
  };

  Object.assign(REACTIONS, CONC_DILUTE_REACTIONS);
  window.CONC_DILUTE_REACTIONS = CONC_DILUTE_REACTIONS;
  console.log(`✅ chemicals_conc_reactions.js: ${Object.keys(CONC_DILUTE_REACTIONS).length} phản ứng đặc/loãng + C₂H₂ đã nạp.`);
});

