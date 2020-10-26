import { Status } from "../../dynamic-relaxation/solver";
import { BarGoal, HingeGoal } from "../../dynamic-relaxation/goals";
import { vec3 } from "gl-matrix";
import { angleBetweenVectors } from "../../dynamic-relaxation/utility";

export default class HingeOptimizer {
  constructor(solver, targetCurve) {
    this.solver = solver;
    this.vertices = [];
    this.angles = [];
    this.targetAngles = [];
    this.diffAngles = [];
    this.hingeGoals = [];
    this.barGoals = [];
    this.goalsUpdated();
    this.targetCurve = targetCurve;
    this.targetCurveUpdated();
    this.step = 1;
    this.angleTolerance = (2 * Math.PI) / 360;
    this.status = "initialized";
  }

  solverVerticesUpdated() {
    this.vertices = this.solver.vertices;
    let len = this.vertices.length - 2;
    this.angles = new Array(len);
    this.targetAngles = new Array(len);
    this.diffAngles = new Array(len);
  }

  goalsUpdated() {
    this.solverVerticesUpdated();
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
    this._getAngles(this.targetAngles, targetPoints);
  }

  _updateLengths(targetPoints) {
    let v = vec3.create();
    for (let i = 0; i < targetPoints.length - 1; i++) {
      vec3.sub(v, targetPoints[i], targetPoints[i + 1]);
      let length = vec3.len(v);
      this.barGoals[i].restLength = length;
    }
  }

  _getAngles(out, points) {
    let v1 = vec3.create();
    let v2 = vec3.create();
    for (let i = 1; i < points.length - 1; i++) {
      vec3.sub(v1, points[i - 1], points[i]);
      vec3.sub(v2, points[i + 1], points[i]);
      out[i - 1] = angleBetweenVectors(v1, v2);
    }
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

  _setDiffAngles() {
    for (let i = 0; i < this.angles.length; i++) {
      this.diffAngles[i] = this.angles[i] - this.targetAngles[i];
    }
  }

  _optimize() {
    this._getAngles(this.angles, this.vertices);
    this._setDiffAngles();
    if (Math.max(...this.diffAngles) < this.angleTolerance) {
      this.stopOptimization("done");
      return;
    }
    for (let i = 0; i < this.hingeGoals.length; i++) {
      this.hingeGoals[i].strength = Math.max(
        0.05,
        this.hingeGoals[i].strength * (1 - this.step * this.diffAngles[i])
      );
    }
    if (this.gui.gui.run) {
      this.solver.resumeSimulation();
    }
  }
}
