go to your level,
After the line:
scene.environment = loadCubeTextures();

add your boxes like:
const box1 = createBox({
  size: [2, 4, 2],
  color: 0xff0000,
  mass: 5000,
  position: [0, 50, 100],
  scene: scene,
  world: world,
});
scene and world should striclty be that, the rest feel free to change

then go to:
const tick = () => {
  stats.begin();
  controls.update();

then add somex like:
box1.mesh.position.set(
    box1.body.position.x,
    box1.body.position.y,
    box1.body.position.z
  );

There you go, you are done with the first box

- The y position should probably be equal or greater to half your height
