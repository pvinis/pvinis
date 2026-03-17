// Generates ASCII tombstones for abandoned repos.

const OWNER = "pvinis";
const DEATH_THRESHOLD_DAYS = 365;
const EXCLUDE_FILE = new URL("../data/graveyard-exclude.json", import.meta.url);

interface Repo {
  name: string;
  description: string | null;
  created_at: string;
  pushed_at: string;
  fork: boolean;
}

function getExcludeList(): string[] {
  try {
    return JSON.parse(Bun.file(EXCLUDE_FILE).text() as unknown as string);
  } catch {
    return [];
  }
}

async function fetchRepos(): Promise<Repo[]> {
  const allRepos: Repo[] = [];
  let page = 1;

  while (true) {
    const proc = Bun.spawnSync([
      "gh",
      "api",
      `/users/${OWNER}/repos?per_page=100&page=${page}&type=owner&sort=pushed&direction=asc`,
    ]);

    if (proc.exitCode !== 0) {
      throw new Error(`gh api failed: ${proc.stderr.toString()}`);
    }

    const repos: Repo[] = JSON.parse(proc.stdout.toString());
    if (repos.length === 0) break;
    allRepos.push(...repos);
    if (repos.length < 100) break;
    page++;
  }

  return allRepos;
}

function isDead(repo: Repo): boolean {
  const lastPush = new Date(repo.pushed_at);
  const now = new Date();
  const daysSincePush = (now.getTime() - lastPush.getTime()) / (1000 * 60 * 60 * 24);
  return daysSincePush >= DEATH_THRESHOLD_DAYS;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const EMPTY_EPITAPHS = [
  "Gone but not explained",
  "It seemed like a good idea",
  "README said 'coming soon'",
  "The world wasn't ready",
  "Left no description behind",
  "A mystery, even to its creator",
  "Too beautiful for this world",
  "Started with great intentions",
];

function getEpitaph(repo: Repo): string {
  if (repo.description?.trim()) {
    const desc = repo.description.trim();
    return desc.length > 35 ? desc.slice(0, 32) + "..." : desc;
  }
  const hash = repo.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return EMPTY_EPITAPHS[hash % EMPTY_EPITAPHS.length];
}

function makeTombstone(repo: Repo): string {
  const born = formatDate(repo.created_at);
  const died = formatDate(repo.pushed_at);
  const epitaph = getEpitaph(repo);

  const maxWidth = 27;
  const lines: string[] = [];
  const words = epitaph.split(" ");
  let currentLine = "";
  for (const word of words) {
    if (currentLine && currentLine.length + 1 + word.length > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = currentLine ? currentLine + " " + word : word;
    }
  }
  if (currentLine) lines.push(currentLine);

  const pad = (s: string, w: number) => {
    const padding = w - s.length;
    const left = Math.floor(padding / 2);
    const right = padding - left;
    return " ".repeat(left) + s + " ".repeat(right);
  };

  const W = 31;
  const border = "─".repeat(W);
  const empty = "│" + " ".repeat(W) + "│";
  const displayName =
    repo.name.length > W - 2 ? repo.name.slice(0, W - 5) + "..." : repo.name;

  return [
    "┌" + border + "┐",
    "│" + pad("R.I.P.", W) + "│",
    empty,
    "│" + pad(displayName, W) + "│",
    empty,
    "│" + pad(`${born} — ${died}`, W) + "│",
    empty,
    ...lines.map((l) => "│" + pad(`"${l}"`, W) + "│"),
    "└" + border + "┘",
  ].join("\n");
}

export async function generateGraveyard(): Promise<string> {
  let repos: Repo[];
  try {
    repos = await fetchRepos();
  } catch {
    return "*The graveyard groundskeeper is on break. Check back later.*";
  }

  const excludeList = getExcludeList();

  const deadRepos = repos
    .filter((r) => isDead(r) && !r.fork && !excludeList.includes(r.name))
    .sort(
      (a, b) =>
        new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
    );

  if (deadRepos.length === 0) {
    return "*No repos have died yet. The graveyard is empty... for now.*";
  }

  const tombstones = deadRepos.slice(0, 12).map(makeTombstone);

  // Arrange in rows of 3
  const rows: string[][] = [];
  for (let i = 0; i < tombstones.length; i += 3) {
    rows.push(tombstones.slice(i, i + 3));
  }

  let output = "";
  for (const row of rows) {
    const splitTombs = row.map((t) => t.split("\n"));
    const maxLines = Math.max(...splitTombs.map((t) => t.length));

    const padded = splitTombs.map((t) => {
      while (t.length < maxLines) t.push(" ".repeat(33));
      return t;
    });

    for (let line = 0; line < maxLines; line++) {
      output += padded.map((t) => t[line]).join("  ") + "\n";
    }
    output += "\n";
  }

  return "```\n" + output.trimEnd() + "\n```";
}

// Allow running standalone
if (import.meta.main) {
  console.log(await generateGraveyard());
}
