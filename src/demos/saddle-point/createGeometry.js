import * as THREE from "three";

export default function createGeometry(scene, vertices) {
  const geometry = new THREE.BufferGeometry();
  let size = Math.round(Math.sqrt(vertices.length));
  vertices = new Float32Array(vertices.flat());
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  let indices = generateLineGridIndices(size, size);
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

function generateLineGridIndices(rows, cols) {
  let indices = [];
  function toIndex(x, y) {
    return x * rows + y;
  }
  let corners = [
    0,
    toIndex(0, cols - 1),
    toIndex(rows - 1, 0),
    toIndex(rows - 1, cols - 1),
  ];
  function addLine(p1, p2) {
    if (p2[0] >= rows || p2[1] >= cols) {
      return;
    }
    for (let p of [p1, p2]) {
      if (corners.includes(toIndex(...p))) {
        return;
      }
    }
    indices.push(toIndex(...p1));
    indices.push(toIndex(...p2));
  }
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      addLine([row, col], [row + 1, col]);
      addLine([row, col], [row, col + 1]);
    }
  }
  return indices;
}
