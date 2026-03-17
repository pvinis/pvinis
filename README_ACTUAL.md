This profile README has three parts:

## 1. README Roulette

The header section changes randomly every time the GitHub Action runs. There are multiple "personalities" in `templates/headers/` — professional, hacker terminal, error page, recipe, fortune cookie, minimalist, existential, honest bio.

The build script picks one at random and injects it as the header.

## 2. Bad Words Tracker

This is the original feature. It captures commits with profanity via a global `pre-push` git hook.

**How it works:**

1. **Git hook** (`pre-push`): Captures all commits being pushed and sends them to a bad word detector. It's a global hook configured via:
```
[core]
	hooksPath = /Users/pavlos/.config/git/hooks
```

The [`pre-push`](./hook/pre-push) hook grabs new commits and writes them to `/tmp/pvinis-commits`.

2. **Bad word detector** ([`detector/index.js`](./detector/index.js)): Checks commit messages for profanity. If found, writes the naughty commit data to `/tmp/pvinis-commits-data.json` and triggers the updater.

3. **Updater script** ([`scripts/update.sh`](./scripts/update.sh)): Uses the data to regenerate the README with fresh bad words.

## 3. The Graveyard

A memorial section for abandoned repos. The [`graveyard.js`](./scripts/graveyard.js) script:

- Fetches all public repos via the GitHub API
- Filters for repos with no push in 1+ year
- Generates ASCII tombstones with the repo name, birth/death dates, and an epitaph (from the repo description, or a funny fallback)
- Displays up to 12 tombstones in rows of 3

## Build Pipeline

A [GitHub Action](./.github/workflows/update-readme.yml) runs daily and on push. It:

1. Picks a random header template (Roulette)
2. Reads the current bad-words section
3. Generates the graveyard
4. Assembles everything into `README.md`

The bad-words tracker also updates the README locally via the pre-push hook, which the next Action run will incorporate.
