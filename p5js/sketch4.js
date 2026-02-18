const contactSketch = (p) => {
  let nodes = [];
  let stars = [];
  const numNodes = 100;
  const numStars = 120;
  const connectionDistance = 120;
  const hoverDistance = 80;

  p.setup = () => {
    const section = document.getElementById("projects-2");
    const holder  = document.getElementById("projects-2-sketch");
    let canvas = p.createCanvas(section.offsetWidth, section.offsetHeight +1);
    canvas.parent(section);
    canvas.position(0, 0);
    canvas.style('z-index', '-0');
    canvas.style('position', 'absolute');
    canvas.style('pointer-events', 'none');
    p.noStroke();

 // Create stars
 for (let i = 0; i < numStars; i++) {
  stars.push({
    x: p.random(p.width),
    y: p.random(p.height),
    size: p.random(1, 2.5),
    speed: p.random(0.1, 0.3),
    brightness: p.random(100, 255)
  });
}

// Create nodes
for (let i = 0; i < numNodes; i++) {
  nodes.push({
    x: p.random(p.width),
    y: p.random(p.height),
    vx: p.random(-0.7, 0.7),
    vy: p.random(-0.7, 0.7)
  });
}
};

p.draw = () => {
drawAnimatedGradient();
drawStars();

for (let i = 0; i < nodes.length; i++) {
  let n1 = nodes[i];

  let dMouse = p.dist(p.mouseX, p.mouseY, n1.x, n1.y);
  let isHovered = dMouse < hoverDistance;
  let pulse = isHovered ? p.sin(p.frameCount * 0.3) * 3 + 4 : 3;

  if (isHovered) {
    p.fill(255, 100);
    p.ellipse(n1.x, n1.y, pulse * 2.5);
  }

  p.fill(255);
  p.ellipse(n1.x, n1.y, pulse);

  for (let j = i + 1; j < nodes.length; j++) {
    let n2 = nodes[j];
    let d = p.dist(n1.x, n1.y, n2.x, n2.y);
    if (d < connectionDistance) {
      p.stroke(255, p.map(d, 0, connectionDistance, 255, 0));
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
let t = p.millis() * 0.0002;
let topColor = p.lerpColor(p.color(10, 0, 30), p.color(60, 0, 80), (p.cos(t) + 1) / 2);
let bottomColor = p.lerpColor(p.color(30, 0, 60), p.color(80, 0, 120), (p.sin(t) + 1) / 2);

for (let y = 0; y < p.height; y++) {
  let inter = p.map(y, 0, p.height, 0, 1);
  p.stroke(p.lerpColor(topColor, bottomColor, inter));
  p.line(0, y, p.width, y);
}
}

function drawStars() {
for (let s of stars) {
  let twinkle = p.sin(p.frameCount * 0.02 + s.y * 0.05) * 50;
  p.fill(255, 255, 255, s.brightness + twinkle);
  p.noStroke();
  p.ellipse(s.x, s.y, s.size);

  s.x -= s.speed;
  if (s.x < -10) {
    s.x = p.width + 10;
    s.y = p.random(p.height);
  }
}
}

  p.windowResized = () => {
    const section = document.getElementById('contact');
    p.resizeCanvas(section.offsetWidth, section.offsetHeight);

        // Reset stars
        stars = [];
        for (let i = 0; i < numStars; i++) {
          stars.push({
            x: p.random(p.width),
            y: p.random(p.height),
            size: p.random(1, 2.5),
            speed: p.random(0.1, 0.3),
            brightness: p.random(100, 255)
          });
        }
    
        // Reset nodes
        nodes = [];
        for (let i = 0; i < numNodes; i++) {
          nodes.push({
            x: p.random(p.width),
            y: p.random(p.height),
            vx: p.random(-0.7, 0.7),
            vy: p.random(-0.7, 0.7)
          });
        }
  };
};

new p5(contactSketch);