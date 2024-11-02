import "./style.css";
import * as THREE from "three";
import { sizes, handleResize } from "./setup/sizes.js";
import { createRenderer } from "./setup/renderer.js";
import { createControls } from "./setup/cameraControls.js";
import { setupLights } from "./setup/lights.js";
import { loadCubeTextures } from "./setup/skybox.js";
import { initPhysics } from "./setup/physics.js";
import { setupFloor, createBox, createRamp } from "./buildWorld.js";
import stats from "./setup/stats.js";
import Car from "./cars/car.js";
import Car2 from "./cars/car2.js";
import { FollowCamera } from "./setup/followCamera.js"; // Import FollowCamera
import * as CANNON from "cannon-es";
import { drawSpeedo } from "./gameScreenUI/speedometer.js";
import { startCountdown, startMatch } from "./gameScreenUI/timer.js";

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
car.init({ x: -380, y: 55, z: 30 });

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

const box3 = createBox({
  size: [50, 100, 200],
  color: 0x00ff00,
  mass: 0,
  position: [-375, 3, 105],
  scene: scene,
  world: world,
});
const box4 = createBox({
  size: [3, 2, 390],
  color: 0xff0000,
  mass: 0,
  position: [-375, 52, 400],
  scene: scene,
  world: world,
});
const box5 = createBox({
  size: [50, 100, 200],
  color: 0x00ff00,
  mass: 0,
  position: [-375, 3, 800 - 105],
  scene: scene,
  world: world,
});

// createRamp(scene, world);

// Follow Camera
const followCamera = new FollowCamera(camera); // Initialize with default offset

// Animation Loop
const timeStep = 1 / 60; // seconds
let lastCallTime;

// Usage example: Create a few boxes with varying sizes, colors, masses, and positions

const countdownElement = document.getElementById("countdown");
//startCountdown(50, countdownElement);
startMatch();

function checkGoal(carPosition, goalBox) {
  const { x, y, z } = carPosition;
  const halfX = goalBox.geometry.parameters.width / 2;
  const halfY = goalBox.geometry.parameters.height / 2;
  const halfZ = goalBox.geometry.parameters.depth / 2;

  if (
    x > goalBox.position.x - halfX &&
    x < goalBox.position.x + halfX &&
    y > goalBox.position.y - halfY &&
    y < goalBox.position.y + halfY &&
    z > goalBox.position.z - halfZ &&
    z < goalBox.position.z + halfZ
  ) {
    // Trigger end of game
    console.log("Goal reached! Race is over.");
    window.location.href = "../goal.html";
    // Add more actions here, like displaying an end screen or stopping the car
  }
}

let isEditMode = false;

document.addEventListener("keydown", (event) => {
  if (event.key === "e") {
    isEditMode = true; // Enter edit mode
    controls.enabled = true; // Enable orbit or other controls for editing
  } else if (event.key === "p") {
    isEditMode = false; // Enter play mode
    controls.enabled = false; // Disable editing controls in play mode
  }
});

startMatch();

const tick = () => {
  stats.begin();
  controls.update();

  const time = performance.now() / 1000; // seconds
  const dt = lastCallTime ? time - lastCallTime : timeStep;
  world.step(timeStep, dt);
  lastCallTime = time;

  // Retrieve car speed and update speedometer
  const carSpeed = car.getSpeed(); // Assume car.getSpeed() returns speed value
  const carGear = car.getGear(); // Assume car.getGear() returns current gear
  const carRpm = car.getRpm(); // Assume car.getRpm() returns RPM value
  drawSpeedo(carSpeed, carGear, carRpm, 160, car.isReverse); // Update speedometer display

  // Car position and quaternion
  const carPosition = new THREE.Vector3(
    car.car.chassisBody.position.x,
    car.car.chassisBody.position.y,
    car.car.chassisBody.position.z
  );
  const carQuaternion = new THREE.Quaternion(
    car.car.chassisBody.quaternion.x,
    car.car.chassisBody.quaternion.y,
    car.car.chassisBody.quaternion.z,
    car.car.chassisBody.quaternion.w
  );

  if (!isEditMode) followCamera.update(carPosition, carQuaternion);

  renderer.render(scene, camera);
  stats.end();

  window.requestAnimationFrame(tick);
};
tick();
