import Solver from "../../dynamic-relaxation/solver";
import { AnchorGoal, ForceGoal, BarGoal } from "../../dynamic-relaxation/goals";

export default function createSolver() {
  const vertices = [
    [0, 0, 0],
    [1, 0, 0],
  ];
  const goals = [];
  goals.push(new AnchorGoal(0, [0, 0, 0], 10));
  goals.push(new BarGoal(0, 1, 1, 10));
  goals.push(new ForceGoal(1, [0, 0, -1], 1));

  const timeStep = 0.1;
  const terminationForce = 1e-1;

  const solver = new Solver(vertices, timeStep, terminationForce);
  solver.addGoals(goals);
  return solver;
}
