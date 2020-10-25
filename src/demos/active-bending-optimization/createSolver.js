import Solver, { Status } from "../../dynamic-relaxation/solver";
import { AnchorGoal, BarGoal, HingeGoal } from "../../dynamic-relaxation/goals";
import { math } from "../../dynamic-relaxation/mathjs";

export default function createSolver(numberOfHinges) {
  const solver = new Solver([], 1e-3);
  updateGoals(solver, numberOfHinges);
  return solver;
}

export function updateGoals(solver, numberOfHinges) {
  let vertices = [];
  let goals = [];

  let angle = Math.PI / (numberOfHinges - 1);
  for (let i = 0; i < numberOfHinges; i++) {
    let x = Math.cos(angle * i);
    let z = Math.sin(angle * i);
    vertices.push([x, 0, z]);
  }

  let hingeStrength = 0.1;
  let restAngle = Math.PI;
  for (let i = 1; i < numberOfHinges - 1; i++) {
    let goal = new HingeGoal(i - 1, i + 1, i, restAngle, hingeStrength);
    goals.push(goal);
  }

  let barStrength = 10;
  let length = 2 * Math.sin(angle / 2);
  for (let i = 1; i < numberOfHinges; i++) {
    let goal = new BarGoal(i - 1, i, length, barStrength);
    goals.push(goal);
  }

  let anchorStrength = 50;
  goals.push(new AnchorGoal(0, vertices[0], anchorStrength));
  goals.push(
    new AnchorGoal(
      numberOfHinges - 1,
      vertices[numberOfHinges - 1],
      anchorStrength
    )
  );

  resetSolver(solver, vertices, goals);
}

function resetSolver(solver, vertices, goals) {
  solver.vertices = vertices;
  solver.dt = 1;
  solver.goals = [];
  solver.velocities = math.zeros(vertices.length, 3).toArray();
  solver.residuals = math.zeros(vertices.length, 3).toArray();
  solver.temp = math.zeros(vertices.length, 3).toArray();
  solver.stiffnesses = new Array(vertices.length);
  solver.energy = [0, 0, 0];
  solver.mass = 1;
  solver.status = Status.INITIALIZED;
  solver.iterationCount = 0;
  solver.addGoals(goals);
}
