// Picks a random header template from templates/headers/ and returns it.

import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const HEADERS_DIR = join(import.meta.dir, "..", "templates", "headers");
const FORTUNES_FILE = join(import.meta.dir, "..", "data", "fortunes.json");

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function renderTemplate(content: string): string {
  const now = new Date();
  content = content.replace(/\{\{date\}\}/g, now.toISOString().split("T")[0]);

  try {
    const fortunes: string[] = JSON.parse(readFileSync(FORTUNES_FILE, "utf8"));
    content = content.replace(/\{\{fortune\}\}/g, pickRandom(fortunes));
  } catch {
    content = content.replace(
      /\{\{fortune\}\}/g,
      "The universe is under no obligation to make sense to you."
    );
  }

  return content;
}

export function getRandomHeader(): string {
  const files = readdirSync(HEADERS_DIR).filter((f) => f.endsWith(".md"));

  if (files.length === 0) return "# pvinis\n";

  const chosen = pickRandom(files);
  const content = readFileSync(join(HEADERS_DIR, chosen), "utf8");
  return renderTemplate(content);
}

if (import.meta.main) {
  console.log(getRandomHeader());
}
