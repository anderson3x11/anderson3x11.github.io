// Hero mark: the tall star extruded in 3D and drawn as 0/1 characters, turning slowly.
// Lit faces read as "0", the shaded sides as "1". Turns slower under reduced motion.
import * as THREE from "three";
import { AsciiEffect } from "three/addons/effects/AsciiEffect.js";

const host = document.querySelector(".ascii");

const renderer = new THREE.WebGLRenderer();
const effect = new AsciiEffect(renderer, "000001111 ", { resolution: 0.22 });
host.append(effect.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
camera.position.z = 15;

scene.add(new THREE.AmbientLight(0xffffff, 0.15));
const key = new THREE.DirectionalLight(0xffffff, 2.4);
key.position.set(-2, 1.5, 6);
scene.add(key);

// Same outline as the 2D mark (100 x 300 box), y flipped and centered
const s = new THREE.Shape();
const p = (x, y) => [(x - 50) / 42, (150 - y) / 42];
s.moveTo(...p(50, 0));
s.bezierCurveTo(...p(53, 105), ...p(59, 141), ...p(100, 150));
s.bezierCurveTo(...p(59, 159), ...p(53, 195), ...p(50, 300));
s.bezierCurveTo(...p(47, 195), ...p(41, 159), ...p(0, 150));
s.bezierCurveTo(...p(41, 141), ...p(47, 105), ...p(50, 0));
const geo = new THREE.ExtrudeGeometry(s, { depth: 1.1, bevelEnabled: false, curveSegments: 40 });
geo.center();
const mark = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: 0xffffff }));
// Slight tilt: the star spins around a leaning axis
const tilt = new THREE.Group();
tilt.rotation.z = -0.22;
tilt.add(mark);
scene.add(tilt);

function resize() {
  const { clientWidth: w, clientHeight: h } = host;
  effect.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

// Reduced motion keeps a slow, steady turn instead of stopping
const speed = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.35 : 1;

function frame(t = 0) {
  mark.rotation.y = 0.6 + t * 0.0006 * speed;
  mark.rotation.x = Math.sin(t * 0.0004 * speed) * 0.12 * speed;
  effect.render(scene, camera);
}

resize();
mark.rotation.y = 0.6;
effect.render(scene, camera);
new ResizeObserver(() => { resize(); effect.render(scene, camera); }).observe(host);

let raf = 0;
const loop = (t) => { frame(t); raf = requestAnimationFrame(loop); };
new IntersectionObserver(([e]) => {
  cancelAnimationFrame(raf);
  if (e.isIntersecting) raf = requestAnimationFrame(loop);
}).observe(host);
