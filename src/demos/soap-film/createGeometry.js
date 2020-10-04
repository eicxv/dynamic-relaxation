import * as THREE from "three";

export default function createGeometry(scene, vertices, indices) {
  const geometry = new THREE.BufferGeometry();
  vertices = new Float32Array(vertices.flat());
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  const material = new THREE.MeshBasicMaterial({
    color: 0xaa4444,
    side: THREE.DoubleSide,
    wireframe: true,
  });
  let mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  function updateGeometry(vertices) {
    let position = mesh.geometry.getAttribute("position");
    position.array = new Float32Array(vertices.flat());
    position.needsUpdate = true;
  }
  return updateGeometry;
}
