import { math } from "./mathjs";

class BaseGoal {}

export class AnchorGoal extends BaseGoal {
  constructor(vertexIndex, position, strength) {
    super();
    this.vertexIndex = vertexIndex;
    this.position = position;
    this.strength = strength;
  }
  calculate(vertices, residuals) {
    let r = math.subtract(this.position, vertices[this.vertexIndex]);
    r = math.dotMultiply(r, this.strength);
    residuals[this.vertexIndex] = math.add(residuals[this.vertexIndex], r);
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
    let r = math.dotMultiply(this.force, this.strength);
    residuals[this.vertexIndex] = math.add(residuals[this.vertexIndex], r);
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
    let vectorAB = math.subtract(
      vertices[this.vertexIndexB],
      vertices[this.vertexIndexA]
    );
    let length = math.norm(vectorAB);
    let strain = 1 - this.restLength / length;
    let r = math.dotMultiply(vectorAB, strain * this.strength);
    residuals[this.vertexIndexA] = math.add(residuals[this.vertexIndexA], r);
    r = math.dotMultiply(r, -1);
    residuals[this.vertexIndexB] = math.add(residuals[this.vertexIndexB], r);
  }
  addStiffness(stiffnesses) {
    stiffnesses[this.vertexIndexA] += this.strength;
    stiffnesses[this.vertexIndexB] += this.strength;
  }
}
