import readline from "readline";
import { MESSAGES, COMMANDS } from "./constants.js";
import { parseArgs } from "./utils/argParser.js";

export function startRepl(state) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> "
  });

  rl.prompt();

  rl.on("line", async (line) => {
    const input = line.trim();

    if (input === COMMANDS.EXIT) {
      rl.close();
      return;
    }

    try {
      const { command, args } = parseArgs(input);

      console.log("Command:", command);
      console.log("Args:", args);

      console.log(MESSAGES.location(state.currentDir));
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