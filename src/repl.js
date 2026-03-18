import readline from "readline";
import { MESSAGES, COMMANDS } from "./constants.js";
import { parseArgs } from "./utils/argParser.js";
import { up, cd, ls } from "./navigation.js";
import { csvToJson } from "./commands/csvToJson.js";

export function startRepl(state) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> "
  });

  rl.prompt();

  rl.on("line", async (line) => {
    const input = line.trim();

    try {
      const { command, args, pathArg } = parseArgs(input);

      switch (command) {
        case COMMANDS.UP: 
          up(state);
          break;
        case COMMANDS.CD: 
          await cd(state, pathArg);
          break;
        case COMMANDS.LS: 
          await ls(state);
          break;
        case COMMANDS.CSV_TO_JSON: 
          await csvToJson(state.currentDir, args);
          break;
        case COMMANDS.EXIT: 
          rl.close();
          break;
        default:
          console.warn(MESSAGES.INVALID_INPUT);
      }
    } catch {
      console.warn(MESSAGES.INVALID_INPUT);
    }

    rl.prompt();
  });

  rl.on("close", () => {
    console.log(MESSAGES.GOODBYE);
    process.exit(0);
  });

  return rl;
}