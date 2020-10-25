import Solver from "../../dynamic-relaxation/solver";
import {
  AnchorGoal,
  BarGoal,
  SoapFilmGoal,
} from "../../dynamic-relaxation/goals";

export default function createSolver() {
  let goals = [];
  const radius = 1;
  const height = 1.2;
  const radialSubdivisions = 15;
  const heightSubdivisions = 10;

  let vertices = generateCylinderVertices(
    radius,
    height,
    radialSubdivisions,
    heightSubdivisions
  );
  let indices = generateMeshIndices(heightSubdivisions + 1, radialSubdivisions);
  addFaceGoals(goals, indices);
  addAnchorGoals(goals, vertices, heightSubdivisions + 1, radialSubdivisions);

  const solver = new Solver(vertices, 1e-1);
  solver.addGoals(goals);
  return [solver, indices];
}

function addFaceGoals(goals, indices) {
  for (let i = 0; i < indices.length; i += 3) {
    let v1 = indices[i];
    let v2 = indices[i + 1];
    let v3 = indices[i + 2];
    let goal = new SoapFilmGoal(v1, v2, v3, 1);
    goals.push(goal);
  }
}

function addAnchorGoals(goals, vertices, heightSub, radSub) {
  for (let i = 0; i < radSub; i++) {
    for (let offset of [0, heightSub - 1]) {
      let index = i * heightSub + offset;
      let goal = new AnchorGoal(index, vertices[index], 10);
      goals.push(goal);
    }
  }
}

function generateCylinderVertices(
  radius,
  height,
  radialSubdivisions,
  heightSubdivisions
) {
  let vertices = [];
  const angleStep = (2 * Math.PI) / radialSubdivisions;
  const heightStep = height / heightSubdivisions;
  for (let i = 0; i < radialSubdivisions; i++) {
    let angle = angleStep * i;
    let x = radius * Math.cos(angle);
    let y = radius * Math.sin(angle);
    for (let j = 0; j < heightSubdivisions + 1; j++) {
      let z = heightStep * j;
      vertices.push([x, y, z]);
    }
  }
  return vertices;
}

function generateMeshIndices(rows, cols) {
  let indices = [];
  function toIndex(x, y) {
    return x * rows + y;
  }
  function addFace(p1, p2, p3) {
    if (
      p2[0] >= cols ||
      p2[1] >= rows ||
      p3[0] >= cols ||
      p3[1] >= rows ||
      p1[0] >= cols ||
      p1[1] >= rows
    ) {
      return;
    }
    indices.push(toIndex(...p1));
    indices.push(toIndex(...p2));
    indices.push(toIndex(...p3));
  }
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      addFace([col, row], [col, row + 1], [col + 1, row + 1]);
      addFace([col + 1, row + 1], [col + 1, row], [col, row]);
    }
  }
  for (let row = 0; row < rows; row++) {
    addFace([cols - 1, row], [cols - 1, row + 1], [0, row + 1]);
    addFace([0, row + 1], [0, row], [cols - 1, row]);
  }
  return indices;
}
