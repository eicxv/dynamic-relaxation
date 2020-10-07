import * as THREE from "three";

export default class BezierCurve {
  constructor(points, scene) {
    let controlPoints = points.map((v) => new THREE.Vector3(...v));
    this.curve = new THREE.CubicBezierCurve3(...controlPoints);

    var points = this.curve.getPoints(50);
    var geometry = new THREE.BufferGeometry().setFromPoints(points);
    var material = new THREE.LineBasicMaterial({ color: 0x449944 });
    this.sceneObject = new THREE.Line(geometry, material);
    scene.add(this.sceneObject);
  }

  update() {
    let position = this.sceneObject.geometry.getAttribute("position");
    let points = this.curve
      .getPoints(50)
      .map((v) => [v.x, v.y, v.z])
      .flat();
    position.array = new Float32Array(points);
    position.needsUpdate = true;
  }
}
