// Image-shaped particle logo ONLY (no stars, no glow)
// Mouse-local disperse + smoke curl + slow return
// p5.js Web Editor + website friendly (uses #logo-canvas if present)

console.log("RUNNING sketch6.js");

const IMG_FILE = "images/sx_logo2.png";
let img;

let pts = [];

const TARGET_IMG_W = 300;
const SAMPLE_STEP = 1;
const ALPHA_CUTOFF = 10;
const MAX_PARTICLES = 6000;

let disperseTimer = 0;
let cooldown = 0;

function preload() {
  img = loadImage(IMG_FILE);
}

// ✅ Pause when offscreen (simple + lightweight)
function checkVisibility() {
  const section = document.getElementById("contact");
  if (!section) return;

  const rect = section.getBoundingClientRect();
  const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

  if (isVisible) loop();
  else noLoop();
}

function setup() {
  const container = document.getElementById("contact");
  if (container) {
    const c = createCanvas(container.offsetWidth, container.offsetHeight);
    c.parent("contact-logo");
  } else {
    createCanvas(windowWidth, windowHeight);
  }

  pixelDensity(1);

  img.resize(TARGET_IMG_W, 0);
  buildParticlesFromImage();

  // ✅ Start paused correctly + update on scroll/resize
  checkVisibility();
  window.addEventListener("scroll", checkVisibility, { passive: true });
  window.addEventListener("resize", checkVisibility);
}

function draw() {
  // ✅ remove background elements: just clear (transparent-friendly)
  clear(); // if you want solid bg instead, use: background(0);

  const cx = width * 0.72;
  const cy = height * 0.52;
  const scale = min(width, height) * 0.0035;

  // --- Organic hover trigger (shape-aware) ---
  let nearShape = false;
  const probeCount = 140;
  const triggerPx = 22;
  const triggerPxSoft = 38;

  if (pts.length > 0) {
    for (let k = 0; k < probeCount; k++) {
      const p = pts[(frameCount * 37 + k * 53) % pts.length];
      const sx = cx + p.x * scale;
      const sy = cy + p.y * scale;

      const d = dist(mouseX, mouseY, sx, sy);
      const n = noise(sx * 0.01, sy * 0.01, frameCount * 0.01);
      const thresh = lerp(triggerPx, triggerPxSoft, n);

      if (d < thresh) {
        nearShape = true;
        break;
      }
    }
  }

  if (cooldown > 0) cooldown--;
  if (disperseTimer > 0) disperseTimer--;

  if (nearShape && disperseTimer === 0 && cooldown === 0) {
    triggerDisperse(cx, cy, scale);
  }

  updateParticles(cx, cy, scale, mouseX, mouseY);
  drawParticles(cx, cy, scale);
}

function buildParticlesFromImage() {
  pts = [];
  img.loadPixels();

  const w = img.width;
  const h = img.height;

  const keep = 0.35;
  let count = 0;

  for (let y = 0; y < h; y += SAMPLE_STEP) {
    for (let x = 0; x < w; x += SAMPLE_STEP) {
      const idx = 4 * (y * w + x);
      const a = img.pixels[idx + 3];

      if (a > ALPHA_CUTOFF) {
        if (random() > keep) continue;

        count++;
        if (count > MAX_PARTICLES && random() > 0.25) continue;

        const hx = x - w * 0.5;
        const hy = y - h * 0.5;

        pts.push({
          hx,
          hy,
          x: hx + randomGaussian(0, 0.6),
          y: hy + randomGaussian(0, 0.6),
          vx: 0,
          vy: 0,
          tw: random(0.01, 0.05),
          ph: random(TWO_PI),
          sz: random(0.7, 2.0),
        });
      }
    }
  }
}

// Mouse-local disperse (only particles near mouse get kicked)
function triggerDisperse(cx, cy, scale) {
  disperseTimer = 80;
  cooldown = 55;

  const affectRadius = 120;
  const burstMin = 0.03;
  const burstMax = 0.09;
  const upwardLift = 0.1;
  const swirl = 0.35;
  const jitter = 0.18;

  const mx = mouseX;
  const my = mouseY;

  for (let p of pts) {
    const sx = cx + p.x * scale;
    const sy = cy + p.y * scale;

    const dx = sx - mx;
    const dy = sy - my;
    const d = sqrt(dx * dx + dy * dy);
    if (d > affectRadius) continue;

    let k = 1 - d / affectRadius;
    k = k * k * (3 - 2 * k);

    const ang = atan2(dy, dx) + random(-jitter, jitter);
    const pow = random(burstMin, burstMax) * k;

    p.vx += cos(ang) * pow;
    p.vy += sin(ang) * pow - pow * upwardLift;

    // tangential swirl around mouse
    const inv = 1 / max(d, 1);
    const ux = dx * inv;
    const uy = dy * inv;
    p.vx += -uy * swirl * k;
    p.vy += ux * swirl * k;
  }
}

