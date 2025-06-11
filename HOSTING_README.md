# Paper Stock Management System - Hosting Package

## 📁 Complete Hosting Package
This folder contains everything needed to deploy your Paper Stock Management System to any web hosting provider, including InfinityFree.

## 🚀 Quick Deployment Guide

### Step 1: Upload Files
1. Upload ALL files from this `hosting` folder to your web server's public directory (usually `public_html` or `www`)
2. Make sure all files and folders are uploaded correctly

### Step 2: Run Installation
1. Visit `http://yourdomain.com/Install.php` in your browser
2. Follow the step-by-step installation wizard
3. Enter your database credentials when prompted
4. Set up your admin password
5. Complete the installation

### Step 3: Security
1. **IMPORTANT**: Delete `Install.php` after successful installation
2. Your application will be available at `http://yourdomain.com/index.html`

## 📋 What's Included

### Core Files
- `index.html` - Main application interface
- `script.js` - Application JavaScript
- `styles.css` - Application styling
- `Install.php` - Web-based installer

### API Directory
- `api/` - Contains all backend PHP scripts
- Database connection and API endpoints

### Other Files
- `README.md` - Detailed documentation
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- Various installation scripts

## 🌐 Hosting Compatibility

### Tested Hosting Providers
- ✅ InfinityFree (Free hosting)
- ✅ Most shared hosting providers
- ✅ VPS/Dedicated servers

### Requirements
- PHP 7.4 or higher
- MySQL/MariaDB database
- MySQLi extension (No PDO required)
- Basic file write permissions

## 🔧 Manual Configuration (if needed)

If the installer doesn't work, you can manually:

1. Create a MySQL database
2. Import the SQL schema (available in installer)
3. Edit `api/config.php` with your database details
4. Set up admin password in database

## 📞 Support

For issues or questions:
1. Check the `README.md` for detailed documentation
2. Review the `DEPLOYMENT_GUIDE.md`
3. Ensure all requirements are met

## 🔒 Security Notes

- Always delete `Install.php` after installation
- Use strong database passwords
- Regularly backup your data
- Keep the system updated

---
**Paper Stock Management System v1.0**  
Ready for deployment to any web hosting provider!
