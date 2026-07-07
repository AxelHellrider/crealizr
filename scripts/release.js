#!/usr/bin/env node
/**
 * Bumps package.json's version, following this repo's existing commit
 * prefix convention:
 *   - "BREAKING" anywhere in the message           -> major
 *   - "feature(...)" / "feat(...)" / "feat:"        -> minor
 *   - anything else (fix, bugfix, refactor, chore…) -> patch
 * Highest-precedence bump wins.
 *
 * Locally (`npm run release`), the range scanned is every commit since the
 * last "chore(release): vX.Y.Z" commit, then the bump is committed and
 * tagged so the base version in git actually advances.
 *
 * On CI/deploy hosts, only the single HEAD commit is classified and bumped
 * once on top of whatever version is already committed in package.json —
 * deliberately not a git-log range. Deploy hosts commonly do a shallow
 * clone, where neither `git describe --tags` nor `git log --grep` across
 * history can see far enough back; relying on either re-derives the bump
 * from scratch every build and can never advance past one step from the
 * hardcoded base. HEAD's message is the one thing guaranteed present even
 * at clone depth 1, so that's the only thing CI trusts.
 *
 * Usage: node scripts/release.js [--dry-run]
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const dryRun = process.argv.includes("--dry-run");
// On CI/deploy platforms (Vercel, generic CI) we only want the version bump
// baked into the build output — there's no point (and often no permission)
// to commit/tag from an ephemeral, detached-HEAD checkout.
const isCI = Boolean(process.env.CI || process.env.VERCEL || process.env.NODE_ENV === "production");
// "build" runs this via the `prebuild` hook on every local build too — only
// auto-bump there when we're actually on a CI/deploy platform. A dev running
// `npm run build` locally to sanity-check a production build shouldn't get
// a surprise commit; `npm run release` (this same script, run directly)
// still works locally regardless of lifecycle event.
if (process.env.npm_lifecycle_event === "prebuild" && !isCI) {
    console.log("Skipping auto-release: local build (not CI). Run `npm run release` manually when ready.");
    process.exit(0);
}
const pkgPath = path.join(__dirname, "..", "package.json");

function sh(cmd) {
    return execSync(cmd, { encoding: "utf8" }).trim();
}

function lastReleaseCommit() {
    try {
        return sh('git log --grep="^chore(release):" -1 --format=%H') || null;
    } catch {
        return null;
    }
}

function commitsSince(commit) {
    const range = commit ? `${commit}..HEAD` : "HEAD";
    const log = sh(`git log ${range} --format=%s`);
    return log ? log.split("\n") : [];
}

function classify(subjects) {
    let bump = null; // null | "patch" | "minor" | "major"
    for (const subject of subjects) {
        if (/breaking/i.test(subject)) return "major";
        if (/^feat(ure)?(\(.+\))?[:!]?/i.test(subject)) bump = "minor";
        else if (!bump) bump = "patch";
    }
    return bump;
}

function bumpVersion(version, level) {
    const [major, minor, patch] = version.split(".").map(Number);
    if (level === "major") return `${major + 1}.0.0`;
    if (level === "minor") return `${major}.${minor + 1}.0`;
    return `${major}.${minor}.${patch + 1}`;
}

function mainCI() {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    let head;
    try {
        head = sh("git log -1 --format=%s");
    } catch {
        console.log("Could not read HEAD commit — leaving version as-is.");
        return;
    }

    const level = classify([head]) ?? "patch";
    const nextVersion = bumpVersion(pkg.version, level);
    console.log(`${pkg.version} -> v${nextVersion}  [${level} bump, from HEAD: "${head}"]`);

    if (dryRun) {
        console.log("\nDry run — no files changed.");
        return;
    }

    pkg.version = nextVersion;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
    console.log(`\nCI build — bumped package.json to v${nextVersion} for this build only (no commit/tag).`);
}

function mainLocal() {
    const releaseCommit = lastReleaseCommit();
    const subjects = commitsSince(releaseCommit);

    if (subjects.length === 0) {
        console.log(releaseCommit ? `No commits since ${releaseCommit.slice(0, 7)} — nothing to release.` : "No commits found.");
        return;
    }

    const level = classify(subjects);
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    const nextVersion = bumpVersion(pkg.version, level);
    const nextTag = `v${nextVersion}`;

    console.log(`${releaseCommit ? releaseCommit.slice(0, 7) : "(no previous release)"} -> ${nextTag}  [${level} bump, ${subjects.length} commit(s)]`);
    subjects.forEach(s => console.log(`  - ${s}`));

    if (dryRun) {
        console.log("\nDry run — no files changed, nothing committed or tagged.");
        return;
    }

    pkg.version = nextVersion;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

    sh(`git add "${pkgPath}"`);
    sh(`git commit -m "chore(release): ${nextTag}"`);
    sh(`git tag -a ${nextTag} -m "${nextTag}"`);

    console.log(`\nCommitted and tagged ${nextTag}. Push with: git push && git push origin ${nextTag}`);
}

function main() {
    if (isCI) {
        mainCI();
    } else {
        mainLocal();
    }
}

main();
