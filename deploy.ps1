# OneClickFolio Vercel Deployment Script
# Run this script from PowerShell in the F:\Resume-dev directory

Write-Host "🚀 OneClickFolio - Vercel Deployment Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
Write-Host "Checking Vercel CLI installation..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
    Write-Host "✅ Vercel CLI installed successfully!" -ForegroundColor Green
} else {
    Write-Host "✅ Vercel CLI is already installed." -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Before deploying, make sure you have:" -ForegroundColor Cyan
Write-Host "   1. MongoDB Atlas connection string" -ForegroundColor White
Write-Host "   2. Google Gemini API key" -ForegroundColor White
Write-Host "   3. Vercel account (free)" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Do you have all the requirements above? (Y/N)"

if ($continue -ne "Y" -and $continue -ne "y") {
    Write-Host ""
    Write-Host "Please get the requirements first:" -ForegroundColor Yellow
    Write-Host "   - MongoDB Atlas: https://www.mongodb.com/cloud/atlas" -ForegroundColor White
    Write-Host "   - Gemini API: https://makersuite.google.com/app/apikey" -ForegroundColor White
    Write-Host "   - Vercel Account: https://vercel.com/signup" -ForegroundColor White
    exit
}

Write-Host ""
Write-Host "🔐 Logging into Vercel..." -ForegroundColor Yellow
vercel login

Write-Host ""
Write-Host "🏗️  Building and deploying to Vercel..." -ForegroundColor Yellow
Write-Host "Note: This will create a preview deployment first." -ForegroundColor Gray
Write-Host ""

vercel

Write-Host ""
Write-Host "✅ Preview deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Go to https://vercel.com/dashboard" -ForegroundColor White
Write-Host "   2. Select your project" -ForegroundColor White
Write-Host "   3. Go to Settings → Environment Variables" -ForegroundColor White
Write-Host "   4. Add these variables:" -ForegroundColor White
Write-Host "      - MONGODB_URI (your MongoDB connection string)" -ForegroundColor Gray
Write-Host "      - GEMINI_API_KEY (your Gemini API key)" -ForegroundColor Gray
Write-Host "      - FRONTEND_URL (your Vercel app URL)" -ForegroundColor Gray
Write-Host "      - NODE_ENV (set to: production)" -ForegroundColor Gray
Write-Host ""

$deployProd = Read-Host "After setting environment variables, deploy to production? (Y/N)"

if ($deployProd -eq "Y" -or $deployProd -eq "y") {
    Write-Host ""
    Write-Host "🚀 Deploying to production..." -ForegroundColor Yellow
    vercel --prod
    
    Write-Host ""
    Write-Host "✅ Production deployment complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Your OneClickFolio is now live!" -ForegroundColor Cyan
    Write-Host "Share your deployment URL with anyone!" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "To deploy to production later, run:" -ForegroundColor Yellow
    Write-Host "   vercel --prod" -ForegroundColor White
}

Write-Host ""
Write-Host "📚 For more details, check VERCEL_DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
