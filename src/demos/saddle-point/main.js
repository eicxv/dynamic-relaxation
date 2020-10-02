import Viewport from "../../viewport/viewport";
import createGeometry from "./createGeometry";
import createSolver from "./createSolver";

export default function main() {
  const container = document.getElementById("viewport");
  const viewport = new Viewport(container);
  const scene = viewport.getScene();
  const solver = createSolver();
  let updateGeometry = createGeometry(scene, solver.vertices);
  solver.onVerticesChange(updateGeometry);
  solver.startSimulation();

  function update() {
    viewport.render();
    requestAnimationFrame(update);
  }
  update();
}
