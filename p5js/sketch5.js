const contactSketch5_BG = (p) => {
  let nodes = [];
  let stars = [];

  const numNodes = 90;
  const numStars = 110;
  const connectionDistance = 120;

  p.setup = () => {
    const section = document.getElementById("contact");
    const canvas = p.createCanvas(section.offsetWidth, section.offsetHeight);

    canvas.parent("contact-sketch");
    canvas.position(0, 0);
    canvas.style("z-index", "0");
    canvas.style("pointer-events", "none");

    p.noStroke();

    initStars();
    initNodes();
  };

  p.draw = () => {
    drawAnimatedGradient();
    drawStars();

    for (let i = 0; i < nodes.length; i++) {
      const n1 = nodes[i];

      // ✅ Ambient pulse only (no mouse hover)
      const pulse = p.sin(p.frameCount * 0.05 + i * 0.2) * 1.2 + 3;

      // ✅ Softer node
      p.noStroke();
      p.fill(255, 180);
      p.ellipse(n1.x, n1.y, pulse);

      // ✅ Connection lines (softer)
      for (let j = i + 1; j < nodes.length; j++) {
        const n2 = nodes[j];
        const d = p.dist(n1.x, n1.y, n2.x, n2.y);
        if (d < connectionDistance) {
          p.stroke(255, p.map(d, 0, connectionDistance, 120, 0));
          p.line(n1.x, n1.y, n2.x, n2.y);
        }
      }

      // Move & wrap nodes
      n1.x += n1.vx;
      n1.y += n1.vy;

      if (n1.x < 0) n1.x = p.width;
      if (n1.x > p.width) n1.x = 0;
      if (n1.y < 0) n1.y = p.height;
      if (n1.y > p.height) n1.y = 0;
    }
  };

  function drawAnimatedGradient() {
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

    for (let y = 0; y < p.height; y++) {
      const inter = p.map(y, 0, p.height, 0, 1);
      p.stroke(p.lerpColor(topColor, bottomColor, inter));
      p.line(0, y, p.width, y);
    }
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

  p.windowResized = () => {
    const section = document.getElementById("contact");
    p.resizeCanvas(section.offsetWidth, section.offsetHeight);

    initStars();
    initNodes(); // ✅ keeps the calm speed
  };
};

new p5(contactSketch5_BG);
