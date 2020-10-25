import Gui from "../../dynamic-relaxation/gui";
import { AnchorGoal } from "../../dynamic-relaxation/goals";

export default function createGui(solver, updateGeometry) {
  let gui = new Gui(solver, updateGeometry);

  const topAnchors = solver.goals.filter(
    (goal) => goal instanceof AnchorGoal && goal.position[2] !== 0
  );
  let goalFolder = gui.addFolder("Goals");
  goalFolder.open();

  let obj = { z: topAnchors[0].position[2] };
  let controller = goalFolder.add(obj, "z", 0, 2).step(0.01).name("distance");
  controller.onChange((value) => {
    for (let anchor of topAnchors) {
      anchor.position[2] = value;
    }
  });
  controller.onFinishChange(gui.resume.bind(gui));
}
