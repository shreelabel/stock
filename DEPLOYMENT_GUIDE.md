# Roll Stock Management System - Deployment Guide

## Overview
This package contains the clean, production-ready files for the Shree Label Creation - Paper Stock Management System.

## Package Contents

### Core Application Files
- `index.html` - Main application interface
- `script.js` - Application JavaScript logic
- `styles.css` - Application styling
- `README.md` - Project documentation

### API Directory (`/api/`)
Contains all backend PHP endpoints:

#### Core Functionality
- `config.php` - Database configuration
- `get_rolls.php` - Retrieve stock data
- `add_roll.php` - Add new roll to inventory
- `update_roll.php` - Update existing roll data
- `delete_roll.php` - Remove roll from inventory

#### User Management
- `admin_login.php` - Admin authentication
- `change_password.php` - Change admin password

#### Data Management
- `get_dropdown_data.php` - Populate form dropdowns
- `get_materials_companies.php` - Material and company data
- `get_next_roll_number.php` - Auto-generate roll numbers

#### Advanced Features
- `export_stock_excel.php` - Export data to Excel
- `print_roll.php` - Print roll labels
- `process_slit.php` - Process slitting operations
- `slit_roll.php` - Slit roll functionality

### Exports Directory (`/exports/`)
Directory for storing exported Excel files (must be writable by web server)

## Pre-Deployment Requirements

### Server Requirements
- **Web Server**: Apache/Nginx with PHP support
- **PHP Version**: 7.4 or higher
- **Database**: MySQL 5.7+ or MariaDB 10.2+
- **PHP Extensions Required**:
  - PDO
  - PDO_MySQL
  - mbstring
  - zip (for Excel exports)

### Database Setup
1. Create a MySQL database for the application
2. Import the database schema (see README.md for SQL structure)
3. Create a database user with appropriate permissions

## Deployment Steps

### 1. Upload Files
Upload all files to your web server's document root or subdirectory

### 2. Configure Database Connection
Edit `api/config.php` and update the database connection parameters:
```php
$host = 'your_database_host';
$dbname = 'your_database_name';
$username = 'your_database_user';
$password = 'your_database_password';
```

### 3. Set Directory Permissions
Ensure the following directories are writable by the web server:
```bash
chmod 755 /path/to/application/
chmod 777 /path/to/application/exports/
```

### 4. Configure Admin Access
1. Access the application in your browser
2. Use the default admin login or set up admin credentials
3. Change the default password immediately after first login

### 5. Test Functionality
Verify all features work correctly:
- ✅ Admin login/logout
- ✅ View stock table
- ✅ Add new rolls
- ✅ Edit existing rolls
- ✅ Delete rolls
- ✅ Export to Excel
- ✅ Print functionality
- ✅ Slitting operations

## Security Considerations

### 1. Database Security
- Use strong database passwords
- Limit database user permissions to only required tables
- Consider using SSL for database connections

### 2. File Permissions
- Ensure PHP files are not writable by web server
- Only `/exports/` directory should be writable
- Regularly backup the database

### 3. Admin Access
- Use strong admin passwords
- Consider implementing session timeouts
- Monitor access logs

## Maintenance

### Regular Tasks
1. **Database Backups**: Schedule regular automated backups
2. **Log Monitoring**: Check PHP error logs regularly
3. **Updates**: Keep PHP and server software updated
4. **Cleanup**: Periodically clean old export files from `/exports/`

### Troubleshooting
- Check PHP error logs for any issues
- Verify database connectivity
- Ensure all required PHP extensions are installed
- Check file/directory permissions

## Support
For technical support or questions, refer to the main README.md file or contact your system administrator.

---
**Deployment Package Created**: June 11, 2025  
**Version**: Final Production Release  
**Files Included**: 20 core files (6 application + 14 API endpoints)
