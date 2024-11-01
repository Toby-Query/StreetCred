import "./style.css";
import * as THREE from "three";
import { sizes, handleResize } from "./setup/sizes.js";
import { createRenderer } from "./setup/renderer.js";
import { createControls } from "./setup/cameraControls.js";
import { setupLights } from "./setup/lights.js";
import { loadCubeTextures } from "./setup/skybox.js";
import { initPhysics } from "./setup/physics.js";
import { setupPhysFloor, createBox } from "./buildWorld.js";
import stats from "./setup/stats.js";
import Car from "./cars/car.js";
import Car2 from "./cars/car2.js";
import { FollowCamera } from "./setup/followCamera.js"; // Import FollowCamera
import * as CANNON from "cannon-es";
import { drawSpeedo } from "./gameScreenUI/speedometer.js";
import { startCountdown } from "./gameScreenUI/timer.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

console.log("what")
// Canvas and Scene
const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  sizes.width / sizes.height,
  0.1,
  10000
);

const checkpoints=[];
let score=0;


//that_one.quaternion.set(0,0,0,1);
let curr_index=0;
checkpoints.push({
  position:[0,0,80],
  quaternion:[0,-0.3826834323650898,0,0.9238795325112867]
});
checkpoints.push({
  position:[-50.2,0,86],
  quaternion:[0,-0.5,0,0.8660254038]
});
checkpoints.push({
  position:[-50.35,0,141],
  quaternion:[0,0.5,0,0.8660254038]
});
checkpoints.push({
  position:[105,0,141],
  quaternion:[0,-0.5,0,0.8660254038]
});
checkpoints.push({
  position:[105,0,56],
  quaternion:[0,0.5,0,0.8660254038]
});
checkpoints.push({
  position:[-130.7,0,53],
  quaternion:[0,0.5,0,0.8660254038]
});
checkpoints.push({
  position:[-130.7,0,19.1],
  quaternion:[0,-0.5,0,0.8660254038]
});
checkpoints.push({
  position:[-85.8,0,17],
  quaternion:[0,-0.5,0,0.8660254038]
});
checkpoints.push({
  position:[-75,0,-34],
  quaternion:[0,-0.4617486132350339,0,0.88701208331782217]
});
checkpoints.push({
  position:[-3,0,-34.5],
  quaternion:[0,0.382683432354098,0,0.923879532511867]
});
//console.log(checkpoints);




//camera.position.set(0, 4, 6);
camera.position.set(0, 50, 10);
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

const textureLoader = new THREE.TextureLoader();
const texture1 = textureLoader.load("/track5/newtextures/Poliigon_GrassPatchyGround_4585_BaseColor.jpg");

// Floor
setupPhysFloor(world);
let room;
const loader = new GLTFLoader();
loader.load(
    "/track5/scene.gltf",
    (gltf) => {
        room = gltf.scene;
        room.scale.set(0.5, 0.5, 0.5);
        room.position.x = -35;
        room.position.y = -1;
        room.position.z = -20;
        //new CANNON.Vec3(36,0,24)
        scene.add(room);
        room.traverse((node) => { 
          if (node.name.includes("Plane")){
             //console.log(node); 
             node.material = new THREE.MeshStandardMaterial({ map: texture1 });
            }
        });
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
        console.error("An error occurred while loading the model:", error);
    }
);
var camera_toggle=false;
var follower;
window.addEventListener("keydown",(e)=>{
  // console.log(e.key);
  if(e.key=="c"){
    camera_toggle=!camera_toggle;
  }
  if (camera_toggle){
    //camera.position.set(0, 10, 10);
    followCamera.update(new THREE.Vector3(0,20,10), new THREE.Quaternion(0,0,0,1));
  }
});

