<?php
// Allow CORS for localhost:3000
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require __DIR__ . '/../vendor/autoload.php';

use pwa\Controller\AuthController;
use pwa\Router\Router;
use pwa\Controller\PersonController;
use pwa\Controller\ItemController;
use pwa\Controller\ReservationController;

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

// Item endpoints
$router->post('/api/v1/items', ItemController::class, 'create');
$router->get('/api/v1/items/category', ItemController::class, 'getAllCategories'); //HOTOVO
$router->get('/api/v1/items/category/{categoryName:string}', ItemController::class, 'getByCategory'); //HOTOVO
$router->get('/api/v1/items/{id:uuid}', ItemController::class, 'getById');
$router->put('/api/v1/items/{id:uuid}', ItemController::class, 'update');
$router->delete('/api/v1/items/{id:uuid}', ItemController::class, 'delete');
$router->post('/api/v1/items/category/{categoryName:string}/availability', ItemController::class, 'getAvailabilityByCategory'); //HOTOVO

$router->get('/api/v1/reservations', ReservationController::class, 'getByUserId'); //HOTOVO
$router->post('/api/v1/reservations', ReservationController::class, 'create'); //HOTOVO
$router->get('/api/v1/reservations/history', ReservationController::class, 'getHistory');
$router->get('/api/v1/reservations/{id:uuid}', ReservationController::class, 'getById');
$router->put('/api/v1/reservations/{id:uuid}', ReservationController::class, 'update');
$router->delete('/api/v1/reservations/{id:uuid}', ReservationController::class, 'delete'); //HOTOVO
$router->post('/api/v1/reservations/{reservationID:uuid}/items', ReservationController::class, 'addItemToReservation'); //HOTOVO
$router->delete('/api/v1/reservations/{reservationID:uuid}/items/{itemID:uuid}', ReservationController::class, 'deleteItemFromReservation'); //HOTOVO
$router->post('/api/v1/reservations/{id:uuid}/rent', ReservationController::class, 'rent'); //HOTOVO
$router->get('/api/v1/reservations/{reservationID:uuid}/items', ReservationController::class, 'getItemsByReservation'); //HOTOVO
$router->post('/api/v1/reservations/{id:uuid}/return', ReservationController::class, 'returnReservation'); //HOTOVO

// 3. zavoláme metódu dispatch na routri
$router->dispatch();