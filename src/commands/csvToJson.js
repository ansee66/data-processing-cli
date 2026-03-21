import { createReadStream, createWriteStream } from "node:fs";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { resolvePath } from "../utils/pathResolver.js";
import { checkIsFileExist } from "../utils/helpers.js";
import { MESSAGES } from "../constants.js";

export async function csvToJson(currentDir, args) {
  const inputPath = args.input;
  const outputPath = args.output;
  if (!inputPath || !outputPath) return;

  const fullInputPath = resolvePath(currentDir, inputPath);
  const isFileExist = await checkIsFileExist(fullInputPath);
  if (!isFileExist) return;

  const fullOutputPath = resolvePath(currentDir, outputPath);

  const csvToJsonTransformer = new Transform({
    transform(chunk, encoding, callback) {
      const lines = chunk
        .toString()
        .split("\n")
        .map(line => line.replace(/\r$/, ""))
        .filter(Boolean);

      if (!this.headers) {
        this.headers = lines.shift().split(",");
        this.isFirst = true;
      }

      for (const line of lines) {
        const values = line
          .match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
          ?.map(v => v.replace(/^"|"$/g, "")); // to handle commas inside a string

        const obj = {};

        this.headers.forEach((header, i) => {
          obj[header] = values[i];
        })

        if (!this.isFirst) {
          this.push(",\n");
        } else {
          this.push("[\n");
          this.isFirst = false;
        }

        this.push("  " + JSON.stringify(obj));
      }
      callback();
    },
    flush(callback) {
      this.push(this.isFirst ? "[]" : "\n]");
      callback();
    }
  });

  await pipeline(
    createReadStream(fullInputPath),
    csvToJsonTransformer,
    createWriteStream(fullOutputPath)
  );

  console.log(MESSAGES.location(currentDir));
}