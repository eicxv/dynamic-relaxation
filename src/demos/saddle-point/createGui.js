import dat from "three/examples/jsm/libs/dat.gui.module";

export default function createGui(solver, startVertices, updateGeometry) {
  function resetVertices() {
    solver.vertices = startVertices;
    solver.velocities = startVertices.map(() => [0, 0, 0]);
    solver.energy.pop();
    solver.energy.unshift(0);
    solver.iterationCount = 0;
    updateGeometry(startVertices);
  }

  class GuiObj {
    constructor() {
      this.run = true;
      this.reset = () => {
        resetVertices();
        if (this.run) {
          solver.resumeSimulation();
        }
      };
    }
  }
  const guiObj = new GuiObj();

  let gui = new dat.GUI();
  let solverGui = gui.addFolder("Solver");
  solverGui.open();

  let controller = solverGui.add(guiObj, "run");
  controller.onFinishChange((value) => {
    if (guiObj.run) {
      solver.resumeSimulation();
    } else {
      solver.stopSimulation();
    }
  });

  solverGui.add(guiObj, "reset");

  let statusController = solverGui.add(solver, "status").name("solver status");
  statusController.domElement.style.pointerEvents = "none";

  let iterationController = solverGui
    .add(solver, "iterationCount")
    .name("iteration");
  iterationController.listen();
  iterationController.domElement.style.pointerEvents = "none";
  solver.onStatusChange(() => {
    statusController.updateDisplay();
  });

  // Force Goal gui
  const forceGoal = solver.goals[solver.goals.length - 1];
  createForceGoalGui(gui, guiObj, solver, forceGoal);
}

function createForceGoalGui(gui, guiObj, solver, forceGoal) {
  let forceGoalGui = gui.addFolder("Force Goal");
  forceGoalGui.open();

  let controller = forceGoalGui
    .add(forceGoal, "vertexIndex", 0, solver.vertices.length - 1)
    .step(1);
  controller.onFinishChange(() => {
    if (guiObj.run) {
      solver.resumeSimulation();
    }
  });

  controller = forceGoalGui.add(forceGoal, "strength", -2, 2);
  controller.onFinishChange(() => {
    if (guiObj.run) {
      solver.resumeSimulation();
    }
  });
}
