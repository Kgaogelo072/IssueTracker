# Azure Deployment Setup Script for IssueTracker
# This script helps you set up Azure resources and configure deployment

param(
    [Parameter(Mandatory=$true)]
    [string]$SubscriptionName,
    
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroupName = "rg-issuetracker",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "South Africa North",
    
    [Parameter(Mandatory=$false)]
    [string]$ApiAppName = "issuetracker-api",
    
    [Parameter(Mandatory=$false)]
    [string]$FrontendAppName = "issuetracker-frontend",
    
    [Parameter(Mandatory=$false)]
    [string]$SqlServerName = "issuetracker-sql",
    
    [Parameter(Mandatory=$false)]
    [string]$DatabaseName = "IssueTrackerDb"
)

Write-Host "🚀 Azure Deployment Setup for IssueTracker" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

# Check Azure CLI
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Azure CLI is not installed. Please install it from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Red
    exit 1
}

# Check .NET
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    Write-Host "❌ .NET SDK is not installed. Please install it from https://dotnet.microsoft.com/download" -ForegroundColor Red
    exit 1
}

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install it from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host "✅ All prerequisites are installed" -ForegroundColor Green

# Login to Azure
Write-Host "🔐 Logging in to Azure..." -ForegroundColor Yellow
az login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Azure login failed!" -ForegroundColor Red
    exit 1
}

# Set subscription
Write-Host "📝 Setting Azure subscription..." -ForegroundColor Yellow
az account set --subscription $SubscriptionName

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to set subscription!" -ForegroundColor Red
    exit 1
}

# Create resource group
Write-Host "🏗️ Creating resource group..." -ForegroundColor Yellow
az group create --name $ResourceGroupName --location $Location

# Create SQL Server
Write-Host "🗄️ Creating SQL Server..." -ForegroundColor Yellow
$sqlPassword = Read-Host "Enter a secure password for SQL Server admin (at least 8 characters)" -AsSecureString
$sqlPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sqlPassword))

az sql server create `
    --name $SqlServerName `
    --resource-group $ResourceGroupName `
    --location $Location `
    --admin-user "sqladmin" `
    --admin-password $sqlPasswordPlain

# Create database
Write-Host "📊 Creating database..." -ForegroundColor Yellow
az sql db create `
    --resource-group $ResourceGroupName `
    --server $SqlServerName `
    --name $DatabaseName `
    --service-objective "Basic"

# Configure firewall
Write-Host "🔥 Configuring SQL Server firewall..." -ForegroundColor Yellow
az sql server firewall-rule create `
    --resource-group $ResourceGroupName `
    --server $SqlServerName `
    --name "AllowAzureServices" `
    --start-ip-address "0.0.0.0" `
    --end-ip-address "0.0.0.0"

# Create App Service Plan
Write-Host "📋 Creating App Service Plan..." -ForegroundColor Yellow
az appservice plan create `
    --name "$ApiAppName-plan" `
    --resource-group $ResourceGroupName `
    --location $Location `
    --sku "B1" `
    --is-linux false

# Create API App Service
Write-Host "🔧 Creating API App Service..." -ForegroundColor Yellow
az webapp create `
    --resource-group $ResourceGroupName `
    --plan "$ApiAppName-plan" `
    --name $ApiAppName `
    --runtime "DOTNET|9.0"

# Create Static Web App for Frontend
Write-Host "🌐 Creating Static Web App..." -ForegroundColor Yellow
az staticwebapp create `
    --name $FrontendAppName `
    --resource-group $ResourceGroupName `
    --location "Central US" `
    --source "https://github.com/yourusername/IssueTracker" `
    --branch "main" `
    --app-location "Frontend" `
    --output-location "dist/issuetracker-frontend"

# Configure connection string
Write-Host "🔗 Configuring database connection..." -ForegroundColor Yellow
$connectionString = "Server=tcp:$SqlServerName.database.windows.net,1433;Initial Catalog=$DatabaseName;Persist Security Info=False;User ID=sqladmin;Password=$sqlPasswordPlain;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

az webapp config connection-string set `
    --resource-group $ResourceGroupName `
    --name $ApiAppName `
    --connection-string-type "SQLAzure" `
    --settings DefaultConnection="$connectionString"

# Generate JWT secret key
Write-Host "🔐 Generating JWT secret key..." -ForegroundColor Yellow
$jwtSecret = -join ((33..126) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Configure app settings
Write-Host "⚙️ Configuring application settings..." -ForegroundColor Yellow
az webapp config appsettings set `
    --resource-group $ResourceGroupName `
    --name $ApiAppName `
    --settings `
        "Jwt:SecretKey=$jwtSecret" `
        "Jwt:Issuer=https://$ApiAppName.azurewebsites.net" `
        "Jwt:Audience=https://$FrontendAppName.azurestaticapps.net" `
        "ASPNETCORE_ENVIRONMENT=Production"

# Enable HTTPS only
Write-Host "🔒 Enabling HTTPS only..." -ForegroundColor Yellow
az webapp update `
    --resource-group $ResourceGroupName `
    --name $ApiAppName `
    --https-only true

# Create deployment summary
Write-Host "📋 Creating deployment summary..." -ForegroundColor Yellow
$summary = @"
# Azure Deployment Summary

## Resources Created:
- Resource Group: $ResourceGroupName
- SQL Server: $SqlServerName.database.windows.net
- Database: $DatabaseName
- API App Service: $ApiAppName.azurewebsites.net
- Frontend Static Web App: $FrontendAppName.azurestaticapps.net

## Connection String:
$connectionString

## JWT Secret Key:
$jwtSecret

## Next Steps:
1. Update your GitHub repository secrets with the values above
2. Push your code to trigger the GitHub Actions deployment
3. Test the deployed application

## GitHub Secrets Required:
- AZURE_CREDENTIALS: Service principal credentials
- AZURE_SUBSCRIPTION_ID: Your Azure subscription ID
- AZURE_WEBAPP_PUBLISH_PROFILE: App Service publish profile
- AZURE_STATIC_WEB_APPS_API_TOKEN: Static Web App deployment token
- AZURE_SQL_CONNECTION_STRING: $connectionString
- JWT_SECRET_KEY: $jwtSecret

## URLs:
- API: https://$ApiAppName.azurewebsites.net
- Frontend: https://$FrontendAppName.azurestaticapps.net
- Azure Portal: https://portal.azure.com/#@/resource/subscriptions/*/resourceGroups/$ResourceGroupName
"@

Set-Content -Path "azure-deployment-summary.md" -Value $summary

Write-Host "✅ Azure setup completed successfully!" -ForegroundColor Green
Write-Host "📄 Deployment summary saved to: azure-deployment-summary.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Your resources are ready for deployment!" -ForegroundColor Green
Write-Host "📊 Monitor your resources at: https://portal.azure.com/#@/resource/subscriptions/*/resourceGroups/$ResourceGroupName" -ForegroundColor Cyan 