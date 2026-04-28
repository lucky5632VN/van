/* chemicals_idcl.js — IDCL Standardized Chemical Database for Green Chemistry & Safety */

const CHEMICAL_DATABASE = {
  "cl2": {
    "id": "cl2",
    "name": "Chlorine Gas",
    "formula": "Cl₂",
    "molar_mass": 70.9,
    "density": 0.0032, // Khí (g/mL ở đktc)
    "physical_state": "gas",
    "visuals": {
      "color": "#d4e09b", // Vàng lục đặc trưng
      "opacity": 0.4
    },
    "safety": {
      "toxicity_level": 4,
      "is_volatile": true,
      "is_corrosive": true,
      "required_ppe": ["goggles", "fume-hood"],
      "hazard_codes": ["H330", "H315"]
    },
    "green_metrics": {
      "waste_penalty_multiplier": 2.5,
      "eco_hazard_score": 8
    }
  },
  "naoh": {
    "id": "naoh",
    "name": "Sodium Hydroxide",
    "formula": "NaOH",
    "molar_mass": 40.0,
    "density": 2.13,
    "physical_state": "solid", // Thường ở dạng viên (pellets)
    "visuals": {
      "color": "#ffffff",
      "opacity": 1.0
    },
    "safety": {
      "toxicity_level": 2,
      "is_volatile": false,
      "is_corrosive": true,
      "required_ppe": ["goggles", "gloves"],
      "hazard_codes": ["H314"]
    },
    "green_metrics": {
      "waste_penalty_multiplier": 1.2,
      "eco_hazard_score": 3
    }
  },
  "h2so4_con": {
    "id": "h2so4_con",
    "name": "Sulfuric Acid (Concentrated)",
    "formula": "H₂SO₄",
    "molar_mass": 98.08,
    "density": 1.84,
    "physical_state": "liquid",
    "visuals": {
      "color": "#f1f1f1",
      "opacity": 0.8
    },
    "safety": {
      "toxicity_level": 3,
      "is_volatile": true, // Axit đậm đặc bốc khói
      "is_corrosive": true,
      "required_ppe": ["goggles", "gloves", "fume-hood"],
      "hazard_codes": ["H314", "H290"]
    },
    "green_metrics": {
      "waste_penalty_multiplier": 1.8,
      "eco_hazard_score": 5
    }
  }
};

window.CHEMICAL_DATABASE = CHEMICAL_DATABASE;

document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.CHEMICALS !== 'undefined') {
    Object.values(CHEMICAL_DATABASE).forEach(c => {
      if (!window.CHEMICALS.find(e => e.id === c.id)) {
        window.CHEMICALS.push(c);
      } else {
        // Merge attributes if chemical already exists
        let existing = window.CHEMICALS.find(e => e.id === c.id);
        Object.assign(existing, c);
      }
    });
    console.log(`✅ chemicals_idcl.js: Đã nạp thành công ${Object.keys(CHEMICAL_DATABASE).length} hóa chất chuẩn IDCL.`);
  }
});
