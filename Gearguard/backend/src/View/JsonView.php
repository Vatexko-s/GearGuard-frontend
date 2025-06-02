<?php

namespace pwa\View;

class JsonView
{
    /**
     * Renders the provided data as a JSON response.
     *
     * @param mixed $data The data to be encoded as JSON.
     * @param int   $statusCode HTTP status code (default is 200).
     * @return void
     */
    public function render(mixed $data, int $statusCode = 200): void
    {
        // Set the HTTP status code.
        http_response_code($statusCode);
        
        // Set the Content-Type header to application/json.
        header('Content-Type: application/json');

        header("Access-Control-Allow-Origin: http://127.0.0.1:8080"); // Replace with your frontend's origin
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
        header("Access-Control-Allow-Credentials: true");

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            // Handle preflight request
            http_response_code(200);
            exit;
        }
        // Encode the data as JSON and output it.
        echo json_encode($data, JSON_PRETTY_PRINT);
    }
}
