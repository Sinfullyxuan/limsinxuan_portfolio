const homeSketch = (p) => {
  let stars = [];
  let shootingStars = [];
  let cursorStars = [];
  let starColors = [];
  let ready = false;

  // ✅ cached gradient buffer
  let bg = null;
  let needsBg = true;

  // ✅ IntersectionObserver
  let observer = null;

  // ✅ smooth cursor tracking
  let lastMX = 0,
    lastMY = 0;
  let hasMouse = false;

  // ✅ mobile detection
  function isMobile() {
    return window.innerWidth < 768;
  }

  // =========================
  // Gradient caching
  // =========================
  function buildGradient() {
    bg = p.createGraphics(p.width, p.height);
    bg.pixelDensity(1);

    const topColor = p.color(9, 0, 18);
    const bottomColor = p.color(20, 0, 40);

    bg.noFill();
    for (let i = 0; i <= bg.height; i++) {
      const inter = p.map(i, 0, bg.height, 0, 1);
      bg.stroke(p.lerpColor(topColor, bottomColor, inter));
      bg.line(0, i, bg.width, i);
    }

    needsBg = false;
  }

  function drawGradient() {
    if (!bg || needsBg || bg.width !== p.width || bg.height !== p.height) {
      buildGradient();
    }
    p.image(bg, 0, 0);
  }

  // =========================
  // Stars
  // =========================
  function generateStars() {
    stars = [];

    // fewer stars on mobile
    const count = isMobile() ? 120 : 300;

    for (let i = 0; i < count; i++) {
      stars.push(new Star(p.random(p.width), p.random(p.height)));
    }
  }

  // =========================
  // p5 lifecycle
  // =========================
  p.setup = () => {
    const homeSection = document.getElementById("home");
    const holder = document.getElementById("p5-sketch");

    if (!homeSection || !holder) {
      console.warn("#home or #p5-sketch not found.");
      return;
    }

    const w = homeSection.clientWidth || homeSection.offsetWidth;
    const h = homeSection.clientHeight || homeSection.offsetHeight;

    const canvas = p.createCanvas(w, h);
    canvas.parent("p5-sketch");
    canvas.position(0, 0);
    canvas.style("z-index", "0");
    canvas.style("position", "absolute");

    // ✅ perf
    p.pixelDensity(1);
    p.frameRate(isMobile() ? 30 : 60); // ✅ smoother on desktop

    // colors BEFORE generating anything
    starColors = [
      p.color(255, 255, 255),
      p.color(255, 204, 228),
      p.color(204, 252, 255),
    ];

    // ✅ build cached gradient once
    needsBg = true;
    buildGradient();

    generateStars();

    ready = true;

    // ✅ initialize cursor tracking so first move doesn't "jump"
    lastMX = p.mouseX;
    lastMY = p.mouseY;

    // ✅ Pause / resume when section leaves viewport
    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0].isIntersecting;
        if (visible) p.loop();
        else p.noLoop();
      },
      { threshold: 0.15 }
    );

    observer.observe(homeSection);
  };

  p.draw = () => {
    if (!ready) return;

    drawGradient();

    for (let star of stars) {
      star.update();
      star.show();
    }

    // ✅ lower shooting star chance on mobile
    const shootChance = isMobile() ? 0.004 : 0.01;
    if (p.random() < shootChance) {
      shootingStars.push(new ShootingStar());
    }

    // ✅ cap so it never grows too much during lag spikes
    if (shootingStars.length > 6) shootingStars.shift();

    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.update();
      s.show();
      if (s.isFaded()) shootingStars.splice(i, 1);
    }

    // ✅ Smooth cursor spawning HERE (not in mouseMoved)
    if (!isMobile() && hasMouse) {
      const dx = p.mouseX - lastMX;
      const dy = p.mouseY - lastMY;
      const dist = Math.hypot(dx, dy);

      // smaller step = more stars = smoother (but heavier)
      const step = 6;
      const count = Math.min(10, Math.ceil(dist / step));

      for (let i = 0; i < count; i++) {
        const t = count === 1 ? 1 : i / (count - 1);
        const x = p.lerp(lastMX, p.mouseX, t) + p.random(-3, 3);
        const y = p.lerp(lastMY, p.mouseY, t) + p.random(-3, 3);
        cursorStars.push(new CursorStar(x, y));
      }

      lastMX = p.mouseX;
      lastMY = p.mouseY;

      if (cursorStars.length > 220) {
        cursorStars.splice(0, cursorStars.length - 220);
      }
    }

    for (let i = cursorStars.length - 1; i >= 0; i--) {
      const cs = cursorStars[i];
      cs.update();
      cs.show();
      if (cs.isFaded()) cursorStars.splice(i, 1);
    }
  };

  p.windowResized = () => {
    const homeSection = document.getElementById("home");
    if (!homeSection) return;

    const oldWidth = p.width;
    const oldHeight = p.height;

    const w = homeSection.clientWidth || homeSection.offsetWidth;
    const h = homeSection.clientHeight || homeSection.offsetHeight;

    p.resizeCanvas(w, h);

    // ✅ rebuild gradient next draw
    needsBg = true;

    // avoid divide by zero
    if (oldWidth === 0 || oldHeight === 0) {
      generateStars();
      return;
    }

    const widthRatio = p.width / oldWidth;
    const heightRatio = p.height / oldHeight;

    for (let star of stars) {
      star.x *= widthRatio;
      star.y *= heightRatio;
    }

    // optional: re-gen star count for breakpoint changes
    generateStars();
  };

  // ✅ mouseMoved now only records positions (stable)
  p.mouseMoved = () => {
    if (isMobile() || !ready) return;

    if (!hasMouse) {
      lastMX = p.mouseX;
      lastMY = p.mouseY;
      hasMouse = true;
      return;
    }

    hasMouse = true;
  };

  // cleanup (optional)
  p.removeObserver = () => {
    if (observer) observer.disconnect();
    observer = null;
  };

  // =========================
  // Classes
  // =========================
  class Star {
    constructor(x, y) {
      this.x = x;
      this.y = y;

      this.size = p.random(1, 3);
      this.isBig = p.random() < 0.2;
      if (this.isBig) this.size = p.random(2, 5);

      this.brightness = p.random(100, 205);
      this.blinkSpeed = p.random(0.02, 0.05);
      this.noiseOffset = p.random(10);

      this.color =
        Array.isArray(starColors) && starColors.length
          ? p.random(starColors)
          : p.color(255);
    }

    update() {
      const twinkle = p.noise(this.noiseOffset + p.frameCount * 0.1);
      this.brightness = p.map(twinkle, 0, 1, 100, 205);

      if (this.isBig) {
        this.brightness = 100 + p.sin(p.frameCount * this.blinkSpeed) * 100;
      }
    }

    show() {
      p.push();
      p.noStroke();

      if (!(this.color && this.color.levels)) this.color = p.color(255);

      if (this.isBig) {
        p.drawingContext.shadowBlur = this.size;
        p.drawingContext.shadowColor = p.color(
          p.red(this.color),
          p.green(this.color),
          p.blue(this.color),
          this.brightness
        );
      } else {
        p.drawingContext.shadowBlur = 0;
      }

      p.fill(
        p.red(this.color),
        p.green(this.color),
        p.blue(this.color),
        this.brightness
      );
      p.ellipse(this.x, this.y, this.size);
      p.pop();
    }
  }

  class ShootingStar {
    constructor() {
      this.x = p.random(p.width);
      this.y = p.random(p.height / 2);
      this.speedX = p.random(5, 10);
      this.speedY = p.random(3, 7);
      this.alpha = 255;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.alpha -= 5;
    }

    show() {
      p.stroke(255, this.alpha);
      p.strokeWeight(2);
      p.line(
        this.x,
        this.y,
        this.x - this.speedX * 5,
        this.y - this.speedY * 5
      );
    }

    isFaded() {
      return this.alpha <= 0;
    }
  }

  class CursorStar {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = p.random(1, 4);

      this.color =
        Array.isArray(starColors) && starColors.length
          ? p.random(starColors)
          : p.color(255);

      this.velocityX = p.random(-1, 1);
      this.velocityY = p.random(-1, 1);
      this.alpha = 205;
    }

    update() {
      this.x += this.velocityX;
      this.y += this.velocityY;
      this.alpha -= 2; // ✅ slower fade = smoother trail
    }

    show() {
      p.noStroke();

      if (!(this.color && this.color.levels)) this.color = p.color(255);

      p.fill(
        p.red(this.color),
        p.green(this.color),
        p.blue(this.color),
        this.alpha
      );
      p.ellipse(this.x, this.y, this.size);
    }

    isFaded() {
      return this.alpha <= 2;
    }
  }
};

// Initialize the home sketch
new p5(homeSketch);
