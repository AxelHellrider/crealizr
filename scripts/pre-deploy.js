#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Pre-deployment checks and version management
console.log('🚀 Running pre-deployment checks...\n');

// Check if working directory is clean
function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      console.log('❌ Working directory is not clean:');
      console.log(status);
      console.log('\nPlease commit or stash changes before deployment.');
      process.exit(1);
    }
    console.log('✅ Working directory is clean');
  } catch (error) {
    console.error('❌ Error checking git status:', error.message);
    process.exit(1);
  }
}

// Run tests
function runTests() {
  try {
    console.log('🧪 Running tests...');
    execSync('npm test', { stdio: 'inherit' });
    console.log('✅ All tests passed');
  } catch (error) {
    console.error('❌ Tests failed:', error.message);
    process.exit(1);
  }
}

// Run linting
function runLint() {
  try {
    console.log('🔍 Running linting...');
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('✅ Linting passed');
  } catch (error) {
    console.error('❌ Linting failed:', error.message);
    process.exit(1);
  }
}

// Build project
function buildProject() {
  try {
    console.log('🏗️ Building project...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build successful');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Check if version increment is needed
function checkVersionIncrement() {
  const versionManager = require('./version-manager');
  const commits = versionManager.getCommitMessages();
  
  if (commits.length === 0) {
    console.log('ℹ️ No new commits found, skipping version increment');
    return false;
  }
  
  const currentVersion = versionManager.getCurrentVersion();
  const versionType = versionManager.determineVersionType(commits);
  const newVersion = versionManager.incrementVersion(currentVersion, versionType);
  
  if (currentVersion !== newVersion) {
    console.log(`📈 Version increment needed: ${currentVersion} → ${newVersion}`);
    console.log(`🔄 Version type: ${versionType}`);
    
    // Run version management
    try {
      execSync(`node scripts/version-manager.js ${versionType}`, { stdio: 'inherit' });
      console.log('✅ Version incremented successfully');
      return true;
    } catch (error) {
      console.error('❌ Version increment failed:', error.message);
      process.exit(1);
    }
  } else {
    console.log('ℹ️ No version increment needed');
    return false;
  }
}

// Main execution
function main() {
  checkGitStatus();
  runTests();
  runLint();
  buildProject();
  
  const versionIncremented = checkVersionIncrement();
  
  if (versionIncremented) {
    console.log('\n🎉 Pre-deployment checks completed with version increment!');
    console.log('📝 Don\'t forget to push the new version tag:');
    console.log('   git push origin main --tags');
  } else {
    console.log('\n✅ Pre-deployment checks completed successfully!');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  checkGitStatus,
  runTests,
  runLint,
  buildProject,
  checkVersionIncrement
};
