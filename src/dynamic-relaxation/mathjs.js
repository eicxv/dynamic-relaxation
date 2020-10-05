import { create, all } from "mathjs";

const config = {};
export const math = create(all, config);

export function angleBetweenVectors(vectorA, vectorB) {
  let crossProd = math.cross(vectorA, vectorB);
  let dotProd = math.dot(vectorA, vectorB);
  return Math.atan2(math.norm(crossProd), dotProd);
}
