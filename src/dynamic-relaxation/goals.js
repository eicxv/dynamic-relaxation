import { angleBetweenVectors } from "./utility";
import { vec3 } from "gl-matrix";

const temp1 = vec3.create();
const temp2 = vec3.create();
const temp3 = vec3.create();
const temp4 = vec3.create();
const temp5 = vec3.create();

class BaseGoal {}

export class AnchorGoal extends BaseGoal {
  constructor(vertexIndex, position, strength) {
    super();
    this.vertexIndex = vertexIndex;
    this.position = vec3.clone(position);
    this.strength = strength;
  }
  calculate(vertices, residuals) {
    let r = vec3.sub(temp1, this.position, vertices[this.vertexIndex]);
    vec3.scaleAndAdd(
      residuals[this.vertexIndex],
      residuals[this.vertexIndex],
      r,
      this.strength
    );
  }
  addStiffness(stiffnesses) {
    stiffnesses[this.vertexIndex] += this.strength;
  }
}

export class ForceGoal extends BaseGoal {
  constructor(vertexIndex, force, strength) {
    super();
    this.vertexIndex = vertexIndex;
    this.force = force;
    this.strength = strength;
  }
  calculate(vertices, residuals) {
    vec3.scaleAndAdd(
      residuals[this.vertexIndex],
      residuals[this.vertexIndex],
      this.force,
      this.strength
    );
  }
  addStiffness(stiffnesses) {
    // no stiffness
  }
}

export class BarGoal extends BaseGoal {
  constructor(vertexIndexA, vertexIndexB, restLength, strength) {
    super();
    this.vertexIndexA = vertexIndexA;
    this.vertexIndexB = vertexIndexB;
    this.restLength = restLength;
    this.strength = strength;
  }

  calculate(vertices, residuals) {
    let vectorAB = vec3.sub(
      temp1,
      vertices[this.vertexIndexB],
      vertices[this.vertexIndexA]
    );
    let length = vec3.len(vectorAB, vectorAB);
    let strain = 1 - this.restLength / length;
    let r = vec3.scale(vectorAB, vectorAB, strain * this.strength);
    vec3.add(residuals[this.vertexIndexA], residuals[this.vertexIndexA], r);
    vec3.sub(residuals[this.vertexIndexB], residuals[this.vertexIndexB], r);
  }
  addStiffness(stiffnesses) {
    stiffnesses[this.vertexIndexA] += this.strength;
    stiffnesses[this.vertexIndexB] += this.strength;
  }
}

export class HingeGoal extends BaseGoal {
  constructor(
    vertexIndexEndA,
    vertexIndexEndB,
    vertexIndexMid,
    restAngle,
    strength
  ) {
    super();
    this.vertexIndexEndA = vertexIndexEndA;
    this.vertexIndexEndB = vertexIndexEndB;
    this.vertexIndexMid = vertexIndexMid;
    this.restAngle = restAngle;
    this.strength = strength;
  }

  calculate(vertices, residuals) {
    let vectorMidA = vec3.sub(
      temp1,
      vertices[this.vertexIndexEndA],
      vertices[this.vertexIndexMid]
    );
    let vectorMidB = vec3.sub(
      temp2,
      vertices[this.vertexIndexEndB],
      vertices[this.vertexIndexMid]
    );
    let angle = angleBetweenVectors(vectorMidA, vectorMidB);
    let strain = angle - this.restAngle;
    let perp = vec3.cross(temp3, vectorMidA, vectorMidB);

    let forceA = vec3.cross(temp4, vectorMidA, perp);
    forceA = vec3.scale(
      forceA,
      forceA,
      (this.strength * strain) / (vec3.len(forceA) * vec3.len(vectorMidA))
    );
    let forceB = vec3.cross(temp5, vectorMidB, perp);
    forceB = vec3.scale(
      forceB,
      forceB,
      (this.strength * strain) / (vec3.len(forceB) * vec3.len(vectorMidB))
    );
    vec3.sub(
      residuals[this.vertexIndexEndA],
      residuals[this.vertexIndexEndA],
      forceA
    );
    vec3.add(
      residuals[this.vertexIndexEndB],
      residuals[this.vertexIndexEndB],
      forceB
    );
    vec3.add(
      residuals[this.vertexIndexMid],
      residuals[this.vertexIndexMid],
      forceA
    );
    vec3.sub(
      residuals[this.vertexIndexMid],
      residuals[this.vertexIndexMid],
      forceB
    );
  }

