import { math, angleBetweenVectors } from "./mathjs";

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
    let vectorMidA = math.subtract(
      vertices[this.vertexIndexEndA],
      vertices[this.vertexIndexMid]
    );
    let vectorMidB = math.subtract(
      vertices[this.vertexIndexEndB],
      vertices[this.vertexIndexMid]
    );
    let angle = angleBetweenVectors(vectorMidA, vectorMidB);
    let strain = angle - this.restAngle;
    let perp = math.cross(vectorMidA, vectorMidB);

    let forceA = math.cross(vectorMidA, perp);
    forceA = math.dotMultiply(
      forceA,
      (this.strength * strain) / (math.norm(forceA) * math.norm(vectorMidA))
    );
    let forceB = math.cross(vectorMidB, perp);
    forceB = math.dotMultiply(
      forceB,
      (this.strength * strain) / (math.norm(forceB) * math.norm(vectorMidB))
    );

    residuals[this.vertexIndexEndA] = math.subtract(
      residuals[this.vertexIndexEndA],
      forceA
    );
    residuals[this.vertexIndexEndB] = math.add(
      residuals[this.vertexIndexEndB],
      forceB
    );
    residuals[this.vertexIndexMid] = math
      .chain(residuals[this.vertexIndexMid])
      .add(forceA)
      .subtract(forceB)
      .done();
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
    let p1p2 = math.subtract(p2, p1);
    let p1p3 = math.subtract(p3, p1);
    let crossProduct = math.cross(p1p2, p1p3);
    let area = math.norm(crossProduct) / 2;
    return area;
  }

  _applyForce(vertices, residuals, vertexIndexA, vertexIndexB, angle) {
    let vectorAB = math.subtract(
      vertices[vertexIndexB],
      vertices[vertexIndexA]
    );
    let length = math.norm(vectorAB);
    let sigma = this.strength;
    let tension = (sigma * length) / (2 * math.tan(angle));
    let r = math.dotMultiply(vectorAB, tension / length);
    residuals[vertexIndexA] = math.add(residuals[vertexIndexA], r);
    r = math.dotMultiply(r, -1);
    residuals[vertexIndexB] = math.add(residuals[vertexIndexB], r);
  }

  _vectorAngle(a, b) {
    let angle = math.acos(math.dot(a, b) / (math.norm(a) * math.norm(b)));
    return angle;
  }

  calculate(vertices, residuals) {
    let angle;
    let v1;
    let v2;

    v1 = math.subtract(
      vertices[this.vertexIndexC],
      vertices[this.vertexIndexA]
    );
    v2 = math.subtract(
      vertices[this.vertexIndexC],
      vertices[this.vertexIndexB]
    );
    angle = this._vectorAngle(v1, v2);

    this._applyForce(
      vertices,
      residuals,
      this.vertexIndexA,
      this.vertexIndexB,
      angle
    );
    v1 = math.subtract(
      vertices[this.vertexIndexA],
      vertices[this.vertexIndexB]
    );
    v2 = math.subtract(
      vertices[this.vertexIndexA],
      vertices[this.vertexIndexC]
    );
    angle = this._vectorAngle(v1, v2);
    this._applyForce(
      vertices,
      residuals,
      this.vertexIndexB,
      this.vertexIndexC,
      angle
    );
    v1 = math.subtract(
      vertices[this.vertexIndexB],
      vertices[this.vertexIndexC]
    );
    v2 = math.subtract(
      vertices[this.vertexIndexB],
      vertices[this.vertexIndexA]
    );
    angle = this._vectorAngle(v1, v2);
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
