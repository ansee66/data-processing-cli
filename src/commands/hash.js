import { createReadStream, createWriteStream } from "node:fs";
import { createHash } from "node:crypto";
import { resolvePath } from "../utils/pathResolver.js";
import { checkIsFileExist } from "../utils/helpers.js";
import { MESSAGES } from "../constants.js";

const DEFAULT_ALGORITHM = "sha256";
const AVAILABLE_ALGORITHMS = [DEFAULT_ALGORITHM, "md5", "sha512"];

export async function hash(currentDir, args, flags) {
  const inputPath = args.input;
  if (!inputPath) return;

  const fullInputPath = resolvePath(currentDir, inputPath);
  const isFileExist = await checkIsFileExist(fullInputPath);
  if (!isFileExist) return;

  const algorithm = args.algorithm || DEFAULT_ALGORITHM;
  if (!AVAILABLE_ALGORITHMS.includes(algorithm)) {
    console.log(MESSAGES.OPERATION_FAILED);
    return;
  }

  const hash = createHash(algorithm);
  const readStream = createReadStream(fullInputPath);

  let result;

  await new Promise((resolve, reject) => {
    readStream.on("data", (chunk) => {
      hash.update(chunk);
    })

    readStream.on("end", () => {
      result = hash.digest("hex");
      resolve();
    })

    readStream.on("error", reject)
  })

  console.log(`${algorithm}: ${result}`);

  if (flags.save) {
    const outputPath = `${fullInputPath}.${algorithm}`;
    const writeStream = createWriteStream(outputPath);

    await new Promise((resolve, reject) => {
      writeStream.write(result, (err) => {
        if (err) reject(err);
        else resolve()
      })
    })
  }

  console.log(MESSAGES.location(currentDir));
}