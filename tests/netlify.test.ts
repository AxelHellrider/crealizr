import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

function parseTomlValue(toml: string, key: string) {
  const match = toml.match(new RegExp(`^\\s*${key}\\s*=\\s*\"([^\"]+)\"`, "m"));
  return match ? match[1] : null;
}

describe("netlify.toml", () => {
  it("uses the expected build command and publish directory", () => {
    const tomlPath = resolve(process.cwd(), "netlify.toml");
    const toml = readFileSync(tomlPath, "utf8");

    const command = parseTomlValue(toml, "command");
    const publish = parseTomlValue(toml, "publish");

    expect(command).toBe("npm run build");
    expect(publish).toBe(".next");
  });
});
