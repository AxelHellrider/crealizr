#!/usr/bin/env node
/**
 * Bumps package.json's version based on commit messages since the last
 * "vX.Y.Z" git tag, following this repo's existing prefix convention:
 *   - "BREAKING" anywhere in the message           -> major
 *   - "feature(...)" / "feat(...)" / "feat:"        -> minor
 *   - anything else (fix, bugfix, refactor, chore…) -> patch
 * Highest-precedence bump wins. Then commits package.json and tags it.
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
const isCI = Boolean(process.env.CI || process.env.VERCEL);
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

function lastTag() {
    try {
        return sh("git describe --tags --match \"v[0-9]*.[0-9]*.[0-9]*\" --abbrev=0");
    } catch {
        return null;
    }
}

function commitsSince(tag) {
    const range = tag ? `${tag}..HEAD` : "HEAD";
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

function main() {
    const tag = lastTag();
    const subjects = commitsSince(tag);

    if (subjects.length === 0) {
        console.log(tag ? `No commits since ${tag} — nothing to release.` : "No commits found.");
        return;
    }

    const level = classify(subjects);
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    const nextVersion = bumpVersion(pkg.version, level);
    const nextTag = `v${nextVersion}`;

    console.log(`${tag ?? "(no previous tag)"} -> ${nextTag}  [${level} bump, ${subjects.length} commit(s)]`);
    subjects.forEach(s => console.log(`  - ${s}`));

    if (dryRun) {
        console.log("\nDry run — no files changed, nothing committed or tagged.");
        return;
    }

    pkg.version = nextVersion;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

    if (isCI) {
        console.log(`\nCI build — bumped package.json to ${nextTag} for this build only (no commit/tag).`);
        return;
    }

    sh(`git add "${pkgPath}"`);
    sh(`git commit -m "chore(release): ${nextTag}"`);
    sh(`git tag -a ${nextTag} -m "${nextTag}"`);

    console.log(`\nCommitted and tagged ${nextTag}. Push with: git push && git push origin ${nextTag}`);
}

main();
