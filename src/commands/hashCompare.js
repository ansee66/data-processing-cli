import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";
import { resolvePath } from "../utils/pathResolver.js";
import { checkIsFileExist } from "../utils/helpers.js";
import { MESSAGES, DEFAULT_ALGORITHM, AVAILABLE_ALGORITHMS } from "../constants.js";

export async function hashCompare(currentDir, args, flags) {
  const inputPath = args.input;
  const hashPath = args.hash;
  if (!inputPath || !hashPath) return;

  const algorithm = args.algorithm || DEFAULT_ALGORITHM;
  if (!AVAILABLE_ALGORITHMS.includes(algorithm)) return;

  const fullInputPath = resolvePath(currentDir, inputPath);
  const fullHashPath = resolvePath(currentDir, hashPath);
  
  const isFileExist = await checkIsFileExist(fullInputPath);
  const isHashExist = await checkIsFileExist(fullHashPath);
  if (!isFileExist || !isHashExist) return;

  const hash = createHash(algorithm);

  let calculatedHash;
  let hashFromFile = "";

  const filePromise = new Promise((resolve, reject) => {
    const fileStream = createReadStream(fullInputPath);
    fileStream.on("data", (chunk) => {
      hash.update(chunk);
    });

    fileStream.on("end", () => {
      calculatedHash = hash.digest("hex");
      resolve();
    });

    fileStream.on("error", reject);
  })

  const hashFilePromise = new Promise((resolve, reject) => {
    const hashStream = createReadStream(fullHashPath);
    hashStream.on("data", (chunk) => {
      hashFromFile += chunk.toString();
    });

    hashStream.on("end",resolve);

    hashStream.on("error", reject);
  })

  try {
    await Promise.all([filePromise, hashFilePromise]);
  } catch {
    console.log(MESSAGES.OPERATION_FAILED);
    return;
  }

  const normalizedFileHash = hashFromFile.trim().toLowerCase();
  const normalizedCalculated = calculatedHash.toLowerCase();

  console.log(
    normalizedCalculated === normalizedFileHash ? "OK" : "MISMATCH"
  );

  console.log(MESSAGES.location(currentDir));
}