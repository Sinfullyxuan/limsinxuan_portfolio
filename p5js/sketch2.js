const aboutSketch = (p) => {
  let stars = [];
  let shootingStars = [];
  let cursorStars = [];
  let starColors = [];
  let ready = false;

  function isMobile() {
    return window.innerWidth < 768;
  }

  p.setup = () => {
    const aboutSection = document.getElementById("about");
    if (!aboutSection) {
      console.warn("#about section not found.");
      return;
    }

    const canvas = p.createCanvas(aboutSection.offsetWidth, aboutSection.offsetHeight);
    canvas.parent("about-sketch");
    canvas.position(0, 0);
    canvas.style("z-index", "0");
    canvas.style("position", "absolute");

    // define colors first
    starColors = [
      p.color(255, 255, 255),
      p.color(255, 204, 228),
      p.color(204, 252, 255),
    ];

    generateStars();
    ready = true;

    // optional: reduce FPS on mobile
    if (isMobile()) p.frameRate(30);
  };

  p.draw = () => {
    if (!ready) return;

    drawGradient();

    for (let star of stars) {
      star.update();
      star.show();
    }

    // shooting stars (lower chance on mobile)
    const shootChance = isMobile() ? 0.004 : 0.01;
    if (p.random() < shootChance) {
      shootingStars.push(new ShootingStar());
    }

    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.update();
      s.show();
      if (s.isFaded()) shootingStars.splice(i, 1);
    }

    for (let i = cursorStars.length - 1; i >= 0; i--) {
      const cs = cursorStars[i];
      cs.update();
      cs.show();
      if (cs.isFaded()) cursorStars.splice(i, 1);
    }
  };

  function drawGradient() {
    const topColor = p.color(20, 0, 40);
    const bottomColor = p.color(80, 0, 120);
    setGradient(0, 0, p.width, p.height, topColor, bottomColor);
  }

  function setGradient(x, y, w, h, c1, c2) {
    p.noFill();
    for (let i = y; i <= y + h; i++) {
      const inter = p.map(i, y, y + h, 0, 1);
      p.stroke(p.lerpColor(c1, c2, inter));
      p.line(x, i, x + w, i);
    }
  }

  function generateStars() {
    stars = [];

    // optional: fewer stars on mobile
    const count = isMobile() ? 120 : 300;

    for (let i = 0; i < count; i++) {
      stars.push(new Star(p.random(p.width), p.random(p.height)));
    }
  }

  p.windowResized = () => {
    const aboutSection = document.getElementById("about");
    if (!aboutSection) return;

    const oldWidth = p.width;
    const oldHeight = p.height;

    p.resizeCanvas(aboutSection.offsetWidth, aboutSection.offsetHeight);

    // if canvas was 0, just regenerate
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

    // optional: re-gen to adapt star count across breakpoints
    generateStars();
  };

  // cursor stars (disabled on mobile like sketch 1)
  p.mouseMoved = () => {
    if (!ready || isMobile()) return;

    cursorStars.push(new CursorStar(p.mouseX, p.mouseY));

    if (cursorStars.length > 100) {
      cursorStars.splice(0, cursorStars.length - 100);
    }
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
      p.line(this.x, this.y, this.x - this.speedX * 5, this.y - this.speedY * 5);
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
      this.brightness = p.random(108, 205);

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
      this.alpha -= 3;
    }

    show() {
      p.noStroke();

      if (!(this.color && this.color.levels)) this.color = p.color(255);

      p.fill(p.red(this.color), p.green(this.color), p.blue(this.color), this.alpha);
      p.ellipse(this.x, this.y, this.size);
    }

    isFaded() {
      return this.alpha <= 3;
    }
  }
};

// ✅ Initialize sketch 2
new p5(aboutSketch);
