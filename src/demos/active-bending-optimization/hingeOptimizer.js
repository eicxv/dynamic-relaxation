import { math, angleBetweenVectors } from "../../dynamic-relaxation/mathjs";
import { Status } from "../../dynamic-relaxation/solver";
import { BarGoal, HingeGoal } from "../../dynamic-relaxation/goals";

export default class HingeOptimizer {
  constructor(solver, targetCurve) {
    this.solver = solver;
    this.hingeGoals = [];
    this.barGoals = [];
    this.goalsUpdated();
    this.targetCurve = targetCurve;
    this.targetCurveUpdated();
    this.step = 1;
    this.angleTolerance = (2 * Math.PI) / 360;
    this.status = "initialized";
  }

  goalsUpdated() {
    this.hingeGoals = this.solver.goals.filter(
      (goal) => goal instanceof HingeGoal
    );
    this.barGoals = this.solver.goals.filter((goal) => goal instanceof BarGoal);
  }

  targetCurveUpdated() {
    this.status = "curve updated";
    const n = this.solver.vertices.length;
    const curve = this.targetCurve.curve;
    let targetPoints = curve.getPoints(n - 1);
    targetPoints = targetPoints.map((v) => [v.x, v.y, v.z]);
    this._updateTargetAngles(targetPoints);
    this._updateLengths(targetPoints);
  }

  _updateTargetAngles(targetPoints) {
    this.targetAngles = this._getAngles(targetPoints);
  }

  _updateLengths(targetPoints) {
    for (let i = 0; i < targetPoints.length - 1; i++) {
      let v = math.subtract(targetPoints[i], targetPoints[i + 1]);
      let length = math.norm(v);
      this.barGoals[i].restLength = length;
    }
  }

  _getAngles(points) {
    let angles = [];
    for (let i = 1; i < points.length - 1; i++) {
      let v1 = math.subtract(points[i - 1], points[i]);
      let v2 = math.subtract(points[i + 1], points[i]);
      angles.push(angleBetweenVectors(v1, v2));
    }
    return angles;
  }

  _onConverge(status) {
    if (status === Status.CONVERGED) {
      this._optimize();
    }
  }

  startOptimization() {
    this.status = "running";
    let onConverge = this._onConverge.bind(this);
    this._onConvergeIdentifier = this.solver.onStatusChange(onConverge);
    this._optimize();
  }

  stopOptimization(status = "stopped") {
    this.status = status;
    this.solver.removeOnStatusChange(this._onConvergeIdentifier);
  }

  _optimize() {
    let vertices = this.solver.vertices;
    let currAngles = this._getAngles(vertices);
    let diffAngles = math.subtract(currAngles, this.targetAngles);
    if (math.max(diffAngles) < this.angleTolerance) {
      this.stopOptimization("done");
      return;
    }
    for (let i = 0; i < this.hingeGoals.length; i++) {
      this.hingeGoals[i].strength = Math.max(
        0.05,
        this.hingeGoals[i].strength * (1 - this.step * diffAngles[i])
      );
    }
    if (this.gui.gui.run) {
      this.solver.resumeSimulation();
    }
  }
}
