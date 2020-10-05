import Gui from "../../dynamic-relaxation/gui";
import { HingeGoal } from "../../dynamic-relaxation/goals";

export default function createGui(solver, updateGeometry, hingeOptimizer) {
  let gui = new Gui(solver, updateGeometry);

  createHingesGui(gui, solver);
  createTargetCurveGui(gui, hingeOptimizer.targetCurve);
  createOptimizerGui(gui, hingeOptimizer);
}

function createHingesGui(gui, solver) {
  let resume = gui.resume.bind(gui);
  let hingeFolder = gui.addFolder("Hinges");
  let hingeGoals = solver.goals.filter((goal) => goal instanceof HingeGoal);
  hingeGoals.forEach((goal, i) => {
    let controller = hingeFolder.add(goal, "strength", 0, 1);
    controller.name(`hinge ${i}`);
    controller.onFinishChange(resume);
    controller.listen();
  });
}

function createTargetCurveGui(gui, targetCurve) {
  let curveFolder = gui.addFolder("Target Curve");
  let onFinish = targetCurve.update.bind(targetCurve);
  curveFolder.add(targetCurve.curve.v1, "x", -2, 2).onFinishChange(onFinish);
  curveFolder.add(targetCurve.curve.v1, "z", 0, 2).onFinishChange(onFinish);
  curveFolder.add(targetCurve.curve.v2, "x", -2, 2).onFinishChange(onFinish);
  curveFolder.add(targetCurve.curve.v2, "z", 0, 2).onFinishChange(onFinish);
}

function createOptimizerGui(gui, optimizer) {
  let resume = gui.resume.bind(gui);
  let optimizerFolder = gui.addFolder("Optimizer");
  optimizerFolder.add(optimizer, "optimize").onFinishChange(resume);
  optimizerFolder.add(optimizer, "targetCurveUpdated").onFinishChange(resume);
}
