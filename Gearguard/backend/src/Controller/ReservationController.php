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
        $statuses = ['Returned'];
        $reservations = $reservationModel->getByUserIdAndStatuses($uuid, $statuses);

        // Add items_ids to each reservation
        $reservationsWithItems = array_map(function ($reservation) {
            return [
                'id' => $reservation->getId()->toString(),
                'user_id' => $reservation->getUserId()->toString(),
                'start_date' => $reservation->getStartDate(),
                'end_date' => $reservation->getEndDate(),
                'status' => $reservation->getStatus(),
                'items_ids' => $reservation->getItems(),
            ];
        }, $reservations);

        $this->view->render($reservationsWithItems);
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
        $statuses = ['Reserved', 'Rented'];
        $reservations = $reservationModel->getByUserIdAndStatuses($uuid, $statuses);

        // Ensure an empty array is returned if no reservations are found
        $this->view->render($reservations ?: []);
    }

    public function create(): void
    {
        $body = json_decode(file_get_contents('php://input'), true);

        if (!is_array($body)) {
            $this->view->render(['error' => 'Invalid request body'], 400);
            return;
        }

        // Get user_id from token
        $userId = $this->getUserIdFromToken();

        if (!$userId || !$this->validateUuid($userId)) {
            $this->view->render(['error' => 'Invalid or missing user ID in token'], 400);
            return;
        }

        $stmt = $this->getPdo()->prepare("SELECT COUNT(*) FROM users WHERE id = :id");
        $stmt->execute([':id' => $userId]);
        if ($stmt->fetchColumn() == 0) {
            $this->view->render(['error' => 'User does not exist'], 404);
            return;
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
        if (empty($body['status'])) {
            $body['status'] = 'Reserved';
        } elseif (!in_array($body['status'], ['returned', 'rented', 'reserved'], true)) {
            $this->view->render(['error' => 'Invalid status. Allowed values are returned, rented, or reserved.'], 400);
            return;
        }

        // Add user_id to the request body
        $body['user_id'] = $userId;

        // Ensure items are optional
        $body['items'] = $body['items'] ?? [];

        $reservationModel = new ReservationModel();
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
        // Validate the UUID format of the reservation ID
        if (!$this->validateUuid($id)) {
            $this->view->render(['error' => 'Invalid UUID'], 400);
            return;
        }

        // Get user ID from the token
        $userId = $this->getUserIdFromToken();
        if (!$userId || !$this->validateUuid($userId)) {
            $this->view->render(['error' => 'Invalid or missing user ID in token'], 400);
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

        // Ensure the user is authorized to delete the reservation
        if ($reservation->getUserId()->toString() !== $userId) {
            $this->view->render(['error' => 'Unauthorized to delete this reservation'], 403);
            return;
        }

        // Proceed with deletion
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

        // Validate token and get user ID
        $userId = $this->getUserIdFromToken();
        if (!$userId || !$this->validateUuid($userId)) {
            $this->view->render(['error' => 'Invalid or missing user ID in token'], 401);
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

        // Check if the reservation is owned by the user
        if ($reservation->getUserId()->toString() !== $userId) {
            $this->view->render(['error' => 'Unauthorized to modify this reservation'], 403);
            return;
        }

        // Ensure the reservation status is "reserved"
        if ($reservation->getStatus() !== 'Reserved') {
            $this->view->render(['error' => 'Reservation must be in "reserved" status'], 400);
            return;
        }

        // Check if the item exists in the reservation
        $items = $reservation->getItems();
        if (!in_array($itemUuid->toString(), $items, true)) {
            $this->view->render(['error' => 'Item not found in reservation'], 404);
            return;
        }

        // Remove the item from the reservation
        $itemDeleted = $reservationModel->deleteItemFromReservation($reservationUuid, $itemUuid);
        if (!$itemDeleted) {
            $this->view->render(['error' => 'Failed to remove item from reservation'], 500);
            return;
        }

        // Delete the item availability record
        $availabilityStmt = $reservationModel->getPdo()->prepare(
            "DELETE FROM item_availability WHERE item_id = :item_id AND reservation_id = :reservation_id"
        );
        $availabilityStmt->execute([
            ':item_id' => $itemUuid->toString(),
            ':reservation_id' => $reservationUuid->toString(),
        ]);

        if ($availabilityStmt->rowCount() === 0) {
            $this->view->render(['error' => 'Failed to delete item availability record'], 500);
            return;
        }

        $this->view->render(['message' => 'Item removed from reservation and availability record deleted'], 200);
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
        if ($reservationModel->isItemInAnotherReservation(
            $itemId,
            $reservationUuid,
            $reservation->getStartDate(),
            $reservation->getEndDate()
        )) {
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
        if (!$reservationModel->addItemToReservation($reservationUuid, Uuid::fromString($itemId))) {
            $this->view->render(['error' => 'Failed to add item to reservation'], 500);
            return;
        }

        // Create a record in the item_availability table
        $availabilityStmt = $this->getPdo()->prepare(
            "INSERT INTO item_availability (item_id, reservation_id, start_date, end_date, state)
         VALUES (:item_id, :reservation_id, :start_date, :end_date, :state)"
        );

        $availabilitySuccess = $availabilityStmt->execute([
            ':item_id' => $itemId,
            ':reservation_id' => $reservationId,
            ':start_date' => $reservation->getStartDate(),
            ':end_date' => $reservation->getEndDate(),
            ':state' => 'Reserved',
        ]);

        if (!$availabilitySuccess) {
            $this->view->render(['error' => 'Failed to create item availability record'], 500);
            return;
        }

        $this->view->render(['message' => 'Item added to reservation and availability record created'], 201);
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

    public function rent(string $id): void
    {
        // Validate the UUID format of the reservation ID
        if (!$this->validateUuid($id)) {
            $this->view->render(['error' => 'Invalid UUID'], 400);
            return;
        }

        // Get user ID from the token
        $userId = $this->getUserIdFromToken();
        if (!$userId || !$this->validateUuid($userId)) {
            $this->view->render(['error' => 'Invalid or missing user ID in token'], 400);
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

        // Ensure the user is authorized to rent the reservation
        if ($reservation->getUserId()->toString() !== $userId) {
            $this->view->render(['error' => 'Unauthorized to rent this reservation'], 403);
            return;
        }

        // Validate that the reservation can only be rented one day before the start date
        //$currentDate = strtotime(date('Y-m-d'));
        //$reservationStartDate = strtotime($reservation->getStartDate());
        //$daysDifference = ($reservationStartDate - $currentDate) / (60 * 60 * 24);
        //
        //if ($daysDifference !== 1) {
        //    $this->view->render(['error' => 'Reservation can only be rented one day before the start date'], 400);
        //    return;
        //}

        // Update the reservation status to "rented"
        if (!$reservationModel->updateStatus($uuid, 'Rented')) {
            $this->view->render(['error' => 'Failed to update reservation status'], 500);
            return;
        }

        // Update the status of items in the reservation during the specified time
        $items = $reservation->getItems();
        if (!empty($items)) {
            $pdo = $this->getPdo();
            foreach ($items as $itemId) {
                $stmt = $pdo->prepare(
                    "UPDATE item_availability
                 SET state = :state
                 WHERE item_id = :item_id
                   AND reservation_id = :reservation_id
                   AND start_date <= :end_date
                   AND end_date >= :start_date"
                );
                $stmt->execute([
                    ':item_id' => $itemId,
                    ':reservation_id' => $uuid->toString(),
                    ':start_date' => $reservation->getStartDate(),
                    ':end_date' => $reservation->getEndDate(),
                    ':state' => 'Not Available',
                ]);
            }
        }

        $this->view->render(['message' => 'Reservation rented successfully'], 200);
    }

    public function getItemsByReservation(string $reservationID): void
    {
        if (!$this->validateUuid($reservationID)) {
            $this->view->render(['error' => 'Invalid reservation ID'], 400);
            return;
        }

        $reservationModel = new \pwa\Service\ReservationModel();
        $uuid = \Ramsey\Uuid\Uuid::fromString($reservationID);

        $items = $reservationModel->getItemsWithDetailsByReservationId($uuid);
        if (empty($items)) {
            $this->view->render(['error' => 'No items found for the reservation'], 404);
            return;
        }

        $this->view->render($items);
    }

    public function returnReservation(string $id): void
    {
        if (!$this->validateUuid($id)) {
            $this->view->render(['error' => 'Invalid UUID'], 400);
            return;
        }

        $userId = $this->getUserIdFromToken();
        if (!$userId || !$this->validateUuid($userId)) {
            $this->view->render(['error' => 'Invalid or missing user ID in token'], 400);
            return;
        }

        $reservationModel = new ReservationModel();
        $uuid = Uuid::fromString($id);

        $reservation = $reservationModel->getById($uuid);
        if (!$reservation) {
            $this->view->render(['error' => 'Reservation not found'], 404);
            return;
        }

        if ($reservation->getUserId()->toString() !== $userId) {
            $this->view->render(['error' => 'Unauthorized to return this reservation'], 403);
            return;
        }

        if ($reservation->getStatus() === 'Returned') {
            $this->view->render(['error' => 'Reservation is already returned'], 400);
            return;
        }

        if (!$reservationModel->updateStatus($uuid, 'Returned')) {
            $this->view->render(['error' => 'Failed to update reservation status'], 500);
            return;
        }

        $this->view->render(['message' => 'Reservation returned successfully'], 200);
    }
}