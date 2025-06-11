# 🚀 Paper Stock Management System - Hosting Setup Guide

## 📋 Pre-configured Database Settings

Your hosting files have been updated with FreeMySQL database configuration:

- **Host:** `sql12.freesqldatabase.com`
- **Database:** `sql12784281`
- **Username:** `sql12784281`
- **Password:** `TTfcAuK6pP`
- **Port:** `3306`

## 🔧 Files Updated for Hosting:

### 1. **api/config.php**
✅ Database credentials updated to FreeMySQL
✅ Error handling for hosting environment
✅ Automatic table creation

### 2. **Install.php**
✅ Default values set to FreeMySQL credentials
✅ Web installer ready to use

### 3. **install_standalone.php**
✅ Standalone installer with FreeMySQL defaults
✅ No external dependencies

### 4. **.htaccess**
✅ CORS headers for API calls
✅ Security configurations
✅ File compression
✅ Error handling

## 🌐 Deployment Steps:

### Step 1: Upload Files
```bash
# Upload entire 'hosting' folder contents to your web server
# Example: public_html/ or htdocs/
```

### Step 2: Database Setup
1. Your `bappa.sql` file is already uploaded to FreeMySQL
2. Database tables should be automatically created by the system

### Step 3: Installation (Choose One Method)

#### Method A: Web Installer
1. Visit: `http://yourdomain.com/Install.php`
2. Follow the installation wizard
3. Database fields are pre-filled with your FreeMySQL credentials

#### Method B: Standalone Installer
1. Visit: `http://yourdomain.com/install_standalone.php`
2. Complete the installation process

#### Method C: Direct Access (if database is already set up)
1. Visit: `http://yourdomain.com/index.html`
2. Login with default password: `admin123`

## 🔑 Admin Access:
- **Default Password:** `admin123`
- **Change immediately after first login**

## 🧪 Testing Your Installation:

### 1. Basic Test
- Open: `http://yourdomain.com/index.html`
- Check if the page loads without errors

### 2. Database Connection Test
- Login as admin
- Try to view stock (should work even if empty)
- Add a test roll to verify database connectivity

### 3. API Test
Check these endpoints manually:
- `http://yourdomain.com/api/get_rolls.php`
- `http://yourdomain.com/api/get_next_roll_number.php`

## 🐛 Troubleshooting:

### Common Issues:

#### 1. **500 Internal Server Error**
- Check if .htaccess is supported
- Review PHP error logs
- Verify file permissions (755 for folders, 644 for files)

#### 2. **Database Connection Failed**
- Verify FreeMySQL credentials
- Check if database service is active
- Ensure `sql12784281` database exists

#### 3. **CORS Errors**
- .htaccess file should handle this
- If issues persist, add CORS headers manually in PHP files

#### 4. **File Upload Issues**
- Check hosting provider's PHP limits
- Modify .htaccess upload limits if needed

### 📞 Support Commands:

#### Enable PHP Error Display (for debugging only):
```php
// Add to top of config.php temporarily
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

#### Test Database Connection:
```php
// Create test.php file
<?php
$host = 'sql12.freesqldatabase.com';
$username = 'sql12784281';
$password = 'TTfcAuK6pP';
$database = 'sql12784281';

$conn = new mysqli($host, $username, $password, $database);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} else {
    echo "Connected successfully!";
}
?>
```

## ✅ Final Checklist:

- [ ] All files uploaded to hosting
- [ ] Database credentials verified
- [ ] .htaccess file in place
- [ ] Installation completed
- [ ] Admin password changed
- [ ] Basic functionality tested
- [ ] Remove test files (if any)

## 🎯 Ready to Deploy!

Your hosting folder is now completely configured for:
- ✅ FreeMySQL Database
- ✅ Shared Hosting Environment
- ✅ CORS Support
- ✅ Security Headers
- ✅ Error Handling
- ✅ Mobile Responsive
- ✅ Professional UI

**Upload the 'hosting' folder contents to your web server and you're ready to go!**
