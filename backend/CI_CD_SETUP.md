# CI/CD Setup for Azure Web App

This guide will help you set up continuous deployment from GitHub to Azure Web App.

## Prerequisites

1. GitHub repository with your code
2. Azure Web App created (see AZURE_DEPLOYMENT.md)
3. Azure CLI installed

## Setup Steps

### Step 1: Get Azure Publish Profile

The publish profile contains credentials that GitHub Actions will use to deploy to Azure.

```bash
# Download the publish profile
az webapp deployment list-publishing-profiles \
  --resource-group reach-backend-rg \
  --name reach-backend \
  --xml > publish-profile.xml

# View the content (you'll copy this in the next step)
cat publish-profile.xml
```

### Step 2: Add Publish Profile to GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
5. Value: Paste the entire XML content from `publish-profile.xml`
6. Click **Add secret**

### Step 3: Configure GitHub Actions Workflow

The workflow file is already created at `.github/workflows/azure-deploy.yml`. It will:
- Trigger on pushes to `main` branch that affect the `backend/` directory
- Build the TypeScript code
- Deploy to Azure Web App

### Step 4: Update the Workflow (if needed)

Open `.github/workflows/azure-deploy.yml` and update the `app-name` if you used a different name:

```yaml
- name: Deploy to Azure Web App
  uses: azure/webapps-deploy@v2
  with:
    app-name: 'reach-backend'  # Change this to your app name
    publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
    package: ./backend
```

### Step 5: Test the CI/CD Pipeline

1. Make a change to any file in the `backend/` directory
2. Commit and push to the `main` branch:
```bash
git add .
git commit -m "Test CI/CD deployment"
git push origin main
```

3. Go to your GitHub repository → **Actions** tab
4. You should see the workflow running
5. Once complete, verify at `https://your-app-name.azurewebsites.net/health`

## Alternative: Deploy from Azure Portal

If you prefer to set up CI/CD directly from Azure:

### Option A: GitHub Integration (Recommended)

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Web App
3. Go to **Deployment Center**
4. Choose **GitHub** as the source
5. Authorize Azure to access your GitHub account
6. Select:
   - **Organization**: Your GitHub username/org
   - **Repository**: Your repo name
   - **Branch**: main
7. Azure will automatically create a GitHub Actions workflow
8. Click **Save**

### Option B: Local Git

1. In Azure Portal, go to **Deployment Center**
2. Choose **Local Git**
3. Copy the Git URL
4. Add Azure as a remote:
```bash
cd backend
git remote add azure <your-git-url>
git push azure main
```

## Environment Variables

Remember to set your environment variables in Azure:

```bash
az webapp config appsettings set \
  --resource-group reach-backend-rg \
  --name reach-backend \
  --settings \
    PRIVY_APP_ID="your_privy_app_id" \
    PRIVY_APP_SECRET="your_privy_app_secret" \
    NODE_ENV="production"
```

Or set them in Azure Portal:
1. Go to your Web App
2. **Configuration** → **Application settings**
3. Click **New application setting**
4. Add each variable

## Monitoring Deployments

### View Deployment Logs in GitHub

1. Go to **Actions** tab in your GitHub repo
2. Click on any workflow run
3. Expand the steps to see detailed logs

### View Deployment Logs in Azure

```bash
# Stream logs in real-time
az webapp log tail \
  --resource-group reach-backend-rg \
  --name reach-backend

# Download logs
az webapp log download \
  --resource-group reach-backend-rg \
  --name reach-backend \
  --log-file logs.zip
```

Or in Azure Portal:
1. Go to your Web App
2. **Monitoring** → **Log stream**

## Advanced CI/CD Features

### Add Environment-Specific Deployments

Create separate workflows for staging and production:

**.github/workflows/deploy-staging.yml**
```yaml
name: Deploy to Staging

on:
  push:
    branches:
      - develop

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      # ... same steps but deploy to staging app
      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'reach-backend-staging'
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE_STAGING }}
          package: ./backend
```

### Add Tests to CI Pipeline

Update `.github/workflows/azure-deploy.yml`:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        working-directory: ./backend
        run: npm ci
      - name: Run tests
        working-directory: ./backend
        run: npm test
      - name: Run linter
        working-directory: ./backend
        run: npm run lint

  deploy:
    needs: test  # Only deploy if tests pass
    runs-on: ubuntu-latest
    # ... rest of deploy job
```

### Add Deployment Notifications

Add Slack/Discord notifications:

```yaml
- name: Notify Slack
  if: success()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment to Azure successful! 🚀'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Rollback Strategy

If a deployment fails:

### Option 1: Revert via GitHub
```bash
git revert HEAD
git push origin main
```

### Option 2: Redeploy Previous Version via Azure
```bash
# List deployment history
az webapp deployment list \
  --resource-group reach-backend-rg \
  --name reach-backend

# Redeploy a specific deployment
az webapp deployment source show \
  --resource-group reach-backend-rg \
  --name reach-backend \
  --deployment-id <deployment-id>
```

### Option 3: Azure Portal
1. Go to **Deployment Center**
2. View deployment history
3. Click **Redeploy** on a previous successful deployment

## Troubleshooting

### Deployment Fails with "Publish Profile Invalid"

Regenerate the publish profile:
```bash
az webapp deployment list-publishing-profiles \
  --resource-group reach-backend-rg \
  --name reach-backend \
  --xml > publish-profile.xml
```
Then update the GitHub secret.

### Build Fails

Check the GitHub Actions logs:
1. Go to **Actions** tab
2. Click the failed workflow
3. Expand each step to see errors

Common issues:
- Missing dependencies: Run `npm install` locally first
- TypeScript errors: Run `npm run build` locally to test
- Node version mismatch: Ensure local and CI use same Node version

### App Doesn't Start After Deployment

Check Azure logs:
```bash
az webapp log tail \
  --resource-group reach-backend-rg \
  --name reach-backend
```

Common issues:
- Missing environment variables
- Port configuration (should be 8080 or use `process.env.PORT`)
- Build artifacts not included in deployment

## Best Practices

1. **Use Branch Protection**: Require PR reviews before merging to `main`
2. **Add Status Checks**: Make CI tests required before merging
3. **Use Staging Environment**: Test in staging before production
4. **Monitor Deployments**: Set up Application Insights in Azure
5. **Automate Rollbacks**: Configure automatic rollback on health check failures
6. **Keep Secrets Secure**: Never commit `.env` files or secrets
7. **Version Your Releases**: Use Git tags for production deployments

## Next Steps

1. ✅ Set up GitHub secret with publish profile
2. ✅ Push code to trigger first deployment
3. ✅ Monitor deployment in GitHub Actions
4. ✅ Verify app is running at Azure URL
5. ✅ Update Neynar webhook URL
6. 🔄 Set up staging environment (optional)
7. 📊 Configure Application Insights (optional)

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Azure Web Apps Deployment](https://docs.microsoft.com/en-us/azure/app-service/deploy-github-actions)
- [Azure CLI Reference](https://docs.microsoft.com/en-us/cli/azure/webapp/deployment)

