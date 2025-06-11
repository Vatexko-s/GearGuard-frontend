<?php

namespace pwa\Service;

use pwa\Entity\Reservation;
use PDO;
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\UuidInterface;

class ReservationModel
{
    private PDO $pdo;

    public function __construct()
    {
        $dsn = sprintf(
            'pgsql:host=%s;port=%s;dbname=%s',
            getenv('POSTGRES_HOST') ?: 'localhost',
            getenv('POSTGRES_PORT') ?: 5432,
            getenv('POSTGRES_DB') ?: 'your_database'
        );

        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        $this->pdo = new PDO($dsn, getenv('POSTGRES_USER') ?: 'default_user', getenv('POSTGRES_PASSWORD') ?: 'default_password', $options);
    }

    public function getPdo(): \PDO
    {
        return $this->pdo;
    }

    public function getById(UuidInterface $id): ?Reservation
    {
        $stmt = $this->pdo->prepare("SELECT * FROM reservations WHERE id = :id");
        $stmt->execute([':id' => $id->toString()]);
        $data = $stmt->fetch();

        if ($data) {
            $data['items'] = $this->getItemsByReservationId($id);
            return $this->hydrateReservation($data);
        }

        return null;
    }

    public function getByUserId(UuidInterface $userId): array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM reservations WHERE user_id = :user_id");
        $stmt->execute([':user_id' => $userId->toString()]);
        $rows = $stmt->fetchAll();

