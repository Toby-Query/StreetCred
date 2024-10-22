import * as THREE from "three";

const keys = {};
let speed = 0;
const acceleration = 0.05;
const maxSpeed = 0.3;
const friction = 0.98;
const turnAngle = Math.PI / 180;

let accelerateSound = null;
let engineSound = null; // New engine sound

export function initControls(listener) {
  // Load the accelerate sound
  const audioLoader = new THREE.AudioLoader();
  accelerateSound = new THREE.Audio(listener);

  audioLoader.load("sounds/accelerate.mp3", (buffer) => {
    accelerateSound.setBuffer(buffer);
    accelerateSound.setLoop(true); // Loop the sound while moving forward
    accelerateSound.setVolume(0.5); // Set volume level
  });

  // Load and play the engine sound
  engineSound = new THREE.Audio(listener);

  audioLoader.load("sounds/engine.mp3", (buffer) => {
    engineSound.setBuffer(buffer);
    engineSound.setLoop(true); // Engine sound loops continuously
    engineSound.setVolume(1); // Adjust volume level
    engineSound.play(); // Start the engine sound immediately
  });

  window.addEventListener("keydown", (event) => {
    keys[event.key] = true;
  });

  window.addEventListener("keyup", (event) => {
    keys[event.key] = false;
  });
}

export function updateControls(car) {
  let movingForward = false;

  if (keys["ArrowUp"]) {
    speed = Math.min(maxSpeed, speed + acceleration); // Move forward
    movingForward = true;
  }
  if (keys["ArrowDown"]) {
    speed = Math.max(-maxSpeed, speed - acceleration); // Move backward
  }
  if (keys["ArrowLeft"] && !almostZero(speed)) {
    car.rotation.y += turnAngle; // Turn left
  }
  if (keys["ArrowRight"] && !almostZero(speed)) {
    car.rotation.y -= turnAngle; // Turn right
  }

  // Apply movement
  car.position.x += Math.sin(car.rotation.y) * speed;
  car.position.z += Math.cos(car.rotation.y) * speed;

  // Apply friction
  speed *= friction;

  // Handle acceleration sound
  if (movingForward) {
    if (!accelerateSound.isPlaying) {
      accelerateSound.play(); // Start the sound when moving forward
    }
  } else if (accelerateSound.isPlaying) {
    accelerateSound.stop(); // Stop the sound when not moving forward
  }
}

function almostZero(number) {
  return Math.abs(number) < 0.01;
}
