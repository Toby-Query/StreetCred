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
import Car from "./world/car";
import { FollowCamera } from "./followCamera"; // Import FollowCamera
import * as CANNON from "cannon-es";

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

// Lighting
setupLights(scene);

// Environment Textures
scene.environment = loadCubeTextures();

// Floor
setupFloor(scene, world);

// Follow Camera
const followCamera = new FollowCamera(camera); // Initialize with default offset

// Animation Loop
const timeStep = 1 / 60; // seconds
let lastCallTime;

// Create a Three.js box
const dummyGeo = new THREE.BoxGeometry(2, 4, 2);
const dummyMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const dummyMesh = new THREE.Mesh(dummyGeo, dummyMat);

// Add the box to the scene
scene.add(dummyMesh);

// Create a Cannon.js box with the same dimensions
const shape = new CANNON.Box(new CANNON.Vec3(1, 2, 1)); // Half-extents are half the dimensions
const boxBody = new CANNON.Body({
  mass: 1, // Set mass as needed; 0 means it will be static
});
boxBody.addShape(shape);
dummyMesh.position.set(0, 50, 100);
// Set the position of the Cannon box to match the Three.js box position
boxBody.position.set(
  dummyMesh.position.x,
  dummyMesh.position.y,
  dummyMesh.position.z
);

// Add the box to the Cannon.js world
world.addBody(boxBody);
const tick = () => {
  stats.begin();
  controls.update();
  dummyMesh.position.set(
    boxBody.position.x,
    boxBody.position.y,
    boxBody.position.z
  );
  const time = performance.now() / 1000; // seconds
  const dt = lastCallTime ? time - lastCallTime : timeStep;
  world.step(timeStep, dt);
  lastCallTime = time;

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

  followCamera.update(carPosition, carQuaternion);

  renderer.render(scene, camera);
  stats.end();

  window.requestAnimationFrame(tick);
};
tick();
