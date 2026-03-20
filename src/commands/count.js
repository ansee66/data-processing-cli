import { createReadStream } from "node:fs";
import { resolvePath } from "../utils/pathResolver.js";
import { checkIsFileExist } from "../utils/helpers.js";
import { MESSAGES } from "../constants.js";

export async function count(currentDir, args) {
  const inputPath = args.input;
  if (!inputPath) return;

  const fullInputPath = resolvePath(currentDir, inputPath);
  const isFileExist = await checkIsFileExist(fullInputPath);
  if (!isFileExist) return;

  let lines = 0;
  let words = 0;
  let chars = 0;
  let prevPiece = "";

  const stream = createReadStream(fullInputPath);

  return new Promise((resolve) => {
    stream.on("data", (chunk) => {
      const text = chunk.toString();
      chars += text.length;
      lines += (text.match(/\n/g) || []).length + 1;

      const combined = prevPiece + text;
      const parts = combined.split(/\s+/);

      words += parts.length - 1;
      prevPiece = parts[parts.length - 1];

    });
    stream.on("end", () => {
      if (prevPiece.trim()) words++;

      console.log(`Lines: ${lines}`);
      console.log(`Words: ${words}`);
      console.log(`Characters: ${chars}`);

      console.log(MESSAGES.location(currentDir));
      resolve();
    });

    stream.on("error", () => {
      console.log(MESSAGES.OPERATION_FAILED);
    });
  })
}