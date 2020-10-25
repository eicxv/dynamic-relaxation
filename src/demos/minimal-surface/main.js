import Viewport from "../../viewport/viewport";
import createGeometry from "./createGeometry";
import createSolver from "./createSolver";
import createGui from "./createGui";

export default function main() {
  const container = document.getElementById("viewport");
  const viewport = new Viewport(container);
  const scene = viewport.getScene();
  const [solver, indices] = createSolver();
  let vertices = solver.vertices;
  let updateGeometry = createGeometry(scene, vertices, indices);
  solver.onVerticesChange(updateGeometry);
  solver.startSimulation();

  function update() {
    viewport.render();
    requestAnimationFrame(update);
  }
  update();
  createGui(solver, updateGeometry);
}