// let torus;
// loader.load(
//     "/track5/torus/scene.gltf",
//     (gltf) => {
//         torus = gltf.scene;
//         torus.scale.set(0.3, 0.3, 0.3);
//         torus.position.x = 0;
//         torus.position.y = 0;
//         torus.position.z = 0;
//         //new CANNON.Vec3(36,0,24)
//         console.log(torus);
//         scene.add(torus);
//     },
//     (xhr) => {
//         console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
//     },
//     (error) => {
//         console.error("An error occurred while loading the model:", error);
//     }
// );
//const this_geometry = new THREE.TorusGeometry(19, 0.5, 30, 200);
const this_geometry = new THREE.TorusGeometry(8, 0.5, 10, 100);
const this_material = new THREE.MeshStandardMaterial({color: 0xff0000});
let this_one=new THREE.Mesh(this_geometry, this_material);
this_one.position.set(1,0,10);
scene.add(this_one);

// Follow Camera
const followCamera = new FollowCamera(camera); // Initialize with default offset

// Animation Loop
const timeStep = 1 / 60; // seconds
let lastCallTime;

// Usage example: Create a few boxes with varying sizes, colors, masses, and positions

const that_geometry = new THREE.TorusGeometry(8, 0.5, 10, 100);
const that_material = new THREE.MeshStandardMaterial({color: 0x00ff00});
let that_one=new THREE.Mesh(that_geometry, that_material);
that_one.position.set(checkpoints[curr_index].position[0],checkpoints[curr_index].position[1],checkpoints[curr_index].position[2]);
// Convert 45 degrees to radians 
that_one.quaternion.set(checkpoints[curr_index].quaternion[0],checkpoints[curr_index].quaternion[1],checkpoints[curr_index].quaternion[2],checkpoints[curr_index].quaternion[3]);
scene.add(that_one);

const countdownElement = document.getElementById("countdown");
//startCountdown(50, countdownElement);
function countdown(n,who) { 
  if (n === 6) { 
    who.material.color.setHex(0xff0000);
  } 
  else if (n === 3) { 
    who.material.color.setHex(0xffa500);
  } 
  else if (n === 0){
    who.material.color.setHex(0x00ff00);
    startCountdown(50, countdownElement);
    return;
  } 
  //renderer.render(scene, camera);
  setTimeout(() => countdown(n-1,who), 1000); 
}
countdown(9,this_one);

function distanceBetweenVectors(v1, v2) { 
  const dx = v2[0] - v1.x; 
  const dy = v2[1] - v1.y; 
  const dz = v2[2] - v1.z; 
  //console.log(v1);
  //console.log(v2);
  return Math.sqrt(dx * dx + dy * dy + dz * dz); 
}
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

  
  //Car position and quaternion
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
    if (curr_index<checkpoints.length){
      let ddd=distanceBetweenVectors(carPosition,checkpoints[curr_index].position);
      //console.log(ddd);
      if(ddd<10){
        if (that_one){
          scene.remove(that_one);
        }
        curr_index++;
        if (curr_index<checkpoints.length){
          score++;
          const that_geometry = new THREE.TorusGeometry(8, 0.5, 10, 100);
          const that_material = new THREE.MeshStandardMaterial({color: 0x00ff00});
          that_one=new THREE.Mesh(that_geometry, that_material);
          that_one.position.set(checkpoints[curr_index].position[0],checkpoints[curr_index].position[1],checkpoints[curr_index].position[2]);
          // Convert 45 degrees to radians 
          that_one.quaternion.set(checkpoints[curr_index].quaternion[0],checkpoints[curr_index].quaternion[1],checkpoints[curr_index].quaternion[2],checkpoints[curr_index].quaternion[3]);
          scene.add(that_one);
        }
      }
    }
    let ddd=distanceBetweenVectors(carPosition,[0,0,0]);
    if (score==9&&ddd<10){
        //you have finished the race
        console.log("done");
    }
  if (camera_toggle){
    followCamera.update(carPosition, carQuaternion);
  }

  renderer.render(scene, camera);
  stats.end();

  window.requestAnimationFrame(tick);
};
tick();
