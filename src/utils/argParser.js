const FLAG_PREFIX = "--";

export function parseArgs(input) {
  const tokens = input.trim().split(/\s+/);
  const command = tokens.shift();

  const args = {};
  const flags = {};
  let pathArg = "";

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.startsWith(FLAG_PREFIX)) {
      const key = token.slice(2);
      const next = tokens[i + 1];

      if (next && !next.startsWith(FLAG_PREFIX)) {
        args[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      pathArg = token;
    }
  }

  return { command, args, flags, pathArg };
}