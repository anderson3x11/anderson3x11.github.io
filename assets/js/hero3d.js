// Home hero: the site's mark (assets/images/mark.svg) extruded in polished gold, turning slowly.
// Stops rendering when off screen, and draws a single still frame
// when the visitor prefers reduced motion.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

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

// The mark is drawn in a 100 x 100 SVG box: extrude every shape, flip y (SVG points down), center it
const mark = new THREE.Group();
const svg = await fetch(new URL("../images/mark.svg", import.meta.url)).then((r) => r.text());
for (const path of new SVGLoader().parse(svg).paths) {
  for (const shape of SVGLoader.createShapes(path)) {
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 7, bevelEnabled: true, bevelThickness: 1.4, bevelSize: 1, bevelSegments: 6, curveSegments: 24 });
    mark.add(new THREE.Mesh(geo, gold));
  }
}
mark.scale.set(0.055, -0.055, 0.055);
const box = new THREE.Box3().setFromObject(mark);
mark.position.sub(box.getCenter(new THREE.Vector3()));
const pivot = new THREE.Group();
pivot.add(mark);
scene.add(pivot);

function resize() {
  const { clientWidth: w, clientHeight: h } = canvas;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // Keep the whole mark in frame on narrow screens
  camera.position.z = w / h < 1 ? 15 : 12;
  camera.updateProjectionMatrix();
}

const clock = new THREE.Clock();
function frame() {
  const t = clock.getElapsedTime();
  pivot.rotation.y = t * 0.4;
  pivot.rotation.x = Math.sin(t * 0.5) * 0.1;
  pivot.position.y = Math.sin(t * 0.8) * 0.12;
  renderer.render(scene, camera);
}

resize();
pivot.rotation.y = -0.5;
renderer.render(scene, camera);
new ResizeObserver(() => { resize(); renderer.render(scene, camera); }).observe(canvas);

if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  new IntersectionObserver(([entry]) => {
    renderer.setAnimationLoop(entry.isIntersecting ? frame : null);
  }).observe(canvas);
}
