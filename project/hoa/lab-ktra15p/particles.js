/* ============================================================
   particles.js — Canvas Particle System & Effects Engine
   ============================================================ */

let canvas, ctx, particles = [], animId;
let screenFlash = 0; // 0 to 1 intensity

function initCanvas() {
  canvas = document.getElementById('effectsCanvas');
  const surface = document.getElementById('workspaceSurface');
  const rect = surface.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  ctx = canvas.getContext('2d');
  loop();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  const surface = document.getElementById('workspaceSurface');
  const rect = surface.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const items = window.state?.workspaceItems || [];

  // 1. Bottom Layer: Molecular Mesh (under items)
  items.forEach(it => {
    if (it.isReacting) drawMolecularMesh(ctx, it.x, it.y, it.liquidColor, it.scale || 1);
  });

  // 2. Middle Layer: Wires & Particles
  if (items.length > 0) drawWires(ctx, items);

  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    p.update();
    p.draw(ctx);
  });
  
  // 3. Top Layer: Dynamic Lighting
  drawLighting(ctx, items);

  // 4. Global Layer: Screen Flash
  if (screenFlash > 0) {
    ctx.save();
    ctx.fillStyle = `rgba(255, 255, 255, ${screenFlash * 0.8})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    screenFlash -= 0.05;
    if (screenFlash < 0) screenFlash = 0;
  }

  animId = requestAnimationFrame(loop);
}

function drawMolecularMesh(ctx, x, y, color, scale = 1) {
  const time = Date.now() * 0.001;
  ctx.save();
  // Adjust center based on scale
  const centerX = x + 40 * scale;
  const centerY = y + 45 * scale;
  ctx.translate(centerX, centerY);
  ctx.rotate(time * 0.2);
  ctx.globalAlpha = 0.15;
  ctx.strokeStyle = color || '#38bdf8';
  ctx.lineWidth = 1 * scale;

  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const r = (40 + Math.sin(time * 2) * 5) * scale;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(px, py);
    ctx.stroke();
    
    // Draw hexagon nodes
    ctx.beginPath();
    ctx.arc(px, py, 2 * scale, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Outer hex
  ctx.beginPath();
  for (let i = 0; i <= 6; i++) {
    const angle = (i * Math.PI) / 3;
    const r = (40 + Math.sin(time * 2) * 5) * scale;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
}

function drawLighting(ctx, items) {
  items.forEach(it => {
    const scale = it.scale || 1;
    // Heat Source Glow (Burner)
    if (it.toolId === 'bunsen-burner' && it.active) {
      const centerX = it.x + 25 * scale;
      const centerY = it.y + 70 * scale;
      const gradient = ctx.createRadialGradient(centerX, centerY, 10 * scale, centerX, centerY, 150 * scale);
      gradient.addColorStop(0, 'rgba(245, 158, 11, 0.3)');
      gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
      
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = gradient;
      ctx.fillRect(centerX - 150 * scale, centerY - 150 * scale, 300 * scale, 300 * scale);
      ctx.restore();
    }
    
    // Chemical Luminescence (Colored liquid glow)
    if (it.type === 'beaker' && it.liquidLevel > 0) {
      const color = it.liquidColor || 'rgba(56, 189, 248, 0.2)';
      const centerX = it.x + 40 * scale;
      const centerY = it.y + 60 * scale;
      const gradient = ctx.createRadialGradient(centerX, centerY, 5 * scale, centerX, centerY, 60 * scale);
      gradient.addColorStop(0, color.replace(/[\d\.]+\)$/, '0.1)'));
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = gradient;
      ctx.fillRect(centerX - 60 * scale, centerY - 60 * scale, 120 * scale, 120 * scale);
      ctx.restore();
    }
  });
}

function triggerFlash() {
  screenFlash = 1.0;
}

window.triggerFlash = triggerFlash;

function drawWires(ctx, items) {
  const supplies = items.filter(it => it.toolId === 'power-supply' && it.connections);
  
  supplies.forEach(supply => {
    const sScale = supply.scale || 1;
    supply.connections.forEach((connId, index) => {
      const target = items.find(it => it.uid === connId);
      if (!target) return;
      
      const tScale = target.scale || 1;
      const isPositive = target.connectionType === 'positive';
      
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash(supply.active ? [] : [5, 5]);
      ctx.strokeStyle = supply.active 
        ? (isPositive ? '#ef4444' : '#1e293b') // Red for positive, Black for negative
        : '#475569'; // Grey if off
      ctx.lineWidth = (supply.active ? 3 : 1.5) * sScale;
      
      // Wire points (terminals are at different spots on supply)
      const x1 = supply.x + 15 * sScale;
      const y1 = supply.y + (isPositive ? 40 : 48) * sScale;
      const x2 = target.x + 10 * tScale;
      const y2 = target.y + 5 * tScale;
      
      ctx.moveTo(x1, y1);
      // Draw a curved wire
      const cpX = (x1 + x2) / 2;
      const cpY = Math.max(y1, y2) + (index === 0 ? 50 : 30); // Slightly different curves
      ctx.quadraticCurveTo(cpX, cpY, x2, y2);
      
      ctx.stroke();
      
      // Joint points
      ctx.fillStyle = isPositive ? '#7f1d1d' : '#000';
      ctx.beginPath(); ctx.arc(x1, y1, 3.5, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    });
  });
}

// ——— PARTICLE CLASSES ———
class BubbleParticle {
  constructor(x, y, color = '#bae6fd', scale = 1) {
    this.x = x + (Math.random() - 0.5) * 30 * scale;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 1.5 * scale;
    this.vy = -(Math.random() * 2.5 + 1) * scale;
    this.r = (Math.random() * 5 + 2) * scale;
    this.life = 1;
    this.color = color;
    this.decay = Math.random() * 0.015 + 0.008;
  }
  update() {
    this.x += this.vx + Math.sin(Date.now() * 0.005 + this.x) * 0.5;
    this.y += this.vy;
    this.r *= 0.99;
    this.life -= this.decay;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life * 0.8;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // shine
    ctx.beginPath();
    ctx.arc(this.x - this.r * 0.3, this.y - this.r * 0.3, this.r * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fill();
    ctx.restore();
  }
}

class PrecipitateParticle {
  constructor(x, y, color = '#1d4ed8', scale = 1) {
    this.x = x + (Math.random() - 0.5) * 40 * scale;
    this.y = y - Math.random() * 20 * scale;
    this.vx = (Math.random() - 0.5) * 0.8 * scale;
    this.vy = (Math.random() * 1.5 + 0.5) * scale;
    this.r = (Math.random() * 3 + 1) * scale;
    this.life = 1;
    this.color = color;
    this.decay = Math.random() * 0.008 + 0.004;
    this.rotation = Math.random() * Math.PI * 2;
  }
  update() {
    this.x += this.vx;
    this.vy *= 1.02; // accelerate fall
    this.y += this.vy;
    this.rotation += 0.05;
    this.life -= this.decay;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life * 0.9;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    // small diamond
    ctx.beginPath();
    ctx.moveTo(0, -this.r * 1.5);
    ctx.lineTo(this.r, 0);
    ctx.lineTo(0, this.r * 1.5);
    ctx.lineTo(-this.r, 0);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

class SmokeParticle {
  constructor(x, y, color = 'rgba(74,222,128,0.3)', scale = 1) {
    this.x = x + (Math.random() - 0.5) * 20 * scale;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2 * scale;
    this.vy = -(Math.random() * 1.5 + 0.5) * scale;
    this.r = (Math.random() * 15 + 8) * scale;
    this.life = 1;
    this.color = color;
    this.decay = Math.random() * 0.012 + 0.005;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.r += 0.3;
    this.vx *= 0.98;
    this.life -= this.decay;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life * 0.3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

class SparkParticle {
  constructor(x, y, color, scale = 1) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 6 + 2) * scale;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 1;
    this.decay = Math.random() * 0.05 + 0.03;
    this.color = color || `hsl(${Math.random() * 60 + 10}, 100%, 60%)`;
    this.r = (Math.random() * 3 + 1) * scale;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.15; // gravity
    this.vx *= 0.97;
    this.r *= 0.95;
    this.life -= this.decay;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

class FlameParticle {
  constructor(x, y, baseHue = 30, scale = 1) {
    this.x = x + (Math.random() - 0.5) * 12 * scale;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 1.5 * scale;
    this.vy = -(Math.random() * 3 + 2) * scale;
    this.r = (Math.random() * 8 + 4) * scale;
    this.life = 1;
    this.decay = Math.random() * 0.04 + 0.02;
    // baseHue: 30 (orange), 210 (blue), 60 (yellow-white)
    this.hue = baseHue + (Math.random() * 20 - 10);
  }
  update() {
    this.x += this.vx + Math.sin(Date.now() * 0.01 + this.y) * 0.5;
    this.y += this.vy;
    this.r *= 0.97;
    this.life -= this.decay;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life * 0.85;
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
    gradient.addColorStop(0, `hsla(${50 + this.hue},100%,90%,1)`);
    gradient.addColorStop(0.4, `hsla(${30 + this.hue},100%,60%,0.8)`);
    gradient.addColorStop(1, `hsla(${this.hue},100%,40%,0)`);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();
  }
}

class ToxicCloudParticle {
  constructor(x, y, color = '#166534', scale = 1) {
    this.x = x + (Math.random() - 0.5) * 30 * scale;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2.5 * scale;
    this.vy = -(Math.random() * 2 + 0.5) * scale;
    this.r = (Math.random() * 20 + 10) * scale;
    this.life = 1;
    this.color = color;
    this.decay = Math.random() * 0.006 + 0.003;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.r += 0.5;
    this.vx *= 0.99;
    this.life -= this.decay;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life * 0.25;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

// ——— EMITTER FUNCTIONS ———
function emitBubbles(x, y, color, count = 20, duration = 2000, scale = 1) {
  let elapsed = 0;
  const rate = 80;
  const interval = setInterval(() => {
    for (let i = 0; i < 3; i++) {
      particles.push(new BubbleParticle(x, y, color, scale));
    }
    elapsed += rate;
    if (elapsed >= duration) clearInterval(interval);
  }, rate);
}

function emitPrecipitate(x, y, color, count = 30, scale = 1) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      particles.push(new PrecipitateParticle(x, y, color, scale));
    }, i * 30);
  }
}

function emitSparks(x, y, count = 20, color, scale = 1) {
  for (let i = 0; i < count; i++) {
    particles.push(new SparkParticle(x, y, color, scale));
  }
}

function emitFlames(x, y, duration = 999999, hue = 30, scale = 1) {
  const interval = setInterval(() => {
    for (let i = 0; i < 3; i++) {
      particles.push(new FlameParticle(x, y, hue, scale));
    }
  }, 50);
  return interval; // caller must clearInterval
}

function emitToxicCloud(x, y, color, duration = 3000, scale = 1) {
  let elapsed = 0;
  const rate = 100;
  const interval = setInterval(() => {
    for (let i = 0; i < 2; i++) {
      particles.push(new ToxicCloudParticle(x, y, color, scale));
    }
    elapsed += rate;
    if (elapsed >= duration) clearInterval(interval);
  }, rate);
}

function emitSmoke(x, y, color, duration = 2000, scale = 1) {
  let elapsed = 0;
  const rate = 80;
  const interval = setInterval(() => {
    particles.push(new SmokeParticle(x, y, color, scale));
    elapsed += rate;
    if (elapsed >= duration) clearInterval(interval);
  }, rate);
}

// ——— REACTION EFFECTS ———
function triggerReactionEffect(effect, x, y, reaction, scale = 1) {
  switch (effect) {
    case 'bubbles':
    case 'bubbles-intense':
    case 'bubbles-fast': {
      const count = effect === 'bubbles-intense' ? 40 : effect === 'bubbles-fast' ? 50 : 25;
      const dur   = effect === 'bubbles-fast' ? 2500 : effect === 'bubbles-intense' ? 3000 : 2000;
      const col = reaction.particles?.[0]?.color || '#bae6fd';
      emitBubbles(x, y, col, count, dur, scale);
      break;
    }
    case 'bubbles-violent': {
      emitBubbles(x, y, '#b8e0ff', 60, 3500, scale);
      emitSparks(x, y, 20, null, scale);
      break;
    }
    // ——— Kết tủa màu chính xác từ PHENOMENA_DB ———
    case 'precipitate-color': {
      const col = reaction.precipitateColor || reaction.particles?.[0]?.color || '#f1f5f9';
      const count = reaction.particles?.[0]?.count || 35;
      emitPrecipitate(x, y, col, count, scale);
      // Hiệu ứng bùng sáng nhỏ khi kết tủa xuất hiện
      emitSparks(x, y - 10 * scale, 6, null, scale);
      break;
    }
    case 'precipitate-blue':
    case 'precipitate-brown':
    case 'precipitate-white':
    case 'precipitate-white-cloud': {
      const col = reaction.particles?.[0]?.color || '#f1f5f9';
      emitPrecipitate(x, y, col, 35, scale);
      if (effect === 'precipitate-white-cloud') {
        emitSmoke(x, y - 20 * scale, 'rgba(241,245,249,0.4)', 1500, scale);
      }
      break;
    }
    case 'dissolve-sediment': {
      // Hiệu ứng "tan biến": lấp lánh và khói nhẹ
      emitSparks(x, y + 20 * scale, 15, null, scale);
      emitSmoke(x, y + 10 * scale, 'rgba(255, 255, 255, 0.3)', 2000, scale);
      break;
    }
    case 'heat':
    case 'warm':
      emitSparks(x, y, 20, null, scale);
      break;
    case 'catalytic-decomposition':
      emitBubbles(x, y, '#e0f2fe', 60, 3000, scale);
      emitSparks(x, y, 15, null, scale);
      break;
    case 'toxic-gas-brown':
      emitToxicCloud(x, y, '#92400e', 4000, scale);
      emitBubbles(x, y, '#b45309', 15, 3000, scale);
      break;
    case 'color-change-pink':
      emitSparks(x, y, 15, null, scale);
      break;
    case 'explosion-small': {
      emitSparks(x, y, 40, null, scale);
      emitSmoke(x, y - 10 * scale, 'rgba(50,50,50,0.5)', 3000, scale);
      const flameInterval = emitFlames(x, y, 999999, 30, scale);
      setTimeout(() => clearInterval(flameInterval), 600);
      emitBubbles(x, y, '#fca5a5', 30, 1500, scale); // red tinted bubbles
      break;
    }
    case 'explosion-violent': {
      emitSparks(x, y, 100, null, scale);
      emitSmoke(x, y - 20 * scale, 'rgba(30,30,30,0.7)', 4000, scale);
      const flameInterval = emitFlames(x, y, 999999, 30, scale);
      setTimeout(() => clearInterval(flameInterval), 1000); // longer burn
      emitBubbles(x, y, '#ef4444', 80, 2000, scale); 
      break;
    }
    case 'fire-acetylene': {
      emitSparks(x, y, 50, '#fde68a', scale);
      emitSmoke(x, y - 10 * scale, 'rgba(50,50,50,0.6)', 3500, scale);
      const flameInterval = emitFlames(x, y, 3500, 50, scale); // vàng chói, hơi khói
      setTimeout(() => clearInterval(flameInterval), 2000);
      break;
    }
    case 'fire-methane': {
      emitSparks(x, y, 30, '#93c5fd', scale);
      const flameInterval = emitFlames(x, y, 3000, 210, scale); // ngọn lửa xanh (blue)
      setTimeout(() => clearInterval(flameInterval), 1500);
      break;
    }
    case 'explosion-pop': {
      emitSparks(x, y, 60, '#e0f2fe', scale);
      emitSmoke(x, y - 15 * scale, 'rgba(255,255,255,0.4)', 1500, scale);
      const flashInterval = emitFlames(x, y, 500, 60, scale); 
      setTimeout(() => clearInterval(flashInterval), 300);
      break;
    }
    case 'layering-ester': {
      // Hiệu ứng phân lớp: Bọt khí trắng mờ tập trung ở bề mặt
      emitBubbles(x, y - 20 * scale, 'rgba(255,255,255,0.4)', 40, 5000, scale);
      emitSparks(x, y, 15, null, scale); // Tỏa nhiệt nhẹ
      break;
    }
    case 'fire-blue-sulfur': {
      emitSparks(x, y, 20, '#60a5fa', scale);
      const flameInterval = emitFlames(x, y, 3000, 230, scale); // Xanh mờ (hue ~230)
      setTimeout(() => clearInterval(flameInterval), 1500);
      break;
    }
    case 'smoke-brown-iron': {
      emitSparks(x, y, 40, '#f59e0b', scale);
      emitSmoke(x, y - 15 * scale, 'rgba(146,64,14,0.7)', 5000, scale); // Khói nâu đỏ FeCl3
      break;
    }
    case 'complex-blue-black': {
      emitBubbles(x, y, 'rgba(30,58,138,0.6)', 30, 4000, scale);
      emitSparks(x, y, 10, '#1e40af', scale); 
      break;
    }
    case 'complex-violet': {
      emitBubbles(x, y, 'rgba(124,58,237,0.5)', 25, 3000, scale);
      emitSparks(x, y, 12, '#a78bfa', scale);
      break;
    }
    case 'fire-lithium': {
      emitSparks(x, y, 40, '#dc2626', scale);
      const flameInterval = emitFlames(x, y, 3000, 0, scale); // Đỏ tía (hue ~0)
      setTimeout(() => clearInterval(flameInterval), 1500);
      break;
    }
    case 'fire-sodium': {
      emitSparks(x, y, 50, '#f59e0b', scale);
      const flameInterval = emitFlames(x, y, 3000, 45, scale); // Vàng chói (hue ~45)
      setTimeout(() => clearInterval(flameInterval), 1500);
      break;
    }
    case 'fire-potassium': {
      emitSparks(x, y, 40, '#7c3aed', scale);
      const flameInterval = emitFlames(x, y, 3000, 270, scale); // Tím hoa cà (hue ~270)
      setTimeout(() => clearInterval(flameInterval), 1500);
      break;
    }
    case 'neutral':
    default:
      emitSparks(x, y, 8, null, scale);
      break;
  }
}

// ——— INTRO PAGE NEURAL BACKGROUND ———
let introCanvas, introCtx, introNodes = [];

function initIntroParticles() {
  introCanvas = document.getElementById('introCanvas');
  if (!introCanvas) return;
  
  introCtx = introCanvas.getContext('2d');
  resizeIntroCanvas();
  
  introNodes = [];
  const nodeCount = Math.min(60, Math.floor((window.innerWidth * window.innerHeight) / 25000));
  
  for (let i = 0; i < nodeCount; i++) {
    introNodes.push({
      x: Math.random() * introCanvas.width,
      y: Math.random() * introCanvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1
    });
  }
  
  window.addEventListener('resize', resizeIntroCanvas);
  requestAnimationFrame(introLoop);
}

function resizeIntroCanvas() {
  if (!introCanvas) return;
  introCanvas.width = window.innerWidth;
  introCanvas.height = window.innerHeight;
}

function introLoop() {
  if (!introCanvas || !document.getElementById('introOverlay')) return;
  if (document.getElementById('introOverlay').classList.contains('hide')) return;

  introCtx.clearRect(0, 0, introCanvas.width, introCanvas.height);
  
  // Update & Draw Nodes
  introNodes.forEach((node, i) => {
    node.x += node.vx;
    node.y += node.vy;
    
    if (node.x < 0 || node.x > introCanvas.width) node.vx *= -1;
    if (node.y < 0 || node.y > introCanvas.height) node.vy *= -1;
    
    introCtx.beginPath();
    introCtx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
    introCtx.fillStyle = 'rgba(56, 189, 248, 0.3)';
    introCtx.fill();
    
    // Connections
    for (let j = i + 1; j < introNodes.length; j++) {
      const other = introNodes[j];
      const dist = Math.hypot(node.x - other.x, node.y - other.y);
      if (dist < 150) {
        introCtx.beginPath();
        introCtx.moveTo(node.x, node.y);
        introCtx.lineTo(other.x, other.y);
        introCtx.strokeStyle = `rgba(56, 189, 248, ${0.15 * (1 - dist/150)})`;
        introCtx.lineWidth = 0.8;
        introCtx.stroke();
      }
    }
  });
  
  requestAnimationFrame(introLoop);
}

// Global Exports
window.initCanvas = initCanvas;
window.emitBubbles = emitBubbles;
window.emitPrecipitate = emitPrecipitate;
window.emitSparks = emitSparks;
window.emitFlames = emitFlames;
window.emitToxicCloud = emitToxicCloud;
window.emitSmoke = emitSmoke;
window.triggerReactionEffect = triggerReactionEffect;
window.initIntroParticles = initIntroParticles;
