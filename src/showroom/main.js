import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Set up Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Set up Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Sky blue color

// Set up Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(-2, 2, -2);

// Set up Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth the control movements

// Add Lighting, other(spotlights) lights are built into the model with Blender
const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft light
scene.add(ambientLight);

//Setup the camera controls
class cameraControls{
    constructor(car){
        this.car = car;
        this.zoomSpeed=1;
        window.addEventListener('keydown', (event) => this.onKeyDown(event));
    }
    onKeyDown(event){
        //Zoom in
        if (event.key==="+"){
            if (camera.fov > 10){
                camera.fov -= this.zoomSpeed;
                camera.updateProjectionMatrix();
            }
        }
        //Zoom out
        if (event.key==="-"){
            if (camera.fov < 100){
                camera.fov += this.zoomSpeed;
                camera.updateProjectionMatrix();
            }
        }
    }
}
  
// Add Ground Plane
const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x000000,
});
const groundMesh=new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.rotation.x=-Math.PI / 2;//Rotate to lie flat
groundMesh.position.y=0;
scene.add(groundMesh);

//+++++++++++++++++++++++++++++++++++++++++++++++++++++
//Setup the car selection
const cars=["porsche","bmw_m6_gran_coupe","ford_mustang_shelby_gt500"];
//Map each model's properties
const carMap={
    porsche:{
        displacement:[0,0.1,0],
        scale:[0.55,0.55,0.55],
    },
    bmw_m6_gran_coupe:{
        displacement:[0,0.1,0.5],
        scale:[0.75,0.75,0.75],
    },
    ford_mustang_shelby_gt500:{
        displacement:[0,0.2,-1.5],
        scale:[0.7,0.7,0.7],
    },
}
var index=0;
let s=localStorage.getItem("StreetCredCar");
if (s){
    index=cars.findIndex((c)=>c==s);
    if (index==-1){
        index=0;
    }
}

// Load the Showroom Model
const loader = new GLTFLoader();

let room;
loader.load(
    "/showroom/trial.gltf",
    (gltf) => {
        room = gltf.scene;
        room.scale.set(0.5, 0.5, 0.5);
        room.position.x = 0;
        room.position.y = 0;
        room.position.z = -1;
        //new CANNON.Vec3(36,0,24)
        scene.add(room);
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
        console.error("An error occurred while loading the model:", error);
    }
);

//Function to load the car
async function load_car(car) {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(
            `/${car}/scene.gltf`,
            (gltf) => {
                const car_obj = gltf.scene;
                car_obj.scale.set(carMap[car].scale[0], carMap[car].scale[1], carMap[car].scale[2]);
                car_obj.position.set(carMap[car].displacement[0], carMap[car].displacement[1], carMap[car].displacement[2]);
                scene.add(car_obj);
                // Set up camera controls after car is loaded
                var camera_controls = new cameraControls(car_obj);                
                // Resolve the promise with the loaded car object
                resolve(car_obj);
            },
            (xhr)=>{
                console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
            },
            (error)=>{
                console.error("An error occurred while loading the model:", error);
                reject(error); // Reject if there's an error loading the car
            }
        );
    });
}
//load an initial car
var current_car;
try {
    current_car = await load_car(cars[index]);
} catch (error) {
    console.error("Failed to load car:", error);
}

async function handleKeydown(e){
    //Accept choice
    if (e.key=="Enter"){
        localStorage.setItem("StreetCredCar",cars[index]);
        window.history.go(-1);
        return;
    }
    else if(e.key=="Escape"){
        window.history.go(-1);
        return;
    }
    else if (e.key=="ArrowRight"){
        if (index==cars.length-1){
            index=0;
        }
        else{
            index++;
        }
    }
    else if (e.key=="ArrowLeft"){
        if (index==0){
            index=cars.length-1;
        }
        else{
            index--;
        }
    }
    else{
        return;
    }
    if (current_car){
        //remove current car before adding a new one
        scene.remove(current_car);
        current_car=null;
    }
    //load new car
    current_car=await load_car(cars[index]);
}
//Listen for key presses
window.addEventListener("keydown",(event) => handleKeydown(event));
// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Adjust on Window Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
