# Helper script to deploy IssueTracker API to Azure
# Run this from the root directory of the project

param(
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroupName = "rg-issuetracker",
    
    [Parameter(Mandatory=$false)]
    [string]$AppServiceName = "issuetracker-api",
    
    [Parameter(Mandatory=$false)]
    [string]$SqlServerName = "issuetracker-sql",
    
    [Parameter(Mandatory=$false)]
    [string]$DatabaseName = "IssueTrackerDb",
    
    [Parameter(Mandatory=$false)]
    [string]$SqlAdminPassword = "Password@1",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "South Africa North"
)

Write-Host "IssueTracker API Deployment Helper" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "Backend/IssueTracker.API/azure-deploy.ps1")) {
    Write-Host "Please run this script from the root directory of the IssueTracker project" -ForegroundColor Red
    exit 1
}

# Check if Azure CLI is available
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Host "Azure CLI is not installed. Please install it from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Red
    exit 1
}

# Check if .NET is available
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    Write-Host ".NET SDK is not installed. Please install it from https://dotnet.microsoft.com/download" -ForegroundColor Red
    exit 1
}

Write-Host "Deployment Configuration:" -ForegroundColor Yellow
Write-Host "  Resource Group: $ResourceGroupName" -ForegroundColor White
Write-Host "  App Service: $AppServiceName" -ForegroundColor White
Write-Host "  SQL Server: $SqlServerName" -ForegroundColor White
Write-Host "  Database: $DatabaseName" -ForegroundColor White
Write-Host "  Location: $Location" -ForegroundColor White
Write-Host ""

# Ask for confirmation
$confirm = Read-Host "Do you want to proceed with the deployment? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Deployment cancelled by user" -ForegroundColor Yellow
    exit 0
}

# Change to the API directory and run the deployment script
Write-Host "Changing to API directory..." -ForegroundColor Yellow
Set-Location "Backend/IssueTracker.API"

try {
    # Run the deployment script
    & ".\azure-deploy.ps1" `
        -ResourceGroupName $ResourceGroupName `
        -AppServiceName $AppServiceName `
        -SqlServerName $SqlServerName `
        -DatabaseName $DatabaseName `
        -SqlAdminPassword $SqlAdminPassword `
        -Location $Location `
        -EnsureWebApp $true
}
finally {
    # Return to the original directory
    Set-Location "../.."
}

Write-Host ""
Write-Host "Deployment process completed!" -ForegroundColor Green
Write-Host "Your API should be available at: https://$AppServiceName.azurewebsites.net" -ForegroundColor Cyan
Write-Host "Monitor your app at: https://portal.azure.com/#@/resource/subscriptions/*/resourceGroups/$ResourceGroupName/providers/Microsoft.Web/sites/$AppServiceName" -ForegroundColor Cyan 