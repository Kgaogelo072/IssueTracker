# Helper script to deploy IssueTracker Frontend to Azure
# Run this from the root directory of the project

param(
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroupName = "rg-issuetracker",
    
    [Parameter(Mandatory=$false)]
    [string]$StaticWebAppName = "issuetracker-frontend",
    
    [Parameter(Mandatory=$false)]
    [string]$ApiUrl = "https://issuetracker-api.azurewebsites.net/api",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "Central US"
)

Write-Host "IssueTracker Frontend Deployment Helper" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "Frontend/azure-deploy.ps1")) {
    Write-Host "Please run this script from the root directory of the IssueTracker project" -ForegroundColor Red
    exit 1
}

# Check if Azure CLI is available
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Host "Azure CLI is not installed. Please install it from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Red
    exit 1
}

# Check if Node.js is available
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js is not installed. Please install it from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host "Deployment Configuration:" -ForegroundColor Yellow
Write-Host "  Resource Group: $ResourceGroupName" -ForegroundColor White
Write-Host "  Static Web App: $StaticWebAppName" -ForegroundColor White
Write-Host "  API URL: $ApiUrl" -ForegroundColor White
Write-Host "  Location: $Location" -ForegroundColor White
Write-Host ""

# Ask for confirmation
$confirm = Read-Host "Do you want to proceed with the deployment? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Deployment cancelled by user" -ForegroundColor Yellow
    exit 0
}

# Change to the Frontend directory and run the deployment script
Write-Host "Changing to Frontend directory..." -ForegroundColor Yellow
Set-Location "Frontend"

try {
    # Run the deployment script
    & ".\azure-deploy.ps1" `
        -ResourceGroupName $ResourceGroupName `
        -StaticWebAppName $StaticWebAppName `
        -ApiUrl $ApiUrl `
        -Location $Location
}
finally {
    # Return to the original directory
    Set-Location ".."
}

Write-Host ""
Write-Host "Deployment process completed!" -ForegroundColor Green
Write-Host "Your frontend should be available at: https://$StaticWebAppName.azurestaticapps.net" -ForegroundColor Cyan
Write-Host "Monitor your app at: https://portal.azure.com/#@/resource/subscriptions/*/resourceGroups/$ResourceGroupName/providers/Microsoft.Web/staticSites/$StaticWebAppName" -ForegroundColor Cyan 