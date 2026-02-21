console.log("RUNNING sketch3.js");

const projectSketch = (p) => {
  let nodes = [];
  let stars = [];

  // ✅ responsive params (set in setup/resize)
  let numNodes = 100;
  let numStars = 120;
  let connectionDistance = 120;
  let hoverDistance = 80;
  let connectionDist2 = 120 * 120;
  let hoverDist2 = 80 * 80;

  // ✅ optional: cap connections per node (prevents dense web)
  let maxLinksPerNode = 6;

  // ✅ cached animated gradient
  let bg = null;
  let needsBg = true;
  const GRADIENT_EVERY = 3;

  // ✅ pause/resume
  let observer = null;
  let ready = false;

  function isMobile() {
    return window.innerWidth < 768;
  }

  function setResponsiveParams() {
    const minDim = Math.min(p.width, p.height);

    // ✅ counts (fewer on mobile)
    numNodes = isMobile() ? 55 : 100;
    numStars = isMobile() ? 70 : 120;

    // ✅ distances scale with canvas size (prevents “condensed web”)
    connectionDistance = minDim * (isMobile() ? 0.22 : 0.18);
    hoverDistance = minDim * (isMobile() ? 0.14 : 0.12);

    // ✅ squared distances for fast checks
    connectionDist2 = connectionDistance * connectionDistance;
    hoverDist2 = hoverDistance * hoverDistance;

    // ✅ limit links (lower on mobile)
    maxLinksPerNode = isMobile() ? 4 : 6;
  }

  function makeStars() {
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

  function makeNodes() {
    nodes = [];
    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: p.random(p.width),
        y: p.random(p.height),
        vx: p.random(-0.7, 0.7),
        vy: p.random(-0.7, 0.7),
      });
    }
  }

  // =========================
  // Cached animated gradient
  // =========================
  function buildAnimatedGradient() {
   if (!bg) bg = p.createGraphics(10, 10);
   if (bg.width !== p.width || bg.height !== p.height) bg.resizeCanvas(p.width, p.height);
   bg.pixelDensity(1);

    const t = p.millis() * 0.0002;
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

    for (let y = 0; y < bg.height; y++) {
      const inter = y / bg.height;
      bg.stroke(p.lerpColor(topColor, bottomColor, inter));
      bg.line(0, y, bg.width, y);
    }

    needsBg = false;
  }

  function drawAnimatedGradient() {
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

  p.setup = () => {
    const section = document.getElementById("projects");
    const holder = document.getElementById("projects-sketch");
    if (!section || !holder) return;

    const w = section.clientWidth || section.offsetWidth;
    const h = (section.clientHeight || section.offsetHeight) + 2;

    const canvas = p.createCanvas(w, h);
    canvas.parent("projects-sketch");
    canvas.position(0, 0);
    canvas.style("z-index", "0");
    canvas.style("position", "absolute");

    p.pixelDensity(1);
    p.frameRate(isMobile() ? 30 : 60);

    setResponsiveParams();
    makeStars();
    makeNodes();

    needsBg = true;

    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0].isIntersecting;
        if (visible) p.loop();
        else p.noLoop();
      },
      { threshold: 0.15 }
    );
    observer.observe(section);

    ready = true;
  };

  p.draw = () => {
    if (!ready) return;

    drawAnimatedGradient();
    drawStars();

    for (let i = 0; i < nodes.length; i++) {
      const n1 = nodes[i];

      // hover (squared distance)
      const dxm = p.mouseX - n1.x;
      const dym = p.mouseY - n1.y;
      const dMouse2 = dxm * dxm + dym * dym;
      const isHovered = dMouse2 < hoverDist2;
      const pulse = isHovered ? p.sin(p.frameCount * 0.3) * 3 + 4 : 3;

      if (isHovered) {
        p.noStroke();
        p.fill(255, 100);
        p.ellipse(n1.x, n1.y, pulse * 2.5);
      }

      p.noStroke();
      p.fill(255);
      p.ellipse(n1.x, n1.y, pulse);

      // ✅ cap number of links drawn from this node
      let links = 0;

      for (let j = i + 1; j < nodes.length; j++) {
        if (links >= maxLinksPerNode) break;

        const n2 = nodes[j];
        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const d2 = dx * dx + dy * dy;

        if (d2 < connectionDist2) {
          const d = Math.sqrt(d2); // only when close enough
          p.stroke(255, p.map(d, 0, connectionDistance, 255, 0));
          p.line(n1.x, n1.y, n2.x, n2.y);
          links++;
        }
      }

      // move & wrap
      n1.x += n1.vx;
      n1.y += n1.vy;
      if (n1.x < 0) n1.x = p.width;
      if (n1.x > p.width) n1.x = 0;
      if (n1.y < 0) n1.y = p.height;
      if (n1.y > p.height) n1.y = 0;
    }
  };

  p.windowResized = () => {
    const section = document.getElementById("projects");
    if (!section) return;

    const w = section.clientWidth || section.offsetWidth;
    const h = section.clientHeight || section.offsetHeight;

    p.resizeCanvas(w, h);

    setResponsiveParams();
    makeStars();
    makeNodes();

    needsBg = true;
  };
};

new p5(projectSketch);
