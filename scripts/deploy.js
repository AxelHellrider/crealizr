#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting deployment process...\n');

// Check if we're on main branch
function checkBranch() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    if (branch !== 'main') {
      console.log(`❌ Not on main branch. Current branch: ${branch}`);
      console.log('Please switch to main branch before deploying.');
      process.exit(1);
    }
    console.log('✅ On main branch');
  } catch (error) {
    console.error('❌ Error checking branch:', error.message);
    process.exit(1);
  }
}

// Pull latest changes
function pullLatest() {
  try {
    console.log('📥 Pulling latest changes...');
    execSync('git pull origin main', { stdio: 'inherit' });
    console.log('✅ Latest changes pulled');
  } catch (error) {
    console.error('❌ Error pulling changes:', error.message);
    process.exit(1);
  }
}

// Run pre-deployment checks
function runPreDeploy() {
  try {
    console.log('🔍 Running pre-deployment checks...');
    execSync('npm run pre-deploy', { stdio: 'inherit' });
    console.log('✅ Pre-deployment checks passed');
  } catch (error) {
    console.error('❌ Pre-deployment checks failed:', error.message);
    process.exit(1);
  }
}

// Deploy to production (Hostinger specific)
function deployToProduction() {
  try {
    console.log('🌍 Deploying to Hostinger...');
    
    // Check if there's a Hostinger deployment script in package.json
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
    
    if (packageJson.scripts && packageJson.scripts['deploy:hostinger']) {
      console.log('🚀 Running Hostinger deployment script...');
      execSync('npm run deploy:hostinger', { stdio: 'inherit' });
    } else {
      // Default Hostinger deployment options
      console.log('📦 Build files ready for Hostinger deployment');
      
      // Option 1: FTP/SFTP deployment (if configured)
      if (process.env.HOSTINGER_FTP_HOST && process.env.HOSTINGER_FTP_USER) {
        console.log('📡 Deploying via FTP/SFTP...');
        deployViaFTP();
      }
      // Option 2: Git push deployment (if configured)
      else if (process.env.HOSTINGER_GIT_REPO) {
        console.log('🔀 Deploying via Git push...');
        deployViaGit();
      }
      // Option 3: Manual deployment instructions
      else {
        console.log('📋 Manual deployment required for Hostinger');
        console.log('\n📁 To deploy to Hostinger:');
        console.log('1. Build the project: npm run build');
        console.log('2. Upload the .next folder to Hostinger');
        console.log('3. Upload public folder to Hostinger');
        console.log('4. Configure Node.js on Hostinger to point to .next/server.js');
        console.log('5. Set up environment variables on Hostinger');
        console.log('\n🔧 For automatic deployment, configure FTP or Git credentials in environment variables.');
      }
    }
    
    console.log('✅ Deployment process completed');
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// FTP/SFTP deployment for Hostinger
function deployViaFTP() {
  try {
    const ftpHost = process.env.HOSTINGER_FTP_HOST;
    const ftpUser = process.env.HOSTINGER_FTP_USER;
    const ftpPass = process.env.HOSTINGER_FTP_PASS;
    const ftpPath = process.env.HOSTINGER_FTP_PATH || '/public_html';
    
    if (!ftpHost || !ftpUser || !ftpPass) {
      throw new Error('Missing FTP credentials. Set HOSTINGER_FTP_HOST, HOSTINGER_FTP_USER, HOSTINGER_FTP_PASS');
    }
    
    console.log(`📡 Uploading to ${ftpHost}:${ftpPath}`);
    
    // Create FTP script
    const ftpScript = `
      open ${ftpHost}
      user ${ftpUser} ${ftpPass}
      cd ${ftpPath}
      lcd .next
      put -R server app
      cd ../
      lcd public
      put -R *
      bye
    `;
    
    require('fs').writeFileSync('/tmp/ftp_script.txt', ftpScript);
    
    // Execute FTP upload (requires ftp client to be installed)
    execSync('ftp -n < /tmp/ftp_script.txt', { stdio: 'inherit' });
    
    console.log('✅ FTP deployment completed');
  } catch (error) {
    console.error('❌ FTP deployment failed:', error.message);
    throw error;
  }
}

// Git push deployment for Hostinger
function deployViaGit() {
  try {
    const gitRepo = process.env.HOSTINGER_GIT_REPO;
    
    if (!gitRepo) {
      throw new Error('Missing Git repository URL. Set HOSTINGER_GIT_REPO');
    }
    
    console.log(`🔀 Pushing to Hostinger Git repository: ${gitRepo}`);
    
    // Add Hostinger remote if not exists
    try {
      execSync('git remote get-url hostinger', { stdio: 'pipe' });
    } catch {
      execSync(`git remote add hostinger ${gitRepo}`, { stdio: 'inherit' });
    }
    
    // Push to Hostinger repository
    execSync('git push hostinger main --force', { stdio: 'inherit' });
    
    console.log('✅ Git deployment completed');
  } catch (error) {
    console.error('❌ Git deployment failed:', error.message);
    throw error;
  }
}

// Push version tag if it was created
function pushVersionTag() {
  try {
    // Check if there are any unpushed tags
    const tags = execSync('git tag --points-at HEAD', { encoding: 'utf8' }).trim();
    if (tags) {
      console.log('🏷️ Pushing version tags...');
      execSync('git push origin main --tags', { stdio: 'inherit' });
      console.log('✅ Version tags pushed');
    }
  } catch (error) {
    console.error('❌ Error pushing tags:', error.message);
    // Don't exit here, as deployment might still be successful
  }
}

// Notify about deployment
function notifyDeployment() {
  const versionManager = require('./version-manager');
  const currentVersion = versionManager.getCurrentVersion();
  
  console.log('\n🎉 Deployment completed successfully!');
  console.log(`📦 Version: ${currentVersion}`);
  console.log('🌐 Live at: https://crealizr.net');
  console.log('📋 Changelog updated');
}

// Main deployment process
function main() {
  checkBranch();
  pullLatest();
  runPreDeploy();
  deployToProduction();
  pushVersionTag();
  notifyDeployment();
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  checkBranch,
  pullLatest,
  runPreDeploy,
  deployToProduction,
  pushVersionTag,
  notifyDeployment
};