        return array_map(function ($data) {
            $data['items'] = $this->getItemsByReservationId(Uuid::fromString($data['id']));
            return $this->hydrateReservation($data);
        }, $rows);
    }

    public function create(array $data): Reservation
    {
        $this->pdo->beginTransaction();

        try {
            // Insert into reservations table
            $stmt = $this->pdo->prepare(
                "INSERT INTO reservations (id, user_id, start_date, end_date, status)
             VALUES (:id, :user_id, :start_date, :end_date, :status) RETURNING id"
            );

            $reservationId = Uuid::uuid4();
            $stmt->execute([
                ':id' => $reservationId->toString(),
                ':user_id' => $data['user_id'],
                ':start_date' => $data['start_date'],
                ':end_date' => $data['end_date'],
                ':status' => $data['status'] ?? 'reserved',
            ]);

            // Extract item IDs from the items array
            $itemIds = array_map(fn($item) => $item['id'], $data['items']);

            // Insert into reservation_items table
            $itemStmt = $this->pdo->prepare(
                "INSERT INTO reservation_items (reservation_id, item_id) VALUES (:reservation_id, :item_id)"
            );

            foreach ($itemIds as $itemId) {
                $itemStmt->execute([
                    ':reservation_id' => $reservationId->toString(),
                    ':item_id' => $itemId,
                ]);
            }

            $this->pdo->commit();

            $data['id'] = $reservationId->toString();
            return $this->hydrateReservation($data);
        } catch (\Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    public function update(UuidInterface $id, array $data): bool
    {
        $this->pdo->beginTransaction();

        try {
            // Update the reservations table
            $sql = "UPDATE reservations SET start_date = :start_date, end_date = :end_date, status = :status WHERE id = :id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':id' => $id->toString(),
                ':start_date' => $data['start_date'] ?? null,
                ':end_date' => $data['end_date'] ?? null,
                ':status' => $data['status'] ?? null,
            ]);

            // Update the reservation_items table
            if (!empty($data['items']) && is_array($data['items'])) {
                // Extract item IDs from the items array
                $itemIds = array_map(fn($item) => $item['id'], $data['items']);

                // Get existing item IDs for the reservation
                $existingItemIds = $this->getItemsByReservationId($id);

                // Find new items to add
                $itemsToAdd = array_diff($itemIds, $existingItemIds);

                // Find items to remove
                $itemsToRemove = array_diff($existingItemIds, $itemIds);

                // Add new items
                $addStmt = $this->pdo->prepare(
                    "INSERT INTO reservation_items (reservation_id, item_id) VALUES (:reservation_id, :item_id)"
                );
                foreach ($itemsToAdd as $itemId) {
                    $addStmt->execute([
                        ':reservation_id' => $id->toString(),
                        ':item_id' => $itemId,
                    ]);
                }

                $removeStmt = $this->pdo->prepare(
                    "DELETE FROM reservation_items WHERE reservation_id = :reservation_id AND item_id = :item_id"
                );
                foreach ($itemsToRemove as $itemId) {
                    $removeStmt->execute([
                        ':reservation_id' => $id->toString(),
                        ':item_id' => $itemId,
                    ]);
                }
            }

            $this->pdo->commit();
            return true;
        } catch (\Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    public function delete(UuidInterface $id): bool
    {
        $this->pdo->beginTransaction();

        try {
            $itemStmt = $this->pdo->prepare("DELETE FROM reservation_items WHERE reservation_id = :reservation_id");
            $itemStmt->execute([':reservation_id' => $id->toString()]);

            $stmt = $this->pdo->prepare("DELETE FROM reservations WHERE id = :id");
            $stmt->execute([':id' => $id->toString()]);

            $this->pdo->commit();
            return $stmt->rowCount() > 0;
        } catch (\Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    public function deleteItemFromReservation(UuidInterface $reservationId, UuidInterface $itemId): bool
    {
        $stmt = $this->pdo->prepare(
            "DELETE FROM reservation_items WHERE reservation_id = :reservation_id AND item_id = :item_id"
        );
        $stmt->execute([
            ':reservation_id' => $reservationId->toString(),
            ':item_id' => $itemId->toString(),
        ]);

        return $stmt->rowCount() > 0;
    }

    private function getItemsByReservationId(UuidInterface $reservationId): array
    {
        $stmt = $this->pdo->prepare("SELECT item_id FROM reservation_items WHERE reservation_id = :reservation_id");
        $stmt->execute([':reservation_id' => $reservationId->toString()]);
        return array_column($stmt->fetchAll(), 'item_id');
    }

    public function getByUserIdAndStatuses(UuidInterface $userId, array $statuses): array
    {
        $placeholders = implode(',', array_fill(0, count($statuses), '?'));
        $sql = "SELECT * FROM reservations WHERE user_id = ? AND status IN ($placeholders)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(array_merge([$userId->toString()], $statuses));
        $rows = $stmt->fetchAll();

        return array_map(function ($data) {
            $data['items'] = $this->getItemsByReservationId(Uuid::fromString($data['id']));
            return $this->hydrateReservation($data);
        }, $rows);
    }

    public function isItemInAnotherReservation(string $itemId, ?UuidInterface $currentReservationId): bool
    {
        $query = "SELECT COUNT(*) FROM reservation_items WHERE item_id = :item_id";
        $params = [':item_id' => $itemId];

        if ($currentReservationId !== null) {
            $query .= " AND reservation_id != :reservation_id";
            $params[':reservation_id'] = $currentReservationId->toString();
        }

        $stmt = $this->pdo->prepare($query);
        $stmt->execute($params);

        return $stmt->fetchColumn() > 0;
    }

    public function addItemToReservation(UuidInterface $reservationId, UuidInterface $itemId): bool
    {
        $stmt = $this->pdo->prepare(
            "INSERT INTO reservation_items (reservation_id, item_id) VALUES (:reservation_id, :item_id)"
        );

        return $stmt->execute([
            ':reservation_id' => $reservationId->toString(),
            ':item_id' => $itemId->toString(),
        ]);
    }

    private function hydrateReservation(array $data): Reservation
    {
        $reservation = new Reservation();
        $reservation->setId(Uuid::fromString($data['id']));
        $reservation->setUserId(Uuid::fromString($data['user_id']));
        $reservation->setStartDate($data['start_date']);
        $reservation->setEndDate($data['end_date']);
        $reservation->setStatus($data['status']);
        $reservation->setItems($data['items'] ?? []);

        return $reservation;
    }
}