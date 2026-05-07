# Hostinger Deployment Setup

This guide covers the specific setup required for deploying CRealizr to Hostinger hosting.

## Prerequisites

- Hostinger hosting account with Node.js support
- SSH access or FTP credentials
- Domain configured on Hostinger
- Git repository (GitHub/GitLab/Bitbucket)

## Deployment Options

### Option 1: Git Push Deployment (Recommended)

Hostinger supports Git-based deployment which is the most reliable option.

#### Setup Steps:

1. **Enable Git Deployment on Hostinger**
   - Log into Hostinger control panel
   - Go to "Hosting" → "Manage" → "Git"
   - Click "Enable Git Deployment"
   - Connect your GitHub repository

2. **Configure Git Remote**
   ```bash
   # Add Hostinger as remote (replace with your repo URL)
   git remote add hostinger https://github.com/yourusername/yourrepo.git
   
   # Or use Hostinger's Git URL if provided
   git remote add hostinger git@git.hostinger.com:username/crealizr.git
   ```

3. **Set Environment Variables**
   Add these to your `.env` file:
   ```env
   HOSTINGER_GIT_REPO=git@git.hostinger.com:username/crealizr.git
   NODE_ENV=production
   NEXT_PUBLIC_GA_ID=your_google_analytics_id
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

### Option 2: FTP/SFTP Deployment

For manual deployment via FTP/SFTP.

#### Setup Steps:

1. **Get FTP Credentials**
   - Host: Usually your domain or IP
   - Username: Found in Hostinger control panel
   - Password: Your hosting account password
   - Path: `/public_html` or similar

2. **Configure Environment Variables**
   ```env
   HOSTINGER_FTP_HOST=ftp.yourdomain.com
   HOSTINGER_FTP_USER=your_username
   HOSTINGER_FTP_PASS=your_password
   HOSTINGER_FTP_PATH=/public_html
   ```

3. **Install FTP Client** (if not available)
   ```bash
   # Ubuntu/Debian
   sudo apt-get install ftp
   
   # macOS
   brew install inetutils
   
   # Windows
   # Use Git Bash or WSL
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

### Option 3: Manual Deployment

If automatic deployment isn't working.

#### Manual Steps:

1. **Build the Project**
   ```bash
   npm run build
   ```

2. **Upload Files to Hostinger**
   - Upload `.next` folder to your Hostinger hosting
   - Upload `public` folder to your hosting
   - Upload `package.json` and `package-lock.json`

3. **Configure Node.js on Hostinger**
   - In Hostinger control panel, go to "Setup" → "Node.js"
   - Set "Web Root" to your project folder
   - Set "Startup File" to `.next/server.js`
   - Set "Node Version" to 20.x

4. **Install Dependencies**
   ```bash
   # Via SSH or Hostinger terminal
   cd /path/to/your/project
   npm ci --production
   ```

5. **Set Environment Variables**
   Add these in Hostinger control panel under "Environment Variables":
   ```env
   NODE_ENV=production
   NEXT_PUBLIC_GA_ID=your_google_analytics_id
   ```

## Environment Variables

Create a `.env.local` file locally and configure the same variables in Hostinger:

```env
# Production
NODE_ENV=production

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Hostinger Deployment (choose one)
HOSTINGER_GIT_REPO=git@git.hostinger.com:username/crealizr.git
# OR
HOSTINGER_FTP_HOST=ftp.yourdomain.com
HOSTINGER_FTP_USER=your_username
HOSTINGER_FTP_PASS=your_password
HOSTINGER_FTP_PATH=/public_html
```

## Hostinger Configuration

### Node.js Setup

1. **Login to Hostinger Control Panel**
2. **Navigate to Hosting → Manage → Setup**
3. **Configure Node.js:**
   - Node.js version: 20.x
   - Application mode: Production
   - Startup file: `.next/server.js`
   - Web root: Your project folder

### Domain Configuration

1. **Point your domain to Hostinger**
2. **Configure SSL certificate** (recommended)
3. **Set up custom error pages** (optional)

### Performance Optimization

1. **Enable Gzip compression** in Hostinger settings
2. **Configure caching headers**
3. **Enable CDN** if available

## Troubleshooting

### Common Issues

#### 1. Build Errors
```bash
# Check Node.js version on Hostinger
node --version  # Should be 20.x

# Clear cache and rebuild
rm -rf .next
npm run build
```

#### 2. Environment Variables Not Working
- Ensure variables are set in Hostinger control panel
- Restart the application after changing variables
- Check for typos in variable names

#### 3. FTP Upload Issues
- Verify FTP credentials
- Check file permissions on Hostinger
- Ensure target directory exists

#### 4. Git Push Issues
- Verify SSH keys are configured
- Check repository permissions
- Ensure main branch exists

### Debug Mode

Add debug logging to deployment:
```bash
DEBUG=true npm run deploy
```

## GitHub Actions Integration

Update your GitHub Actions workflow to deploy to Hostinger:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Hostinger

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build project
      run: npm run build
      
    - name: Deploy to Hostinger
      env:
        HOSTINGER_FTP_HOST: ${{ secrets.HOSTINGER_FTP_HOST }}
        HOSTINGER_FTP_USER: ${{ secrets.HOSTINGER_FTP_USER }}
        HOSTINGER_FTP_PASS: ${{ secrets.HOSTINGER_FTP_PASS }}
      run: npm run deploy
```

### Required GitHub Secrets

Add these to your GitHub repository secrets:

- `HOSTINGER_FTP_HOST`
- `HOSTINGER_FTP_USER` 
- `HOSTINGER_FTP_PASS`
- `HOSTINGER_GIT_REPO` (if using Git deployment)

## Best Practices

1. **Always test locally first**
2. **Use Git deployment for reliability**
3. **Keep environment variables secure**
4. **Monitor deployment logs**
5. **Set up monitoring/uptime checks**
6. **Regular backups of your hosting**

## Support

If you encounter issues:

1. Check Hostinger's Node.js documentation
2. Review Hostinger control panel logs
3. Contact Hostinger support
4. Check the deployment script logs

## Migration Guide

If moving from another host to Hostinger:

1. Export your database (if applicable)
2. Backup current files
3. Update DNS settings
4. Deploy using one of the methods above
5. Test thoroughly
6. Update DNS to point to Hostinger
7. Monitor for issues
