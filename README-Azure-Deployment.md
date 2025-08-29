# Azure Deployment Guide for IssueTracker

## 🚀 Overview
This guide will help you deploy your IssueTracker application to Azure. The application consists of an Angular frontend and ASP.NET Core API backend.

## 📋 Prerequisites
- Azure subscription
- Azure CLI installed
- Git repository (GitHub/Azure DevOps)
- Domain (optional, for custom domain setup)

## 🏗️ Architecture
- **Frontend**: Azure Static Web Apps (Angular)
- **Backend**: Azure App Service (ASP.NET Core API)
- **Database**: Azure SQL Database
- **Authentication**: JWT-based authentication

## 🔧 Step 1: Create Azure Resources

### 1.1 Login to Azure
```bash
az login
az account set --subscription "Your-Subscription-Name"
```

### 1.2 Create Resource Group
```bash
az group create --name "rg-issuetracker" --location "South Africa North"
```

### 1.3 Create Azure SQL Database
```bash
# Create SQL Server
az sql server create \
  --name "issuetracker-sql" \
  --resource-group "rg-issuetracker" \
  --location "South Africa North" \
  --admin-user "sqladmin" \
  --admin-password "YourSecurePassword123!"

# Create Database
az sql db create \
  --resource-group "rg-issuetracker" \
  --server "issuetracker-sql" \
  --name "IssueTrackerDb" \
  --service-objective "Basic"

# Configure firewall (allow Azure services)
az sql server firewall-rule create \
  --resource-group "rg-issuetracker" \
  --server "issuetracker-sql" \
  --name "AllowAzureServices" \
  --start-ip-address "0.0.0.0" \
  --end-ip-address "0.0.0.0"
```

### 1.4 Create App Service Plan
```bash
az appservice plan create \
  --name "issuetracker-plan" \
  --resource-group "rg-issuetracker" \
  --location "South Africa North" \
  --sku "B1" \
  --is-linux false
```

### 1.5 Create App Service for API
```bash
az webapp create \
  --resource-group "rg-issuetracker" \
  --plan "issuetracker-plan" \
  --name "issuetracker-api" \
  --runtime "DOTNET|9.0"
```

### 1.6 Create Static Web App for Frontend
```bash
az staticwebapp create \
  --name "issuetracker-frontend" \
  --resource-group "rg-issuetracker" \
  --location "Central US" \
  --source "https://github.com/yourusername/IssueTracker" \
  --branch "main" \
  --app-location "Frontend" \
  --output-location "dist/issuetracker-frontend"
```

## 🔐 Step 2: Configure Environment Variables

### 2.1 Set App Service Configuration
```bash
# Connection String
az webapp config connection-string set \
  --resource-group "rg-issuetracker" \
  --name "issuetracker-api" \
  --connection-string-type "SQLAzure" \
  --settings DefaultConnection="Server=tcp:issuetracker-sql.database.windows.net,1433;Initial Catalog=IssueTrackerDb;Persist Security Info=False;User ID=sqladmin;Password=YourSecurePassword123!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

# App Settings
az webapp config appsettings set \
  --resource-group "rg-issuetracker" \
  --name "issuetracker-api" \
  --settings \
    "Jwt:SecretKey=YourSuperSecretKeyThatIsAtLeast32CharactersLong!" \
    "Jwt:Issuer=https://issuetracker-api.azurewebsites.net" \
    "Jwt:Audience=https://issuetracker-frontend.azurestaticapps.net" \
    "ASPNETCORE_ENVIRONMENT=Production"
```

## 🗄️ Step 3: Deploy Database

### 3.1 Update Connection String for Migration
Update your local `appsettings.Development.json` temporarily:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=tcp:issuetracker-sql.database.windows.net,1433;Initial Catalog=IssueTrackerDb;Persist Security Info=False;User ID=sqladmin;Password=YourSecurePassword123!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  }
}
```

### 3.2 Run Migration
```bash
cd Backend/IssueTracker.API
dotnet ef database update --configuration Release
```

## 🚀 Step 4: Deploy Applications

### 4.1 Deploy API
```bash
# Build and publish
cd Backend/IssueTracker.API
dotnet publish -c Release -o ./publish

# Create zip file
Compress-Archive -Path "./publish/*" -DestinationPath "./publish.zip"

# Deploy to Azure
az webapp deployment source config-zip \
  --resource-group "rg-issuetracker" \
  --name "issuetracker-api" \
  --src "./publish.zip"
```

### 4.2 Deploy Frontend
```bash
# Build Angular app
cd Frontend
npm install
npm run build -- --configuration production

