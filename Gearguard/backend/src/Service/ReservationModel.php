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
                ':status' => $data['status'] ?? 'Reserved',
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

    public function updateStatus(UuidInterface $id, string $status): bool
    {
        $stmt = $this->pdo->prepare("UPDATE reservations SET status = :status WHERE id = :id");
        $stmt->execute([
            ':id' => $id->toString(),
            ':status' => $status,
        ]);

        return $stmt->rowCount() > 0;
    }

    public function delete(UuidInterface $id): bool
    {
        $this->pdo->beginTransaction();

        try {
            // Delete records from item_availability table
            $availabilityStmt = $this->pdo->prepare("DELETE FROM item_availability WHERE reservation_id = :reservation_id");
            $availabilityStmt->execute([':reservation_id' => $id->toString()]);

            // Delete records from reservation_items table
            $itemStmt = $this->pdo->prepare("DELETE FROM reservation_items WHERE reservation_id = :reservation_id");
            $itemStmt->execute([':reservation_id' => $id->toString()]);

            // Delete the reservation itself
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
        if (empty($statuses)) {
            error_log('Statuses array is empty.');
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($statuses), '?'));
        $sql = "SELECT * FROM reservations WHERE user_id = ? AND status IN ($placeholders)";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(array_merge([$userId->toString()], $statuses));
            $rows = $stmt->fetchAll();

            if (empty($rows)) {
                error_log('No reservations found for user_id: ' . $userId->toString());
                return [];
            }

            return array_map(function ($data) {
                $data['items'] = $this->getItemsByReservationId(Uuid::fromString($data['id']));
                return $this->hydrateReservation($data);
            }, $rows);
        } catch (\PDOException $e) {
            error_log('Database error: ' . $e->getMessage());
            return [];
        }
    }

    public function isItemInAnotherReservation(string $itemId, ?UuidInterface $currentReservationId, string $startDate, string $endDate): bool
    {
        $query = "
        SELECT COUNT(*) 
        FROM reservation_items ri
        JOIN reservations r ON ri.reservation_id = r.id
        WHERE ri.item_id = :item_id
          AND r.start_date < :end_date
          AND r.end_date > :start_date
          AND r.status != 'Returned'
    ";
        $params = [
            ':item_id' => $itemId,
            ':start_date' => $startDate,
            ':end_date' => $endDate,
        ];

        if ($currentReservationId !== null) {
            $query .= " AND ri.reservation_id != :reservation_id";
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

    public function getItemsWithDetailsByReservationId(UuidInterface $reservationId): array
    {
        $sql = "
        SELECT i.id, i.category, i.name, i.description, ia.state AS status
        FROM items i
        JOIN reservation_items ri ON i.id = ri.item_id
        JOIN reservations r ON ri.reservation_id = r.id
        JOIN item_availability ia ON i.id = ia.item_id
        WHERE ri.reservation_id = :reservation_id
          AND ia.start_date <= r.end_date
          AND ia.end_date >= r.start_date
    ";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':reservation_id' => $reservationId->toString()]);
        return $stmt->fetchAll();
    }
}