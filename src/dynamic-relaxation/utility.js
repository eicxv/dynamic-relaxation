import { vec3 } from "gl-matrix";

const temp = vec3.create();

export function createArray(length) {
  return Array.from({ length }, () => vec3.create());
}

export function zeroArray(array) {
  for (let v of array) {
    vec3.zero(v);
  }
  return array;
}

export function addArray(out, arrayA, arrayB) {
  for (let i = 0; i < out.length; i++) {
    vec3.add(out[i], arrayA[i], arrayB[i]);
  }
  return out;
}

export function subArray(out, arrayA, arrayB) {
  for (let i = 0; i < out.length; i++) {
    vec3.sub(out[i], arrayA[i], arrayB[i]);
  }
  return out;
}

export function scaleArray(out, array, scale) {
  for (let i = 0; i < out.length; i++) {
    vec3.scale(out[i], array[i], scale);
  }
  return out;
}

export function scaleAndAddArray(out, arrayA, arrayB, scale) {
  for (let i = 0; i < out.length; i++) {
    vec3.scaleAndAdd(out[i], arrayA[i], arrayB[i], scale);
  }
  return out;
}

export function angleBetweenVectors(vectorA, vectorB) {
  let crossProdLen = vec3.len(vec3.cross(temp, vectorA, vectorB));
  let dotProd = vec3.dot(vectorA, vectorB);
  return Math.atan2(crossProdLen, dotProd);
}
