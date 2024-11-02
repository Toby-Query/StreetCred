import * as THREE from "three";
import * as CANNON from "cannon-es";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";

export function setupFloor(scene, world) {
  //width and height
  const width = 800;
  const height = 800;

  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(
    "/textures/asphalt/asphalt_02_diff_4k.jpg"
  );
  // Set the texture's repeat properties
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(80, 80); // Apply texture scaling

  const floorGeo = new THREE.PlaneGeometry(width, height);
  const floorMesh = new THREE.Mesh(
    floorGeo,
    new THREE.MeshStandardMaterial({
      //color: 0xffffff,
      roughness: 0.5,
      metalness: 0,
      map: texture,
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
export function setupPhysFloor(world) {
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
  texture = null, // New parameter for texture
  mass = 5000,
  position = [0, 0, 0],
  rotationY = 0, // Rotation around the y-axis in radians
  scene,
  world,
}) {
  // Create a Three.js box
  const [width, height, depth] = size;
  const geo = new THREE.BoxGeometry(width, height, depth);

  // Create material with texture or color
  const mat = texture
    ? new THREE.MeshStandardMaterial({ map: texture }) // Apply texture if provided
    : new THREE.MeshStandardMaterial({ color }); // Apply color if no texture is provided

  const mesh = new THREE.Mesh(geo, mat);

  // Set initial position and rotation for the Three.js mesh
  mesh.position.set(...position);
  mesh.rotation.y = rotationY; // Apply y-axis rotation to the mesh

  //cast shadows
  mesh.castShadow = true;

  //receive shadows
  mesh.receiveShadow = true;

  // Add the mesh to the Three.js scene
  scene.add(mesh);

  // Create a Cannon.js box with half-extents for the physics shape
  const shape = new CANNON.Box(
    new CANNON.Vec3(width / 2, height / 2, depth / 2)
  );
  const body = new CANNON.Body({ mass });
  body.addShape(shape);

  // Set the initial position and rotation for the Cannon.js body
  body.position.set(...position);
  body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotationY); // Apply y-axis rotation to the body

  // Add the body to the Cannon.js world
  world.addBody(body);

  // Return both mesh and body for further control if needed
  return { mesh, body };
}

export function createColliderBox({
  size = [2, 4, 2],
  color = 0x00ff00,
  texture = null, // New parameter for texture
  mass = 5000,
  position = [0, 0, 0],
  rotationY = 0, // Rotation around the y-axis in radians
  scene,
  world,
}) {
  // Create a Three.js box
  const [width, height, depth] = size;
  // Create a Cannon.js box with half-extents for the physics shape
  const shape = new CANNON.Box(
    new CANNON.Vec3(width / 2, height / 2, depth / 2)
  );
  const body = new CANNON.Body({ mass });
  body.addShape(shape);

  // Set the initial position and rotation for the Cannon.js body
  body.position.set(...position);
  body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotationY); // Apply y-axis rotation to the body

  // Add the body to the Cannon.js world
  world.addBody(body);

  // Return both mesh and body for further control if needed
  return { body };
}

// Function to create a goal area without physics
export function createGoalBox({
  size = [13, 6, 10],
  color = 0x0000ff,
  position = [370, 3, 5],
  scene,
  label = "GOAL",
}) {
  const [width, height, depth] = size;

  // Create the Three.js box mesh
  const geo = new THREE.BoxGeometry(width, height, depth);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.5, // Set opacity for visibility but not obtrusive
  });
  const mesh = new THREE.Mesh(geo, mat);

  // Set initial position
  mesh.position.set(...position);

  // Add the box to the scene
  scene.add(mesh);

  // Optionally, add a label above the goal box
  // const loader = new FontLoader();
  // loader.load("path/to/font.json", function (font) {
  //   const textGeo = new THREE.TextGeometry(label, {
  //     font: font,
  //     size: 2,
  //     height: 0.5,
  //   });
  //   const textMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  //   const textMesh = new THREE.Mesh(textGeo, textMat);
  //   textMesh.position.set(
  //     position[0],
  //     position[1] + height / 2 + 1,
  //     position[2]
  //   );
  //   scene.add(textMesh);
  // });
  return mesh;
}

// Function to create a ramp
export function createRamp(scene, world) {
  const factor = 50;
  // Ramp dimensions
  const rampWidth = factor * 5;
  const rampHeight = factor * 0.5;
  const rampDepth = factor * 10;
  const rampAngle = Math.PI / 8; // 30 degrees

  // Create Three.js ramp mesh
  const rampGeometry = new THREE.BoxGeometry(rampWidth, rampHeight, rampDepth);
  const rampMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const rampMesh = new THREE.Mesh(rampGeometry, rampMaterial);
  rampMesh.castShadow = true;
  rampMesh.receiveShadow = true;

  // Position and rotate the ramp
  rampMesh.position.set(0, rampHeight / 2, 0); // Adjust position as needed
  rampMesh.rotation.x = -rampAngle;
  scene.add(rampMesh);

  // Create Cannon-ES ramp body
  const rampShape = new CANNON.Box(
    new CANNON.Vec3(rampWidth / 2, rampHeight / 2, rampDepth / 2)
  );
  const rampBody = new CANNON.Body({
    mass: 0, // Static object
    shape: rampShape,
    wireframe: true,
  });
  rampBody.position.set(0, rampHeight / 2, 0); // Position the physics body
  rampBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -rampAngle); // Rotate to match mesh
  world.addBody(rampBody);

  // Add wireframe visualization for the physics body
  //const wireframe = addPhysicsWireframe(rampShape, 0x00ff00); // Green wireframe color
  //scene.add(wireframe);

  // Sync the wireframe with the Cannon body in the animation loop
  //rampBody.threeWireframe = wireframe;

  return { rampMesh, rampBody };
}

// Helper function to create a wireframe for Cannon-ES body
function addPhysicsWireframe(cannonShape, color) {
  // Create Three.js wireframe geometry based on the shape
  const geometry = new THREE.BoxGeometry(
    cannonShape.halfExtents.x * 2,
    cannonShape.halfExtents.y * 2,
    cannonShape.halfExtents.z * 2
  );

  // Wireframe material
  const wireframeMaterial = new THREE.LineBasicMaterial({ color });
  const wireframe = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    wireframeMaterial
  );

  return wireframe;
}
