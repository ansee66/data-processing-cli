const FLAG_PREFIX = "--";

export function parseArgs(input) {
  const tokens = input.trim().split(/\s+/);
  const command = tokens.shift();

  const args = {};
  const flags = {};

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (!token.startsWith("--")) continue;

    const key = token.slice(2);
    const next = tokens[i + 1];

    if (next && !next.startsWith(FLAG_PREFIX)) {
      args[key] = next;
      i++;
    } else {
      flags[key] = true;
    }
  }

  return { command, args, flags };
}