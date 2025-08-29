# Azure Deployment Script for IssueTracker API
# Run this script from the Backend/IssueTracker.API directory (PowerShell)

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,

    [Parameter(Mandatory=$true)]
    [string]$AppServiceName,

    [Parameter(Mandatory=$true)]
    [string]$SqlServerName,

    [Parameter(Mandatory=$true)]
    [string]$DatabaseName,

    [Parameter(Mandatory=$true)]
    [string]$SqlAdminPassword,

    [Parameter(Mandatory=$false)]
    [string]$Location = "South Africa North",

    # Set to $true to auto-create a Linux plan + web app if missing
    [Parameter(Mandatory=$false)]
    [bool]$EnsureWebApp = $true,

    # Name of the App Service Plan (will default to "$AppServiceName-plan")
    [Parameter(Mandatory=$false)]
    [string]$AppServicePlanName = $null
)

if (-not $AppServicePlanName) { $AppServicePlanName = "$AppServiceName-plan" }

function Fail($msg) { Write-Host "ERROR: $msg" -ForegroundColor Red; exit 1 }

Write-Host "Starting Azure deployment for IssueTracker API..." -ForegroundColor Green

# --- Preconditions -----------------------------------------------------------

# 1) Ensure RG exists
Write-Host "Checking Resource Group '$ResourceGroupName'..." -ForegroundColor Yellow
$rg = az group show --name $ResourceGroupName --only-show-errors 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating Resource Group '$ResourceGroupName' in '$Location'..."
    az group create --name $ResourceGroupName --location $Location | Out-Null
    if ($LASTEXITCODE -ne 0) { Fail "Failed to create resource group." }
}

# 2) Ensure (optional) Linux plan + webapp exist (for DOTNET 8 runtime)
if ($EnsureWebApp) {
    Write-Host "Ensuring Linux App Service Plan '$AppServicePlanName'..." -ForegroundColor Yellow
    az appservice plan show --name $AppServicePlanName --resource-group $ResourceGroupName 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        az appservice plan create `
          --name $AppServicePlanName `
          --resource-group $ResourceGroupName `
          --location $Location `
          --sku B1 `
          --is-linux | Out-Null
        if ($LASTEXITCODE -ne 0) { Fail "Failed to create Linux App Service plan." }
    }

    Write-Host "Ensuring Web App '$AppServiceName' (Linux, DOTNET:8.0)..." -ForegroundColor Yellow
    az webapp show --name $AppServiceName --resource-group $ResourceGroupName 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        az webapp create `
          --resource-group $ResourceGroupName `
          --plan $AppServicePlanName `
          --name $AppServiceName `
          --runtime "DOTNETCORE:8.0" | Out-Null
        if ($LASTEXITCODE -ne 0) { Fail "Failed to create Web App." }
    }
}

# --- Build & Package ---------------------------------------------------------

Write-Host "Building the application (Release)..." -ForegroundColor Yellow
dotnet publish -c Release -o ./publish
if ($LASTEXITCODE -ne 0) { Fail "Build failed." }

Write-Host "Creating deployment package..." -ForegroundColor Yellow
if (Test-Path "./publish.zip") { Remove-Item "./publish.zip" -Force }
Compress-Archive -Path "./publish/*" -DestinationPath "./publish.zip"

# --- Deploy Package ----------------------------------------------------------

Write-Host "Deploying to Azure App Service..." -ForegroundColor Yellow
az webapp deploy `
    --resource-group $ResourceGroupName `
    --name $AppServiceName `
    --src-path "./publish.zip" `
    --type zip | Out-Null
if ($LASTEXITCODE -ne 0) { Fail "Deployment failed." }

# --- Connection String -------------------------------------------------------

Write-Host "Configuring database connection string..." -ForegroundColor Yellow
$connectionString = "Server=tcp:$SqlServerName.database.windows.net,1433;Initial Catalog=$DatabaseName;Persist Security Info=False;User ID=sqladmin;Password=$SqlAdminPassword;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

az webapp config connection-string set `
    --resource-group $ResourceGroupName `
    --name $AppServiceName `
    --connection-string-type "SQLAzure" `
    --settings DefaultConnection="$connectionString" | Out-Null
if ($LASTEXITCODE -ne 0) { Fail "Failed to set connection string." }

# --- App Settings (use double underscore!!) ---------------------------------

Write-Host "Setting application settings (JWT, environment)..." -ForegroundColor Yellow
$frontendAudience = "https://issuetracker-frontend.azurestaticapps.net"  # change to your actual SWA URL after creation
$issuer = "https://$AppServiceName.azurewebsites.net"

az webapp config appsettings set `
    --resource-group $ResourceGroupName `
    --name $AppServiceName `
    --settings `
        "Jwt__SecretKey=YourSuperSecretKeyThatIsAtLeast32CharactersLong!" `
        "Jwt__Issuer=$issuer" `
        "Jwt__Audience=$frontendAudience" `
        "ASPNETCORE_ENVIRONMENT=Production" | Out-Null
if ($LASTEXITCODE -ne 0) { Fail "Failed to set app settings." }

# --- Security & Runtime knobs -----------------------------------------------

Write-Host "Enabling HTTPS-only & AlwaysOn..." -ForegroundColor Yellow
az webapp update `
    --resource-group $ResourceGroupName `
    --name $AppServiceName `
    --https-only true | Out-Null
if ($LASTEXITCODE -ne 0) { Fail "Failed to enable HTTPS-only." }

az webapp config set `
    --resource-group $ResourceGroupName `
    --name $AppServiceName `
    --always-on true | Out-Null

# --- Restart & Output --------------------------------------------------------

Write-Host "Restarting app..." -ForegroundColor Yellow
az webapp restart --resource-group $ResourceGroupName --name $AppServiceName | Out-Null

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "API URL: https://$AppServiceName.azurewebsites.net" -ForegroundColor Cyan
Write-Host "Ensure CORS in your API allows your SWA domain, e.g. https://<your-swa>.azurestaticapps.net" -ForegroundColor DarkCyan
