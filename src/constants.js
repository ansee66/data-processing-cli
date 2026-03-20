export const MESSAGES = {
  WELCOME: "Welcome to Data Processing CLI!",
  GOODBYE: "Thank you for using Data Processing CLI!",
  INVALID_INPUT: "Invalid input",
  OPERATION_FAILED: "Operation failed",
  PATH_ERROR: "Path is required",

  location: (dir) => `You are currently in ${dir}`,
};

export const COMMANDS = {
  EXIT: ".exit",
  UP: "up",
  CD: "cd",
  LS: "ls",
  CSV_TO_JSON: "csv-to-json",
  JSON_TO_CSV: "json-to-csv",
  COUNT: "count",
}