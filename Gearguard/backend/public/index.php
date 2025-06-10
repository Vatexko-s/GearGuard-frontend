<?php

require __DIR__ . '/../vendor/autoload.php';

use pwa\Controller\AuthController;
use pwa\Router\Router;
use pwa\Controller\PersonController;
use pwa\Controller\ItemController;

//echo "Hello, world from L17!";

// 1. vytvoríme inštanciu routra
$router = new Router();

// 2. nakonfigurujeme routy
// User management endpoints
$router->post('/users', AuthController::class, 'create');
$router->delete('/users/{userId:uuid}', AuthController::class, 'delete');

// Authentication endpoint
$router->post('/login', AuthController::class, 'login');
$router->post('/logout', AuthController::class, 'logout');

// Person endpoints
$router->get('/persons', PersonController::class, 'read');
$router->post('/persons', PersonController::class, 'create');
$router->delete('/persons/{personId:uuid}', PersonController::class, 'delete');

$router->post('/api/v1/items', ItemController::class, 'create');
$router->get('/api/v1/items/category', ItemController::class, 'getAllCategories');
$router->get('/api/v1/items/category/{categoryName}', ItemController::class, 'getByCategory'); //TODO: blbost nefunguje
$router->get('/api/v1/items/{id:uuid}', ItemController::class, 'getById');
$router->put('/api/v1/items/{id:uuid}', ItemController::class, 'update');
$router->delete('/api/v1/items/{id:uuid}', ItemController::class, 'delete');

// 3. zavoláme metódu dispatch na routri
$router->dispatch();

