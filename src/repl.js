import readline from "readline";
import { MESSAGES, COMMANDS } from "./constants.js";

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