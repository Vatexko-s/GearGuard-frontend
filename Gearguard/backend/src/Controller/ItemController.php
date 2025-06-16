<?php

namespace pwa\Controller;

use pwa\Service\ItemModel;
use pwa\View\JsonView;
use Ramsey\Uuid\Uuid;

class ItemController
{
    private JsonView $view;

    public function __construct()
    {
        $this->view = new JsonView();
    }

    private function validateUuid(string $id): bool
    {
        return Uuid::isValid($id);
    }

    public function getById(string $id): void
    {
        if (!$this->validateUuid($id)) {
            $this->view->render(['error' => 'Invalid UUID'], 400);
            return;
        }

        $itemModel = new ItemModel();
        $uuid = Uuid::fromString($id);
        $item = $itemModel->getById($uuid);

        if ($item) {
            $this->view->render($item);
        } else {
            $this->view->render(['error' => 'Item not found'], 404);
        }
    }

    private function validateItemData(array $data): array
    {
        $errors = [];

        if (empty($data['name']) || !is_string($data['name'])) {
            $errors[] = 'Name is required and must be a string.';
        }

        if (empty($data['description']) || !is_string($data['description'])) {
            $errors[] = 'Description is required and must be a string.';
        }

        if (empty($data['category']) || !is_string($data['category'])) {
            $errors[] = 'Category is required and must be a string.';
        }

        if (empty($data['status']) || !in_array($data['status'], ['Available', 'Not available', 'reserved'], true)) {
            $errors[] = 'Status is required and must be either "Available" or "Not available".';
        }

        if (isset($data['updated_at']) && !strtotime($data['updated_at'])) {
            $errors[] = 'Updated_at must be a valid timestamp.';
        }

        return $errors;
    }

    public function getByCategory(string $category): void
    {
        if (empty($category) || !is_string($category)) {
            $this->view->render(['error' => 'Invalid category'], 400);
            return;
        }

        $itemModel = new ItemModel();
        $items = $itemModel->getByCategory($category);

        if (empty($items)) {
            $this->view->render(['error' => 'No items found for the given category'], 404);
            return;
        }

        $this->view->render($items);
    }

    public function getAllCategories(): void
    {
        $itemModel = new ItemModel();
        $categories = $itemModel->getAllCategories();

        $this->view->render($categories);
    }

    public function create(): void
    {
        $body = json_decode(file_get_contents('php://input'), true);

        $errors = $this->validateItemData($body);
        if (!empty($errors)) {
            $this->view->render(['errors' => $errors], 400);
            return;
        }

        $itemModel = new ItemModel();
        $item = $itemModel->create($body);

        $this->view->render($item, 201);
    }

    public function update(string $id): void
    {
        if (!$this->validateUuid($id)) {
            $this->view->render(['error' => 'Invalid UUID'], 400);
            return;
        }

        $body = json_decode(file_get_contents('php://input'), true);
        if (!is_array($body)) {
            $this->view->render(['error' => 'Invalid request body'], 400);
            return;
        }

        $itemModel = new ItemModel();
        $uuid = Uuid::fromString($id);
        $existingItem = $itemModel->getById($uuid);

        if (!$existingItem) {
            $this->view->render(['error' => 'Item not found'], 404);
            return;
        }

        // Merge existing item data with the new data
        $updatedData = array_merge($existingItem->jsonSerialize(), $body);

        $errors = $this->validateItemData($updatedData);
        if (!empty($errors)) {
            $this->view->render(['errors' => $errors], 400);
            return;
        }

        if ($itemModel->update($uuid, $updatedData)) {
            $this->view->render(['message' => 'Item updated']);
        } else {
            $this->view->render(['error' => 'Failed to update item'], 500);
        }
    }

    public function delete(string $id): void
    {
        if (!$this->validateUuid($id)) {
            $this->view->render(['error' => 'Invalid UUID'], 400);
            return;
        }

        $itemModel = new ItemModel();
        $uuid = Uuid::fromString($id);

        if ($itemModel->delete($uuid)) {
            $this->view->render([], 204);
        } else {
            $this->view->render(['error' => 'Item not found'], 404);
        }
    }
}