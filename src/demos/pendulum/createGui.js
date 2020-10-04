import Gui from "../../dynamic-relaxation/gui";

export default function createGui(solver, updateGeometry) {
  let gui = new Gui(solver, updateGeometry);

  // set default dt
  solver._setTimeStep();
  // remove _setTimeStep to allow manual control of dt
  solver._setTimeStep = () => {};

  const timeStepFolder = gui.addFolder("Time Step");
  timeStepFolder.open();
  timeStepFolder.add(solver, "dt", 0, 1).name("time step");
}
