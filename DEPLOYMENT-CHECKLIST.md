# IssueTracker Azure Deployment Checklist

## ✅ Pre-Deployment Checklist

### Prerequisites
- [ ] Azure subscription active
- [ ] Azure CLI installed and logged in (`az login`)
- [ ] .NET 8.0 SDK installed
- [ ] Node.js 18+ installed
- [ ] Git repository cloned locally
- [ ] All code changes committed and pushed

### Azure Resources (if not using setup script)
- [ ] Resource Group created: `rg-issuetracker`
- [ ] SQL Server created: `issuetracker-sql`
- [ ] Database created: `IssueTrackerDb`
- [ ] App Service Plan created: `issuetracker-plan` (B1 tier)
- [ ] App Service created: `issuetracker-api`
- [ ] Static Web App created: `issuetracker-frontend`

### Local Testing
- [ ] API builds successfully: `dotnet build`
- [ ] API runs locally: `dotnet run`
- [ ] Frontend builds successfully: `npm run build`
- [ ] Frontend runs locally: `npm start`
- [ ] Database migrations work: `dotnet ef database update`

## 🚀 Deployment Steps

### Step 1: Deploy API
```powershell
# From project root
.\deploy-api.ps1
```

**Checklist:**
- [ ] Script runs without errors
- [ ] App Service is accessible: https://issuetracker-api.azurewebsites.net
- [ ] Swagger UI loads: https://issuetracker-api.azurewebsites.net/swagger
- [ ] Database connection works (check logs)

### Step 2: Deploy Frontend
```powershell
# From project root
.\deploy-frontend.ps1
```

**Checklist:**
- [ ] Script runs without errors
- [ ] Static Web App is accessible: https://issuetracker-frontend.azurestaticapps.net
- [ ] Frontend loads without console errors
- [ ] API calls work (check browser network tab)

## 🧪 Post-Deployment Testing

### API Testing
- [ ] Health check endpoint responds
- [ ] Authentication endpoints work (register/login)
- [ ] CRUD operations work for projects
- [ ] CRUD operations work for issues
- [ ] JWT tokens are generated correctly

### Frontend Testing
- [ ] User registration works
- [ ] User login works
- [ ] Project creation works
- [ ] Issue creation works
- [ ] Navigation between pages works
- [ ] Responsive design works on mobile

### Integration Testing
- [ ] Frontend can communicate with API
- [ ] CORS is properly configured
- [ ] JWT authentication works end-to-end
- [ ] Data persists between sessions

## 🔧 Configuration Verification

### Azure App Service Settings
- [ ] Connection string is set correctly
- [ ] JWT settings are configured
- [ ] Environment is set to Production
- [ ] HTTPS-only is enabled
- [ ] Always-on is enabled

### CORS Configuration
- [ ] Frontend domain is in allowed origins
- [ ] Development domain is in allowed origins
- [ ] Credentials are allowed

### Database Configuration
- [ ] Connection string is valid
- [ ] Firewall rules allow Azure services
- [ ] Database is accessible from App Service

## 📊 Monitoring Setup

### Application Insights (Optional)
- [ ] Application Insights resource created
- [ ] Instrumentation key configured
- [ ] Logs are being collected
- [ ] Performance metrics are visible

### Alerts (Optional)
- [ ] CPU usage alerts configured
- [ ] Memory usage alerts configured
- [ ] Error rate alerts configured
- [ ] Response time alerts configured

## 🔒 Security Verification

### Authentication
- [ ] JWT tokens are properly signed
- [ ] Token expiration is reasonable
- [ ] Password hashing is working
- [ ] User sessions are secure

### Network Security
- [ ] HTTPS is enforced
- [ ] SQL Server firewall is configured
- [ ] No sensitive data in logs
- [ ] Environment variables are secure

## 🚨 Troubleshooting Common Issues

### If API deployment fails:
1. Check Azure CLI login: `az account show`
2. Verify resource group exists: `az group show --name rg-issuetracker`
3. Check .NET version: `dotnet --version`
4. Verify build works locally: `dotnet build`

### If Frontend deployment fails:
1. Check Node.js version: `node --version`
2. Verify npm install works: `npm install`
3. Check build works locally: `npm run build`
4. Verify Azure CLI access to Static Web Apps

### If database connection fails:
1. Check connection string in App Service settings
2. Verify SQL Server firewall rules
3. Test connection from Azure portal
4. Check database exists and is accessible

### If CORS errors occur:
1. Verify frontend URL in CORS configuration
2. Check Program.cs CORS settings
3. Restart App Service after CORS changes
4. Clear browser cache

## 📈 Performance Optimization

### After successful deployment:
- [ ] Monitor response times
- [ ] Check memory usage
- [ ] Optimize database queries if needed
- [ ] Consider scaling up if usage increases
- [ ] Set up automated backups

## 📝 Documentation

### Update these files after deployment:
- [ ] README.md with production URLs
- [ ] Environment configuration files
- [ ] Deployment scripts if needed
- [ ] Team documentation

---

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ API responds to all endpoints
- ✅ Frontend loads and functions correctly
- ✅ Users can register and login
- ✅ Projects and issues can be created/edited/deleted
- ✅ All features work as expected
- ✅ No critical errors in logs
- ✅ Performance is acceptable

**Congratulations! 🎉 Your IssueTracker is now live on Azure!** 