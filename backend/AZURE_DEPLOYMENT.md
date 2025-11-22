# Deploying to Azure Web App

This guide will help you deploy the Reach backend to Azure Web App.

## Prerequisites

1. [Azure Account](https://azure.microsoft.com/free/)
2. [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed
3. Node.js 18+ installed locally

## Deployment Steps

### Option 1: Deploy via Azure CLI (Recommended)

#### 1. Login to Azure
```bash
az login
```

#### 2. Create a Resource Group (if you don't have one)
```bash
az group create --name reach-backend-rg --location eastus
```

#### 3. Create an App Service Plan
```bash
az appservice plan create \
  --name reach-backend-plan \
  --resource-group reach-backend-rg \
  --sku B1 \
  --is-linux
```

#### 4. Create the Web App
```bash
az webapp create \
  --resource-group reach-backend-rg \
  --plan reach-backend-plan \
  --name reach-backend \
  --runtime "NODE:18-lts"
```

#### 5. Configure Environment Variables
```bash
az webapp config appsettings set \
  --resource-group reach-backend-rg \
  --name reach-backend \
  --settings \
    PRIVY_APP_ID="your_privy_app_id" \
    PRIVY_APP_SECRET="your_privy_app_secret" \
    PORT="8080"
```

#### 6. Deploy the Code
From the `backend` directory:
```bash
# Build the project
npm run build

# Create a deployment zip
zip -r deploy.zip dist package.json package-lock.json node_modules

# Deploy to Azure
az webapp deployment source config-zip \
  --resource-group reach-backend-rg \
  --name reach-backend \
  --src deploy.zip
```

### Option 2: Deploy via GitHub Actions (CI/CD)

#### 1. Create a GitHub Repository
Push your code to GitHub if you haven't already.

#### 2. Get Azure Publish Profile
```bash
az webapp deployment list-publishing-profiles \
  --resource-group reach-backend-rg \
  --name reach-backend \
  --xml
```

#### 3. Add to GitHub Secrets
- Go to your GitHub repository
- Settings → Secrets and variables → Actions
- Add a new secret named `AZURE_WEBAPP_PUBLISH_PROFILE`
- Paste the XML content from step 2

#### 4. Create GitHub Actions Workflow
Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure Web App

on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      working-directory: ./backend
      run: npm ci
      
    - name: Build
      working-directory: ./backend
      run: npm run build
      
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'reach-backend'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: ./backend
```

### Option 3: Deploy via Azure Portal (GUI)

1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new **Web App**
3. Configure:
   - **Runtime**: Node 18 LTS
   - **Operating System**: Linux
   - **Region**: Choose closest to your users
4. Go to **Configuration** → **Application Settings**
5. Add your environment variables:
   - `PRIVY_APP_ID`
   - `PRIVY_APP_SECRET`
6. Go to **Deployment Center**
7. Choose deployment method (GitHub, Local Git, etc.)
8. Follow the wizard to complete deployment

## Post-Deployment

### 1. Verify Deployment
Visit your app URL: `https://reach-backend.azurewebsites.net/health`

You should see:
```json
{
  "status": "ok",
  "connectedUsers": 0,
  "fids": []
}
```

### 2. Configure Neynar Webhook
Go to [Neynar Developer Portal](https://dev.neynar.com) and update your webhook URL to:
```
https://reach-backend.azurewebsites.net/webhooks/neynar
```

### 3. Monitor Logs
```bash
az webapp log tail \
  --resource-group reach-backend-rg \
  --name reach-backend
```

Or view logs in Azure Portal:
- Go to your Web App
- **Monitoring** → **Log stream**

## Scaling

### Enable Always On (Recommended)
Prevents the app from going to sleep:
```bash
az webapp config set \
  --resource-group reach-backend-rg \
  --name reach-backend \
  --always-on true
```

### Scale Up (Vertical Scaling)
```bash
az appservice plan update \
  --name reach-backend-plan \
  --resource-group reach-backend-rg \
  --sku P1V2
```

### Scale Out (Horizontal Scaling)
```bash
az appservice plan update \
  --name reach-backend-plan \
  --resource-group reach-backend-rg \
  --number-of-workers 2
```

## Troubleshooting

### Check Application Logs
```bash
az webapp log download \
  --resource-group reach-backend-rg \
  --name reach-backend \
  --log-file logs.zip
```

### Restart the App
```bash
az webapp restart \
  --resource-group reach-backend-rg \
  --name reach-backend
```

### SSH into Container
```bash
az webapp ssh \
  --resource-group reach-backend-rg \
  --name reach-backend
```

## Cost Estimation

- **Basic (B1)**: ~$13/month - Good for development/testing
- **Standard (S1)**: ~$70/month - Production ready with auto-scaling
- **Premium (P1V2)**: ~$80/month - Better performance and features

## Security Best Practices

1. **Use Azure Key Vault** for secrets:
```bash
az keyvault create \
  --name reach-backend-kv \
  --resource-group reach-backend-rg \
  --location eastus
```

2. **Enable HTTPS only**:
```bash
az webapp update \
  --resource-group reach-backend-rg \
  --name reach-backend \
  --https-only true
```

3. **Configure CORS** if needed:
```bash
az webapp cors add \
  --resource-group reach-backend-rg \
  --name reach-backend \
  --allowed-origins https://your-frontend-domain.com
```

## Additional Resources

- [Azure Web Apps Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Node.js on Azure](https://docs.microsoft.com/en-us/azure/app-service/quickstart-nodejs)
- [Azure CLI Reference](https://docs.microsoft.com/en-us/cli/azure/webapp)

