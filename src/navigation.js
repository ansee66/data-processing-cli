import path from "node:path";
import { readdir, stat } from "node:fs/promises";
import { resolvePath } from "./utils/pathResolver.js";
import { sortAlphabetically } from "./utils/helpers.js";
import { MESSAGES } from "./constants.js";

export async function up(state) {
  const parent = path.dirname(state.currentDir);

  if (parent !== state.currentDir) {
    state.currentDir = parent;
    console.log(MESSAGES.location(state.currentDir));
  }
}

export async function cd(state, path) {
  const fullPath  = resolvePath(state.currentDir, path);

  let pathStats;
  try {
    pathStats = await stat(fullPath);
  } catch {
    console.log(`${MESSAGES.OPERATION_FAILED}: path doesn't exist`);
    return;
  }

  if (!pathStats.isDirectory()) {
    console.log(`${MESSAGES.OPERATION_FAILED}: path is not a directory`);
    return;
  }

  state.currentDir = fullPath;
  console.log(MESSAGES.location(state.currentDir));
}

export async function ls(state) {
  let entries;

  try {
    entries = await readdir(state.currentDir, {
      withFileTypes: true
    });
  } catch {
    console.log(MESSAGES.OPERATION_FAILED);
    return;
  }

  const folders = [];
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      folders.push(entry.name);
    } else {
      files.push(entry.name);
    }
  }

  folders.sort(sortAlphabetically);
  files.sort(sortAlphabetically);

  folders.forEach(folder => {console.log(`${folder} [folder]`);});
  files.forEach(file => {console.log(`${file} [file]`);});
}