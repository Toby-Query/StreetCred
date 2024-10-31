import * as THREE from "three";
import * as CANNON from "cannon-es";

export function setupFloor(scene, world) {
  //width and height
  const width = 10;
  const height = 200;

  const floorGeo = new THREE.PlaneGeometry(width, height);
  const floorMesh = new THREE.Mesh(
    floorGeo,
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0,
    })
  );
  floorMesh.rotation.x = -Math.PI * 0.5;
  //set position
  floorMesh.position.z = height / 2;

  floorMesh.receiveShadow = true;

  scene.add(floorMesh);

  const floorShape = new CANNON.Plane();
  const floorBody = new CANNON.Body({ mass: 0 });
  floorBody.addShape(floorShape);
  floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1, 0, 0),
    Math.PI * 0.5
  );
  world.addBody(floorBody);
}

export function createBox({
  size = [2, 4, 2],
  color = 0x00ff00,
  mass = 5000,
  position = [0, 0, 0],
  scene,
  world,
}) {
  // Create a Three.js box
  const [width, height, depth] = size;
  const geo = new THREE.BoxGeometry(width, height, depth);
  const mat = new THREE.MeshBasicMaterial({ color });
  const mesh = new THREE.Mesh(geo, mat);

  // Set initial position for the Three.js mesh
  mesh.position.set(...position);

  // Add the mesh to the Three.js scene
  scene.add(mesh);

  // Create a Cannon.js box with half-extents for the physics shape
  const shape = new CANNON.Box(
    new CANNON.Vec3(width / 2, height / 2, depth / 2)
  );
  const body = new CANNON.Body({ mass });
  body.addShape(shape);

  // Set the initial position for the Cannon.js body
  body.position.set(...position);

  // Add the body to the Cannon.js world
  world.addBody(body);

  // Return both mesh and body for further control if needed
  return { mesh, body };
}
