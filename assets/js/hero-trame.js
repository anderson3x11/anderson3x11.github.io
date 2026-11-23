// Hero: the chrome star rendered in 3D into a tiny buffer, each cell redrawn as a dot sized by its light
// (a halftone), over a faint dotted field that thickens behind the name and ripples around the pointer.
// Loaded only when the animation is on; start(canvas) returns stop().
import * as THREE from "three";

const phone = matchMedia("(max-width: 860px)").matches;
const CELL = phone ? 15 : 13;    // larger dots on phones: fewer cells to draw
const FPS = phone ? 30 : 40;

function starGeometry() {
  const s = new THREE.Shape();
  const p = (x, y) => [(x - 50) / 42, (150 - y) / 42];
  s.moveTo(...p(50, 0));
  s.bezierCurveTo(...p(53, 105), ...p(59, 141), ...p(100, 150));
  s.bezierCurveTo(...p(59, 159), ...p(53, 195), ...p(50, 300));
  s.bezierCurveTo(...p(47, 195), ...p(41, 159), ...p(0, 150));
  s.bezierCurveTo(...p(41, 141), ...p(47, 105), ...p(50, 0));
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.7, bevelEnabled: true, bevelThickness: 0.16, bevelSize: 0.07, bevelSegments: 10, curveSegments: 80 });
  g.center();
  return g;
}

export function start(canvas) {
  const ctx = canvas.getContext("2d");
  // transparent render: alpha tells which cells the star covers
  const gl = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, alpha: true });
  gl.setClearColor(0x000000, 0);
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.z = phone ? 19 : 17.5;

  // Black studio with bright strips: on chrome, the reflections become bands of dots
  const studio = new THREE.Scene();
  const panel = (w, h, x, y, z, ry, rx, k) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k, k), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.rotation.y = ry; m.rotation.x = rx; studio.add(m);
  };
  panel(1.2, 14, -6, 0, 3, Math.PI / 2.6, 0, 8);
  panel(1.2, 14, 6, 0, 2, -Math.PI / 2.6, 0, 6);
  panel(10, 2, 0, 7, 2, 0, Math.PI / 2, 4);
  panel(4, 4, 2, -2, 8, Math.PI, 0, 2.5);
  panel(16, 1, 0, -6, -4, 0, -Math.PI / 3, 3);
  for (const [y, k] of [[-3.2, 5], [-1.1, 3], [0.9, 7], [2.8, 4], [4.4, 6]]) panel(16, 0.28, 0, y, 7, Math.PI, 0, k);
  const pmrem = new THREE.PMREMGenerator(gl);
  scene.environment = pmrem.fromScene(studio, 0.02).texture;

  const star = new THREE.Mesh(starGeometry(), new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03 }));
  const tilt = new THREE.Group();
  tilt.rotation.z = -0.22;
  tilt.add(star);
  scene.add(tilt);

  let cols = 0, rows = 0, step = 0, buf = null, cov = null;
  const read = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const mouse = { x: -1e4, y: -1e4 };
  const onMove = (e) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
  if (!phone) addEventListener("pointermove", onMove);

  function resize() {
    const dpr = Math.min(devicePixelRatio, 1.5);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    step = CELL * 0.62;
    cols = Math.floor(w / step); rows = Math.floor(h / step);
    gl.setSize(cols, rows, false);
    read.canvas.width = cols; read.canvas.height = rows;
    camera.aspect = cols / rows;
    camera.updateProjectionMatrix();
    buf = new Float32Array(cols * rows);
    cov = new Uint8Array(cols * rows);
  }

  const hash = (x, y) => { const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return h - Math.floor(h); };
  function field(x, y, t) {
    const r = hash(x, y);
    const g = Math.max(0, (y / rows - 0.5) / 0.5);  // thickens toward the bottom, behind the name
    let v = g * g * 0.45 * (0.7 + 0.3 * Math.sin(t * 0.8 + x * 0.12));
    if (r > 0.985) v = Math.max(v, 0.3 + 0.25 * Math.sin(t * 2 + r * 60));  // a few dots twinkle
    const d = Math.hypot(x * step - mouse.x, y * step - mouse.y);
    if (d < 220) v = Math.max(v, (1 - d / 220) * (0.5 + 0.5 * Math.sin(d * 0.07 - t * 5)) * 0.75);
    return v;
  }

  function draw(t) {
    gl.render(scene, camera);
    // empty the copy first, or the old transparent frames show through as ghosts
    read.clearRect(0, 0, cols, rows);
    read.drawImage(gl.domElement, 0, 0);
    const px = read.getImageData(0, 0, cols, rows).data;
    for (let i = 0; i < buf.length; i++) { buf[i] = px[i * 4] / 255; cov[i] = px[i * 4 + 3] > 128 ? 1 : 0; }
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    const fg = new Path2D(), bg = new Path2D(), half = step / 2;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const i = y * cols + x, cx = x * step + half, cy = y * step + half;
      if (cov[i]) {
        // covered cells keep a small dot so the silhouette reads; light makes it grow
        const r = half * Math.min(1, 0.16 + buf[i] * 0.72);
        fg.moveTo(cx + r, cy); fg.arc(cx, cy, r, 0, 6.283);
      } else {
        const a = field(x, y, t);
        if (a > 0.06) { const r = half * a * 0.85; bg.moveTo(cx + r, cy); bg.arc(cx, cy, r, 0, 6.283); }
      }
    }
    ctx.fillStyle = "rgba(242, 239, 230, .22)"; ctx.fill(bg);
    ctx.fillStyle = "#f2efe6"; ctx.fill(fg);
  }

  let raf = 0, last = 0, visible = true;
  const loop = (now) => {
    raf = requestAnimationFrame(loop);
    if (!visible || now - last < 1000 / FPS) return;
    last = now;
    const t = now / 1000;
    star.rotation.y = 0.6 + t * 0.6;
    star.rotation.x = Math.sin(t * 0.6) * 0.08;
    draw(t);
  };
  resize();
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting)); io.observe(canvas);
  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect(); io.disconnect();
    removeEventListener("pointermove", onMove);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pmrem.dispose(); gl.dispose();
  };
}
