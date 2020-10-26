import { vec3 } from "gl-matrix";
import throttle from "lodash.throttle";
import {
  createArray,
  zeroArray,
  addArray,
  scaleArray,
  scaleAndAddArray,
} from "./utility";

export const Status = Object.freeze({
  INITIALIZED: Symbol("initialized"),
  RUNNING: Symbol("running"),
  CONVERGED: Symbol("converged"),
  STOPPED: Symbol("stopped"),
});

export default class Solver {
  constructor(vertices, terminationForce) {
    this.vertices = vertices;
    this.terminationForce = terminationForce;
    this.dt = 1;
    this.goals = [];
    this.velocities = createArray(vertices.length);
    this.residuals = createArray(vertices.length);
    this.temp = createArray(vertices.length);
    this.stiffnesses = new Array(vertices.length);
    this.energy = [0, 0, 0];
    this.mass = 1;
    this.status = Status.INITIALIZED;
    this.iterationCount = 0;
    this._onVerticesChange = [];
    this._onStatusChange = [];

    this._verticesUpdated = throttle(() => {
      for (let func of this._onVerticesChange) {
        func(this.vertices);
      }
    }, 33);
  }

  startSimulation() {
    this.iterationCount = 0;
    this.resumeSimulation();
  }

  stopSimulation() {
    this._setStatus(Status.STOPPED);
    clearTimeout(this.iterationId);
  }

  resumeSimulation() {
    this._setTimeStep();
    if (this.status !== Status.RUNNING) {
      this._setStatus(Status.RUNNING);
      this.iterationId = setTimeout(this._runIteration.bind(this), 0);
    }
  }

  addGoals(goals) {
    this.goals.push(...goals);
  }

  onVerticesChange(func) {
    this._onVerticesChange.push(func);
    return this._onVerticesChange.length - 1;
  }

  onStatusChange(func) {
    this._onStatusChange.push(func);
    return this._onStatusChange.length - 1;
  }

  removeOnVerticesChange(index) {
    this._onVerticesChange.splice(index, 1);
  }

  removeOnStatusChange(index) {
    this._onStatusChange.splice(index, 1);
  }

  _setTimeStep() {
    this.stiffnesses.fill(0);
    for (let goal of this.goals) {
      goal.addStiffness(this.stiffnesses);
    }
    const stiffness = Math.max(...this.stiffnesses);
    this.dt = Math.sqrt(2 / stiffness);
  }

  _updateResiduals() {
    zeroArray(this.residuals);
    for (let goal of this.goals) {
      goal.calculate(this.vertices, this.residuals);
    }
  }

  _updateVelocities() {
    let dv = scaleArray(this.temp, this.residuals, this.dt);
    addArray(this.velocities, this.velocities, dv);
  }

  _updateVertices() {
    let dx = scaleArray(this.temp, this.velocities, this.dt);
    addArray(this.vertices, this.vertices, dx);
    this._verticesUpdated();
  }

  _updateEnergy() {
    let energy = this.velocities.reduce(this._energyReducer, 0);
    this.energy.pop();
    this.energy.unshift(energy);
  }

  _energyReducer(acc, vel) {
    return acc + vec3.sqrLen(vel);
  }

  _sincePeak() {
    let [c, b, a] = this.energy;
    let e = b - c;
    let d = a - b;
    return e / (e - d);
  }

  _resetToEnergyPeak() {
    let q = this._sincePeak();

    scaleAndAddArray(
      this.vertices,
      this.vertices,
      this.velocities,
      -this.dt * (1 + q)
    );
    scaleAndAddArray(
      this.vertices,
      this.vertices,
      this.residuals,
      ((this.dt ** 2 / 2) * q) / this.mass
    );

    zeroArray(this.velocities);
    this.energy.pop();
    this.energy.unshift(0);
  }

  _checkTermination() {
    let force = this.residuals.reduce(this._terminationReducer, 0);
    return force < this.terminationForce;
  }

  _terminationReducer(acc, res) {
    return acc + vec3.len(res);
  }

  // _verticesUpdated = throttle(() => {
  //   if (this._onVerticesChange) {
  //     this._onVerticesChange(this.vertices);
  //   }
  // }, 33);

  _setStatus(status) {
    let prevStatus = this.status;
    this.status = status;
    for (let func of this._onStatusChange) {
      func(status, prevStatus);
    }
  }

  _runIteration() {
    this._updateResiduals();
    if (this._checkTermination()) {
      this._setStatus(Status.CONVERGED);
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
