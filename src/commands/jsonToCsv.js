import { createWriteStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { resolvePath } from "../utils/pathResolver.js";
import { checkIsFileExist } from "../utils/helpers.js";
import { MESSAGES } from "../constants.js";

export async function jsonToCsv(currentDir, args) {
  const inputPath = args.input;
  const outputPath = args.output;
  if (!inputPath || !outputPath) return;

  const fullInputPath = resolvePath(currentDir, inputPath);
  const isFileExist = await checkIsFileExist(fullInputPath);
  if (!isFileExist) return;

  const fullOutputPath = resolvePath(currentDir, outputPath);

    let data;

  try {
    const content = await readFile(fullInputPath, "utf-8");
    data = JSON.parse(content);

    if (!Array.isArray(data)) throw new Error();
  } catch (err) {
    console.log(MESSAGES.OPERATION_FAILED);
    return;
  }

  const jsonToCsvTransformer = new Transform({
    writableObjectMode: true,

    transform(obj, encoding, callback) {
      try {
        if (!this.headers) {
          this.headers = Object.keys(obj);
          this.push(this.headers.join(",") + "\n");
        }

        const row = this.headers.map((key) => {
          let value = obj[key];
          value = value == null ? "" : String(value);

          if (value.includes('"')) {
            value = value.replace(/"/g, '""');
          }

          if (value.includes(",") || value.includes("\n")) {
            value = `"${value}"`;
          }

          return value;
        });

        this.push(row.join(",") + "\n");
        callback();
      } catch (err) {
        callback(err);
      }
    },
  });

  try {
    await pipeline(
      Readable.from(data),
      jsonToCsvTransformer,
      createWriteStream(fullOutputPath)
    );
  } catch {
    console.log(MESSAGES.OPERATION_FAILED);
    return;
  }

  console.log(MESSAGES.location(currentDir));
}