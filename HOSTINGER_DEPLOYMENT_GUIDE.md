# 🚀 NIRVANA Club Web Platform — Hostinger Shared Hosting Deployment Guide

This guide explains step-by-step how to deploy the NIRVANA Club Web Platform to **Hostinger Shared Hosting** (Single / Premium / Business Web Hosting) using PHP and MySQL with **zero Node.js dependencies**.

---

## 📦 What is Included in this Deployment Package?

The package **`nirvana_hostinger_public_html.zip`** (or the folder `public_html/`) contains:

1. **React Production Frontend:** Built HTML, CSS, JavaScript, fonts, and images (Warm Cream design, animations, scroll reveal).
2. **PHP REST API Backend (`/api`):** Complete conversion from Node.js/Express to PHP 8.x PDO.
3. **Database Schema & Data (`database.sql`):** 10 tables and all existing data (admins, team, alumni, professors, settings, events, certificates).
4. **Pure PHP Dynamic QR Code Generator:** Zero Composer dependencies required on Hostinger.
5. **Apache Configuration (`.htaccess`):** Handles client-side React routing (SPA) and routes API requests to PHP seamlessly.
6. **Authentication & Security:** HS256 JWT, bcrypt password verification, Bearer authorization header preservation, SQL injection protection via PDO prepared statements.

---

## 🛠️ Step-by-Step Hostinger Deployment (5 Minutes)

### Step 1: Create a MySQL Database on Hostinger
1. Log in to your **Hostinger hPanel** ([hpanel.hostinger.com](https://hpanel.hostinger.com)).
2. Go to **Databases** → **MySQL Databases**.
3. Create a new database:
   - **Database Name:** e.g., `u123456789_nirvana`
   - **Username:** e.g., `u123456789_admin`
   - **Password:** e.g., `YourSecurePassword@123`
4. Click **Create**.
5. Note down your **Database Name**, **Username**, and **Password**.

---

### Step 2: Import `database.sql` in phpMyAdmin
1. In the same **Databases** section in Hostinger hPanel, click **Enter phpMyAdmin** next to your newly created database.
2. At the top navigation bar of phpMyAdmin, click the **Import** tab.
3. Click **Choose File** and select **`database.sql`** (found inside this project or extracted from the zip).
4. Click **Go** at the bottom right.
5. You will see: *"Import has been successfully finished, queries executed."*
   All 10 tables (`admins`, `team_members`, `alumni`, `professors`, `club_settings`, etc.) and all records will be created.

---

### Step 3: Configure Database Credentials in `config/database.php`
Open `config/database.php` (or edit it directly in Hostinger File Manager after uploading) and update your MySQL credentials:

```php
// MySQL Configuration (Hostinger hPanel Database details)
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'u123456789_nirvana'); // <-- Your Hostinger Database Name
define('DB_USER', 'u123456789_admin');   // <-- Your Hostinger Database Username
define('DB_PASS', 'YourSecurePassword@123'); // <-- Your Hostinger Database Password
```

---

### Step 4: Upload to Hostinger `public_html`
1. In Hostinger hPanel, go to **Files** → **File Manager**.
2. Open the **`public_html`** folder of your domain or subdomain.
3. Click the **Upload** button (top right) and choose **`nirvana_hostinger_public_html.zip`**.
4. Right-click the uploaded zip file and click **Extract**.
   - Select destination as the current directory (`public_html`).
5. After extracting, ensure that files like `index.html`, `.htaccess`, `api/`, `config/`, and `includes/` are directly inside `public_html/`.
6. You can now delete the `.zip` file from Hostinger to save disk space.

---

### Step 5: Verify Permissions (One Click)
In Hostinger File Manager:
- Right-click the **`uploads/`** folder → **Permissions** → Ensure it is set to **`755`** (or readable & writable by web server for admin photo uploads).

---

## 🔑 Administrator Credentials

The default admin accounts are already pre-seeded in the database:

| Account | Email | Password |
|---|---|---|
| **NIRVANA Admin** | `admin@nirvana.edu` | `Admin@123` |
| **Club Admin** | `admin@club.org` | `admin123` |

### Accessing the Admin Portal:
- Navigate to: `https://yourdomain.com/admin/login`
- Or click the discreet **"Executive Portal • Login →"** link at the very bottom of the website footer.
- The **"Forgot Password?"** link allows instant password recovery using email and a 6-digit OTP verification code.

---

## 🧪 Verification & Health Check

After deployment, test the following URLs in your browser:
1. **Public Website:** `https://yourdomain.com/` (Home page with Warm Cream theme, centres, moments, faculty)
2. **Team & QR Codes:** `https://yourdomain.com/team`
3. **Alumni Roster:** `https://yourdomain.com/alumni`
4. **Member Verification:** `https://yourdomain.com/team/1`
5. **API Health Check:** `https://yourdomain.com/api/health`
   - Returns: `{"status":"ok","service":"NIRVANA Club Management & Verification API (PHP/MySQL)"}`

---

## ⚙️ Summary of Converted Components

| Node.js / Express Feature | PHP / Hostinger Implementation | Status |
|---|---|---|
| Express Web Server | Apache + `api/index.php` Front Controller | ✅ Verified |
| Routing | `.htaccess` URL Rewrite | ✅ Verified |
| Database Engine | PDO MySQL (with PDO SQLite fallback) | ✅ Verified |
| Password Hashing | Native PHP `password_hash()` & `password_verify()` | ✅ Verified |
| Authentication | Pure PHP RFC 7519 HS256 JWT | ✅ Verified |
| Dynamic QR Codes | Pure PHP GD Reed-Solomon QR Generator | ✅ Verified |
| Media Uploads | PHP `move_uploaded_file` with MIME validation | ✅ Verified |
| Frontend React SPA | 100% Zero-Change Unmodified Build | ✅ Verified |
