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

    sh(`git add "${pkgPath}"`);
    sh(`git commit -m "chore(release): ${nextTag}"`);
    sh(`git tag -a ${nextTag} -m "${nextTag}"`);

    console.log(`\nCommitted and tagged ${nextTag}. Push with: git push && git push origin ${nextTag}`);
}

main();
