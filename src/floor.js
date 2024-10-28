import * as THREE from "three";
import * as CANNON from "cannon-es";

export function setupFloor(scene, world) {
  //width and height
  const width = 10;
  const height = 100;

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
