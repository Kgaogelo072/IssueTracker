# Azure Deployment Script for IssueTracker Frontend
# Run this script from the Frontend directory

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$true)]
    [string]$StaticWebAppName,
    
    [Parameter(Mandatory=$true)]
    [string]$ApiUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "Central US"
)

Write-Host "Starting Azure deployment for IssueTracker Frontend..." -ForegroundColor Green

# Step 1: Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Dependency installation failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Update environment configuration
Write-Host "Updating environment configuration..." -ForegroundColor Yellow
$environmentContent = @"
export const environment = {
  production: true,
  apiUrl: '$ApiUrl'
};
"@

Set-Content -Path "src/environments/environment.prod.ts" -Value $environmentContent

# Step 3: Build the application
Write-Host "Building the application..." -ForegroundColor Yellow
npm run build -- --configuration production

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Step 4: Deploy to Azure Static Web Apps
Write-Host "Deploying to Azure Static Web Apps..." -ForegroundColor Yellow

# Check if Azure CLI is installed
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Host "Azure CLI is not installed. Please install it from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Red
    exit 1
}

# Login to Azure if not already logged in
Write-Host "Checking Azure login status..." -ForegroundColor Yellow
az account show 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Logging in to Azure..." -ForegroundColor Yellow
    az login
}

# Deploy using Azure CLI
Write-Host "Uploading build files..." -ForegroundColor Yellow
az staticwebapp create `
    --name $StaticWebAppName `
    --resource-group $ResourceGroupName `
    --location $Location `
    --source . `
    --branch main `
    --app-location . `
    --output-location dist/issue-tracker-frontend

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Your frontend is available at: https://$StaticWebAppName.azurestaticapps.net" -ForegroundColor Cyan 
Write-Host "Monitor your app at: https://portal.azure.com/#@/resource/subscriptions/*/resourceGroups/$ResourceGroupName/providers/Microsoft.Web/staticSites/$StaticWebAppName" -ForegroundColor Cyan

# Step 5: Configure custom domain (optional)
Write-Host "To add a custom domain, run:" -ForegroundColor Yellow
Write-Host "   az staticwebapp hostname set --name $StaticWebAppName --resource-group $ResourceGroupName --hostname yourdomain.com" -ForegroundColor Gray 