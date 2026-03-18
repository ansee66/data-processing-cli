import { access } from "node:fs/promises";
import { MESSAGES } from "../constants.js";

export const sortAlphabetically = (a, b) => a.localeCompare(b, undefined, { sensitivity: "base" });

export async function checkIsFileExist(fullPath) {
  try {
    await access(fullPath);
  } catch {
    console.log(MESSAGES.OPERATION_FAILED);
    return false;
  }
  return true;
}
