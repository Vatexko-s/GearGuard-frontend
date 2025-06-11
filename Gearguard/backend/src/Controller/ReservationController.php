<?php

namespace pwa\Controller;

use pwa\Service\ReservationModel;
use pwa\View\JsonView;
use Ramsey\Uuid\Uuid;

class ReservationController
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

        $reservationModel = new ReservationModel();
        $uuid = Uuid::fromString($id);
        $reservation = $reservationModel->getById($uuid);

        if ($reservation) {
            $this->view->render($reservation);
        } else {
            $this->view->render(['error' => 'Reservation not found'], 404);
        }
    }

    private function getUserIdFromToken(): ?string
    {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $token = $matches[1];
            $decodedToken = json_decode(base64_decode(explode('.', $token)[1]), true);
            return $decodedToken['sub'] ?? null; // Extract the 'sub' field for user ID
        }
        return null;
    }

    public function getHistory(): void
    {
        $userId = $this->getUserIdFromToken();

        if (!$userId || !$this->validateUuid($userId)) {
            $this->view->render(['error' => 'Invalid or missing user ID in token'], 400);
            return;
        }

        $reservationModel = new ReservationModel();
        $uuid = Uuid::fromString($userId);
        $statuses = ['returned'];
        $reservations = $reservationModel->getByUserIdAndStatuses($uuid, $statuses);

        $this->view->render($reservations);
    }

    public function getByUserId(): void
    {
        $userId = $this->getUserIdFromToken();

        if (!$userId || !$this->validateUuid($userId)) {
            $this->view->render(['error' => 'Invalid or missing user ID in token'], 400);
            return;
        }

        $reservationModel = new ReservationModel();
        $uuid = Uuid::fromString($userId);
        $statuses = ['reserved', 'rented'];
        $reservations = $reservationModel->getByUserIdAndStatuses($uuid, $statuses);

        $this->view->render($reservations);
    }

    public function create(): void
    {
        $body = json_decode(file_get_contents('php://input'), true);

        if (!is_array($body)) {
            $this->view->render(['error' => 'Invalid request body'], 400);
            return;
        }

        // Validate user_id
        if (empty($body['user_id']) || !$this->validateUuid($body['user_id'])) {
            $this->view->render(['error' => 'Invalid or missing user_id'], 400);
            return;
        }

        $stmt = $this->getPdo()->prepare("SELECT COUNT(*) FROM users WHERE id = :id");
        $stmt->execute([':id' => $body['user_id']]);
        if ($stmt->fetchColumn() == 0) {
            $this->view->render(['error' => 'User does not exist'], 404);
            return;
        }

        // Validate item IDs
        if (empty($body['items']) || !is_array($body['items'])) {
            $this->view->render(['error' => 'Items are required and must be an array'], 400);
            return;
        }

        $itemIds = array_map(fn($item) => $item['id'], $body['items']);
        $placeholders = implode(',', array_fill(0, count($itemIds), '?'));
        $stmt = $this->getPdo()->prepare("SELECT COUNT(*) FROM items WHERE id IN ($placeholders)");
        $stmt->execute($itemIds);

        if ($stmt->fetchColumn() != count($itemIds)) {
            $this->view->render(['error' => 'One or more item IDs do not exist'], 400);
            return;
        }

        // Check if any item is already in another reservation
        $reservationModel = new ReservationModel();
        foreach ($itemIds as $itemId) {
            if ($reservationModel->isItemInAnotherReservation($itemId, null)) {
                $this->view->render(['error' => "Item $itemId is already in another reservation"], 400);
                return;
            }
        }

        // Validate start_date and end_date
        if (empty($body['start_date']) || empty($body['end_date'])) {
            $this->view->render(['error' => 'Start date and end date are required'], 400);
            return;
        }

        $startDate = strtotime($body['start_date']);
        $endDate = strtotime($body['end_date']);

        if ($startDate === false || $endDate === false) {
            $this->view->render(['error' => 'Invalid date format'], 400);
            return;
        }

        if ($endDate <= $startDate) {
            $this->view->render(['error' => 'End date must be after start date'], 400);
            return;
        }

        // Validate status
        if (!empty($body['status']) && !in_array($body['status'], ['returned', 'rented', 'reserved'], true)) {
            $this->view->render(['error' => 'Invalid status. Allowed values are returned, rented, or reserved.'], 400);
            return;
        }

        $reservation = $reservationModel->create($body);

        $this->view->render($reservation, 201);
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

        $reservationModel = new ReservationModel();
        $uuid = Uuid::fromString($id);

        // Check if the reservation exists
        $reservation = $reservationModel->getById($uuid);
        if (!$reservation) {
            $this->view->render(['error' => 'Reservation not found'], 404);
            return;
        }

        // Validate and check for duplicate or conflicting item IDs
        if (!empty($body['items']) && is_array($body['items'])) {
            $newItemIds = array_map(fn($item) => $item['id'], $body['items']);
            $existingItemIds = $reservation->getItems();

            // Check if any new item already exists in the reservation
            $duplicateItems = array_intersect($newItemIds, $existingItemIds);
            if (!empty($duplicateItems)) {
                $this->view->render(['error' => 'One or more items already exist in the reservation'], 400);
                return;
            }

            // Check if any item is already in another reservation
            foreach ($newItemIds as $itemId) {
                if ($reservationModel->isItemInAnotherReservation($itemId, $uuid)) {
                    $this->view->render(['error' => "Item $itemId is already in another reservation"], 400);
                    return;
                }
            }

            // Merge existing and new items, ensuring no duplicates
            $mergedItemIds = array_unique(array_merge($existingItemIds, $newItemIds));

            // Validate all item IDs
            $placeholders = implode(',', array_fill(0, count($mergedItemIds), '?'));
            $stmt = $this->getPdo()->prepare("SELECT COUNT(*) FROM items WHERE id IN ($placeholders)");
            $stmt->execute($mergedItemIds);

            if ($stmt->fetchColumn() != count($mergedItemIds)) {
                $this->view->render(['error' => 'One or more item IDs do not exist'], 400);
                return;
            }

            // Update the body with the merged items
            $body['items'] = array_map(fn($id) => ['id' => $id], $mergedItemIds);
        }

        // Validate start_date and end_date
        if (!empty($body['start_date']) && !empty($body['end_date'])) {
            $startDate = strtotime($body['start_date']);
            $endDate = strtotime($body['end_date']);

            if ($startDate === false || $endDate === false) {
                $this->view->render(['error' => 'Invalid date format'], 400);
                return;
            }

            if ($endDate <= $startDate) {
                $this->view->render(['error' => 'End date must be after start date'], 400);
                return;
            }
        }

        // Validate status
        if (!empty($body['status']) && !in_array($body['status'], ['returned', 'rented', 'reserved'], true)) {
            $this->view->render(['error' => 'Invalid status. Allowed values are returned, rented, or reserved.'], 400);
            return;
        }

        $updated = $reservationModel->update($uuid, $body);

        if ($updated) {
            $this->view->render(['message' => 'Reservation updated']);
        } else {
            $this->view->render(['error' => 'Failed to update reservation'], 500);
        }
    }

    private function getPdo(): \PDO
    {
        return (new ReservationModel())->getPdo(); // Reuse the PDO instance from ReservationModel
    }

    public function delete(string $id): void
    {
        if (!$this->validateUuid($id)) {
            $this->view->render(['error' => 'Invalid UUID'], 400);
            return;
        }

        $reservationModel = new ReservationModel();
        $uuid = Uuid::fromString($id);

        $reservation = $reservationModel->getById($uuid);
        if (!$reservation) {
            $this->view->render(['error' => 'Reservation not found'], 404);
            return;
        }

        if ($reservationModel->delete($uuid)) {
            $this->view->render([], 204);
        } else {
            $this->view->render(['error' => 'Failed to delete reservation'], 500);
        }
    }

    public function deleteItemFromReservation(string $reservationId, string $itemId): void
    {
        if (!$this->validateUuid($reservationId) || !$this->validateUuid($itemId)) {
            $this->view->render(['error' => 'Invalid UUID for reservation or item'], 400);
            return;
        }

        $reservationModel = new ReservationModel();
        $reservationUuid = Uuid::fromString($reservationId);
        $itemUuid = Uuid::fromString($itemId);

        // Check if the reservation exists
        $reservation = $reservationModel->getById($reservationUuid);
        if (!$reservation) {
            $this->view->render(['error' => 'Reservation not found'], 404);
            return;
        }

        // Check if the item exists in the reservation
        $items = $reservation->getItems();
        if (!in_array($itemUuid->toString(), $items, true)) {
            $this->view->render(['error' => 'Item not found in reservation'], 404);
            return;
        }

        // Remove the item from the reservation
        if ($reservationModel->deleteItemFromReservation($reservationUuid, $itemUuid)) {
            $this->view->render(['message' => 'Item removed from reservation'], 200);
        } else {
            $this->view->render(['error' => 'Failed to remove item from reservation'], 500);
        }
    }

    public function addItemToReservation(string $reservationId): void
    {
        if (!$this->validateUuid($reservationId)) {
            $this->view->render(['error' => 'Invalid reservation ID'], 400);
            return;
        }

        $body = json_decode(file_get_contents('php://input'), true);

        if (!is_array($body) || empty($body['item_id']) || !$this->validateUuid($body['item_id'])) {
            $this->view->render(['error' => 'Invalid or missing item_id'], 400);
            return;
        }

        $reservationModel = new ReservationModel();
        $reservationUuid = Uuid::fromString($reservationId);

        // Check if the reservation exists
        $reservation = $reservationModel->getById($reservationUuid);
        if (!$reservation) {
            $this->view->render(['error' => 'Reservation not found'], 404);
            return;
        }

        $itemId = $body['item_id'];

        // Check if the item is already in the reservation
        if (in_array($itemId, $reservation->getItems(), true)) {
            $this->view->render(['error' => 'Item is already in the reservation'], 400);
            return;
        }

        // Check if the item is already in another reservation
        if ($reservationModel->isItemInAnotherReservation($itemId, $reservationUuid)) {
            $this->view->render(['error' => 'Item is already in another reservation'], 400);
            return;
        }

        // Validate if the item exists in the database
        $stmt = $this->getPdo()->prepare("SELECT COUNT(*) FROM items WHERE id = :id");
        $stmt->execute([':id' => $itemId]);
        if ($stmt->fetchColumn() == 0) {
            $this->view->render(['error' => 'Item does not exist'], 404);
            return;
        }

        // Add the item to the reservation
        if ($reservationModel->addItemToReservation($reservationUuid, Uuid::fromString($itemId))) {
            $this->view->render(['message' => 'Item added to reservation'], 200);
        } else {
            $this->view->render(['error' => 'Failed to add item to reservation'], 500);
        }
    }

    private function validateReservationData(array $data): array
    {
        $errors = [];

        if (empty($data['user_id']) || !Uuid::isValid($data['user_id'])) {
            $errors[] = 'User ID is required and must be a valid UUID.';
        }

        if (empty($data['items']) || !is_array($data['items'])) {
            $errors[] = 'Items are required and must be an array.';
        }

        if (empty($data['start_date']) || !strtotime($data['start_date'])) {
            $errors[] = 'Start date is required and must be a valid date.';
        }

        if (empty($data['end_date']) || !strtotime($data['end_date'])) {
            $errors[] = 'End date is required and must be a valid date.';
        }

        return $errors;
    }
}