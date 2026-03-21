import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { open } from "node:fs/promises";
import { scryptSync, createDecipheriv } from "node:crypto";
import { resolvePath } from "../utils/pathResolver.js";
import { checkIsFileExist } from "../utils/helpers.js";
import { MESSAGES } from "../constants.js";

export async function decrypt(currentDir, args) {
  const inputPath = args.input;
  const outputPath =  args.output;
  const password =  args.password;
  if (!inputPath || !outputPath || !password) return;

  const fullInputPath = resolvePath(currentDir, inputPath);
  
  const isFileExist = await checkIsFileExist(fullInputPath);
  if (!isFileExist) return;

  const fd = await open(fullInputPath, "r");
  const stats = await fd.stat();

  if (stats.size < 44) { // 28 header + 16 authTag
    await fd.close();
    console.log(MESSAGES.OPERATION_FAILED);
    return;
  }
  const headerBuffer = Buffer.alloc(28);
  await fd.read(headerBuffer, 0, 28, 0);
  const salt = headerBuffer.slice(0, 16);
  const iv = headerBuffer.slice(16, 28);

  const authTagBuffer = Buffer.alloc(16);
  await fd.read(authTagBuffer, 0, 16, stats.size - 16);

  await fd.close();

  const key = scryptSync(args.password, salt, 32);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTagBuffer);

  const readStream = createReadStream(fullInputPath, { start: 28, end: stats.size - 17 });
  const writeStream = createWriteStream(resolvePath(currentDir, outputPath));

  try {
    await pipeline(
      readStream,
      decipher,
      writeStream
    );

  } catch {
    console.log(MESSAGES.OPERATION_FAILED);
    return;
  }
  
  console.log(MESSAGES.location(currentDir));
}