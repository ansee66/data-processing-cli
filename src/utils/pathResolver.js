import path from "node:path";
import { MESSAGES } from "../constants.js";

export function resolvePath(currentDir, inputPath) {
  if (!inputPath) {
    throw new Error(MESSAGES.PATH_ERROR);
  }

  if (path.isAbsolute(inputPath)) {
    return path.normalize(inputPath);
  }

  return path.resolve(currentDir, inputPath);
}