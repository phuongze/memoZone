@echo off
cd E:\memoryBox

echo ========================================
echo Pushing changes to GitHub...
echo ========================================

git add .
git commit -m "Fix Vercel API route handlers"
git push origin main

echo.
echo ========================================
echo ✅ Changes pushed!
echo ========================================
echo.
echo Now deploying to Vercel...
echo.

vercel --prod

pause
