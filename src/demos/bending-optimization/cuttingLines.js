import * as THREE from "three";

export default class CuttingLines {
  constructor(scene) {
    this.scene = scene;
    this.overallWidth = 1;
    this.connectorWidth = 0.1;
    this.materialThickness = 0.1;
    this.ccDistanceBetweenElements = 0.5;
    this.minSpacing = 0.01;
    this.vertices = [];
    this.indices = [];
  }

  _scaleTorsionConsts() {
    let maxConst = Math.max(...this.torsionConsts);
    let maxAllowedConst = this._calculateTorsionConst(
      this.ccDistanceBetweenElements - this.minSpacing,
      this.materialThickness
    );
    let factor = maxAllowedConst / maxConst;
    this.torsionConsts = this.torsionConsts.map((value) => value * factor);
  }

  _calculateTorsionConst(width) {
    // a > b
    if (width > this.materialThickness) {
      var [a, b] = [width / 2, this.materialThickness / 2];
    } else {
      var [a, b] = [this.materialThickness / 2, width / 2];
    }
    const J =
      a * b ** 3 * (16 / 3 - 3.36 * (b / a) * (1 - (b ** 4 / 12) * a ** 4));
    return J;
  }

  _calculateElementWidths() {
    this.elementWidths = this.torsionConsts.map((value) =>
      secantMethod(
        (w) => {
          return this._calculateTorsionConst(w) - value;
        },
        0,
        this.ccDistanceBetweenElements - this.minSpacing,
        0.05,
        5
      )
    );
  }

  _generateLineIndices() {}

  setTorsionConstants(torsionConsts) {
    this.torsionConsts = torsionConsts;
    this._scaleTorsionConsts();
  }

  draw() {
    this._calculateElementWidths();
    this._createVertices();
    this._createIndices();
    this._createGeometry();
  }

  _clearGeometry() {
    if (!this.lines) {
      return;
    }
    this.lines.geometry.dispose();
    this.lines.material.dispose();
    this.scene.remove(this.lines);
  }

  _createGeometry() {
    this._clearGeometry();
    const geometry = new THREE.BufferGeometry();
    let vertices = new Float32Array(this.vertices.flat());
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(this.indices);
    const material = new THREE.LineBasicMaterial({
      color: 0xaa4444,
    });
    this.lines = new THREE.LineSegments(geometry, material);
    this.scene.add(this.lines);
  }

  _createVertices() {
    this.vertices = [];
    let yOffset = 0;
    let defaultWidth = this.ccDistanceBetweenElements / 2;
    this.vertices.push([0, yOffset - defaultWidth / 2, 0]);
    this.vertices.push([this.overallWidth / 2, yOffset - defaultWidth / 2, 0]);
    this.vertices.push([
      this.overallWidth / 2 - this.connectorWidth,
      yOffset + defaultWidth / 2,
      0,
    ]);
    this.vertices.push([0, yOffset - defaultWidth / 2, 0]);
    this.vertices.push([-this.overallWidth / 2, yOffset - defaultWidth / 2, 0]);
    this.vertices.push([
      -this.overallWidth / 2 + this.connectorWidth,
      yOffset + defaultWidth / 2,
      0,
    ]);
    let ySign = -1;
    for (let width of this.elementWidths) {
      yOffset += this.ccDistanceBetweenElements;
      this._addElementVertices(width, yOffset, ySign, 1);
      this._addElementVertices(width, yOffset, ySign, -1);
      ySign *= -1;
    }
    yOffset += this.ccDistanceBetweenElements;
    if (this.elementWidths.length % 2 == 0) {
      this.vertices.push([
        this.overallWidth / 2 - this.connectorWidth,
        yOffset - defaultWidth / 2,
        0,
      ]);
      this.vertices.push([
        this.overallWidth / 2,
        yOffset + defaultWidth / 2,
        0,
      ]);
      this.vertices.push([0, yOffset + defaultWidth / 2, 0]);
      this.vertices.push([
        -this.overallWidth / 2 + this.connectorWidth,
        yOffset - defaultWidth / 2,
        0,
      ]);
      this.vertices.push([
        -this.overallWidth / 2,
        yOffset + defaultWidth / 2,
        0,
      ]);
      this.vertices.push([0, yOffset + defaultWidth / 2, 0]);
    } else {
      this.vertices.push([this.connectorWidth, yOffset - defaultWidth / 2, 0]);
      this.vertices.push([
        this.overallWidth / 2,
        yOffset - defaultWidth / 2,
        0,
      ]);
      this.vertices.push([
        this.overallWidth / 2,
        yOffset + defaultWidth / 2,
        0,
      ]);
      this.vertices.push([0, yOffset + defaultWidth / 2, 0]);
      this.vertices.push([-this.connectorWidth, yOffset - defaultWidth / 2, 0]);
      this.vertices.push([
        -this.overallWidth / 2,
        yOffset - defaultWidth / 2,
        0,
      ]);
      this.vertices.push([
        -this.overallWidth / 2,
        yOffset + defaultWidth / 2,
        0,
      ]);
      this.vertices.push([0, yOffset + defaultWidth / 2, 0]);
    }
  }

  _createIndices() {
    this.indices = [];
    let endOffset = this.elementWidths.length % 2 !== 0 ? 8 : 0;
    for (let i = 0; i < this.vertices.length - endOffset; i += 12) {
      this.indices.push(i + 0, i + 1, i + 1, i + 7, i + 7, i + 8);
      this.indices.push(i + 3, i + 4, i + 4, i + 10, i + 10, i + 11);
      this.indices.push(i + 2, i + 6, i + 6, i + 9, i + 9, i + 5, i + 5, i + 2);
    }
    for (let i = 0; i < this.vertices.length - 12 - endOffset; i += 12) {
      this.indices.push(i + 8, i + 12);
      this.indices.push(i + 11, i + 15);
    }
    if (this.elementWidths.length % 2 !== 0) {
      let i = this.vertices.length - 8;
      this.indices.push(i - 4, i, i, i + 1, i + 1, i + 2, i + 2, i + 3);
      i += 4;
      this.indices.push(i - 5, i, i, i + 1, i + 1, i + 2, i + 2, i + 3);
    }
  }

  _addElementVertices(width, yCenter, ySign, xSign) {
    let verts = [];
    verts.push([xSign * this.connectorWidth, yCenter - (ySign * width) / 2, 0]);
    verts.push([
      (xSign * this.overallWidth) / 2,
      yCenter - (ySign * width) / 2,
      0,
    ]);
    verts.push([
      xSign * (this.overallWidth / 2 - this.connectorWidth),
      yCenter + (ySign * width) / 2,
      0,
    ]);
    if (ySign === -1) {
      verts.reverse();
    }
    this.vertices.push(...verts);
  }
}

function secantMethod(f, x0, x1, tol, maxIterations) {
  for (let i = 0; i < maxIterations; i++) {
    let x2 = x1 - (f(x1) * (x1 - x0)) / (f(x1) - f(x0));
    x0 = x1;
    x1 = x2;
    if (x1 - x0 < tol) {
      return x1;
    }
  }
  return x1;
}
