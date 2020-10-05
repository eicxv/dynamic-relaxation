import Viewport from "../../viewport/viewport";
import { Status } from "../../dynamic-relaxation/solver";
import { HingeGoal, BarGoal } from "../../dynamic-relaxation/goals";
import createGeometry from "./createGeometry";
import createSolver from "./createSolver";
import createGui from "./createGui";
import BezierCurve from "./bezierCurve";
import HingeOptimizer from "./hingeOptimizer";

export default function main() {
  const container = document.getElementById("viewport");
  const viewport = new Viewport(container);
  const scene = viewport.getScene();
  const solver = createSolver();
  let vertices = solver.vertices;
  let updateGeometry = createGeometry(scene, vertices);
  solver.onVerticesChange(updateGeometry);
  function onConverge(status) {
    if (status === Status.CONVERGED) {
      hingeOptimizer.optimize();
    }
  }
  solver.onStatusChange(onConverge);
  solver.startSimulation();

  const curvePoints = [
    [1, 0, 0],
    [1, 0, 1],
    [-1, 0, 1],
    [-1, 0, 0],
  ];
  const targetCurve = new BezierCurve(curvePoints, scene);
  const hingeGoals = solver.goals.filter((goal) => goal instanceof HingeGoal);
  const barGoals = solver.goals.filter((goal) => goal instanceof BarGoal);
  const hingeOptimizer = new HingeOptimizer(
    solver,
    hingeGoals,
    barGoals,
    targetCurve
  );

  function update() {
    viewport.render();
    requestAnimationFrame(update);
  }
  update();
  createGui(solver, updateGeometry, hingeOptimizer);
}

// main();
