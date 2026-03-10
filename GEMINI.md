# Project Overview

This is a Laravel project that appears to be a web application for a parish or church. It includes features for managing announcements, events, and users. The project uses Laravel for the backend, and React for the frontend.

## Building and Running

### Setup
To set up the project, run the following command:
```bash
composer run setup
```
This will install all the dependencies, create a `.env` file, generate an application key, run the migrations, and build the frontend assets.

### Development
To start the development server, run the following command:
```bash
composer run dev
```
This will start the PHP development server, the queue listener, the log viewer, and the Vite development server.

### Testing
To run the tests, use the following command:
```bash
composer run test
```

## Development Conventions

The project follows the standard Laravel project structure. It uses Laravel Breeze for authentication. The frontend is built with React and Vite. The project also uses Tailwind CSS for styling.

### Backend

The backend is a standard Laravel application. It uses a MySQL database. The database migrations are located in the `database/migrations` directory. The models are located in the `app/Models` directory. The controllers are located in the `app/Http/Controllers` directory. The routes are defined in the `routes/web.php` and `routes/api.php` files.

### Frontend

The frontend is a React application. The main entry point is `resources/js/app.jsx`. The React components are located in the `resources/js/components` directory. The pages are located in the `resources/js/pages` directory. The application uses React Router for routing. The styles are defined in `resources/css/app.css` and use Tailwind CSS.
