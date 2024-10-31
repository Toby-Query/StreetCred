import "./style.css";
import * as THREE from "three";
import { sizes, handleResize } from "./setup/sizes.js";
import { createRenderer } from "./setup/renderer.js";
import { createControls } from "./setup/cameraControls.js";
import { setupLights } from "./setup/lights.js";
import { loadCubeTextures } from "./setup/skybox.js";
import { initPhysics } from "./setup/physics.js";
import { setupFloor, createBox } from "./buildWorld.js";
import stats from "./setup/stats.js";
import Car from "./cars/car.js";
import Car2 from "./cars/car2.js";
import { FollowCamera } from "./setup/followCamera.js"; // Import FollowCamera
import * as CANNON from "cannon-es";
import { drawSpeedo } from "./gameScreenUI/speedometer.js";
import { startCountdown } from "./gameScreenUI/timer.js";

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

// Usage example: Create a few boxes with varying sizes, colors, masses, and positions
const box1 = createBox({
  size: [2, 4, 2],
  color: 0xff0000,
  mass: 5000,
  position: [0, 50, 100],
  scene: scene,
  world: world,
});
const box2 = createBox({
  size: [1, 2, 1],
  color: 0x0000ff,
  mass: 1000,
  position: [10, 50, 100],
  scene: scene,
  world: world,
});
const box3 = createBox({
  size: [1, 6, 220],
  color: 0x00ff00,
  mass: 8000,
  position: [-5, 3, 100],
  scene: scene,
  world: world,
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
