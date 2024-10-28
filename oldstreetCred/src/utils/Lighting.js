// Lighting.js
import * as THREE from "three";
import { GUI } from "dat.gui";

export function setupLighting(scene) {
  // Ambient Light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft ambient light
  scene.add(ambientLight);

  // Directional Light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 20, -200); // Position the light
  directionalLight.castShadow = true; // Enable shadows
  directionalLight.intensity = 2;

  // Shadow properties
  directionalLight.shadow.camera.near = 0.1;
  directionalLight.shadow.camera.far = 325;
  directionalLight.shadow.camera.left = -120;
  directionalLight.shadow.camera.right = 25;
  directionalLight.shadow.camera.top = 500;
  directionalLight.shadow.camera.bottom = -500;

  // Increase shadow map size
  directionalLight.shadow.mapSize.width = 4096;
  directionalLight.shadow.mapSize.height = 4096;
  directionalLight.shadow.bias = -0.005;

  scene.add(directionalLight);

  // Point Light
  const pointLight = new THREE.PointLight(0xffffff, 1, 100);
  pointLight.position.set(0, 10, 0); // Position above the car
  scene.add(pointLight);

  // Hemispheric Light
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5); // Sky color, ground color, intensity
  scene.add(hemiLight);

  //dat.GUI for interactive controls
  //   const gui = new GUI();
  //   const lightFolder = gui.addFolder("Directional Light");
  //   lightFolder.add(directionalLight.position, "x", -200, 200).name("Light X");
  //   lightFolder.add(directionalLight.position, "y", -200, 200).name("Light Y");
  //   lightFolder.add(directionalLight.position, "z", -200, 200).name("Light Z");
  //   lightFolder.add(directionalLight, "intensity", 0, 2).name("Light Intensity");
  //   lightFolder.open();

  //   const shadowFolder = gui.addFolder("Shadow Camera");
  //   shadowFolder
  //     .add(directionalLight.shadow.camera, "left", -500, 500)
  //     .name("Left Bound")
  //     .onChange(() => {
  //       directionalLight.shadow.camera.updateProjectionMatrix();
  //     });
  //   shadowFolder
  //     .add(directionalLight.shadow.camera, "right", -500, 500)
  //     .name("Right Bound")
  //     .onChange(() => {
  //       directionalLight.shadow.camera.updateProjectionMatrix();
  //     });
  //   shadowFolder
  //     .add(directionalLight.shadow.camera, "top", -500, 500)
  //     .name("Top Bound")
  //     .onChange(() => {
  //       directionalLight.shadow.camera.updateProjectionMatrix();
  //     });
  //   shadowFolder
  //     .add(directionalLight.shadow.camera, "bottom", -500, 500)
  //     .name("Bottom Bound")
  //     .onChange(() => {
  //       directionalLight.shadow.camera.updateProjectionMatrix();
  //     });
  //   shadowFolder
  //     .add(directionalLight.shadow.camera, "near", 0.1, 100)
  //     .name("Near")
  //     .onChange(() => {
  //       directionalLight.shadow.camera.updateProjectionMatrix();
  //     });
  //   shadowFolder
  //     .add(directionalLight.shadow.camera, "far", 0.1, 1000)
  //     .name("Far")
  //     .onChange(() => {
  //       directionalLight.shadow.camera.updateProjectionMatrix();
  //     });
  //   shadowFolder.open();
}
