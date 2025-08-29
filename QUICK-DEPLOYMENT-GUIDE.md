# Quick Deployment Guide - IssueTracker to Azure

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Azure subscription
- Azure CLI installed
- Git repository with your code

### Step 1: Run Setup Script
```powershell
# Run the setup script (will create all Azure resources)
.\setup-azure-deployment.ps1 -SubscriptionName "Your-Subscription-Name"
```

### Step 2: Configure GitHub Secrets
Add these secrets to your GitHub repository:

1. **AZURE_CREDENTIALS** - Service principal credentials
2. **AZURE_SUBSCRIPTION_ID** - Your Azure subscription ID
3. **AZURE_WEBAPP_PUBLISH_PROFILE** - App Service publish profile
4. **AZURE_STATIC_WEB_APPS_API_TOKEN** - Static Web App deployment token
5. **AZURE_SQL_CONNECTION_STRING** - Database connection string
6. **JWT_SECRET_KEY** - JWT secret key

### Step 3: Push to GitHub
```bash
git add .
git commit -m "Add Azure deployment configuration"
git push origin main
```

### Step 4: Monitor Deployment
- Check GitHub Actions: https://github.com/yourusername/IssueTracker/actions
- Monitor Azure resources: https://portal.azure.com

## 📋 Manual Deployment Steps

If you prefer manual deployment:

### 1. Create Azure Resources
```bash
# Login to Azure
az login

# Create resource group
az group create --name "rg-issuetracker" --location "South Africa North"

# Create SQL Server
az sql server create \
  --name "issuetracker-sql" \
  --resource-group "rg-issuetracker" \
  --location "South Africa North" \
  --admin-user "sqladmin" \
  --admin-password "Password@1"

# Create database
az sql db create \
  --resource-group "rg-issuetracker" \
  --server "issuetracker-sql" \
  --name "IssueTrackerDb" \
  --service-objective "Basic"

# Create App Service Plan
az appservice plan create \
  --name "issuetracker-plan" \
  --resource-group "rg-issuetracker" \
  --location "South Africa North" \
  --sku "B1"

# Create API App Service
az webapp create \
  --resource-group "rg-issuetracker" \
  --plan "issuetracker-plan" \
  --name "issuetracker-api" \
  --runtime "DOTNET|9.0"

# Create Static Web App
az staticwebapp create \
  --name "issuetracker-frontend" \
  --resource-group "rg-issuetracker" \
  --location "Central US"
```

### 2. Deploy API
```powershell
# From root directory (recommended)
.\deploy-api.ps1

# Or with custom parameters
.\deploy-api.ps1 -ResourceGroupName "rg-issuetracker" -AppServiceName "issuetracker-api" -SqlServerName "issuetracker-sql" -DatabaseName "IssueTrackerDb" -SqlAdminPassword "Password@1"
```

### 3. Deploy Frontend
```powershell
# From root directory (recommended)
.\deploy-frontend.ps1

# Or with custom parameters
.\deploy-frontend.ps1 -ResourceGroupName "rg-issuetracker" -StaticWebAppName "issuetracker-frontend" -ApiUrl "https://issuetracker-api.azurewebsites.net/api"
```

## 🔧 Configuration Files

### Environment Variables
- **API**: Configured in Azure App Service settings
- **Frontend**: Updated automatically during deployment

### CORS Configuration
Already configured in `Program.cs` for:
- `https://issuetracker-frontend.azurestaticapps.net`
- `https://localhost:4200` (development)

## 🌐 URLs After Deployment

- **API**: https://issuetracker-api.azurewebsites.net
- **Frontend**: https://issuetracker-frontend.azurestaticapps.net
- **Swagger**: https://issuetracker-api.azurewebsites.net/swagger

## 🧪 Testing

### Test API Endpoints
```bash
# Test health check
curl https://issuetracker-api.azurewebsites.net/api/health

# Test projects endpoint
curl https://issuetracker-api.azurewebsites.net/api/projects
```

### Test Frontend
1. Open https://issuetracker-frontend.azurestaticapps.net
2. Try to register/login
3. Create a project
4. Add issues

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS configuration in `Program.cs`
   - Verify frontend URL is in allowed origins

2. **Database Connection**
   - Verify connection string in Azure App Service
   - Check SQL Server firewall rules

3. **Build Failures**
   - Check .NET and Node.js versions
   - Verify all dependencies are installed

4. **Deployment Failures**
   - Check GitHub Actions logs
   - Verify Azure credentials and permissions

### Useful Commands

```bash
# Check Azure resources
az resource list --resource-group rg-issuetracker

# Check App Service logs
az webapp log tail --name issuetracker-api --resource-group rg-issuetracker

# Check Static Web App logs
az staticwebapp show --name issuetracker-frontend --resource-group rg-issuetracker
```

## 💰 Cost Optimization

- **App Service**: Start with B1 tier (~$13/month)
- **SQL Database**: Start with Basic tier (~$5/month)
- **Static Web Apps**: Free tier available
- **Monitor usage** and scale as needed

## 📞 Support

- **Azure Documentation**: https://docs.microsoft.com/azure/
- **GitHub Actions**: https://docs.github.com/en/actions
- **IssueTracker Issues**: Create an issue in your repository

---

**Happy Deploying! 🚀** 