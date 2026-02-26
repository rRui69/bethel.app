<?php

use Illuminate\Foundation\Application;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

// Start timing the request
define('LARAVEL_START', microtime(true));

// Maintenance mode check
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Autoload Composer dependencies
require __DIR__.'/../vendor/autoload.php';

// Bootstrap the Laravel application
$app = require_once __DIR__.'/../bootstrap/app.php';

// Create the HTTP kernel
$kernel = $app->make(Kernel::class);

// Capture the incoming request and send the response
$request = Request::capture();
$response = $kernel->handle($request);
$response->send();

// Terminate the kernel
$kernel->terminate($request, $response);