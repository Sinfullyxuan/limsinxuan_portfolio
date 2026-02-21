console.log("RUNNING sketch5.js");

const contactSketch5_BG = (p) => {
  let nodes = [];
  let stars = [];

  // ✅ responsive values (adjusted in setup/resize)
  let numNodes = 90;
  let numStars = 110;
  let connectionDistance = 120;
  let connectionDist2 = 120 * 120;

  // ✅ cached animated gradient (FIXED: no canvas leak)
  let bg = null;
  let needsBg = true;
  const GRADIENT_EVERY = 3;

  let ready = false;

  function isMobile() {
    return window.innerWidth < 768;
  }

  function setResponsiveParams() {
    const minDim = Math.min(p.width, p.height);

    numNodes = isMobile() ? 55 : 90;
    numStars = isMobile() ? 70 : 110;

    connectionDistance = minDim * (isMobile() ? 0.22 : 0.18);
    connectionDist2 = connectionDistance * connectionDistance;
  }

  // =========================
  // Cached animated gradient (FIXED)
  // =========================
  function buildAnimatedGradient() {
    // ✅ create ONCE
    if (!bg) bg = p.createGraphics(10, 10);

    // ✅ resize only when needed
    if (bg.width !== p.width || bg.height !== p.height) {
      bg.resizeCanvas(p.width, p.height);
    }

    bg.pixelDensity(1);

    const t = p.millis() * 0.0002; // same time source as sketch3
    const topColor = p.lerpColor(
      p.color(30, 0, 60),
      p.color(80, 0, 120),
      (p.sin(t) + 1) / 2
    );
    const bottomColor = p.lerpColor(
      p.color(10, 0, 30),
      p.color(60, 0, 80),
      (p.cos(t) + 1) / 2
    );

    // ✅ fully repaint buffer (prevents leftover/alpha artifacts)
    bg.background(topColor);

    for (let y = 0; y < bg.height; y++) {
      const inter = bg.height <= 1 ? 0 : y / (bg.height - 1);
      bg.stroke(p.lerpColor(topColor, bottomColor, inter));
      bg.line(0, y, bg.width, y);
    }

    needsBg = false;
  }

  function drawAnimatedGradient() {
    // ✅ only rebuild occasionally (but without creating new canvases)
    if (
      needsBg ||
      !bg ||
      bg.width !== p.width ||
      bg.height !== p.height ||
      p.frameCount % GRADIENT_EVERY === 0
    ) {
      buildAnimatedGradient();
    }
    p.image(bg, 0, 0);
  }

  // =========================
  // Stars
  // =========================
  function drawStars() {
    p.noStroke();
    for (let s of stars) {
      const twinkle = p.sin(p.frameCount * 0.02 + s.y * 0.05) * 50;
      p.fill(255, 255, 255, s.brightness + twinkle);
      p.ellipse(s.x, s.y, s.size);

      s.x -= s.speed;
      if (s.x < -10) {
        s.x = p.width + 10;
        s.y = p.random(p.height);
      }
    }
  }

  function initStars() {
    stars = [];
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: p.random(p.width),
        y: p.random(p.height),
        size: p.random(1, 2.5),
        speed: p.random(0.1, 0.3),
        brightness: p.random(100, 255),
      });
    }
  }

  // =========================
  // Nodes
  // =========================
  function initNodes() {
    nodes = [];
    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: p.random(p.width),
        y: p.random(p.height),
        vx: p.random(-0.4, 0.4),
        vy: p.random(-0.4, 0.4),
      });
    }
  }

  p.setup = () => {
    const section = document.getElementById("contact");
    const holder = document.getElementById("contact-sketch");
    if (!section || !holder) return;

    const w = section.clientWidth || section.offsetWidth;
    const h = section.clientHeight || section.offsetHeight;

    const canvas = p.createCanvas(w, h);

    // ✅ parent using element reference (more reliable)
    holder.innerHTML = ""; // prevents accidental stacking
    canvas.parent(holder);

    canvas.position(0, 0);
    canvas.style("z-index", "0");
    canvas.style("position", "absolute");
    canvas.style("pointer-events", "none");

    p.pixelDensity(1);
    p.frameRate(isMobile() ? 30 : 60);

    setResponsiveParams();
    initStars();
    initNodes();

    needsBg = true;
    buildAnimatedGradient(); // build once at start
    ready = true;
  };

  p.draw = () => {
    if (!ready) return;

    // ✅ opaque base reduces any flash/compositing weirdness
    p.background(9, 0, 18);

    drawAnimatedGradient();
    drawStars();

    for (let i = 0; i < nodes.length; i++) {
      const n1 = nodes[i];

      const pulse = p.sin(p.frameCount * 0.05 + i * 0.2) * 1.2 + 3;

      p.noStroke();
      p.fill(255, 180);
      p.ellipse(n1.x, n1.y, pulse);

      for (let j = i + 1; j < nodes.length; j++) {
        const n2 = nodes[j];

        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const d2 = dx * dx + dy * dy;

        if (d2 < connectionDist2) {
          const d = Math.sqrt(d2);
          p.stroke(255, p.map(d, 0, connectionDistance, 120, 0));
          p.line(n1.x, n1.y, n2.x, n2.y);
        }
      }

      n1.x += n1.vx;
      n1.y += n1.vy;

      if (n1.x < 0) n1.x = p.width;
      if (n1.x > p.width) n1.x = 0;
      if (n1.y < 0) n1.y = p.height;
      if (n1.y > p.height) n1.y = 0;
    }
  };

  p.windowResized = () => {
    const section = document.getElementById("contact");
    if (!section) return;

    const w = section.clientWidth || section.offsetWidth;
    const h = section.clientHeight || section.offsetHeight;

    p.resizeCanvas(w, h);
    p.pixelDensity(1);

    setResponsiveParams();
    initStars();
    initNodes();

    needsBg = true; // rebuild gradient once for new size
  };
};

// ✅ guard against double-init
if (window.__p5Sketch5) window.__p5Sketch5.remove();
window.__p5Sketch5 = new p5(contactSketch5_BG);