function updateParticles(cx, cy, scale, mx, my) {
  const damp = 0.92;
  const wander = 0.06;

  const smokeStrength = 0.42;
  const smokeScale = 0.018;
  const driftDrag = 0.985;

  const recoverFrames = 220;
  const baseSpring = 0.0085;

  const mouseRadius = 220;
  const mousePush = 6.0;
  const mouseSwirl = 4.0;

  // bubble boundary
  const R = 520;
  const PAD = 160;
  const K = 0.0013;

  const t = millis() * 0.00055;

  for (let p of pts) {
    // idle drift
    p.vx += (noise(p.hx * 0.02 + 10, p.hy * 0.02 + 20, t) - 0.5) * wander;
    p.vy += (noise(p.hx * 0.02 + 30, p.hy * 0.02 + 40, t) - 0.5) * wander;

    if (disperseTimer > 0) {
      // smoke curl field
      const n1 = noise(p.x * smokeScale + 10, p.y * smokeScale + 20, t);
      const n2 = noise(p.x * smokeScale + 40, p.y * smokeScale + 50, t);
      const vxField = n1 - 0.5;
      const vyField = n2 - 0.5;

      p.vx += -vyField * smokeStrength;
      p.vy += vxField * smokeStrength;

      // buoyancy
      p.vy -= 0.1;

      // extra mouse influence
      const sx = cx + p.x * scale;
      const sy = cy + p.y * scale;

      const dx = sx - mx;
      const dy = sy - my;
      const d = sqrt(dx * dx + dy * dy);

      if (d < mouseRadius) {
        let k = 1 - d / mouseRadius;
        k = k * k * (3 - 2 * k);

        const inv = 1 / max(d, 1);
        const ux = dx * inv;
        const uy = dy * inv;

        const invScale = 1 / max(scale, 0.0001);
        p.vx += ux * mousePush * k * invScale;
        p.vy += uy * mousePush * k * invScale;

        p.vx += -uy * mouseSwirl * k * invScale;
        p.vy += ux * mouseSwirl * k * invScale;
      }

      // gentle pull home during disperse
      p.vx += (p.hx - p.x) * 0.0015;
      p.vy += (p.hy - p.y) * 0.0015;

      p.vx *= driftDrag;
      p.vy *= driftDrag;
    } else {
      // slow return
      const u = constrain((recoverFrames - cooldown) / recoverFrames, 0, 1);
      const ease = u * u * (3 - 2 * u);
      const springNow = baseSpring * (0.2 + 0.8 * ease);

      p.vx += (p.hx - p.x) * springNow;
      p.vy += (p.hy - p.y) * springNow;

      p.vx *= 0.86;
      p.vy *= 0.86;
    }

    // integrate
    p.x += p.vx;
    p.y += p.vy;

    // bubble boundary
    const r = sqrt(p.x * p.x + p.y * p.y);
    const edge = R - PAD;

    if (r > edge) {
      let uu = (r - edge) / PAD;
      uu = constrain(uu, 0, 2);
      const s = uu * uu * (3 - 2 * uu);

      const ux = p.x / max(r, 0.0001);
      const uy = p.y / max(r, 0.0001);

      p.vx -= ux * K * s * (PAD * 2.0);
      p.vy -= uy * K * s * (PAD * 2.0);

      p.vx *= 0.97;
      p.vy *= 0.97;
    }

    if (r > R * 1.12) {
      const ux = p.x / max(r, 0.0001);
      const uy = p.y / max(r, 0.0001);
      p.x = ux * (R * 1.02);
      p.y = uy * (R * 1.02);
      p.vx *= 0.5;
      p.vy *= 0.5;
    }

    // damping
    p.vx *= damp;
    p.vy *= damp;
  }
}

function drawParticles(cx, cy, scale) {
  noStroke();
  blendMode(ADD);

  for (let p of pts) {
    const sx = cx + p.x * scale;
    const sy = cy + p.y * scale;

    const tw = 0.6 + 0.4 * sin(frameCount * p.tw + p.ph);
    const a = 90 + 130 * tw;

    fill(235, 245, 255, a);
    circle(sx, sy, p.sz * (0.9 + tw));

    fill(180, 140, 255, 14 * tw);
    circle(sx, sy, p.sz * 7.0);
  }

  blendMode(BLEND);
}

function windowResized() {
  const container = document.getElementById("contact");
  if (container) {
    resizeCanvas(container.offsetWidth, container.offsetHeight);
  } else {
    resizeCanvas(windowWidth, windowHeight);
  }

  // ✅ update visibility on resize too
  checkVisibility();
}
