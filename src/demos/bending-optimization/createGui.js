import Gui from "../../dynamic-relaxation/gui";

export default function createGui(solver, updateGeometry, hingeOptimizer) {
  let gui = new Gui(solver, updateGeometry);

  createHingesGui(gui, hingeOptimizer);
  createTargetCurveGui(gui, hingeOptimizer);
  createOptimizerGui(gui, hingeOptimizer);
}

function createHingesGui(gui, optimizer) {
  let resume = gui.resume.bind(gui);
  let hingeFolder = gui.addFolder("Hinges");
  optimizer.hingeGoals.forEach((goal, i) => {
    hingeFolder
      .add(goal, "strength", 0, 1)
      .name(`hinge ${i}`)
      .onFinishChange(resume)
      .listen();
  });
}

function createTargetCurveGui(gui, optimizer) {
  let targetCurve = optimizer.targetCurve;
  function onFinish() {
    targetCurve.update();
    optimizer.targetCurveUpdated();
  }
  let curveFolder = gui.addFolder("Target Curve");
  curveFolder.add(targetCurve.curve.v1, "x", -2, 2).onChange(onFinish);
  curveFolder.add(targetCurve.curve.v1, "z", 0, 2).onChange(onFinish);
  curveFolder.add(targetCurve.curve.v2, "x", -2, 2).onChange(onFinish);
  curveFolder.add(targetCurve.curve.v2, "z", 0, 2).onChange(onFinish);
}

function createOptimizerGui(gui, optimizer) {
  let optimizerFolder = gui.addFolder("Optimizer");
  optimizerFolder.add(optimizer, "startOptimization").name("optimize");
  optimizerFolder.add(optimizer, "status").listen();
}
