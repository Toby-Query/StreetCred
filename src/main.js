import "./style.css";
import * as THREE from "three";
import { sizes, handleResize } from "./sizes";
import { createRenderer } from "./renderer";
import { createControls } from "./controls";
import { setupLights } from "./lights";
import { loadCubeTextures } from "./textures";
import { initPhysics } from "./physics";
import { setupFloor } from "./floor.js";
import stats from "./stats";
import Car from "./cars/car.js";
import Car2 from "./cars/car2.js";
import { FollowCamera } from "./followCamera"; // Import FollowCamera
import * as CANNON from "cannon-es";
import { drawSpeedo } from "./speedometer.js";
import { startCountdown } from "./timer.js";

// Canvas and Scene
const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  sizes.width / sizes.height,
  0.1,
  10000
);
camera.position.set(0, 4, 6);
scene.add(camera);

// Renderer
const renderer = createRenderer(canvas, sizes);
window.addEventListener("resize", () => handleResize(camera, renderer));

// Controls
const controls = createControls(camera, canvas);

// Physics World
const { world } = initPhysics(scene);

// Car
const car = new Car(scene, world);
car.init();

// Car2
// const car2 = new Car2(scene, world);
// car2.setTarget({ x: -50, y: 0, z: 50 });
// car2.init();

// Lighting
setupLights(scene);

// Environment Textures
scene.environment = loadCubeTextures();

// Floor
setupFloor(scene, world);

// Follow Camera
//const followCamera = new FollowCamera(camera); // Initialize with default offset

// Animation Loop
const timeStep = 1 / 60; // seconds
let lastCallTime;

function createBox({
  size = [2, 4, 2],
  color = 0x00ff00,
  mass = 5000,
  position = [0, 0, 0],
}) {
  // Create a Three.js box
  const [width, height, depth] = size;
  const geo = new THREE.BoxGeometry(width, height, depth);
  const mat = new THREE.MeshBasicMaterial({ color });
  const mesh = new THREE.Mesh(geo, mat);

  // Set initial position for the Three.js mesh
  mesh.position.set(...position);

  // Add the mesh to the Three.js scene
  scene.add(mesh);

  // Create a Cannon.js box with half-extents for the physics shape
  const shape = new CANNON.Box(
    new CANNON.Vec3(width / 2, height / 2, depth / 2)
  );
  const body = new CANNON.Body({ mass });
  body.addShape(shape);

  // Set the initial position for the Cannon.js body
  body.position.set(...position);

  // Add the body to the Cannon.js world
  world.addBody(body);

  // Return both mesh and body for further control if needed
  return { mesh, body };
}

// Usage example: Create a few boxes with varying sizes, colors, masses, and positions
const box1 = createBox({
  size: [2, 4, 2],
  color: 0xff0000,
  mass: 5000,
  position: [0, 50, 100],
});
const box2 = createBox({
  size: [1, 2, 1],
  color: 0x0000ff,
  mass: 1000,
  position: [10, 50, 100],
});
const box3 = createBox({
  size: [1, 6, 220],
  color: 0x00ff00,
  mass: 8000,
  position: [-5, 3, 100],
});

const countdownElement = document.getElementById("countdown");
startCountdown(50, countdownElement);

const tick = () => {
  stats.begin();
  controls.update();

  box1.mesh.position.set(
    box1.body.position.x,
    box1.body.position.y,
    box1.body.position.z
  );
  box2.mesh.position.set(
    box2.body.position.x,
    box2.body.position.y,
    box2.body.position.z
  );
  box3.mesh.position.set(
    box3.body.position.x,
    box3.body.position.y,
    box3.body.position.z
  );

  const time = performance.now() / 1000; // seconds
  const dt = lastCallTime ? time - lastCallTime : timeStep;
  world.step(timeStep, dt);
  lastCallTime = time;

  // Retrieve car speed and update speedometer
  const carSpeed = car.getSpeed(); // Assume car.getSpeed() returns speed value
  const carGear = car.getGear(); // Assume car.getGear() returns current gear
  const carRpm = car.getRpm(); // Assume car.getRpm() returns RPM value
  drawSpeedo(carSpeed, carGear, carRpm, 160, car.isReverse); // Update speedometer display

  // // Car position and quaternion
  // const carPosition = new THREE.Vector3(
  //   car.car.chassisBody.position.x,
  //   car.car.chassisBody.position.y,
  //   car.car.chassisBody.position.z
  // );
  // const carQuaternion = new THREE.Quaternion(
  //   car.car.chassisBody.quaternion.x,
  //   car.car.chassisBody.quaternion.y,
  //   car.car.chassisBody.quaternion.z,
  //   car.car.chassisBody.quaternion.w
  // );

  // followCamera.update(carPosition, carQuaternion);

  renderer.render(scene, camera);
  stats.end();

  window.requestAnimationFrame(tick);
};
tick();
