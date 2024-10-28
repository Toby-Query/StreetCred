import * as THREE from "three";

export function loadCubeTextures() {
  const cubeTextureLoader = new THREE.CubeTextureLoader();
  return cubeTextureLoader.load([
    "/textures/environmentMaps/px.png",
    "/textures/environmentMaps/nx.png",
    "/textures/environmentMaps/py.png",
    "/textures/environmentMaps/ny.png",
    "/textures/environmentMaps/pz.png",
    "/textures/environmentMaps/nz.png",
  ]);
}
