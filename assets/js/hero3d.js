// Home hero: a polished gold "</>" turning slowly, the code symbol treated like a jewel.
// Stops rendering when off screen, and draws a single still frame
// when the visitor prefers reduced motion.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const canvas = document.querySelector(".hero-3d");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const scene = new THREE.Scene();
// A studio-like environment so the metal has something to reflect
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
camera.position.z = 12;

const key = new THREE.DirectionalLight(0xffffff, 1.2);
key.position.set(3, 5, 6);
scene.add(key);

const gold = new THREE.MeshPhysicalMaterial({ color: 0xd9b46a, metalness: 1, roughness: 0.22, clearcoat: 0.6, clearcoatRoughness: 0.2 });

// 2D outlines of the three glyphs, extruded with a bevel
function glyph(points) {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.09, bevelSize: 0.07, bevelSegments: 5, curveSegments: 1 });
  geo.center();
  return new THREE.Mesh(geo, gold);
}
const chevron = [[1, 1.35], [-0.65, 0], [1, -1.35], [1, -0.8], [0.05, 0], [1, 0.8]];
const left = glyph(chevron);
const right = glyph(chevron.map(([x, y]) => [-x, y]));
const slash = glyph([[0.2, 1.5], [0.68, 1.5], [-0.2, -1.5], [-0.68, -1.5]]);
left.position.x = -1.75;
right.position.x = 1.75;

const symbol = new THREE.Group();
symbol.add(left, slash, right);
scene.add(symbol);

function resize() {
  const { clientWidth: w, clientHeight: h } = canvas;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // Keep the whole symbol in frame on narrow screens
  camera.position.z = w / h < 1 ? 16 : 12;
  camera.updateProjectionMatrix();
}

const clock = new THREE.Clock();
function frame() {
  const t = clock.getElapsedTime();
  symbol.rotation.y = t * 0.35;
  symbol.rotation.x = Math.sin(t * 0.5) * 0.12;
  symbol.position.y = Math.sin(t * 0.8) * 0.12;
  renderer.render(scene, camera);
}

resize();
symbol.rotation.y = -0.45;
renderer.render(scene, camera);
new ResizeObserver(() => { resize(); renderer.render(scene, camera); }).observe(canvas);

if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  new IntersectionObserver(([entry]) => {
    renderer.setAnimationLoop(entry.isIntersecting ? frame : null);
  }).observe(canvas);
}
