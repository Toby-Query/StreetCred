import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

// Function to create an opponent car using OBJ and MTL loaders
export function createOpponentCar() {
  return new Promise((resolve, reject) => {
    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();

    // Load the MTL file
    mtlLoader.load(
      "models/car/Chevrolet_Camaro_SS_High.mtl",
      (materials) => {
        materials.preload(); // Preload materials

        // Load the OBJ file using the loaded materials
        objLoader.setMaterials(materials);
        objLoader.load(
          "models/car/Chevrolet_Camaro_SS_High.obj",
          (object) => {
            object.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true; // Allow opponent car to cast shadows
                child.receiveShadow = true; // Allow opponent car to receive shadows
              }
            });
            resolve(object); // Resolve with the loaded object
          },
          undefined,
          (error) => {
            reject(error); // Reject in case of loading error
          }
        );
      },
      undefined,
      (error) => {
        reject(error); // Reject in case of loading error
      }
    );
  });
}
