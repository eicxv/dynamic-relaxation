import { math } from "./mathjs";
import throttle from "lodash.throttle";

export default class Solver {
  constructor(vertices, terminationForce) {
    this.vertices = vertices;
    this.terminationForce = terminationForce;
    this.dt = 1;
    this.goals = [];
    this.velocities = math.zeros(vertices.length, 3).toArray();
    this.residuals = math.zeros(vertices.length, 3).toArray();
    this.energy = [0, 0, 0];
    this.mass = 1;
    this.status = "initialized";
    this.iterationCount = 0;

    this._verticesUpdated = throttle(() => {
      if (this._onVerticesChange) {
        this._onVerticesChange(this.vertices);
      }
    }, 33);
  }

  startSimulation() {
    this.iterationCount = 0;
    this.resumeSimulation();
  }

  stopSimulation() {
    this._setStatus("stopped");
    clearTimeout(this.iterationId);
  }

  resumeSimulation() {
    this._setTimeStep();
    if (this.status !== "running") {
      this._setStatus("running");
      this.iterationId = setTimeout(this._runIteration.bind(this), 0);
    }
  }

  addGoals(goals) {
    this.goals.push(...goals);
  }

  onVerticesChange(func) {
    this._onVerticesChange = func;
  }

  onStatusChange(func) {
    this._onStatusChange = func;
  }

  _setTimeStep() {
    let stiffnesses = math.zeros(this.vertices.length).toArray();
    for (let goal of this.goals) {
      goal.addStiffness(stiffnesses);
    }
    const stiffness = math.max(stiffnesses);
    this.dt = math.sqrt(2 / stiffness);
  }

  _updateResiduals() {
    this.residuals = math.zeros(this.vertices.length, 3).toArray();
    for (let goal of this.goals) {
      goal.calculate(this.vertices, this.residuals);
    }
  }

  _updateVelocities() {
    let dv = math.dotMultiply(this.residuals, this.dt);
    this.velocities = math.add(this.velocities, dv);
  }

  _updateVertices() {
    let dx = math.dotMultiply(this.velocities, this.dt);
    this.vertices = math.add(this.vertices, dx);
    this._verticesUpdated();
  }

  _updateEnergy() {
    let energy = math.chain(this.velocities).dotPow(2).sum().done();
    this.energy.pop();
    this.energy.unshift(energy);
  }

  _sincePeak() {
    let [c, b, a] = this.energy;
    let e = b - c;
    let d = a - b;
    return e / (e - d);
  }

  _resetToEnergyPeak() {
    let q = this._sincePeak();
    this.vertices = math
      .chain(this.vertices)
      .subtract(math.dotMultiply(this.velocities, this.dt * (1 + q)))
      .add(
        math.dotMultiply(
          this.residuals,
          ((math.pow(this.dt, 2) / 2) * q) / this.mass
        )
      )
      .done();

    this.velocities = math.zeros(this.vertices.length, 3).toArray();
    this.energy.pop();
    this.energy.unshift(0);
  }

  _checkTermination() {
    return math.sum(math.abs(this.residuals)) < this.terminationForce;
  }

  // _verticesUpdated = throttle(() => {
  //   if (this._onVerticesChange) {
  //     this._onVerticesChange(this.vertices);
  //   }
  // }, 33);

  _setStatus(status) {
    let prevStatus = this.status;
    this.status = status;
    if (this._onStatusChange) {
      this._onStatusChange(status, prevStatus);
    }
  }

  _runIteration() {
    this._updateResiduals();
    if (this._checkTermination()) {
      this._setStatus("converged");
      this._verticesUpdated();
      return;
    }
    this._updateVelocities();
    this._updateVertices();
    this._updateEnergy();
    if (this.energy[0] < this.energy[1]) {
      this._resetToEnergyPeak();
    }
    this.iterationCount++;
    this.iterationId = setTimeout(this._runIteration.bind(this), 0);
  }
}
