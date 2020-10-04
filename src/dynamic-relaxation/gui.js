import dat from "three/examples/jsm/libs/dat.gui.module";

export default class Gui {
  constructor(solver, updateGeometry) {
    this._gui = new dat.GUI();
    this._solver = solver;
    this._startVertices = solver.vertices.slice();
    this._updateGeometry = updateGeometry;

    let solverFolder = this._gui.addFolder("Solver");
    solverFolder.open();
    this._addRunToggle(solverFolder);
    this._addResetButton(solverFolder);
    this._addIterationCount(solverFolder);
    this._addSolverStatus(solverFolder);
  }

  addFolder(name) {
    return this._gui.addFolder(name);
  }

  _addRunToggle(guiFolder) {
    this.run = true;
    let controller = guiFolder.add(this, "run");
    controller.onFinishChange((value) => {
      if (value) {
        this._solver.resumeSimulation();
      } else {
        this._solver.stopSimulation();
      }
    });
  }

  _addResetButton(guiFolder) {
    guiFolder.add(this, "reset");
  }

  _addIterationCount(guiFolder) {
    let controller = guiFolder
      .add(this._solver, "iterationCount")
      .name("iteration");
    controller.listen();
    controller.domElement.style.pointerEvents = "none";
  }

  _addSolverStatus(guiFolder) {
    let controller = guiFolder
      .add(this._solver, "status")
      .name("solver status");
    controller.domElement.style.pointerEvents = "none";
    this._solver.onStatusChange(() => {
      controller.updateDisplay();
    });
  }

  reset() {
    this._solver.vertices = this._startVertices;
    this._solver.velocities = this._startVertices.map(() => [0, 0, 0]);
    this._solver.energy.pop();
    this._solver.energy.unshift(0);
    this._solver.iterationCount = 0;
    this._updateGeometry(this._startVertices);
    this.resume();
  }

  resume() {
    if (this.run && this._solver.status !== "running") {
      this._solver.resumeSimulation();
    }
  }
}
