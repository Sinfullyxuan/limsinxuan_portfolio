console.log("RUNNING sketch2.js");

const aboutSketch = (p) => {
  let stars = [];
  let shootingStars = [];
  let cursorStars = [];
  let starColors = [];
  let ready = false;

  let bg;
  let needsBg = true;

  let observer = null;
  let isRunning = true;

  function isMobile() {
    return window.innerWidth < 768;
  }

function buildGradient() {
  if (!bg) bg = p.createGraphics(10, 10);
  if (bg.width !== p.width || bg.height !== p.height) bg.resizeCanvas(p.width, p.height);
  bg.pixelDensity(1);

  const topColor = p.color(20, 0, 40);
  const bottomColor = p.color(80, 0, 120);

  // ✅ fully repaint buffer (prevents washed-out / leftover artifacts)
  bg.background(topColor);

  for (let y = 0; y < bg.height; y++) {
    const inter = y / (bg.height - 1);
    bg.stroke(p.lerpColor(topColor, bottomColor, inter));
    bg.line(0, y, bg.width, y);
  }

  needsBg = false;
}

  function drawGradient() {
    if (needsBg || !bg) buildGradient();
    p.image(bg, 0, 0);
  }

  function generateStars() {
    stars = [];
    const count = isMobile() ? 120 : 300;
    for (let i = 0; i < count; i++) stars.push(new Star(p.random(p.width), p.random(p.height)));
  }

  p.setup = () => {
    const aboutSection = document.getElementById("about");
    const holder = document.getElementById("about-sketch");
    if (!aboutSection || !holder) return;

    const w = aboutSection.clientWidth || aboutSection.offsetWidth;
    const h = aboutSection.clientHeight || aboutSection.offsetHeight;

    const canvas = p.createCanvas(w, h);
    holder.innerHTML = "";     // prevents rare stacking
    canvas.parent(holder);
    canvas.position(0, 0);
    canvas.style("z-index", "0");
    canvas.style("position", "absolute");
    canvas.style("pointer-events", "none");

    p.pixelDensity(1);
    p.frameRate(30);

    starColors = [
      p.color(255, 255, 255),
      p.color(255, 204, 228),
      p.color(204, 252, 255),
    ];

    needsBg = true;
    buildGradient();
    generateStars();

    ready = true;

    observer = new IntersectionObserver(
      ([entry]) => {
        const shouldRun = entry.isIntersecting;
        if (shouldRun && !isRunning) { isRunning = true; p.loop(); }
        else if (!shouldRun && isRunning) { isRunning = false; p.noLoop(); }
      },
      { threshold: 0.25, rootMargin: "200px 0px" }
    );
    observer.observe(aboutSection);

    
  };

  p.draw = () => {
    if (!ready) return;

    p.background(20, 0, 40); // ✅ solid base so it never looks faded
    drawGradient();

    for (let star of stars) { star.update(); star.show(); }

    const shootChance = isMobile() ? 0.004 : 0.01;
    if (p.random() < shootChance) shootingStars.push(new ShootingStar());
    if (shootingStars.length > 6) shootingStars.shift();

    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.update(); s.show();
      if (s.isFaded()) shootingStars.splice(i, 1);
    }

    for (let i = cursorStars.length - 1; i >= 0; i--) {
      const cs = cursorStars[i];
      cs.update(); cs.show();
      if (cs.isFaded()) cursorStars.splice(i, 1);
    }
  };

  p.windowResized = () => {
    const aboutSection = document.getElementById("about");
    if (!aboutSection) return;

    const w = aboutSection.clientWidth || aboutSection.offsetWidth;
    const h = aboutSection.clientHeight || aboutSection.offsetHeight;

    p.resizeCanvas(w, h);
    needsBg = true;
    buildGradient();
    generateStars();
  };

  p.mouseMoved = () => {
    if (!ready || isMobile()) return;
    cursorStars.push(new CursorStar(p.mouseX, p.mouseY));
    if (cursorStars.length > 100) cursorStars.splice(0, cursorStars.length - 100);
  };

    // p.mouseMoved = () => {
  //   if (isMobile() || !ready) return;

  //   // keep your “more stars”
  //   for (let i = 0; i < 3; i++) {
  //     cursorStars.push(new CursorStar(p.mouseX + p.random(-4, 4), p.mouseY + p.random(-4, 4)));
  //   }
  //   if (cursorStars.length > 200) cursorStars.splice(0, cursorStars.length - 200);
  // };

  class Star {
    constructor(x, y) {
      this.x = x; this.y = y;
      this.size = p.random(1, 3);
      this.isBig = p.random() < 0.2;
      if (this.isBig) this.size = p.random(2, 5);
      this.brightness = p.random(100, 205);
      this.blinkSpeed = p.random(0.02, 0.05);
      this.noiseOffset = p.random(10);
      this.color = starColors.length ? p.random(starColors) : p.color(255);
    }
    update() {
      const twinkle = p.noise(this.noiseOffset + p.frameCount * 0.1);
      this.brightness = p.map(twinkle, 0, 1, 100, 205);
      if (this.isBig) this.brightness = 100 + p.sin(p.frameCount * this.blinkSpeed) * 100;
    }
    show() {
      p.noStroke();
      if (this.isBig) {
        p.drawingContext.shadowBlur = this.size;
        p.drawingContext.shadowColor = p.color(p.red(this.color), p.green(this.color), p.blue(this.color), this.brightness);
      } else {
        p.drawingContext.shadowBlur = 0;
      }
      p.fill(p.red(this.color), p.green(this.color), p.blue(this.color), this.brightness);
      p.ellipse(this.x, this.y, this.size);
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
    update() { this.x += this.speedX; this.y += this.speedY; this.alpha -= 5; }
    show() {
      p.stroke(255, this.alpha);
      p.strokeWeight(2);
      p.line(this.x, this.y, this.x - this.speedX * 5, this.y - this.speedY * 5);
    }
    isFaded() { return this.alpha <= 0; }
  }

  class CursorStar {
    constructor(x, y) {
      this.x = x; this.y = y;
      this.size = p.random(1, 4);
      this.color = starColors.length ? p.random(starColors) : p.color(255);
      this.vx = p.random(-1, 1);
      this.vy = p.random(-1, 1);
      this.alpha = 205;
    }
    update() { this.x += this.vx; this.y += this.vy; this.alpha -= 3; }
    show() {
      p.noStroke();
      p.fill(p.red(this.color), p.green(this.color), p.blue(this.color), this.alpha);
      p.ellipse(this.x, this.y, this.size);
    }
    isFaded() { return this.alpha <= 3; }
  }
};

new p5(aboutSketch);