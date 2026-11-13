// Curved carousel: each demo is a rounded card bent onto the inside of a cylinder,
// seen from slightly behind its axis so the far cards flare toward the viewer.
// axis "x": cards stacked vertically (cylinder lying down); axis "y": side by side.
import * as THREE from "three";

const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

const vert = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const frag = `
uniform sampler2D map; uniform vec2 size; uniform vec2 cover; uniform float dim; uniform float glitch;
varying vec2 vUv;
float mask(vec2 v) {
  vec2 p = (v - .5) * size; float r = .045;
  vec2 q = abs(p) - (size * .5 - r);
  return 1. - smoothstep(-.003, .003, length(max(q, 0.)) + min(max(q.x, q.y), 0.) - r);
}
vec4 soft(vec2 uv, float rad) {
  if (rad < .0001) return texture2D(map, uv);
  vec4 c = vec4(0.); float tw = 0.;
  for (int i = 0; i < 16; i++) {
    float r = sqrt((float(i) + .5) / 16.), a = float(i) * 2.39996, w = 1. - r * .7;
    c += texture2D(map, uv + vec2(cos(a), sin(a) * size.x / size.y) * r * rad) * w; tw += w;
  }
  return c / tw;
}
void main() {
  // Cards around the focus: soft blur with the color channels slightly apart (chromatic aberration),
  // kept inside the card's own rounded frame
  vec2 uv = (vUv - .5) * cover + .5;
  vec2 sh = vec2(.005 * glitch, 0.) * cover;
  float rad = glitch * .003;
  vec3 col = vec3(soft(uv + sh, rad).r, soft(uv, rad).g, soft(uv - sh, rad).b) * dim;
  gl_FragColor = vec4(col, mask(vUv));
  #include <colorspace_fragment>
}`;

export function carousel(canvas, srcs, { axis = "x", R = 1.9, camZ = 1.5, fov = 33, gap = 0.26, auto = 0, onChange, onPick } = {}) {
  const W = 1.6, H = 1;
  const n0 = srcs.length;
  // Repeat short lists so the wrap-around happens off screen
  const list = [];
  while (list.length < 5) list.push(...srcs);
  const N = list.length;
  const step = ((axis === "x" ? H : W) + gap) / R;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 50);
  camera.position.z = camZ;

  const geo = new THREE.PlaneGeometry(W, H, 64, 64);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    if (axis === "x") { const a = y / R; pos.setXYZ(i, x, R * Math.sin(a), -R * Math.cos(a)); }
    else { const a = x / R; pos.setXYZ(i, R * Math.sin(a), y, -R * Math.cos(a)); }
  }

  const videos = new Map();
  const cards = list.map((src) => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: vert, fragmentShader: frag, transparent: true, side: THREE.DoubleSide,
      uniforms: { map: { value: null }, size: { value: new THREE.Vector2(W, H) }, cover: { value: new THREE.Vector2(1, 1) }, dim: { value: 1 }, glitch: { value: 0 } },
    });
    const fit = (w, h) => { const a = w / h, c = W / H; mat.uniforms.cover.value.set(a > c ? c / a : 1, a > c ? 1 : a / c); };
    if (/\.(webm|mp4)$/.test(src)) {
      // Repeated cards share one video and texture
      if (!videos.has(src)) {
        const v = Object.assign(document.createElement("video"), { src, muted: true, loop: true, playsInline: true, autoplay: true, crossOrigin: "anonymous" });
        v.play().catch(() => {});
        const t = new THREE.VideoTexture(v); t.colorSpace = THREE.SRGBColorSpace;
        videos.set(src, t);
      }
      const t = videos.get(src), v = t.image;
      if (v.videoWidth) fit(v.videoWidth, v.videoHeight); else v.addEventListener("loadedmetadata", () => fit(v.videoWidth, v.videoHeight));
      mat.uniforms.map.value = t;
    } else {
      mat.uniforms.map.value = new THREE.TextureLoader().load(src, (t) => fit(t.image.width, t.image.height));
      mat.uniforms.map.value.colorSpace = THREE.SRGBColorSpace;
    }
    const m = new THREE.Mesh(geo, mat);
    scene.add(m);
    return m;
  });

  let cur = 0, target = 0, active = -1;
  const mod = (a, b) => ((a % b) + b) % b;

  function layout() {
    cards.forEach((m, i) => {
      const off = mod(i - cur + N / 2, N) - N / 2;
      if (axis === "x") m.rotation.x = -off * step; else m.rotation.y = -off * step;
      const far = Math.min(Math.abs(off), 1);
      m.material.uniforms.dim.value = 1 - far * 0.4;
      m.material.uniforms.glitch.value = far;
    });
    const a = mod(Math.round(target), n0);
    if (a !== active) { active = a; onChange?.(a); }
  }

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Frame the centered card: vertical carousel keeps side margins on narrow canvases,
    // horizontal one makes the card about half the width (or 70% of the height)
    const deg = (share) => (2 * Math.atan(share / 2 / (R + camZ)) * 180) / Math.PI;
    camera.fov = axis === "x" ? Math.max(fov, deg(W / 0.84 / camera.aspect)) : Math.max(deg(W / (camera.aspect < 1.8 ? 0.74 : 0.56) / camera.aspect), deg(H / 0.82));
    camera.updateProjectionMatrix();
  }

  function frame() {
    cur += (target - cur) * (still ? 1 : 0.09);
    layout();
    renderer.render(scene, camera);
  }

  const go = (d) => { target = Math.round(target) + d; };

  // Wheel moves the carousel, one card per gesture (Shift + wheel works on the horizontal one)
  let acc = 0, lock = 0;
  canvas.addEventListener("wheel", (e) => {
    const sideways = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    // The vertical carousel only takes the wheel over its middle, so the page scrolls from its edges
    if (axis === "x") {
      const r = canvas.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
      if (nx < 0.1 || nx > 0.9 || ny < 0.22 || ny > 0.78) return;
    }
    // The horizontal carousel only takes sideways scrolling, so the page keeps scrolling past it
    if (axis === "y" && !sideways) return;
    e.preventDefault();
    if (performance.now() < lock) return;
    acc += sideways ? e.deltaX : e.deltaY;
    if (Math.abs(acc) > 30) { go(Math.sign(acc)); acc = 0; lock = performance.now() + 550; }
  }, { passive: false });

  // Drag along the carousel axis; a click without drag picks the centered card
  let down = null;
  canvas.addEventListener("pointerdown", (e) => { down = { x: e.clientX, y: e.clientY, t: target }; });
  addEventListener("pointermove", (e) => {
    if (!down) return;
    const d = axis === "x" ? (down.y - e.clientY) / canvas.clientHeight : (down.x - e.clientX) / canvas.clientWidth;
    target = down.t + d * 2.2;
  });
  addEventListener("pointerup", (e) => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    target = Math.round(target);
    if (moved < 6 && e.target === canvas) onPick?.(active);
    down = null;
  });
  addEventListener("pointercancel", () => { if (down) { target = Math.round(target); down = null; } });

  let hover = false;
  canvas.addEventListener("pointerenter", () => (hover = true));
  canvas.addEventListener("pointerleave", () => (hover = false));
  if (auto && !still) setInterval(() => { if (!hover && !down) go(1); }, auto);

  resize();
  frame();
  new ResizeObserver(() => { resize(); frame(); }).observe(canvas);
  new IntersectionObserver(([e]) => renderer.setAnimationLoop(e.isIntersecting ? frame : null)).observe(canvas);

  return { go };
}
