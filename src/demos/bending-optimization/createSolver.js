import Solver from "../../dynamic-relaxation/solver";
import { AnchorGoal, BarGoal, HingeGoal } from "../../dynamic-relaxation/goals";

export default function createSolver() {
  let vertices = [];
  let goals = [];
  let n = 9;

  let angle = Math.PI / (n - 1);
  for (let i = 0; i < n; i++) {
    let x = Math.cos(angle * i);
    let z = Math.sin(angle * i);
    vertices.push([x, 0, z]);
  }

  let hingeStrength = 0.1;
  let restAngle = Math.PI;
  for (let i = 1; i < n - 1; i++) {
    let goal = new HingeGoal(i - 1, i + 1, i, restAngle, hingeStrength);
    goals.push(goal);
  }

  let barStrength = 10;
  let length = 2 * Math.sin(angle / 2);
  for (let i = 1; i < n; i++) {
    let goal = new BarGoal(i - 1, i, length, barStrength);
    goals.push(goal);
  }

  let anchorStrength = 100;
  goals.push(new AnchorGoal(0, vertices[0], anchorStrength));
  goals.push(new AnchorGoal(n - 1, vertices[n - 1], anchorStrength));

  const solver = new Solver(vertices, 1e-3);
  solver.addGoals(goals);

  return solver;
}
