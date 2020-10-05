import { math, angleBetweenVectors } from "../../dynamic-relaxation/mathjs";

export default class HingeOptimizer {
  constructor(solver, hingeGoals, barGoals, targetCurve) {
    this.solver = solver;
    this.hingeGoals = hingeGoals;
    this.barGoals = barGoals;
    this.targetCurve = targetCurve;
    this.targetCurveUpdated();
    this.step = 1;
    this.angleTolerance = (2 * Math.PI) / 360;
  }

  targetCurveUpdated() {
    const n = this.solver.vertices.length;
    const curve = this.targetCurve.curve;
    let targetPoints = curve.getPoints(n - 1);
    targetPoints = targetPoints.map((v) => [v.x, v.y, v.z]);
    this.updateTargetAngles(targetPoints);
    this.updateLengths(targetPoints);
  }

  updateTargetAngles(targetPoints) {
    this.targetAngles = this.getAngles(targetPoints);
  }

  updateLengths(targetPoints) {
    for (let i = 0; i < targetPoints.length - 1; i++) {
      let v = math.subtract(targetPoints[i], targetPoints[i + 1]);
      let length = math.norm(v);
      this.barGoals[i].restLength = length;
    }
  }

  getAngles(points) {
    let angles = [];
    for (let i = 1; i < points.length - 1; i++) {
      let v1 = math.subtract(points[i - 1], points[i]);
      let v2 = math.subtract(points[i + 1], points[i]);
      angles.push(angleBetweenVectors(v1, v2));
    }
    return angles;
  }

  optimize() {
    let vertices = this.solver.vertices;
    let currAngles = this.getAngles(vertices);
    let diffAngles = math.subtract(currAngles, this.targetAngles);
    if (math.max(diffAngles) < this.angleTolerance) {
      return;
    }
    for (let i = 0; i < this.hingeGoals.length; i++) {
      this.hingeGoals[i].strength =
        this.hingeGoals[i].strength * (1 - this.step * diffAngles[i]);
    }
    this.solver.resumeSimulation();
  }
}
