<div align="center">
  <h1>⛪ BethelApp</h1>
  <p><strong>Deployment and Setup Guide</strong></p>
  <p><em>Web-Based Operation Management System for Diocesan Catholic Church</em></p>
</div>

<br />

## 🛠 Technology Stack

<table align="center" width="100%">
  <tr>
    <td align="center"><b>Backend</b></td>
    <td>Laravel 12 • PHP 8.2+</td>
  </tr>
  <tr>
    <td align="center"><b>Frontend</b></td>
    <td>React 19 • Bootstrap 5 • Tailwind 4.x</td>
  </tr>
  <tr>
    <td align="center"><b>Environment</b></td>
    <td>Laragon 6.0 • MySQL 8.0 • Vite 7.x</td>
  </tr>
</table>

<br />

## 📋 System Requirements

Please ensure your local environment meets the following requirements before proceeding:

* <b>Laragon (Full)</b> — version 6.0+ (This automatically provides PHP 8.2+, MySQL 8.0, Apache 2.4, and phpMyAdmin).
* <b>Node.js</b> — version 18+.
* <b>Composer</b> — version 2.x.
* <b>Git</b> — for repository management.

> <b>ℹ️ Note:</b> Ensure your Laragon environment is actively running both the Apache and MySQL services.

<br />

## 🚀 Installation Instructions

<details>
  <summary><b>Step 1: Clone the Repository</b></summary>
  <br />
  Place the project folder directly into your Laragon web root.
  <pre><code>C:\laragon\www\bethel_app\</code></pre>
  <i>⚠️ The directory must be named exactly <code>bethel_app</code> so Laragon can properly generate the virtual host. Make sure all necessary patch files are applied to your local directory.</i>
</details>

<details>
  <summary><b>Step 2: Environment Configuration</b></summary>
  <br />
  Create your environment configuration file by duplicating the example file:
  <pre><code>copy .env.example .env</code></pre>
  Update the following database connection details inside your new <code>.env</code> file:
  <ul>
    <li><code>DB_DATABASE=bethel_app</code></li>
    <li><code>DB_USERNAME=root</code></li>
    <li><code>DB_PASSWORD=</code> (Leave this blank if using standard Laragon defaults)</li>
  </ul>
</details>

<details>
  <summary><b>Step 3: Database Initialization</b></summary>
  <br />
  <ol>
    <li>Navigate to <code>http://localhost/phpmyadmin</code> in your web browser.</li>
    <li>Log in using <b>root</b> as the username and leave the password field empty.</li>
    <li>Create a fresh database and name it exactly <code>bethel_app</code>.</li>
    <li>Ensure the collation is set to <code>utf8mb4_unicode_ci</code> before saving.</li>
  </ol>
</details>

<details>
  <summary><b>Step 4: Build and Setup Commands</b></summary>
  <br />
  Open the Laragon terminal, change directories to your project folder (<code>cd bethel_app</code>), and run these build commands in sequence:
  <pre><code>composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link
npm install
npm run build</code></pre>
</details>

<details>
  <summary><b>Step 5: Launch the Application</b></summary>
  <br />
  With the virtual host established by Laragon, you can view the live application at:
  <pre><code>http://bethel_app.test</code></pre>
</details>

<br />

## 🔐 System Access Credentials

Running the database seeder will populate the system with these default profiles:

<table width="100%">
  <thead>
    <tr>
      <th align="left">Access Level</th>
      <th align="left">Email Address</th>
      <th align="left">Password</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Head IT Admin</td>
      <td><code>admin@bethelapp.com</code></td>
      <td><code>Admin@1234</code></td>
    </tr>
    <tr>
      <td>IT Helpdesk</td>
      <td><code>helpdesk@bethelapp.com</code></td>
      <td><code>Helpdesk@1234</code></td>
    </tr>
    <tr>
      <td>Standard Parishioner</td>
      <td><code>juan@mail.com</code></td>
      <td><code>Password@123</code></td>
    </tr>
  </tbody>
</table>

> 🛑 <b>SECURITY WARNING:</b> These credentials are for local development only. You must update these passwords immediately when deploying to a live server.

<br />

## 🧰 Common Troubleshooting

<details>
  <summary><b>Missing Application Key Error</b></summary>
  <br />
  If the application throws an encryption key error, execute: <code>php artisan key:generate</code>
</details>

<details>
  <summary><b>Database Connection Refused</b></summary>
  <br />
  Verify that the MySQL service is actively running inside your Laragon control panel.
</details>

<details>
  <summary><b>Missing Target Class Error</b></summary>
  <br />
  Refresh your Composer autoloader files by running: <code>composer dump-autoload</code>
</details>

<details>
  <summary><b>UI Assets Not Loading (Blank Screen)</b></summary>
  <br />
  Recompile your frontend assets by running <code>npm run build</code>, then force refresh your browser cache (Ctrl+Shift+R).
</details>

<details>
  <summary><b>419 Page Expired Error</b></summary>
  <br />
  This indicates a CSRF token mismatch. Clear the application cache using <code>php artisan optimize:clear</code> and refresh the page.
</details>

---

<p align="center">
  <i>College of Computer Studies · Lyceum of Subic Bay · 2026</i>
</p>
