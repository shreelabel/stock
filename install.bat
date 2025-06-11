@echo off
REM Roll Stock Management System - Windows Installation Script
REM This script helps with basic setup tasks on Windows

echo ===================================
echo Roll Stock Management System Setup
echo ===================================

REM Check if we're in the right directory
if not exist "index.html" (
    echo Error: Please run this script from the application root directory
    pause
    exit /b 1
)

echo ✓ Application files found

REM Check directory permissions
echo Checking directory structure...

REM Ensure exports directory exists and is accessible
if exist "exports" (
    echo ✓ Exports directory found
) else (
    echo ⚠ Warning: exports directory not found
)

REM Check for PHP installation
php -v >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ PHP is installed and accessible
    php -v | findstr "PHP"
) else (
    echo ⚠ Warning: PHP not found or not in PATH
    echo   Please ensure PHP is installed and added to system PATH
)

REM Check for required PHP extensions
echo Checking PHP extensions...
php -m | findstr /C:"pdo" >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ PDO extension found
) else (
    echo ⚠ Warning: PDO extension not found
)

php -m | findstr /C:"pdo_mysql" >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ PDO MySQL extension found
) else (
    echo ⚠ Warning: PDO MySQL extension not found
)

echo.
echo Next Steps:
echo 1. Configure database connection in api\config.php
echo 2. Import database schema (see README.md)
echo 3. Set up web server (Apache/IIS) to serve this directory
echo 4. Test the application in your browser
echo 5. Change default admin password
echo.
echo For detailed instructions, see DEPLOYMENT_GUIDE.md
echo.
pause
