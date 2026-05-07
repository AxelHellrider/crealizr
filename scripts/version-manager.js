#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  packageJsonPath: path.join(__dirname, '../package.json'),
  changelogPath: path.join(__dirname, '../CHANGELOG.md'),
  versionTypes: {
    'patch': '🐛 Bug Fixes',
    'minor': '✨ Features', 
    'major': '💥 Breaking Changes',
    'chore': '🔧 Maintenance',
    'docs': '📚 Documentation',
    'style': '💄 Styling',
    'refactor': '♻️ Refactoring',
    'perf': '⚡ Performance',
    'test': '🧪 Testing'
  }
};

// Get current version from package.json
function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync(CONFIG.packageJsonPath, 'utf8'));
  return packageJson.version;
}

// Increment version based on semantic versioning
function incrementVersion(currentVersion, type) {
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      return currentVersion;
  }
}

// Get commit messages since last tag
function getCommitMessages() {
  try {
    // Get the latest tag
    const latestTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
    
    // Get commits since the latest tag
    const commits = execSync(`git log ${latestTag}..HEAD --pretty=format:"%s|%h|%an"`, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(line => line.trim());
    
    return commits.map(commit => {
      const [message, hash, author] = commit.split('|');
      return { message: message.trim(), hash: hash.trim(), author: author.trim() };
    });
  } catch (error) {
    // If no tags exist, get all commits
    const commits = execSync('git log --pretty=format:"%s|%h|%an"', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(line => line.trim());
    
    return commits.map(commit => {
      const [message, hash, author] = commit.split('|');
      return { message: message.trim(), hash: hash.trim(), author: author.trim() };
    });
  }
}

// Determine version increment type based on commit messages
function determineVersionType(commits) {
  const messageText = commits.map(c => c.message.toLowerCase()).join(' ');
  
  // Check for breaking changes first
  if (messageText.includes('breaking') || messageText.includes('!:')) {
    return 'major';
  }
  
  // Check for features
  if (messageText.includes('feat') || messageText.includes('feature')) {
    return 'minor';
  }
  
  // Default to patch for bug fixes and other changes
  return 'patch';
}

// Categorize commits by type
function categorizeCommits(commits) {
  const categorized = {};
  
  // Initialize categories
  Object.keys(CONFIG.versionTypes).forEach(type => {
    categorized[type] = [];
  });
  
  commits.forEach(commit => {
    const message = commit.message.toLowerCase();
    let category = 'chore'; // default
    
    // Determine category based on conventional commits
    if (message.startsWith('feat') || message.startsWith('feature')) {
      category = 'minor';
    } else if (message.startsWith('fix') || message.startsWith('bug')) {
      category = 'patch';
    } else if (message.startsWith('docs') || message.startsWith('doc')) {
      category = 'docs';
    } else if (message.startsWith('style')) {
      category = 'style';
    } else if (message.startsWith('refactor')) {
      category = 'refactor';
    } else if (message.startsWith('perf') || message.startsWith('performance')) {
      category = 'perf';
    } else if (message.startsWith('test')) {
      category = 'test';
    } else if (message.includes('breaking') || message.includes('!:')) {
      category = 'major';
    }
    
    categorized[category].push(commit);
  });
  
  return categorized;
}

// Generate changelog content
function generateChangelog(version, categorizedCommits) {
  const date = new Date().toISOString().split('T')[0];
  let changelog = `## [${version}] - ${date}\n\n`;
  
  // Add commits by category
  Object.entries(CONFIG.versionTypes).forEach(([type, label]) => {
    const commits = categorizedCommits[type];
    if (commits.length > 0) {
      changelog += `### ${label}\n\n`;
      commits.forEach(commit => {
        // Clean up commit message
        let message = commit.message;
        // Remove conventional commit prefixes
        message = message.replace(/^(feat|fix|docs|style|refactor|perf|test|chore)(\(.+\))?:\s*/, '');
        // Capitalize first letter
        message = message.charAt(0).toUpperCase() + message.slice(1);
        
        changelog += `- ${message} (${commit.hash})\n`;
      });
      changelog += '\n';
    }
  });
  
  return changelog;
}

// Update package.json version
function updatePackageVersion(newVersion) {
  const packageJson = JSON.parse(fs.readFileSync(CONFIG.packageJsonPath, 'utf8'));
  packageJson.version = newVersion;
  fs.writeFileSync(CONFIG.packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✅ Updated package.json to version ${newVersion}`);
}

// Update changelog
function updateChangelog(newChangelog) {
  let existingChangelog = '';
  
  if (fs.existsSync(CONFIG.changelogPath)) {
    existingChangelog = fs.readFileSync(CONFIG.changelogPath, 'utf8');
  } else {
    // Create initial changelog header
    existingChangelog = `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n`;
  }
  
  // Insert new changelog after the header
  const headerEnd = existingChangelog.indexOf('\n\n') + 2;
  const newContent = existingChangelog.slice(0, headerEnd) + 
                    newChangelog + 
                    existingChangelog.slice(headerEnd);
  
  fs.writeFileSync(CONFIG.changelogPath, newContent);
  console.log(`✅ Updated CHANGELOG.md`);
}

// Create git tag and push
function createGitTag(version) {
  try {
    execSync(`git add package.json CHANGELOG.md`);
    execSync(`git commit -m "chore: bump version to ${version}"`);
    execSync(`git tag v${version}`);
    console.log(`✅ Created git tag v${version}`);
  } catch (error) {
    console.error(`❌ Error creating git tag: ${error.message}`);
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const forceType = args.find(arg => ['major', 'minor', 'patch'].includes(arg));
  
  console.log('🚀 Starting version management process...\n');
  
  // Get current version
  const currentVersion = getCurrentVersion();
  console.log(`📦 Current version: ${currentVersion}`);
  
  // Get commits
  const commits = getCommitMessages();
  console.log(`📝 Found ${commits.length} commits to process`);
  
  // Determine version type
  const versionType = forceType || determineVersionType(commits);
  console.log(`🔄 Version increment type: ${versionType}`);
  
  // Calculate new version
  const newVersion = incrementVersion(currentVersion, versionType);
  console.log(`🎯 New version: ${newVersion}`);
  
  // Categorize commits
  const categorizedCommits = categorizeCommits(commits);
  
  // Generate changelog
  const changelog = generateChangelog(newVersion, categorizedCommits);
  console.log('📋 Generated changelog content');
  
  // Update files
  updatePackageVersion(newVersion);
  updateChangelog(changelog);
  
  // Create git tag
  createGitTag(newVersion);
  
  console.log(`\n✨ Version ${newVersion} has been successfully created!`);
  console.log(`📝 Don't forget to push the changes and tag:`);
  console.log(`   git push origin main --tags`);
}

// Export functions for testing
module.exports = {
  getCurrentVersion,
  incrementVersion,
  getCommitMessages,
  determineVersionType,
  categorizeCommits,
  generateChangelog,
  updatePackageVersion,
  updateChangelog,
  createGitTag
};

// Run if called directly
if (require.main === module) {
  main();
}
