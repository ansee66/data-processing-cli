import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { randomBytes, scryptSync, createCipheriv } from "node:crypto";
import { resolvePath } from "../utils/pathResolver.js";
import { checkIsFileExist } from "../utils/helpers.js";
import { MESSAGES } from "../constants.js";

export async function encrypt(currentDir, args) {
  const inputPath = args.input;
  const outputPath =  args.output;
  const password =  args.password;
  if (!inputPath || !outputPath || !password) return;

  const fullInputPath = resolvePath(currentDir, inputPath);
  
  const isFileExist = await checkIsFileExist(fullInputPath);
  if (!isFileExist) return;

  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = scryptSync(args.password, salt, 32);
  const cipher = createCipheriv("aes-256-gcm", key, iv);

  const readStream = createReadStream(fullInputPath);
  const writeStream = createWriteStream(resolvePath(currentDir, outputPath));

  writeStream.write(salt);
  writeStream.write(iv);

  try {
    await pipeline(
      readStream,
      cipher,
      writeStream,
      { end: false }
    );

    const authTag = cipher.getAuthTag();

    writeStream.write(authTag);
    writeStream.end();

  } catch {
    console.log(MESSAGES.OPERATION_FAILED);
    return;
  }
  
  console.log(MESSAGES.location(currentDir));
}