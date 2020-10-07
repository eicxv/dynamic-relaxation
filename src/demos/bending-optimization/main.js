import Viewport from "../../viewport/viewport";
import Geometry from "./geometry";
import createSolver from "./createSolver";
import OptimizerGui from "./optimizerGui";
import BezierCurve from "./bezierCurve";
import HingeOptimizer from "./hingeOptimizer";
import CuttingLines from "./cuttingLines";

export default function main() {
  const container = document.getElementById("viewport");
  const viewport = new Viewport(container);
  const scene = viewport.getScene();
  let n = 7;
  const solver = createSolver(n);
  let vertices = solver.vertices;
  const geometry = new Geometry(scene, vertices);
  solver.onVerticesChange(geometry.updateGeometry.bind(geometry));
  solver.startSimulation();
  const cuttingLines = new CuttingLines(scene);

  const curvePoints = [
    [1, 0, 0],
    [1, 0, 1],
    [-1, 0, 1],
    [-1, 0, 0],
  ];
  const targetCurve = new BezierCurve(curvePoints, scene);
  const hingeOptimizer = new HingeOptimizer(solver, targetCurve);

  function update() {
    viewport.render();
    requestAnimationFrame(update);
  }
  update();
  new OptimizerGui(solver, hingeOptimizer, cuttingLines, geometry, n);
}
