/* ============================================================
   chemistry_engine.js — Động cơ tính toán Hoá học Kỹ thuật số
   Xử lý pH, Kết tủa, Màu sắc dựa trên Nhiệt động lực học & Cân bằng
   ============================================================ */

const ChemistryEngine = {

  /**
   * Module giám sát an toàn IDCL (Mars Genesis)
   */
  SafetyWatcher: {
    checkViolation: function(chemicalId, currentEnvironment) {
      // Tìm hóa chất trong DATABASE chuẩn hoặc FALLBACK
      const chem = (typeof CHEMICAL_DATABASE !== 'undefined' && CHEMICAL_DATABASE[chemicalId]) || 
                   (window.CHEMICALS || []).find(c => c.id === chemicalId);

      if (!chem || !chem.safety) return null; // Bỏ qua nếu không có dữ liệu an toàn IDCL

      const violations = [];

      // 1. Kiểm tra quạt thông gió (Fume Hood) cho chất bay hơi/độc
      if (chem.safety.is_volatile && !currentEnvironment.isFumeHoodOn) {
        violations.push({
          type: 'VENTILATION_ERROR',
          message: `CẢNH BÁO: Phát hiện hóa chất/khí bốc hơi cao (${chem.formula || chem.name}) thoát ra môi trường. Quạt hút chưa bật!`,
          requirement: 'fume-hood'
        });
      }

      // 2. Kiểm tra đồ bảo hộ (PPE)
      if (chem.safety.required_ppe) {
        chem.safety.required_ppe.forEach(item => {
          if (!currentEnvironment.equippedPPE.has(item)) {
            violations.push({
              type: 'PPE_MISSING',
              message: `LỖI BẢO HỘ: Thiếu thiết bị ${item} khi tiếp xúc với ${chem.name}.`,
              requirement: item
            });
          }
        });
      }

      return violations.length > 0 ? violations : null;
    }
  },

  /**
   * Tính toán pH của hỗn hợp
   * Sử dụng nồng độ và pKa/pKb
   * @param {Array} chemicals - Danh sách các hợp chất trong cốc
   * @returns {number} ph - Giá trị pH tính được
   */
  calculatePH(chemicals) {
    if (!chemicals || chemicals.length === 0) return 7.0;

    // Lọc ra các acid và base mạnh/yếu
    const acids = chemicals.filter(c => c.type === 'acid');
    const bases = chemicals.filter(c => c.type === 'base' || (c.type === 'oxide' && c.subtype === 'basic'));

    // 1. CHẤT MẠNH (Strong Acid/Base)
    const strongAcid = acids.find(c => c.physical?.pKa < 0);
    const strongBase = bases.find(c => (c.physical?.pKa > 14 || (c.ph && c.ph > 12)));

    // Nếu có cả acid mạnh và base mạnh -> Trung hòa (giả định mol bằng nhau nếu nồng độ bằng nhau)
    if (strongAcid && strongBase) return 7.0;

    if (strongAcid) {
      const conc = parseFloat(strongAcid.molarity || 0.1);
      // pH = -log[H+]
      return Math.max(0, -Math.log10(conc));
    }
    if (strongBase) {
      const conc = parseFloat(strongBase.molarity || 0.1);
      // pOH = -log[OH-], pH = 14 - pOH
      return Math.min(14, 14 + Math.log10(conc));
    }

    // 2. CHẤT YẾU (Weak Acid/Base)
    const weakAcid = acids[0];
    if (weakAcid) {
      const pKa = weakAcid.physical?.pKa || 4.76;
      const conc = parseFloat(weakAcid.molarity || 0.1);
      // pH = 1/2(pKa - logC)
      return 0.5 * (pKa - Math.log10(conc));
    }

    const weakBase = bases[0];
    if (weakBase) {
      if (weakBase.ph && !weakBase.molarity) return weakBase.ph;
      const pKb = weakBase.physical?.pKb || 4.75;
      const conc = parseFloat(weakBase.molarity || 0.1);
      // pOH = 1/2(pKb - logC), pH = 14 - pOH
      const pOH = 0.5 * (pKb - Math.log10(conc));
      return 14 - pOH;
    }

    return 7.0;
  },

  /**
   * Tính toán biến thiên Enthalpy (ΔH)
   * @param {Object} reaction
   * @returns {string} description
   */
  getThermalEffect(reaction) {
    if (!reaction.deltaH) return reaction.effect === 'heat' ? 'Tỏa nhiệt' : 'Nhiệt dung không đáng kể';
    const dh = reaction.deltaH;
    if (dh < 0) return `Tỏa nhiệt mạnh (ΔH = ${dh} kJ/mol)`;
    if (dh > 0) return `Thu nhiệt (ΔH = +${dh} kJ/mol)`;
    return 'Cân bằng nhiệt';
  },

  /**
   * Tra cứu khối lượng mol (Molar Mass)
   * @param {string} chemId 
   * @returns {number}
   */
  getMolarMass(chemId) {
    if (!chemId) return 0;
    const id = chemId.toLowerCase();
    
    // Tìm trong database chính và database mở rộng
    const chem = (window.CHEMICALS || []).find(c => c.id === id) || 
                 (window.ALL_ITEMS || []).find(c => c.id === id);
                 
    if (chem && chem.molarMass) return parseFloat(chem.molarMass);
    
    // Fallback cho một số chất phổ biến nếu data bị thiếu
    const commonMasses = {
      'h2o': 18.015,
      'hcl': 36.46,
      'naoh': 39.997,
      'h2so4': 98.079,
      'nacl': 58.44,
      'nano3': 84.99,
      'agno3': 169.87,
      'ba(oh)2': 171.34,
      'feso4': 151.91,
      'fecl3': 162.2,
      'cuso4': 159.61,
      'kmno4': 158.03
    };
    
    return commonMasses[id] || 0;
  },

  /**
   * Kiểm tra kết tủa dựa trên Ksp
   * @param {Array} chemicals - Các chất hiện có
   * @returns {Object|null} - Thông tin kết tủa nếu có
   */
  checkPrecipitation(chemicals) {
    if (chemicals.length < 2) return null;

    // Tìm tất cả các cặp Cation - Anion có thể tạo tủa
    for (let i = 0; i < chemicals.length; i++) {
      for (let j = 0; j < chemicals.length; j++) {
        const c = chemicals[i].cation;
        const a = chemicals[j].anion;
        if (!c || !a) continue;

        // Tra cứu Ksp từ database mới
        const pKsp = chemicals[j].physical?.pKsp?.[c];
        if (pKsp !== undefined && pKsp !== null) {
          // --- NÂNG CAO: TÍNH LƯỠNG TÍNH (AMPHOTERISM) ---
          // Nếu pH > 12.5 (dư kiềm mạnh), các kết tủa Al(OH)3, Zn(OH)2, Cr(OH)3 sẽ tan
          const ph = this.calculatePH(chemicals);
          if (ph > 12.5) {
            if (a === 'OH' && (c === 'Al' || c === 'Zn' || c === 'Cr3' || c === 'Pb2')) {
              continue; // Không tạo tủa (tủa tan)
            }
          }

          // Giả định Q > Ksp trong phòng thí nghiệm (nồng độ đủ lớn)
          return window.PHENOMENA_DB ? window.PHENOMENA_DB.getPrecipitateColor(c, a) : null;
        }
      }
    }
    return null;
  },

  /**
   * Tính toán màu sắc động của dung dịch
   * @param {Array} chemicals - Các chất
   * @param {number} ph - pH hiện tại
   * @returns {string} - Mã màu hex/rgba
   */
  calculateSolutionColor(chemicals, ph) {
    // 1. Kiểm tra chất chỉ thị (Indicator)
    const indicator = chemicals.find(c => c.type === 'indicator');
    if (indicator) {
      return this.getIndicatorColor(indicator.id, ph);
    }

    // 2. Kiểm tra Cân bằng Cromat / Đicromat (pH dependent)
    const hasChrome = chemicals.find(c => c.anion === 'CrO4' || c.anion === 'Cr2O7');
    if (hasChrome) {
      if (ph < 6.5) return 'rgba(234, 88, 12, 0.65)'; // Cam (Dichromate)
      if (ph > 7.5) return 'rgba(250, 204, 21, 0.6)';  // Vàng (Chromate)
      // Chuyển sắc ở vùng đệm
      return 'rgba(242, 146, 17, 0.62)'; 
    }

    // 3. Kiểm tra ion kim loại chuyển tiếp (Transition Metals)
    for (let i = chemicals.length - 1; i >= 0; i--) {
      const chem = chemicals[i];
      const ionColor = window.PHENOMENA_DB?.getLiquidColorForChem(chem.id) || chem.display?.liquidColor;
      
      if (ionColor) {
        // --- NÂNG CAO: PHỨC CHẤT & REDOX DỰA TRÊN pH ---

        // A. Phức Đồng Amoniac [Cu(NH₃)₄]²⁺ (Xanh thẫm)
        if (chem.cation === 'Cu2' && ph > 8 && chemicals.find(c => c.id === 'nh3')) {
          return 'rgba(30, 58, 138, 0.9)'; 
        }

        // B. Phức Bạc Amoniac [Ag(NH₃)₂]⁺ (Trong suốt/Bạc khi tráng gương)
        if (chem.cation === 'Ag' && chemicals.find(c => c.id === 'nh3')) {
          if (chemicals.find(c => c.id === 'glucose')) return 'rgba(226, 232, 240, 0.9)'; // Màu bạc
          return 'rgba(248, 250, 252, 0.2)'; // Tan thành trong suốt
        }

        // C. Trạng thái KMnO₄ (MnO₄⁻) dựa trên môi trường pH
        if (chem.id === 'kmno4') {
          if (ph < 4) return 'rgba(224, 242, 254, 0.1)';   // Mn²⁺ (Acid: Không màu)
          if (ph >= 4 && ph <= 8.5) return 'rgba(120, 113, 108, 0.6)'; // MnO₂ (Trung tính: Nâu đen)
          if (ph > 8.5) return 'rgba(22, 163, 74, 0.6)';   // MnO₄²⁻ (Kiềm: Xanh lục)
        }

        // D. Phức Sắt(III) Thioxyanat Fe(SCN)₃ (Đỏ máu)
        if (chem.cation === 'Fe3' && chemicals.find(c => c.anion === 'SCN')) {
          return 'rgba(153, 27, 27, 0.9)'; 
        }

        // E. Ion Crômite CrO₂⁻ (Xanh lục - hình thành khi Cr(OH)₃ tan trong kiềm dư)
        if (chem.cation === 'Cr3' && ph > 12.5) {
          return 'rgba(21, 128, 61, 0.7)';
        }

        if (ionColor !== 'rgba(241, 245, 249, 0.35)') return ionColor;
      }
    }

    // 4. Kiểm tra Starch + Iodine (Blue-Black)
    if (chemicals.find(c => c.id === 'starch') && chemicals.find(c => c.id === 'iodine')) {
      return 'rgba(30, 58, 138, 0.95)';
    }

    return 'rgba(224, 242, 254, 0.3)';
  },

  /**
   * Lấy màu chỉ thị dựa trên pH (Sử dụng logic RGB Mapping từ báo cáo)
   */
  getIndicatorColor(id, ph) {
    if (id === 'phenolphthalein') {
      if (ph < 8.2) return 'rgba(255, 255, 255, 0.1)';
      if (ph > 10.0) return 'rgba(219, 39, 119, 0.7)'; // Hồng đậm (Magenta)
      // Nội suy màu ở khoảng chuyển vùng 8.2 - 10.0
      const ratio = (ph - 8.2) / 1.8;
      const opacity = Math.min(0.7, ratio * 0.7);
      return `rgba(219, 39, 119, ${opacity})`;
    }
    if (id === 'litmus' || id.includes('litmus')) {
      if (ph < 5.0) return 'rgba(220, 38, 38, 0.5)'; // Đỏ
      if (ph > 8.0) return 'rgba(37, 99, 235, 0.5)'; // Xanh
      return 'rgba(139, 92, 246, 0.5)'; // Tím trung tính
    }
    return 'rgba(224, 242, 254, 0.3)';
  },

  /**
   * Kiểm tra bốc cháy/nổ dựa trên NFPA/GHS
   */
  checkSafetyRisk(chemicals, environment) {
    const hasFlame = environment.isHeating;
    const flammable = chemicals.find(c => c.display?.ghs?.includes('GHS02') || (c.badges && (c.badges.includes('flammable') || c.badges.includes('dangerous'))));
    
    if (hasFlame && flammable) {
      return {
        type: 'fire',
        message: `🔥 CẢNH BÁO AN TOÀN: ${flammable.name} là chất cực kỳ dễ cháy!`,
        ghs: 'GHS02'
      };
    }
    
    // Nổ NaN3 nếu đun nóng
    const explosive = chemicals.find(c => c.id === 'nan3' && hasFlame);
    if (explosive) {
      return {
        type: 'explosion',
        message: `☢️ NGUY HIỂM: Natri Azide (NaN₃) đang bị đun nóng! Nguy cơ nổ tung!`,
        ghs: 'GHS01'
      };
    }

    // Nổ thuốc súng
    const gunpowder = this.checkGunpowder(chemicals, environment);
    if (gunpowder && environment.isHeating) {
      return {
        type: 'explosion',
        message: gunpowder.message,
        ghs: 'GHS01'
      };
    }

    return null;
  },

  // ——— REACTIVITY SERIES ———
  // K > Na > Ba > Ca > Mg > Al > Zn > Fe > Ni > Sn > Pb > (H) > Cu > Hg > Ag > Pt > Au
  REACTIVITY_SERIES: {
    'k_metal': 100, 'na_metal': 95, 'ba_metal': 90, 'ca_metal': 85, 'mg_metal': 80,
    'al': 75, 'zn': 70, 'fe': 65, 'ni2': 60, 'sn2': 55, 'pb_metal': 50,
    'h2_gas': 45, 'cu': 40, 'hg_metal': 35, 'ag_metal': 30, 'pt': 20, 'au': 10
  },

  /**
   * Kiểm tra phản ứng thế kim loại (Metal Displacement)
   * Kim loại mạnh đẩy kim loại yếu ra khỏi muối
   */
  checkMetalDisplacement(chemicals) {
    const metal = chemicals.find(c => c.type === 'metal');
    const salt = chemicals.find(c => c.type === 'salt');
    
    if (metal && salt && salt.cation) {
      const metalPower = this.REACTIVITY_SERIES[metal.id] || 0;
      // Map cation ID back to its metal form ID for reactivity check
      const cationMetalId = salt.cation.toLowerCase().includes('cu') ? 'cu' : 
                          salt.cation.toLowerCase().includes('fe') ? 'fe' : 
                          salt.cation.toLowerCase().includes('ag') ? 'ag_metal' : 
                          salt.cation.toLowerCase() + '_metal';
      
      const saltMetalPower = this.REACTIVITY_SERIES[cationMetalId] || 0;
      
      if (metalPower > saltMetalPower && saltMetalPower > 0) {
        return {
          type: 'displacement',
          metal: metal,
          salt: salt,
          productMetal: salt.cation,
          message: `⛏️ Phản ứng thế: ${metal.name} đẩy ${salt.name} tạo kim loại mới!`
        };
      }
    }
    return null;
  },

  /**
   * Kiểm tra phản ứng cháy (Combustion)
   */
  checkCombustion(chemicals, environment) {
    const fuel = chemicals.find(c => c.type === 'metal' || c.type === 'nonmetal' || c.id === 'h2_gas');
    const o2 = chemicals.find(c => c.id === 'o2_gas');
    
    if (fuel && o2 && environment.isHeating) {
      return {
        type: 'combustion',
        fuel: fuel,
        message: `🔥 Phản ứng cháy: ${fuel.name} cháy mãnh liệt trong Oxy!`
      };
    }
    return null;
  },

  /**
   * Kiểm tra tạo và đốt thuốc súng (Black Powder)
   * 2KNO3 + S + 3C -> K2S + N2 + 3CO2
   */
  checkGunpowder(chemicals, environment) {
    if (!chemicals || chemicals.length === 0) return null;

    // Chuẩn hóa check (ID hoặc Công thức)
    const isKNO3 = (c) => c.id === 'kno3' || c.id === 'gen_k_no3' || c.formula === 'KNO₃' || c.formula === 'KNO3';
    const isS = (c) => c.id === 's' || c.formula === 'S' || (c.anion === 'S' && c.type === 'nonmetal');
    const isC = (c) => c.id === 'c_carbon' || c.id === 'carbon' || c.formula === 'C';

    const hasKNO3 = chemicals.some(isKNO3);
    const hasS = chemicals.some(isS);
    const hasC = chemicals.some(isC);

    if (hasKNO3 && hasS && hasC) {
      if (environment && environment.isHeating) {
        return {
          type: 'gunpowder_explosion',
          message: '💥 PHẢN ỨNG NỔ: Thuốc súng đen đang cháy mãnh liệt!',
          equation: '2KNO₃ + S + 3C → K₂S + N₂↑ + 3CO₂↑',
          effect: 'explosion',
          color: '#fbbf24'
        };
      } else {
        return {
          type: 'gunpowder_mixture',
          message: '⚡ Hỗn hợp thuốc súng đen đã được tạo thành (KNO₃ + S + C).',
          equation: '2KNO₃ + S + 3C (Hỗn hợp)',
          effect: 'info'
        };
      }
    }
    return null;
  },

  /**
   * Phép thử Iot - Tinh bột
   */
  checkIodineStarch(chemicals) {
    const hasI2 = chemicals.find(c => c.id === 'i2_solid' || c.id === 'i2');
    const hasStarch = chemicals.find(c => c.id === 'starch');
    
    if (hasI2 && hasStarch) {
      return {
        type: 'starch_test',
        color: 'rgba(30, 58, 138, 0.9)', // Xanh đen đậm
        message: '🧬 Hiện tượng: Iot làm tinh bột chuyển màu xanh tím đặc trưng.'
      };
    }
    return null;
  },

  /**
   * Kiểm tra các phản ứng điều chế phức tạp (Synthesis/Preparation)
   * Tự động phát hiện 2-3 thành phần + Nhiệt độ + Xúc tác
   */
  checkSynthesisReactions(chemicals, environment) {
    if (!chemicals || chemicals.length === 0) return null;
    const ids = chemicals.map(c => c.id);
    const hasHeat = environment && environment.isHeating;

    // 1. ĐIỀU CHẾ CLO (PTN): MnO2 + HCl + t°
    if (ids.includes('mno2') && ids.includes('hcl') && hasHeat) {
      return { type: 'synthesis', key: 'mno2+hcl+heat', message: '🟢 Đang điều chế khí Clo (Cl₂)...' };
    }

    // 2. NHIỆT NHÔM: Fe2O3 + Al + t°
    if (ids.includes('fe2o3') && ids.includes('al') && hasHeat) {
      return { type: 'thermite', key: 'fe2o3+al+heat', message: '🔥 Phản ứng Nhiệt nhôm đang diễn ra mãnh liệt!' };
    }

    // ——— HỆ THỐNG GỢI Ý THÔNG MINH TỔNG QUÁT ———
    const allHeatReactions = Object.values(window.HEAT_REACTIONS || {}).sort((a, b) => (b.reactants?.length || 0) - (a.reactants?.length || 0));
    
    for (const r of allHeatReactions) {
      if (!r.reactants || r.reactants.length === 0) continue;
      
      // Kiểm tra xem beaker có chứa TẤT CẢ các chất phản ứng chính không
      const hasAllReactants = r.reactants.every(reqId => {
        // Hỗ trợ alias ch3cooh <-> ch3cooh_glacial
        if (reqId === 'ch3cooh') return ids.includes('ch3cooh') || ids.includes('ch3cooh_glacial');
        return ids.includes(reqId);
      });

      if (hasAllReactants) {
        // Nếu đủ chất nhưng chưa đủ điều kiện (Nhiệt/Xúc tác)
        const needsHeat = r.requires?.heat && !hasHeat;
        const catalystId = r.requires?.catalyst;
        const needsCatalyst = catalystId && !ids.includes(catalystId);

        if (needsHeat || needsCatalyst) {
          let missingLabel = [];
          if (needsHeat) missingLabel.push('Nhiệt độ (t°)');
          if (needsCatalyst) {
            const cat = (window.CHEMICALS || []).find(c => c.id === catalystId) || 
                        (window.ALL_ITEMS || []).find(c => c.id === catalystId);
            missingLabel.push(cat ? cat.name : catalystId);
          }
          
          return {
            type: 'hint',
            id: `hint_${r.reactants.join('_')}`,
            message: `[GỢI_Ý] Phát hiện tổ hợp: ${r.synthesis?.name || 'Phản ứng mới'}. Cần thêm: ${missingLabel.join(' & ')}.`
          };
        } else {
           // Nếu đủ điều kiện, trả về phản ứng thật (nếu là synthesis)
           // Tìm key của phản ứng này trong HEAT_REACTIONS
           const rKey = Object.keys(window.HEAT_REACTIONS || {}).find(k => window.HEAT_REACTIONS[k] === r);
           return { type: 'synthesis', key: rKey, message: r.observation || 'Đang xảy ra phản ứng...' };
        }
      }
    }

    // Luôn ưu tiên Lên men & Đất đèn (không cần nhiệt)
    if (ids.includes('yeast') && ids.includes('glucose')) {
       return { type: 'synthesis', key: 'glucose+yeast', message: '🍇 Quá trình lên men rượu đang diễn ra.' };
    }
    if (ids.includes('cac2') && ids.includes('h2o')) {
       return { type: 'synthesis', key: 'cac2+h2o', message: '🔥 Đất đèn đang giải phóng khí Acetylene (C₂H₂).' };
    }

    return null;
  },

  /**
   * Kiểm tra tính dẫn điện của dung dịch
   */
  checkConductivity(chemicals) {
    if (!chemicals || chemicals.length === 0) return 0;
    const electrolytes = chemicals.filter(c => ['salt', 'acid', 'base'].includes(c.type));
    return electrolytes.length > 0 ? 100 : 0;
  },

  /**
   * Tính toán hiệu quả nguyên tử (Atom Economy)
   * @param {Object} reactionObj - Ví dụ: { reactants: ['H2', 'Cl2'], products: ['HCl'], reactantCoefficients: [1, 1], productCoefficients: [2] }
   * @param {string} desiredProductId - ID của sản phẩm mong muốn (ví dụ: 'HCl')
   */
  calculateAtomEconomy(reactionObj, desiredProductId) {
    const db = window.CHEMICALS || [];
    
    // Tổng khối lượng mol của tất cả các chất tham gia (Reactants)
    const totalReactantMass = (reactionObj.reactants || []).reduce((sum, id, index) => {
        const chem = db.find(c => c.id === id);
        if (!chem) return sum;
        const coeff = (reactionObj.reactantCoefficients && reactionObj.reactantCoefficients[index]) || 1;
        return sum + (chem.molarMass || chem.molar_mass || 0) * coeff;
    }, 0);

    // Khối lượng mol của sản phẩm mong muốn
    const productChem = db.find(c => c.id === desiredProductId);
    if (!productChem || totalReactantMass === 0) return 0;
    
    // Tìm index của product
    const productIndex = (reactionObj.products || []).indexOf(desiredProductId);
    const productCoeff = (productIndex !== -1 && reactionObj.productCoefficients && reactionObj.productCoefficients[productIndex]) ? reactionObj.productCoefficients[productIndex] : 1;

    const desiredProductMass = (productChem.molarMass || productChem.molar_mass || 0) * productCoeff;

    // Tính % Atom Economy
    const economy = (desiredProductMass / totalReactantMass) * 100;
    
    return parseFloat(economy.toFixed(2));
  }
};


window.ChemistryEngine = ChemistryEngine;