  addStiffness(stiffnesses) {
    stiffnesses[this.vertexIndexEndA] += 80 * this.strength;
    stiffnesses[this.vertexIndexEndB] += 80 * this.strength;
    stiffnesses[this.vertexIndexMid] += 80 * 2 * this.strength;
  }
}

export class SoapFilmGoal extends BaseGoal {
  constructor(vertexIndexA, vertexIndexB, vertexIndexC, strength) {
    super();
    this.vertexIndexA = vertexIndexA;
    this.vertexIndexB = vertexIndexB;
    this.vertexIndexC = vertexIndexC;
    this.strength = strength;
  }

  _calculateArea(p1, p2, p3) {
    let p1p2 = vec3.sub(temp1, p2, p1);
    let p1p3 = vec3.sub(temp2, p3, p1);
    let crossProduct = vec3.cross(p1p2, p1p2, p1p3);
    let area = vec3.len(crossProduct) / 2;
    return area;
  }

  _applyForce(vertices, residuals, vertexIndexA, vertexIndexB, angle) {
    let vectorAB = vec3.sub(
      temp1,
      vertices[vertexIndexB],
      vertices[vertexIndexA]
    );
    let length = vec3.len(vectorAB);
    let sigma = this.strength;
    let tension = (sigma * length) / (2 * Math.tan(angle));
    let r = vec3.scale(vectorAB, vectorAB, tension / length);
    vec3.add(residuals[vertexIndexA], residuals[vertexIndexA], r);
    vec3.sub(residuals[vertexIndexB], residuals[vertexIndexB], r);
  }

  _vectorAngle(a, b) {
    return Math.acos(vec3.dot(a, b) / (vec3.len(a) * vec3.len(b)));
  }

  calculate(vertices, residuals) {
    let angle;
    let v1;
    let v2;

    v1 = vec3.sub(
      temp1,
      vertices[this.vertexIndexC],
      vertices[this.vertexIndexA]
    );
    v2 = vec3.sub(
      temp2,
      vertices[this.vertexIndexC],
      vertices[this.vertexIndexB]
    );
    angle = angleBetweenVectors(v1, v2);

    this._applyForce(
      vertices,
      residuals,
      this.vertexIndexA,
      this.vertexIndexB,
      angle
    );
    v1 = vec3.sub(
      temp1,
      vertices[this.vertexIndexA],
      vertices[this.vertexIndexB]
    );
    v2 = vec3.sub(
      temp2,
      vertices[this.vertexIndexA],
      vertices[this.vertexIndexC]
    );
    angle = angleBetweenVectors(v1, v2);
    this._applyForce(
      vertices,
      residuals,
      this.vertexIndexB,
      this.vertexIndexC,
      angle
    );
    v1 = vec3.sub(
      temp1,
      vertices[this.vertexIndexB],
      vertices[this.vertexIndexC]
    );
    v2 = vec3.sub(
      temp2,
      vertices[this.vertexIndexB],
      vertices[this.vertexIndexA]
    );
    angle = angleBetweenVectors(v1, v2);
    this._applyForce(
      vertices,
      residuals,
      this.vertexIndexC,
      this.vertexIndexA,
      angle
    );
  }
  addStiffness(stiffnesses) {
    stiffnesses[this.vertexIndexA] += this.strength * 50;
    stiffnesses[this.vertexIndexB] += this.strength;
    stiffnesses[this.vertexIndexC] += this.strength;
  }
}
