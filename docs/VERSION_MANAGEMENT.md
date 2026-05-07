# Version Management & Changelog System

This document describes the automated version management and changelog creation system for CRealizr.

## Overview

The version management system automatically:
- Analyzes commit messages since the last release
- Determines the appropriate version increment (major/minor/patch)
- Generates a structured changelog
- Updates package.json version
- Creates git tags
- Prepares release documentation

## Scripts

### Version Management Scripts

| Script | Description |
|--------|-------------|
| `npm run version` | Auto-detect version type and increment |
| `npm run version:patch` | Increment patch version (0.1.0 → 0.1.1) |
| `npm run version:minor` | Increment minor version (0.1.0 → 0.2.0) |
| `npm run version:major` | Increment major version (0.1.0 → 1.0.0) |

### Deployment Scripts

| Script | Description |
|--------|-------------|
| `npm run pre-deploy` | Run tests, lint, build, and version checks |
| `npm run deploy` | Full deployment process with version management |
| `npm run release` | Build, version, and push to git |

## Commit Message Conventions

The system follows [Conventional Commits](https://www.conventionalcommits.org/) to determine version increments:

### Version Increment Rules

- **Major**: Commits containing "breaking" or "!" (e.g., `feat!: new API`)
- **Minor**: Commits starting with `feat:` or `feature:` (e.g., `feat: add new tool`)
- **Patch**: Commits starting with `fix:` or `bug:` (e.g., `fix: resolve footer issue`)
- **Default**: All other commits (docs, style, refactor, etc.)

### Commit Categories

| Type | Emoji | Description |
|------|-------|-------------|
| `feat` | ✨ | New features |
| `fix` | 🐛 | Bug fixes |
| `docs` | 📚 | Documentation changes |
| `style` | 💄 | Code style changes |
| `refactor` | ♻️ | Code refactoring |
| `perf` | ⚡ | Performance improvements |
| `test` | 🧪 | Test additions/changes |
| `chore` | 🔧 | Maintenance tasks |

### Examples

```bash
feat: add monster scaling functionality
fix: resolve footer layout issue on mobile
docs: update installation guide
refactor: optimize theme switching logic
breaking!: remove deprecated API endpoints
```

## Changelog Format

The changelog follows [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [0.2.0] - 2026-05-08

### ✨ Features
- Add monster scaling functionality
- Implement seasonal theme system

### 🐛 Bug Fixes
- Resolve footer layout issue on mobile
- Fix navigation dropdown on small screens

### 📚 Documentation
- Update installation guide
- Add API documentation

### 🎨 UI/UX
- Simplify footer structure
- Improve mobile responsiveness
```

## Automated Workflow

### 1. Development
```bash
# Make changes with conventional commits
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
```

### 2. Pre-Deployment
```bash
# Run all checks and version management
npm run pre-deploy
```

This will:
- Check git status (must be clean)
- Run all tests
- Run linting
- Build the project
- Analyze commits and increment version if needed
- Update changelog
- Create git tag

### 3. Deployment
```bash
# Full deployment process
npm run deploy
```

This will:
- Check you're on main branch
- Pull latest changes
- Run pre-deployment checks
- Deploy to production
- Push version tags
- Notify completion

### 4. Manual Version Control
```bash
# Force specific version increment
npm run version:minor
npm run version:major
npm run version:patch
```

## GitHub Actions

The system includes a GitHub Actions workflow (`.github/workflows/release.yml`) that:

1. Triggers on pushes to main branch or manual dispatch
2. Runs tests and builds
3. Creates releases automatically
4. Generates GitHub releases with changelog

### Manual Release via GitHub

1. Go to Actions → Release workflow
2. Click "Run workflow"
3. Choose version type (patch/minor/major)
4. Monitor the process

## File Structure

```
crializr/
├── scripts/
│   ├── version-manager.js    # Core version management logic
│   ├── pre-deploy.js         # Pre-deployment checks
│   └── deploy.js             # Deployment orchestration
├── .github/workflows/
│   └── release.yml           # GitHub Actions workflow
├── CHANGELOG.md              # Auto-generated changelog
├── package.json              # Version and scripts
└── docs/
    └── VERSION_MANAGEMENT.md # This documentation
```

## Configuration

### Version Types Configuration

The version categories and emojis are configured in `scripts/version-manager.js`:

```javascript
const CONFIG = {
  versionTypes: {
    'patch': '🐛 Bug Fixes',
    'minor': '✨ Features', 
    'major': '💥 Breaking Changes',
    'chore': '🔧 Maintenance',
    // ... more categories
  }
};
```

### Custom Deployment

Add custom deployment logic to `package.json`:

```json
{
  "scripts": {
    "deploy:prod": "vercel --prod"
  }
}
```

The deployment script will automatically detect and run this.

## Best Practices

1. **Use Conventional Commits**: Always follow the commit message conventions
2. **Test Before Deploying**: Always run `npm run pre-deploy` before deployment
3. **Review Changelog**: Check the generated changelog for accuracy
4. **Semantic Versioning**: Follow semantic versioning principles
5. **Tag Management**: Don't manually create tags - let the system handle it

## Troubleshooting

### Version Not Incrementing
- Check if commits follow conventional format
- Ensure working directory is clean
- Verify you're on the correct branch

### Git Tag Issues
- Ensure you have push permissions to the repository
- Check if tags already exist locally
- Force push tags if needed: `git push origin main --tags --force`

### Deployment Failures
- Check pre-deployment script output
- Verify build process completes successfully
- Ensure deployment credentials are configured

### Chelog Issues
- Review commit messages for proper formatting
- Check if version-manager.js has correct permissions
- Verify CHANGELOG.md is not locked by another process

## Migration

To migrate an existing project to this system:

1. Copy the scripts directory
2. Update package.json scripts
3. Add GitHub Actions workflow
4. Create initial CHANGELOG.md
5. Run first version increment: `npm run version`
