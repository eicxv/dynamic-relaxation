import {
  createViewport,
  initLines,
  updateGeometry,
} from "./dynamic-relaxation/createViewport";
import { createSolver } from "./dynamic-relaxation/createSolver";
import "./styles.css";

// function main() {
//   const container = document.getElementById("viewport");
//   const viewport = new Viewport(container, true);
//   const scene = viewport.getScene();
//   function update() {
//     viewport.render();
//     requestAnimationFrame(update);
//   }
//   update();
// }

// main();

function main() {
  const [viewport, scene] = createViewport();
  const [solver, vertices] = createSolver();
  const sceneObj = initLines(scene, solver.vertices);
  solver.onVerticesChange(updateGeometry.bind(null, sceneObj));
  solver.startSimulation();

  // const scene = viewport.getScene();
  function update() {
    viewport.render();
    requestAnimationFrame(update);
  }
  update();
  // createGui(solver, vertices, sceneObj);
}

main();
