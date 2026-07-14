#!/usr/bin/env node
/**
 * Bumps package.json's version, following this repo's existing commit
 * prefix convention:
 *   - "BREAKING" anywhere in the message           -> major
 *   - "feature(...)" / "feat(...)" / "feat:"        -> minor
 *   - anything else (fix, bugfix, refactor, chore…) -> patch
 * Highest-precedence bump wins.
 *
 * This ONLY runs locally, via `npm run release`: it scans every commit
 * since the last "chore(release): vX.Y.Z" commit, bumps package.json, then
 * commits and tags — so the version in git actually advances, permanently.
 *
 * Deploy hosts (Hostinger, Vercel, etc.) never bump anything. Earlier
 * versions of this script tried to guess a bump on the deploy host itself,
 * writing an uncommitted version to package.json during the build. That
 * depends on git history being available to find the last release, but
 * Hostinger's deploy does a shallow clone (depth 1) — only HEAD is ever
 * visible, so "since the last release" can't be computed there, and
 * bumping from HEAD alone every build can never advance past one step
 * from whatever's actually committed (the guess is never saved back). The
 * production version was getting stuck / bumping the wrong amount because
 * of this. The fix is to not guess on the deploy host at all: package.json
 * already has the correct version once you've run `npm run release` and
 * pushed — the deploy build just needs to leave it alone.
 *
 * Usage: node scripts/release.js [--dry-run]
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const dryRun = process.argv.includes("--dry-run");
// On CI/deploy platforms (Vercel, Hostinger, generic CI) there's nothing to
// do here — see the module doc comment above for why.
const isCI = Boolean(process.env.CI || process.env.VERCEL || process.env.NODE_ENV === "production");
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
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        console.log(`CI/deploy build — building committed version v${pkg.version} as-is. Run \`npm run release\` locally and push to bump it.`);
        return;
    }
    mainLocal();
}

main();
