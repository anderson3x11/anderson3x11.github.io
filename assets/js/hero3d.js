// Home hero: a few flat-shaded geometric objects floating and spinning.
// Stops rendering when off screen, and draws a single still frame
// when the visitor prefers reduced motion.
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js";

const canvas = document.querySelector(".hero-3d");
const RED = 0xd41515;
// [ink, paper] per theme, matching --ink and --paper-hi in style.css
const THEMES = { light: [0x141414, 0xfbfbf8], dark: [0xeceae3, 0x1b1b19] };

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.z = 11;

scene.add(new THREE.AmbientLight(0xffffff, 1.6));
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(4, 6, 8);
scene.add(sun);

const solid = (color) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.6 });
// Shared materials so a theme switch only recolors three objects
const inkLine = new THREE.LineBasicMaterial();
const inkSolid = solid(0), paperSolid = solid(0);
const edges = (geo) => new THREE.LineSegments(new THREE.EdgesGeometry(geo), inkLine);

function solidWithEdges(geo, material) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, material), edges(geo));
  return g;
}

// [object, position, spin speed per axis]
const shapes = [
  [edges(new THREE.IcosahedronGeometry(1.7, 0)), [-1.4, 0.9, 0], [0.25, 0.35, 0]],
  [new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.32, 12, 40), solid(RED)), [1.9, 1.3, -1], [0.5, 0.2, 0.1]],
  [solidWithEdges(new THREE.BoxGeometry(1.4, 1.4, 1.4), paperSolid), [1.5, -1.5, 0.5], [0.3, 0.45, 0]],
  [new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), inkSolid), [-1.9, -1.8, 1], [0.6, 0.3, 0.2]],
  [new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), solid(RED)), [0.2, -0.3, 2], [0, 0, 0]],
];
shapes.forEach(([obj, pos], i) => {
  obj.position.set(...pos);
  obj.userData.baseY = pos[1];
  obj.userData.phase = i * 1.3;
  scene.add(obj);
});

function resize() {
  const { clientWidth: w, clientHeight: h } = canvas;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

const clock = new THREE.Clock();
function frame() {
  const dt = clock.getDelta(), t = clock.elapsedTime;
  for (const [obj, , spin] of shapes) {
    obj.rotation.x += spin[0] * dt;
    obj.rotation.y += spin[1] * dt;
    obj.rotation.z += spin[2] * dt;
    obj.position.y = obj.userData.baseY + Math.sin(t * 0.8 + obj.userData.phase) * 0.15;
  }
  renderer.render(scene, camera);
}

function applyTheme() {
  const [ink, paper] = THEMES[document.documentElement.dataset.theme] || THEMES.light;
  inkLine.color.set(ink);
  inkSolid.color.set(ink);
  paperSolid.color.set(paper);
  renderer.render(scene, camera);
}
new MutationObserver(applyTheme).observe(document.documentElement, { attributeFilter: ["data-theme"] });

resize();
applyTheme();
new ResizeObserver(() => { resize(); renderer.render(scene, camera); }).observe(canvas);

if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
  renderer.render(scene, camera);
} else {
  new IntersectionObserver(([entry]) => {
    clock.getDelta(); // skip the time spent off screen
    renderer.setAnimationLoop(entry.isIntersecting ? frame : null);
  }).observe(canvas);
}