# The Static Web App will auto-deploy via GitHub Actions
```

## 🌐 Step 5: Configure Custom Domain (Optional)

### 5.1 Add Custom Domain to App Service (API)
```bash
# Add custom domain
az webapp config hostname add \
  --resource-group "rg-issuetracker" \
  --webapp-name "issuetracker-api" \
  --hostname "api.yourdomain.com"

# Bind SSL certificate (managed certificate)
az webapp config ssl bind \
  --resource-group "rg-issuetracker" \
  --name "issuetracker-api" \
  --certificate-thumbprint "auto" \
  --ssl-type "SNI"
```

### 5.2 Add Custom Domain to Static Web App
```bash
az staticwebapp hostname set \
  --name "issuetracker-frontend" \
  --resource-group "rg-issuetracker" \
  --hostname "www.yourdomain.com"
```

## 🔒 Step 6: Security Configuration

### 6.1 Configure HTTPS Only
```bash
az webapp update \
  --resource-group "rg-issuetracker" \
  --name "issuetracker-api" \
  --https-only true
```

### 6.2 Update CORS Configuration
Update the CORS policy in `Program.cs` to include your production domains:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins(
                "https://issuetracker-frontend.azurestaticapps.net",
                "https://www.yourdomain.com" // if using custom domain
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

## 📊 Step 7: Monitoring & Logging

### 7.1 Enable Application Insights
```bash
az monitor app-insights component create \
  --app "issuetracker-insights" \
  --location "South Africa North" \
  --resource-group "rg-issuetracker"

# Link to App Service
az webapp config appsettings set \
  --resource-group "rg-issuetracker" \
  --name "issuetracker-api" \
  --settings "APPINSIGHTS_INSTRUMENTATIONKEY=[your-instrumentation-key]"
```

## 🧪 Step 8: Testing

### 8.1 Test API Endpoints
- https://issuetracker-api.azurewebsites.net/api/projects
- https://issuetracker-api.azurewebsites.net/api/auth/login
- https://issuetracker-api.azurewebsites.net/api/issues

### 8.2 Test Frontend
- https://issuetracker-frontend.azurestaticapps.net

## 🚀 Step 9: CI/CD Setup

### 9.1 GitHub Actions Workflow
Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [ main ]

jobs:
  deploy-api:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup .NET
      uses: actions/setup-dotnet@v1
      with:
        dotnet-version: '9.0.x'
    
    - name: Build and publish API
      run: |
        cd Backend/IssueTracker.API
        dotnet publish -c Release -o ./publish
    
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'issuetracker-api'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: ./Backend/IssueTracker.API/publish

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd Frontend
        npm install
    
    - name: Build Angular app
      run: |
        cd Frontend
        npm run build -- --configuration production
    
    - name: Deploy to Azure Static Web Apps
      uses: Azure/static-web-apps-deploy@v1
      with:
        azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
        repo_token: ${{ secrets.GITHUB_TOKEN }}
        app_location: "Frontend"
        output_location: "dist/issuetracker-frontend"
```

### 9.2 Configure GitHub Secrets
Add these secrets to your GitHub repository:
- `AZURE_WEBAPP_PUBLISH_PROFILE`: Get from Azure Portal > App Service > Get publish profile
- `AZURE_STATIC_WEB_APPS_API_TOKEN`: Get from Azure Portal > Static Web App > Manage deployment tokens

## 📝 Important Notes

1. **Environment Variables**: All sensitive data should be stored in Azure Key Vault for production
2. **Database Backups**: Configure automated backups for Azure SQL Database
3. **Scaling**: Monitor usage and scale App Service plan as needed
4. **Security**: Implement proper authentication and authorization
5. **Monitoring**: Set up alerts for critical metrics

## 🆘 Troubleshooting

### Common Issues:
1. **CORS Errors**: Ensure frontend domain is added to CORS policy
2. **Database Connection**: Verify connection string and firewall rules
3. **SSL Certificate**: May take time to provision, check certificate status
4. **Static Files**: Ensure Angular build output path matches deployment settings
5. **JWT Configuration**: Verify JWT settings match between frontend and backend

## 💰 Cost Optimization

- Use **Basic** tier for App Service initially
- Consider **Serverless** SQL Database for variable workloads
- Monitor usage and optimize resources accordingly
- Set up budget alerts

## 🎯 Next Steps After Deployment

1. Test all functionality thoroughly
2. Set up monitoring and alerts
3. Configure backup strategies
4. Implement CI/CD pipeline
5. Monitor performance and costs
6. Set up user authentication and authorization

For support, refer to Azure documentation or contact Azure support. 