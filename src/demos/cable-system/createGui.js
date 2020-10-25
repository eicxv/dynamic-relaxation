import Gui from "../../dynamic-relaxation/gui";

export default function createGui(solver, updateGeometry) {
  let gui = new Gui(solver, updateGeometry);

  const forceGoal = solver.goals[solver.goals.length - 1];

  let forceGoalFolder = gui.addFolder("Force Goal");
  forceGoalFolder.open();
  forceGoalFolder
    .add(forceGoal, "vertexIndex", 0, solver.vertices.length - 1)
    .step(1)
    .onFinishChange(gui.resume.bind(gui));

  forceGoalFolder
    .add(forceGoal, "strength", -2, 2)
    .onFinishChange(gui.resume.bind(gui));
}
