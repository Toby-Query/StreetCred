// followCamera.js
import * as THREE from "three";

export class FollowCamera {
  constructor(camera, offset = new THREE.Vector3(0, 2, -6)) {
    this.camera = camera;
    this.offset = offset;
  }

  update(carPosition, carQuaternion) {
    // Calculate the world offset using the car's orientation
    const worldOffset = this.offset.clone().applyQuaternion(carQuaternion);
    const cameraPosition = carPosition.clone().add(worldOffset);

    // Smoothly transition the camera to the calculated position
    this.camera.position.lerp(cameraPosition, 0.1);
    this.camera.lookAt(carPosition);
  }
}
