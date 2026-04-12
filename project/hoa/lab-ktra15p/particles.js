/* ============================================================
   particles.js — Canvas Particle System & Effects Engine
   ============================================================ */

let canvas, ctx, particles = [], animId;

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
  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    p.update();
    p.draw(ctx);
  });
  
  // Draw wires if state is available
  if (window.state && window.state.workspaceItems) {
    drawWires(ctx, window.state.workspaceItems);
  }
  
  animId = requestAnimationFrame(loop);
}

function drawWires(ctx, items) {
  const supplies = items.filter(it => it.toolId === 'power-supply' && it.connections);
  
  supplies.forEach(supply => {
    supply.connections.forEach((connId, index) => {
      const target = items.find(it => it.uid === connId);
      if (!target) return;
      
      const isPositive = target.connectionType === 'positive';
      
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash(supply.active ? [] : [5, 5]);
      ctx.strokeStyle = supply.active 
        ? (isPositive ? '#ef4444' : '#1e293b') // Red for positive, Black for negative
        : '#475569'; // Grey if off
      ctx.lineWidth = supply.active ? 3 : 1.5;
      
      // Wire points (terminals are at different spots on supply)
      const x1 = supply.x + 15;
      const y1 = supply.y + (isPositive ? 40 : 48);
      const x2 = target.x + 10;
      const y2 = target.y + 5;
      
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
  constructor(x, y, color = '#bae6fd') {
    this.x = x + (Math.random() - 0.5) * 30;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = -(Math.random() * 2.5 + 1);
    this.r = Math.random() * 5 + 2;
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
  constructor(x, y, color = '#1d4ed8') {
    this.x = x + (Math.random() - 0.5) * 40;
    this.y = y - Math.random() * 20;
    this.vx = (Math.random() - 0.5) * 0.8;
    this.vy = Math.random() * 1.5 + 0.5;
    this.r = Math.random() * 3 + 1;
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
  constructor(x, y, color = 'rgba(74,222,128,0.3)') {
    this.x = x + (Math.random() - 0.5) * 20;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = -(Math.random() * 1.5 + 0.5);
    this.r = Math.random() * 15 + 8;
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
  constructor(x, y) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 1;
    this.decay = Math.random() * 0.05 + 0.03;
    this.color = `hsl(${Math.random() * 60 + 10}, 100%, 60%)`;
    this.r = Math.random() * 3 + 1;
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
  constructor(x, y) {
    this.x = x + (Math.random() - 0.5) * 12;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = -(Math.random() * 3 + 2);
    this.r = Math.random() * 8 + 4;
    this.life = 1;
    this.decay = Math.random() * 0.04 + 0.02;
    this.hue = Math.random() * 30; // orange-yellow
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
  constructor(x, y, color = '#166534') {
    this.x = x + (Math.random() - 0.5) * 30;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2.5;
    this.vy = -(Math.random() * 2 + 0.5);
    this.r = Math.random() * 20 + 10;
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
function emitBubbles(x, y, color, count = 20, duration = 2000) {
  let elapsed = 0;
  const rate = 80;
  const interval = setInterval(() => {
    for (let i = 0; i < 3; i++) {
      particles.push(new BubbleParticle(x, y, color));
    }
    elapsed += rate;
    if (elapsed >= duration) clearInterval(interval);
  }, rate);
}

function emitPrecipitate(x, y, color, count = 30) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      particles.push(new PrecipitateParticle(x, y, color));
    }, i * 30);
  }
}

function emitSparks(x, y, count = 20) {
  for (let i = 0; i < count; i++) {
    particles.push(new SparkParticle(x, y));
  }
}

function emitFlames(x, y, duration = 999999) {
  const interval = setInterval(() => {
    for (let i = 0; i < 3; i++) {
      particles.push(new FlameParticle(x, y));
    }
  }, 50);
  return interval; // caller must clearInterval
}

function emitToxicCloud(x, y, color, duration = 3000) {
  let elapsed = 0;
  const rate = 100;
  const interval = setInterval(() => {
    for (let i = 0; i < 2; i++) {
      particles.push(new ToxicCloudParticle(x, y, color));
    }
    elapsed += rate;
    if (elapsed >= duration) clearInterval(interval);
  }, rate);
}

function emitSmoke(x, y, color, duration = 2000) {
  let elapsed = 0;
  const rate = 80;
  const interval = setInterval(() => {
    particles.push(new SmokeParticle(x, y, color));
    elapsed += rate;
    if (elapsed >= duration) clearInterval(interval);
  }, rate);
}

// ——— REACTION EFFECTS ———
function triggerReactionEffect(effect, x, y, reaction) {
  switch (effect) {
    case 'bubbles':
    case 'bubbles-intense':
    case 'bubbles-fast': {
      const count = effect === 'bubbles-intense' ? 40 : effect === 'bubbles-fast' ? 50 : 25;
      const dur   = effect === 'bubbles-fast' ? 2500 : effect === 'bubbles-intense' ? 3000 : 2000;
      const col = reaction.particles?.[0]?.color || '#bae6fd';
      emitBubbles(x, y, col, count, dur);
      break;
    }
    case 'bubbles-violent': {
      emitBubbles(x, y, '#b8e0ff', 60, 3500);
      emitSparks(x, y, 20);
      break;
    }
    // ——— Kết tủa màu chính xác từ PHENOMENA_DB ———
    case 'precipitate-color': {
      const col = reaction.precipitateColor || reaction.particles?.[0]?.color || '#f1f5f9';
      const count = reaction.particles?.[0]?.count || 35;
      emitPrecipitate(x, y, col, count);
      // Hiệu ứng bùng sáng nhỏ khi kết tủa xuất hiện
      emitSparks(x, y - 10, 6);
      break;
    }
    case 'precipitate-blue':
    case 'precipitate-brown':
    case 'precipitate-white':
    case 'precipitate-white-cloud': {
      const col = reaction.particles?.[0]?.color || '#f1f5f9';
      emitPrecipitate(x, y, col, 35);
      if (effect === 'precipitate-white-cloud') {
        emitSmoke(x, y - 20, 'rgba(241,245,249,0.4)', 1500);
      }
      break;
    }
    case 'dissolve-sediment': {
      // Hiệu ứng "tan biến": lấp lánh và khói nhẹ
      emitSparks(x, y + 20, 15);
      emitSmoke(x, y + 10, 'rgba(255, 255, 255, 0.3)', 2000);
      break;
    }
    case 'heat':
    case 'warm':
      emitSparks(x, y, 20);
      break;
    case 'catalytic-decomposition':
      emitBubbles(x, y, '#e0f2fe', 60, 3000);
      emitSparks(x, y, 15);
      break;
    case 'toxic-gas-brown':
      emitToxicCloud(x, y, '#92400e', 4000);
      emitBubbles(x, y, '#b45309', 15, 3000);
      break;
    case 'color-change-pink':
      emitSparks(x, y, 15);
      break;
    case 'explosion-small': {
      emitSparks(x, y, 40);
      emitSmoke(x, y - 10, 'rgba(50,50,50,0.5)', 3000);
      const flameInterval = emitFlames(x, y);
      setTimeout(() => clearInterval(flameInterval), 600);
      emitBubbles(x, y, '#fca5a5', 30, 1500); // red tinted bubbles
      break;
    }
    case 'explosion-violent': {
      emitSparks(x, y, 100);
      emitSmoke(x, y - 20, 'rgba(30,30,30,0.7)', 4000);
      const flameInterval = emitFlames(x, y);
      setTimeout(() => clearInterval(flameInterval), 1000); // longer burn
      emitBubbles(x, y, '#ef4444', 80, 2000); 
      break;
    }
    case 'neutral':
    default:
      emitSparks(x, y, 8);
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
