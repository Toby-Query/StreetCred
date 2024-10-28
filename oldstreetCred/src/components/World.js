import * as THREE from "three";

export function createWorld() {
  let height = 200;
  // Create the world (a large plane for now)
  const planeGeometry = new THREE.PlaneGeometry(20, height);
  const planeMaterial = new THREE.MeshPhongMaterial({
    color: 0x808080,
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2; // Make the plane horizontal

  // Set the position so the car can start from one end
  plane.position.set(0, 0, -height / 2); // Adjust the Z position to set the starting point for the car
  plane.receiveShadow = true; // Allow the plane to receive shadows

  return plane;
}
