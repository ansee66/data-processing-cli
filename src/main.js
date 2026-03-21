import os from "node:os";
import { MESSAGES } from "./constants.js";
import { startRepl } from "./repl.js";

const state = {
  currentDir: os.homedir()
};

function printWelcome() {
  console.log(MESSAGES.WELCOME);
  console.log(MESSAGES.location(state.currentDir));
}

function start() {
  printWelcome();

  const rl = startRepl(state);
  process.on("SIGINT", () => {
    rl.close();
  });
}

start();
