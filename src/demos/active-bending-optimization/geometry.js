import * as THREE from "three";

export default class Geometry {
  constructor(scene, vertices) {
    this.scene = scene;
    this.createGeometry(vertices);
  }

  createGeometry(vertices) {
    const geometry = new THREE.BufferGeometry();
    let indices = this._generateIndices(vertices.length);
    vertices = new Float32Array(vertices.flat());
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    this.material = new THREE.LineBasicMaterial({
      color: 0xaa4444,
    });
    this.lines = new THREE.LineSegments(geometry, this.material);
    this.scene.add(this.lines);
  }

  updateGeometry(vertices) {
    let position = this.lines.geometry.getAttribute("position");
    position.array = new Float32Array(vertices.flat());
    position.needsUpdate = true;
  }

  clearGeometry() {
    this.lines.geometry.dispose();
    this.lines.material.dispose();
    this.scene.remove(this.lines);
  }

  _generateIndices(length) {
    let indices = [];
    for (let i = 1; i < length; i++) {
      indices.push(i - 1, i);
    }
    return indices;
  }
}
