import Gui from "../../dynamic-relaxation/gui";
import { updateGoals } from "./createSolver";

export default class OptimizerGui {
  constructor(solver, hingeOptimizer, cuttingLines, geometry, startN) {
    this.gui = new Gui(solver, geometry.updateGeometry.bind(geometry));
    this.solver = solver;
    this.optimizer = hingeOptimizer;
    this.cuttingLines = cuttingLines;
    this.geometry = geometry;
    this.n = startN;

    this.gui.solverFolder.close();
    this.createTargetCurveGui();
    this.createOptimizerGui();
    this.createNumberOfHingesGui();
    this.createCuttingLinesGui();
    this.createHingesGui();
    this.optimizerFolder.open();
  }

  createHingesGui() {
    this.hingeFolder = this.gui.addFolder("Hinges");
    let resume = this.gui.resume.bind(this.gui);
    this.optimizer.hingeGoals.forEach((goal, i) => {
      this.hingeFolder
        .add(goal, "strength", 0, 1)
        .name(`hinge ${i}`)
        .onFinishChange(resume)
        .listen();
    });
  }

  createTargetCurveGui() {
    let targetCurve = this.optimizer.targetCurve;
    let onFinish = () => {
      targetCurve.update();
      this.optimizer.targetCurveUpdated();
    };
    this.curveFolder = this.gui.addFolder("Target Curve");
    this.curveFolder.add(targetCurve.curve.v1, "x", -2, 2).onChange(onFinish);
    this.curveFolder.add(targetCurve.curve.v1, "z", 0, 2).onChange(onFinish);
    this.curveFolder.add(targetCurve.curve.v2, "x", -2, 2).onChange(onFinish);
    this.curveFolder.add(targetCurve.curve.v2, "z", 0, 2).onChange(onFinish);
  }

  createOptimizerGui() {
    this.optimizerFolder = this.gui.addFolder("Optimizer");
    this.optimizerFolder.add(this.optimizer, "startOptimization").name("start");
    this.optimizerFolder.add(this.optimizer, "stopOptimization").name("stop");
    this.optimizerFolder.add(this.optimizer, "status").listen();
  }

  createCuttingLinesGui() {
    this.optimizerFolder
      .add(this, "drawCuttingLines")
      .name("draw cutting lines");
  }

  drawCuttingLines() {
    this.cuttingLines.setTorsionConstants(
      this.optimizer.hingeGoals.map((goal) => goal.strength)
    );
    this.cuttingLines.draw();
  }

  createNumberOfHingesGui() {
    this.optimizerFolder
      .add(this, "n", 1, 20)
      .name("number of hinges")
      .step(1)
      .onChange((n) => {
        updateGoals(this.solver, n);
        this.geometry.clearGeometry();
        this.geometry.createGeometry(this.solver.vertices);
        this.gui._startVertices = this.solver.vertices.slice();
        this.optimizer.goalsUpdated();
        this.optimizer.targetCurveUpdated();
        this.gui.resume();
        this.gui._gui.removeFolder(this.hingeFolder);
        this.createHingesGui();
      });
  }
}
