<div align="center">
  # ⛪ BethelApp
  **Step-by-Step Deployment Guide**
  *Web-Based Operation Management System for Diocesan Catholic Church*
  
  <p><b>Laravel 12 &nbsp;•&nbsp; React 19 &nbsp;•&nbsp; Laragon &nbsp;•&nbsp; Bootstrap 5</b></p>

  ![Laravel](https://img.shields.io/badge/Laravel_12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
  ![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Bootstrap](https://img.shields.io/badge/Bootstrap_5-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
  ![Laragon](https://img.shields.io/badge/Laragon-000000?style=for-the-badge&logo=server&logoColor=white)

</div>

<br />

## 📋 Prerequisites
Ensure you have the following software installed prior to starting the setup process.

### Required Software
* **Laragon (Full)** — v6.0 or higher → https://laragon.org/download
* **Node.js** — v18 or higher (included in Laragon Full)
* **Composer** — v2.x (included in Laragon Full)
* **Git** — required for cloning the repo

### Included in Laragon (No separate installation needed)
* PHP 8.2+
* MySQL 8.0
* Apache 2.4
* phpMyAdmin

> ℹ **INFO:** If Laragon is already installed, verify that both the Apache and MySQL services are actively running before moving forward.

<br />

## 🚀 Deployment Guide

<details open>
  <summary><b>STEP 1: Place the Project Files & Apply Bug Fixes</b></summary>
  <br />
  Move or clone your project repository directly into the web root of Laragon:
  <pre><code>C:\laragon\www\bethel_app\</code></pre>
  <i>⚠️ NOTE: The directory name must remain exactly `bethel_app` so Laragon can automatically generate the correct virtual host.</i>

  **Apply All Bug Fixes**
  Swap out the existing files in your repository with the corrected versions listed below:

  | Target File | Destination Directory |
  |---|---|
  | SacramentRequestController.php | app/Http/Controllers/Admin/ |
  | BookingController.php | app/Http/Controllers/ |
  | InboxController.php | app/Http/Controllers/ |
  | web.php | routes/ |
  | AdminApp.jsx | resources/js/pages/Admin/ |
  | TopNav.jsx | resources/js/pages/Admin/ |
  | Sidebar.jsx | resources/js/pages/Admin/ |
  | app.jsx | resources/js/ |
  | admin.css | resources/css/ |
  | navbar.blade.php | resources/views/partials/ |
  | inbox.blade.php | resources/views/parishioner/ |
  | InboxPage.jsx | resources/js/pages/Inbox/ (you must create this folder) |
  | NotificationBell.jsx | resources/js/components/ |
</details>

<details>
  <summary><b>STEP 2: Configure the Environment File</b></summary>
  <br />
  Make a copy of the default environment configuration and rename it inside your project root:
  <pre><code>copy .env.example .env</code></pre>
  Edit the new <code>.env</code> file to match these exact settings:
  <pre><code>APP_NAME=BethelApp
APP_ENV=local
APP_KEY=                         # this gets populated in Step 6
APP_DEBUG=true
APP_URL=http://bethel_app.test
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bethel_app
DB_USERNAME=root
DB_PASSWORD=                     # leave blank for Laragon defaults
FILESYSTEM_DISK=public
SESSION_DRIVER=database
CACHE_STORE=database</code></pre>
  <i>⚠️ NOTE: The default MySQL login for Laragon is root with an empty password. Update DB_PASSWORD only if you manually changed it.</i>
</details>

<details>
  <summary><b>STEP 3: Create the Database</b></summary>
  <br />
  <ol>
    <li>Navigate to <code>http://localhost/phpmyadmin</code> in your web browser.</li>
    <li>Sign in using Username: <b>root</b> and leave the Password blank.</li>
    <li>Select "New" from the left-hand menu.</li>
    <li>Input exactly <code>bethel_app</code> as the database name.</li>
    <li>Choose <code>utf8mb4_unicode_ci</code> for the collation.</li>
    <li>Hit the "Create" button.</li>
  </ol>
  <i>🛑 IMPORTANT: The database name has to be exactly bethel_app to align with your .env file settings.</i>
</details>

<details>
  <summary><b>STEP 4: Open the Terminal in Laragon</b></summary>
  <br />
  You can use the terminal integrated within Laragon. Access it via the tray icon:
  <ul>
    <li>Right-click the Laragon icon running in your system tray.</li>
    <li>Choose Terminal (or click the Terminal button directly on the Laragon dashboard).</li>
    <li>It will default to <code>C:\laragon\www\</code> — change into your project directory using: <code>cd bethel_app</code></li>
  </ul>
  <i>ℹ INFO: Every command from this point forward must be executed inside the C:\laragon\www\bethel_app\ directory.</i>
</details>

<details>
  <summary><b>STEP 5: Install PHP Dependencies</b></summary>
  <br />
  Utilize Composer to pull in all required Laravel packages:
  <pre><code>composer install</code></pre>
  This command processes your composer.json and installs everything into the vendor/ directory. Expect this to take a few minutes on the initial run.
  <i>⚠️ NOTE: If a PHP version error occurs, use the Laragon Menu > PHP to switch your active version to 8.2 or higher.</i>
</details>

<details>
  <summary><b>STEP 6: Generate the Application Key</b></summary>
  <br />
  A unique encryption key is mandatory for Laravel. You can generate one by running:
  <pre><code>php artisan key:generate</code></pre>
  This will automatically populate the APP_KEY= variable inside your .env file. Look for a success message in the console.
</details>

<details>
  <summary><b>STEP 7: Run Database Migrations</b></summary>
  <br />
  Running this command will build all necessary tables within the bethel_app database:
  <pre><code>php artisan migrate</code></pre>
  Each migration file will display a DONE status. The system will create the following structures:
  <ul>
    <li>users, parishes, clergy</li>
    <li>events, announcements, notifications</li>
    <li>sacrament_types, sacrament_requests</li>
    <li>request_payments, request_messages</li>
    <li>cache, jobs, sessions</li>
  </ul>
  <i>🛑 IMPORTANT: A "Connection refused" error indicates MySQL is down. Verify the MySQL indicator is green inside Laragon.</i>
</details>

<details>
  <summary><b>STEP 8: Seed the Database with Test Data</b></summary>
  <br />
  Fill the database with initial test records and the default administrator profiles:
  <pre><code>php artisan db:seed</code></pre>
  This executes the seeders in the specific order of: Users → Parishes → Clergy → Events → Announcements → Notifications → Sacrament Types → Sacrament Requests.
</details>

<details>
  <summary><b>STEP 9: Create the Storage Symlink</b></summary>
  <br />
  BethelApp routes uploaded files (like images and payment proofs) to storage/app/public/. Run this command so they can be viewed via the web:
  <pre><code>php artisan storage:link</code></pre>
  A confirmation message will appear verifying the link has been connected.
</details>

<details>
  <summary><b>STEP 10 & 11: Frontend Dependencies & Build Assets</b></summary>
  <br />
  Download all necessary frontend libraries (React, Vite, Bootstrap, etc.):
  <pre><code>npm install</code></pre>
  This utilizes package.json to populate your node_modules/ folder.
  
  Build your React UI components and stylesheets into optimized production bundles:
  <pre><code>npm run build</code></pre>
  Vite will process resources/js/app.jsx and resources/js/admin.jsx into the public/build/ directory. 
  <i>⚠️ NOTE: The build command is strictly required for production. Whenever you modify a .jsx or .css file during active development, you should run `npm run dev` for hot-reloading instead.</i>
</details>

<details>
  <summary><b>STEP 12: Configure Laragon Virtual Host & Access the App</b></summary>
  <br />
  <b>Automatic Virtual Host (Recommended)</b>
  Laragon handles the virtual host creation based on the folder title. Load the application here: <code>http://bethel_app.test</code>
  
  <b>If the URL fails to load:</b>
  <ol>
    <li>Navigate to Laragon Menu → Apache → Virtual Hosts.</li>
    <li>Ensure there is an entry for bethel_app.test routing to C:\laragon\www\bethel_app\public.</li>
    <li>Restart Apache or click Menu → Laragon → Reload.</li>
    <li>If issues persist, flush your DNS via Menu → Tools → Flush DNS.</li>
  </ol>
  <b>Localhost Alternative</b>
  If you have disabled virtual hosts, change APP_URL to http://localhost/bethel_app in your .env and visit: <code>http://localhost/bethel_app/public</code>
</details>

<details>
  <summary><b>STEP 13: Verify the Application is Working</b></summary>
  <br />
  <b>System Verification Checklist:</b>
  <ul>
    <li>Load <code>http://bethel_app.test</code> — The main page should display the navbar and parish details.</li>
    <li>Select Sacraments in the header — A dropdown must show the available sacrament types.</li>
    <li>Select Announcements — Information cards should load from the db.</li>
    <li>Select Events — The event listings should become visible.</li>
  </ul>
  <b>Testing Parishioner Access:</b>
  <ul>
    <li>Navigate to <code>http://bethel_app.test/login</code></li>
    <li>Authenticate using juan@mail.com / Password@123</li>
    <li>Verify the profile menu displays your name, Inbox, My Bookings, and Logout options.</li>
    <li>Visit /my-bookings — Ensure the list renders without the 30-second lag issue.</li>
    <li>Visit /inbox — Both the Notifications and Messages panels should be clear.</li>
    <li>Resize to mobile view: The hamburger toggle and Logout function must work.</li>
  </ul>
  <b>Testing Admin Access:</b>
  <ul>
    <li>Navigate to <code>http://bethel_app.test/admin/dashboard</code> (This will force a login redirect).</li>
    <li>Authenticate using admin@bethelapp.com / Admin@1234</li>
    <li>The dashboard needs to load the primary stat cards (Requests, Parishioners, etc.).</li>
    <li>Visit /admin/sacraments — The data table should populate properly with requests.</li>
    <li>Resize to mobile view: Check that the sidebar toggle functions and the Sign Out button is accessible at the bottom.</li>
  </ul>
</details>

<details>
  <summary><b>STEP 14: Fresh Reset (Emergency Use Only)</b></summary>
  <br />
  If you need to completely wipe the system and rebuild it from scratch, execute:
  <pre><code>php artisan migrate:fresh --seed</code></pre>
  <i>WARNING: This will drop every single table in your database, execute all migrations again, and repopulate the default test data. Do not ever use this command in a live production setting.</i>
</details>

<br />

## 🔐 Default Login Accounts Created by Seeder

| Access Role | Registered Email | Assigned Password | Landing Route |
|---|---|---|---|
| Ministerial Head IT Admin | `admin@bethelapp.com` | `Admin@1234` | `/admin/dashboard` |
| Ministerial IT Helpdesk | `helpdesk@bethelapp.com` | `Helpdesk@1234` | `/admin/dashboard` |
| Parishioner (x3) | `juan@mail.com` | `Password@123` | `/` |

> 🛑 **IMPORTANT:** Update these default credentials the very first time you log into a production instance.

<br />

## ⚙️ Quick Command Reference

| Terminal Command | Action Performed |
|---|---|
| `composer install` | Downloads required PHP packages (run initially or after json updates) |
| `php artisan key:generate` | Creates the secure APP_KEY inside .env |
| `php artisan migrate` | Generates or updates the database schema |
| `php artisan db:seed` | Injects the default accounts and testing data |
| `php artisan migrate:fresh --seed` | Wipes the entire database, rebuilds it, and seeds it |
| `php artisan storage:link` | Bridges public/storage with storage/app/public |
| `npm install` | Downloads required Node.js libraries |
| `npm run build` | Processes React and CSS for live production |
| `npm run dev` | Boots the Vite server for local development |
| `php artisan optimize:clear` | Purges all cached configs, routes, and views |
| `php artisan config:cache` | Caches your config files to speed up production boot times |

<br />

## 🧰 Troubleshooting

<details>
  <summary><b>Missing Application Encryption Key</b></summary>
  <br />
  You likely missed Step 6. Fix this by running: <code>php artisan key:generate</code>
</details>

<details>
  <summary><b>SQLSTATE: Connection Refused</b></summary>
  <br />
  The MySQL database isn't running. Check your Laragon dashboard and hit Start All.
</details>

<details>
  <summary><b>Target Class Does Not Exist / Class Not Found</b></summary>
  <br />
  Refresh your system autoload files by executing: <code>composer dump-autoload</code>
</details>

<details>
  <summary><b>Blank Page or Missing Stylesheets</b></summary>
  <br />
  Your frontend assets haven't been compiled. Run <code>npm run build</code> and then perform a hard refresh in your browser (Ctrl+Shift+R).
</details>

<details>
  <summary><b>Admin Sacrament Data Table is Empty</b></summary>
  <br />
  This relates to the `latestPayment` column constraint bug. Make absolutely sure you swapped out the `SacramentRequestController.php` and `BookingController.php` files correctly during Step 1.
</details>

<details>
  <summary><b>Uploaded Images Show as 404 Errors</b></summary>
  <br />
  Your system lacks the storage symlink. Generate it via: <code>php artisan storage:link</code>
</details>

<details>
  <summary><b>Form Submissions Result in 419 Page Expired</b></summary>
  <br />
  Your CSRF token is mismatched. Clear the system caches using <code>php artisan optimize:clear</code> and reload the page.
</details>

<br />

## 💻 Technology Stack Summary

| Architecture Layer | Specific Technology | Version & Notes |
|---|---|---|
| Backend Framework | Laravel | 12.x — PHP MVC framework |
| Core Language | PHP | 8.2+ — server-side logic |
| Frontend Interface | React | 19.x — component-based UI |
| Frontend Bundler | Vite | 7.x — compiles JSX and CSS |
| CSS Framework | Bootstrap | 5.3 — responsive grid layout |
| CSS Utility | Tailwind | 4.x — rapid utility styling |
| Database Engine | MySQL | 8.0 — relational data storage |
| Database GUI | phpMyAdmin | Visual DB management via Laragon |
| Local Host Server | Laragon | 6.0 — bundled Apache + PHP + MySQL |
| Render Engine | Blade | Laravel's built-in server HTML engine |
| Security | Laravel Auth | Handles session authentication and roles |

---

<p align="center">
  <i>BethelApp — House of God, Digitally Served</i><br />
  <i>College of Computer Studies · Lyceum of Subic Bay · 2026</i>
</p>
