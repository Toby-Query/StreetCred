import * as THREE from "three";
import { createCar } from "./components/Cars.js";
import { createWorld } from "./components/World.js";
//import { initControls, updateControls } from "./utils/Controls.js";
import { createOpponentCar } from "./components/OpponentCar.js";
import { setupLighting } from "./utils/Lighting.js";
import { startCountdown, endRace, raceStarted } from "./raceLogic.js";
import * as CANNON from "cannon-es";
import cannonDebugger from "cannon-es-debugger";
import Car from "./components/carClass.js";

// Set up the scene
const scene = new THREE.Scene();

//setup physics world
//Physics world
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
});
world.broadphase = new CANNON.SAPBroadphase(world);
cannonDebugger(scene, world.bodies, { color: 0x00ff00 });

//car
//car
const car = new Car(scene, world);
car.init();

const bodyMaterial = new CANNON.Material();
const groundMaterial = new CANNON.Material();
const bodyGroundContactMaterial = new CANNON.ContactMaterial(
  bodyMaterial,
  groundMaterial,
  {
    friction: 0.1,
    restitution: 0.3,
  }
);
world.addContactMaterial(bodyGroundContactMaterial);

// Set up the camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

// Set up the renderer
const canvas = document.getElementById("gameCanvas");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Enable shadows
document.body.appendChild(renderer.domElement);

// Create and add world
// const world = createWorld();
// scene.add(world);

setupLighting(scene);

// Audio setup
const listener = new THREE.AudioListener();
camera.add(listener);

// Initialize controls
//initControls(listener);

// Render loop with the car object available
//let car; // Declare car variable in outer scope

// Create the car
// createCar()
//   .then((loadedCar) => {
//     car = loadedCar;
//     console.log("Car loaded:", car); // Debugging log
//     car.castShadow = true; // Allow car to cast shadows
//     car.traverse((child) => {
//       if (child.isMesh) {
//         child.castShadow = true; // Ensure all child meshes cast shadows
//       }
//     });
//     scene.add(car);
//   })
//   .catch((error) => {
//     console.error("Error loading car:", error); // Catch loading errors
//   });

let opponentCar; // Declare opponent car variable in outer scope

// Create the opponent car
createOpponentCar()
  .then((loadedOpponentCar) => {
    opponentCar = loadedOpponentCar;
    opponentCar.position.set(-5, 1, 0); // Set starting position
    //set scale
    opponentCar.scale.set(0.75, 0.75, 0.75);
    //rotate
    opponentCar.rotation.y = Math.PI;
    scene.add(opponentCar);
  })
  .catch((error) => {
    console.error("Error loading opponent car:", error); // Catch loading errors
  });

// Set the target position for the race
const targetPosition = new THREE.Vector3(0, 1, -200); // Change z value as needed

// Speed of the opponent car
const opponentSpeed = 0.29; // Adjust this value for faster/slower movement

// Call startCountdown() to initiate the countdown when ready to race
startCountdown(() => {
  //startRace(); // Start your race logic here
});

// Modify the race logic to call endRace() with true or false based on the race outcome
function raceOutcome(isWinner) {
  endRace(isWinner); // Call this function with the result of the race
}

function animateOpponentCar() {
  if (opponentCar && raceStarted) {
    // Calculate direction to the target position
    const direction = targetPosition
      .clone()
      .sub(opponentCar.position)
      .normalize();

    // Move the opponent car toward the target position
    opponentCar.position.add(direction.multiplyScalar(opponentSpeed));

    // Optional: Add a condition to stop the car when it reaches the target position
    if (opponentCar.position.distanceTo(targetPosition) < 1) {
      console.log("Opponent car reached the finish line!");
      // You can stop the animation or reset positions here if needed
      raceOutcome(false);
    }
  }
}

async function animate() {
  requestAnimationFrame(animate);

  // Only update controls if the car object is loaded
  if (car && raceStarted) {
    //updateControls(car); // Update car position for controls

    // Calculate the camera's position based on the car's position and rotation
    const carDirection = new THREE.Vector3(); // Vector to hold the car's forward direction
    //car.getWorldDirection(carDirection); // Get the forward direction of the car
    carDirection.y = 0; // Ensure the direction is horizontal

    const cameraOffset = new THREE.Vector3(0, 5, -10); // Offset from the car
    //cameraOffset.applyQuaternion(car.quaternion); // Rotate the offset according to the car's rotation

    // Set camera position relative to the car's position
    //camera.position.copy(car.position).add(cameraOffset);
    //camera.lookAt(car.position); // Make the camera look at the car
    // if (car.position.z < targetPosition.z) {
    //   raceOutcome(true);
    // }
  } else {
    console.log("Car not loaded yet"); // Debugging log for missing car
  }

  // Animate the opponent car
  animateOpponentCar();

  renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
