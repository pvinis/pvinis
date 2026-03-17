// Assembles the final README.md from:
// 1. A random roulette header
// 2. The bad-words section (from current README)
// 3. The graveyard section (generated fresh)

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { getRandomHeader } from "./roulette";
import { generateGraveyard } from "./graveyard";

const ROOT = join(import.meta.dir, "..");

function getBadWordsSection(): string {
  const readme = readFileSync(join(ROOT, "README.md"), "utf8");

  const match = readme.match(
    /(## Latest commit containing bad words[\s\S]*?<sub>\[how does this work\].*?<\/sub>)/
  );

  if (match) return match[1];

  // Fallback: use template as-is
  return readFileSync(join(ROOT, "README.md.tmpl"), "utf8").trimEnd();
}

const WORK_SECTION = `## Some of my work
- [FINISH HIM !!](https://finish-h.im)
- [My "tech radar"](https://radar.thoughtworks.com/?sheetId=https%3A%2F%2Fraw.githubusercontent.com%2Fpvinis%2Ftech-radar%2Fmain%2Ftech-radar.csv)`;

async function main() {
  const header = getRandomHeader();
  const badWords = getBadWordsSection();
  const graveyard = await generateGraveyard();

  const readme = [
    header,
    "",
    "---",
    "",
    badWords,
    "",
    "---",
    "",
    WORK_SECTION,
    "",
    "---",
    "",
    "## The Graveyard",
    "",
    "*Where my abandoned repos rest in peace.*",
    "",
    graveyard,
    "",
    "---",
    "",
    `<sub>this readme updates itself. the header changes randomly. the graveyard is real. [how does it work?](https://github.com/pvinis/pvinis/blob/master/README_ACTUAL.md)</sub>`,
    "",
  ].join("\n");

  writeFileSync(join(ROOT, "README.md"), readme);
  console.log("README.md built successfully.");
}

main();
