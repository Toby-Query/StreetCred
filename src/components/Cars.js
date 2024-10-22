import * as THREE from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

export function createCar() {
  const carPosition = { x: 5, y: 1, z: 0 };

  return new Promise((resolve) => {
    // Load the materials first if using .mtl
    const mtlLoader = new MTLLoader();
    mtlLoader.load("/models/car/Chevrolet_Camaro_SS_High.mtl", (materials) => {
      materials.preload();

      // Then load the object
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load("/models/car/Chevrolet_Camaro_SS_High.obj", (object) => {
        object.scale.set(0.8, 0.8, 0.8); // Adjust scale if needed
        object.position.set(carPosition.x, carPosition.y, carPosition.z);
        object.rotation.y = Math.PI; // Flip the car horizontally

        // Traverse the object to find the desired material(s)
        object.traverse((child) => {
          if (child.isMesh) {
            // Check if the material is the one you want to change
            if (child.material.name === "Material") {
              // Change the diffuse color (Kd) of this material to blue
              child.material.color.set(0x0d5778); // Blue color
            }
          }
        });

        // Return the car object once it's loaded
        resolve(object);
      });
    });
  });
}
