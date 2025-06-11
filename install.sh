#!/bin/bash
# Roll Stock Management System - Quick Installation Script
# This script helps with basic setup tasks

echo "==================================="
echo "Roll Stock Management System Setup"
echo "==================================="

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "Error: Please run this script from the application root directory"
    exit 1
fi

echo "✓ Application files found"

# Check directory permissions
echo "Checking directory permissions..."

# Make exports directory writable
if [ -d "exports" ]; then
    chmod 777 exports
    echo "✓ Exports directory permissions set"
else
    echo "⚠ Warning: exports directory not found"
fi

# Check for PHP
if command -v php > /dev/null; then
    PHP_VERSION=$(php -v | head -n 1 | cut -d ' ' -f 2)
    echo "✓ PHP detected: $PHP_VERSION"
else
    echo "⚠ Warning: PHP not found in PATH"
fi

# Check for required PHP extensions
echo "Checking PHP extensions..."
php -m | grep -E "(pdo|pdo_mysql|mbstring|zip)" > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ Required PHP extensions found"
else
    echo "⚠ Warning: Some required PHP extensions may be missing"
fi

echo ""
echo "Next Steps:"
echo "1. Configure database connection in api/config.php"
echo "2. Import database schema (see README.md)"
echo "3. Set up web server to serve this directory"
echo "4. Test the application in your browser"
echo "5. Change default admin password"
echo ""
echo "For detailed instructions, see DEPLOYMENT_GUIDE.md"
