# [cite_start]BethelApp [cite: 1]

[cite_start]Web-Based Operation Management System for Diocesan Catholic Church[cite: 3].
[cite_start]*BethelApp — House of God, Digitally Served [cite: 168]*.

## [cite_start]🛠 Tech Stack [cite: 166]
* [cite_start]**Backend Framework:** Laravel 12.x [cite: 167]
* [cite_start]**Language:** PHP 8.2+ [cite: 167]
* [cite_start]**Frontend UI:** React 19.x [cite: 167]
* [cite_start]**Build Tool:** Vite 7.x [cite: 167]
* [cite_start]**CSS Framework & Utility:** Bootstrap 5.3 and Tailwind 4.x [cite: 167]
* [cite_start]**Database:** MySQL 8.0 [cite: 167]
* [cite_start]**Local Server Bundle:** Laragon 6.0 [cite: 167]

## [cite_start]📋 Prerequisites [cite: 5]

[cite_start]Before you begin, make sure the following software is installed on your machine[cite: 6]:
* [cite_start]**Laragon (Full)** — version 6.0 or later[cite: 8]. [cite_start]Laragon includes PHP 8.2+ [cite: 13][cite_start], MySQL 8.0 [cite: 14][cite_start], Apache 2.4 [cite: 15][cite_start], and phpMyAdmin[cite: 16].
* [cite_start]**Node.js** — version 18 or later[cite: 9].
* [cite_start]**Composer** — version 2.x[cite: 10].
* [cite_start]**Git** — for cloning the repository[cite: 11].

> [cite_start]**Note:** If you already have Laragon installed, make sure it is running with Apache and MySQL services active before proceeding[cite: 17].

## [cite_start]🚀 Installation & Deployment Guide [cite: 2]

### [cite_start]Step 1: Clone the Repository [cite: 18]
[cite_start]Copy or clone the project folder into Laragon's web root directory[cite: 19]:
[cite_start]`C:\laragon\www\bethel_app\` [cite: 20]

> [cite_start]⚠️ **Important:** The folder name bethel_app must match exactly[cite: 21]. [cite_start]Laragon auto-creates a virtual host from the folder name[cite: 21].

### [cite_start]Step 2: Configure the Environment [cite: 25]
[cite_start]Duplicate the example environment file and rename it[cite: 26]:
[cite_start]`copy .env.example .env` [cite: 28]

[cite_start]Update the values in your `.env` file[cite: 29]:
[cite_start]APP_NAME=BethelApp [cite: 30]
[cite_start]APP_ENV=local [cite: 31]
[cite_start]APP_DEBUG=true [cite: 33]
[cite_start]APP_URL=http://bethel_app.test [cite: 34]
[cite_start]DB_CONNECTION=mysql [cite: 35]
[cite_start]DB_DATABASE=bethel_app [cite: 38]
[cite_start]DB_USERNAME=root [cite: 39]
[cite_start]DB_PASSWORD= [cite: 40]

> [cite_start]⚠️ **Note:** Laragon's default MySQL credentials are: username = root, password = (blank)[cite: 44].

### [cite_start]Step 3: Create the Database [cite: 46]
1. [cite_start]Open your browser and go to: `http://localhost/phpmyadmin`[cite: 47].
2. Log in with: Username: root | [cite_start]Password: (leave blank)[cite: 48].
3. [cite_start]Set the database name to: `bethel_app`[cite: 50].
4. [cite_start]Set Collation to: `utf8mb4_unicode_ci` and click "Create"[cite: 51, 52].

### [cite_start]Step 4: Install Dependencies & Setup [cite: 61, 93]
[cite_start]Open the terminal in Laragon and navigate into the project (`cd bethel_app`)[cite: 54, 59]. Run these commands in order:

1. [cite_start]**Install PHP Dependencies:** `composer install`[cite: 62, 63].
2. [cite_start]**Generate the Application Key:** `php artisan key:generate`[cite: 67, 68].
3. [cite_start]**Run Database Migrations:** `php artisan migrate`[cite: 72, 73].
4. [cite_start]**Seed the Database:** `php artisan db:seed`[cite: 82, 83].
5. [cite_start]**Create the Storage Symlink:** `php artisan storage:link`[cite: 89, 90].
6. [cite_start]**Install Node Dependencies & Build Frontend:** `npm install` and `npm run build`[cite: 94, 95, 98, 99].

### [cite_start]Step 5: Access the Application [cite: 106]
[cite_start]Laragon automatically creates a virtual host[cite: 108]. Access the app at:
[cite_start]`http://bethel_app.test`[cite: 109].

## [cite_start]🔐 Default Login Accounts [cite: 85]
* [cite_start]**Ministerial Head IT Admin:** admin@bethelapp.com / Admin@1234 [cite: 86]
* [cite_start]**Ministerial IT Helpdesk:** helpdesk@bethelapp.com / Helpdesk@1234 [cite: 86]
* [cite_start]**Parishioner:** juan@mail.com / Password@123 [cite: 86]

> [cite_start]🛑 **IMPORTANT:** Change these passwords immediately after your first login in a production environment[cite: 87].

## [cite_start]⚙️ Quick Command Reference [cite: 142]
* [cite_start]`php artisan migrate:fresh --seed` : Drop all tables + migrate + seed (full reset)[cite: 143].
* [cite_start]`npm run dev` : Start Vite dev server with hot-reload[cite: 143].
* [cite_start]`php artisan optimize:clear` : Clear all caches[cite: 143].
