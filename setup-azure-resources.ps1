# Setup Azure Resources for IssueTracker
# Run this script to create all necessary Azure resources

param(
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroupName = "rg-issuetracker",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "South Africa North",
    
    [Parameter(Mandatory=$false)]
    [string]$SqlServerName = "issuetracker-sql",
    
    [Parameter(Mandatory=$false)]
    [string]$DatabaseName = "IssueTrackerDb",
    
    [Parameter(Mandatory=$false)]
    [string]$SqlAdminPassword = "Password@1"
)

Write-Host "Setting up Azure Resources for IssueTracker..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Check if Azure CLI is available
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

# Create Resource Group
Write-Host "Creating Resource Group '$ResourceGroupName'..." -ForegroundColor Yellow
az group create --name $ResourceGroupName --location $Location

# Create SQL Server
Write-Host "Creating SQL Server '$SqlServerName'..." -ForegroundColor Yellow
az sql server create `
    --name $SqlServerName `
    --resource-group $ResourceGroupName `
    --location $Location `
    --admin-user "sqladmin" `
    --admin-password $SqlAdminPassword

# Create Database
Write-Host "Creating Database '$DatabaseName'..." -ForegroundColor Yellow
az sql db create `
    --resource-group $ResourceGroupName `
    --server $SqlServerName `
    --name $DatabaseName `
    --service-objective "Basic"

# Configure firewall (allow Azure services)
Write-Host "Configuring SQL Server firewall..." -ForegroundColor Yellow
az sql server firewall-rule create `
    --resource-group $ResourceGroupName `
    --server $SqlServerName `
    --name "AllowAzureServices" `
    --start-ip-address "0.0.0.0" `
    --end-ip-address "0.0.0.0"

# Create App Service Plan
Write-Host "Creating App Service Plan..." -ForegroundColor Yellow
az appservice plan create `
    --name "issuetracker-plan" `
    --resource-group $ResourceGroupName `
    --location $Location `
    --sku "B1" `
    --is-linux

# Create App Service for API
Write-Host "Creating App Service for API..." -ForegroundColor Yellow
az webapp create `
    --resource-group $ResourceGroupName `
    --plan "issuetracker-plan" `
    --name "issuetracker-api" `
    --runtime "DOTNET:8.0"

# Create Static Web App for Frontend
Write-Host "Creating Static Web App for Frontend..." -ForegroundColor Yellow
az staticwebapp create `
    --name "issuetracker-frontend" `
    --resource-group $ResourceGroupName `
    --location "Central US"

Write-Host ""
Write-Host "Azure Resources Setup Completed!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "Resource Group: $ResourceGroupName" -ForegroundColor White
Write-Host "SQL Server: $SqlServerName.database.windows.net" -ForegroundColor White
Write-Host "Database: $DatabaseName" -ForegroundColor White
Write-Host "App Service: https://issuetracker-api.azurewebsites.net" -ForegroundColor White
Write-Host "Static Web App: https://issuetracker-frontend.azurestaticapps.net" -ForegroundColor White
Write-Host ""
Write-Host "You can now run the deployment scripts:" -ForegroundColor Yellow
Write-Host "  .\deploy-api.ps1" -ForegroundColor Cyan
Write-Host "  .\deploy-frontend.ps1" -ForegroundColor Cyan 