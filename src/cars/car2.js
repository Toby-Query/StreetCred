import * as THREE from "three";
import * as CANNON from "cannon-es";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

export default class Car2 {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.car = {};
    this.chassis = {};
    this.wheels = [];
    this.targetPosition = null; // Target position for the AI
    this.chassisDimension = { x: 1.96, y: 1, z: 4.47 };
    this.chassisModelPos = { x: 0, y: -0.59, z: 0 };
    this.wheelScale = { frontWheel: 0.67, hindWheel: 0.67 };
    this.mass = 250;
  }

  // Set the target position for AI navigation
  setTarget(position) {
    this.targetPosition = new CANNON.Vec3(position.x, position.y, position.z);
  }

  init() {
    this.loadModels();
    this.setupChassis();
    this.setInitialPosition({ x: 2, y: 2, z: 0 }, { x: 0, y: 0, z: 0 });
    this.setupWheels();
    this.update();
  }

  loadModels() {
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderConfig({ type: "js" });
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load("./car/chassis.gltf", (gltf) => {
      this.chassis = gltf.scene;
      this.scene.add(this.chassis);
    });

    for (let i = 0; i < 4; i++) {
      gltfLoader.load("./car/wheel.gltf", (gltf) => {
        const wheelModel = gltf.scene;
        this.wheels.push(wheelModel);
        this.scene.add(wheelModel);
      });
    }
  }

  setupChassis() {
    const chassisShape = new CANNON.Box(
      new CANNON.Vec3(
        this.chassisDimension.x * 0.5,
        this.chassisDimension.y * 0.5,
        this.chassisDimension.z * 0.5
      )
    );
    const chassisBody = new CANNON.Body({
      mass: this.mass,
      material: new CANNON.Material({ friction: 0.3 }),
    });
    chassisBody.addShape(chassisShape);

    this.car = new CANNON.RaycastVehicle({
      chassisBody,
      indexRightAxis: 0,
      indexUpAxis: 1,
      indexForwardAxis: 2,
    });
    this.car.addToWorld(this.world);
  }

  setupWheels() {
    const wheelOptions = {
      radius: 0.34,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: 55,
      suspensionRestLength: 0.5,
      frictionSlip: 30,
      dampingRelaxation: 2.3,
      dampingCompression: 4.3,
      maxSuspensionForce: 10000,
      rollInfluence: 0.01,
      axleLocal: new CANNON.Vec3(-1, 0, 0),
      maxSuspensionTravel: 1,
      customSlidingRotationalSpeed: 30,
    };

    // Positions for wheels on each corner
    const wheelPositions = [
      new CANNON.Vec3(0.75, 0.1, -1.32), // Front right
      new CANNON.Vec3(-0.78, 0.1, -1.32), // Front left
      new CANNON.Vec3(0.75, 0.1, 1.25), // Back right
      new CANNON.Vec3(-0.78, 0.1, 1.25), // Back left
    ];

    // Add each wheel to CANNON vehicle
    wheelPositions.forEach((position) => {
      this.car.addWheel({
        ...wheelOptions,
        chassisConnectionPointLocal: position,
      });
    });
  }

  // AI movement control towards target
  driveToTarget() {
    if (!this.targetPosition) return;

    const maxForce = 750;
    const maxSteerVal = 0.5;

    const direction = new CANNON.Vec3()
      .copy(this.targetPosition)
      .vsub(this.car.chassisBody.position);
    const distance = direction.length();
    direction.normalize();

    const carForward = this.car.chassisBody.quaternion.vmult(
      new CANNON.Vec3(0, 0, -1)
    );
    const dotProduct = direction.dot(carForward);
    const angleToTarget = Math.acos(Math.max(-1, Math.min(1, dotProduct)));

    const steerValue =
      (direction.cross(carForward).y > 0 ? 1 : -1) *
      maxSteerVal *
      Math.min(1, angleToTarget / Math.PI);

    this.car.setSteeringValue(steerValue, 2); // Front left wheel
    this.car.setSteeringValue(steerValue, 3); // Front right wheel

    if (distance > 1) {
      this.car.applyEngineForce(-maxForce, 0);
      this.car.applyEngineForce(-maxForce, 1);
      this.car.applyEngineForce(-maxForce, 2);
      this.car.applyEngineForce(-maxForce, 3);
    } else {
      this.car.applyEngineForce(0, 0);
      this.car.applyEngineForce(0, 1);
      this.car.applyEngineForce(0, 2);
      this.car.applyEngineForce(0, 3);
    }
  }

  setInitialPosition(
    position = { x: 0, y: 4, z: 0 },
    rotation = { x: 0, y: 0, z: 0 }
  ) {
    this.car.chassisBody.position.set(position.x, position.y, position.z);
    const quaternion = new CANNON.Quaternion();
    quaternion.setFromEuler(rotation.x, rotation.y, rotation.z);
    this.car.chassisBody.quaternion.copy(quaternion);
    this.car.chassisBody.velocity.set(0, 0, 0);
    this.car.chassisBody.angularVelocity.set(0, 0, 0);
  }

  update() {
    const updateWorld = () => {
      if (
        this.car.wheelInfos &&
        this.chassis.position &&
        this.wheels[0].position
      ) {
        this.chassis.position.set(
          this.car.chassisBody.position.x + this.chassisModelPos.x,
          this.car.chassisBody.position.y + this.chassisModelPos.y,
          this.car.chassisBody.position.z + this.chassisModelPos.z
        );
        this.chassis.quaternion.copy(this.car.chassisBody.quaternion);

        // Correct wheel positions and rotations
        for (let i = 0; i < 4; i++) {
          if (this.car.wheelInfos[i]) {
            this.car.updateWheelTransform(i);

            // Positioning and rotating wheels
            this.wheels[i].position.copy(
              this.car.wheelInfos[i].worldTransform.position
            );

            // Adjust quaternion to align with the wheel's axis
            // const rotationCorrection = new THREE.Quaternion();
            // rotationCorrection.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0);
            // this.wheels[i].quaternion
            //   .copy(this.car.wheelInfos[i].worldTransform.quaternion)
            //   .multiply(rotationCorrection);
          }
        }
      }
      this.driveToTarget(); // Run AI driving logic
    };

    this.world.addEventListener("postStep", updateWorld);
  }
}
