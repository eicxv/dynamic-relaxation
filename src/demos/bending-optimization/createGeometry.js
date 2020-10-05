import * as THREE from "three";

export default function createGeometry(scene, vertices) {
  const geometry = new THREE.BufferGeometry();
  let indices = generateIndices(vertices.length);
  vertices = new Float32Array(vertices.flat());
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  const material = new THREE.LineBasicMaterial({
    color: 0xaa4444,
  });
  let lines = new THREE.LineSegments(geometry, material);
  scene.add(lines);

  function updateGeometry(vertices) {
    let position = lines.geometry.getAttribute("position");
    position.array = new Float32Array(vertices.flat());
    position.needsUpdate = true;
  }
  return updateGeometry;
}

function generateIndices(length) {
  let indices = [];
  for (let i = 1; i < length; i++) {
    indices.push(i - 1, i);
  }
  return indices;
}
