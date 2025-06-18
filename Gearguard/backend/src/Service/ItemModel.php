<?php

namespace pwa\Service;

use pwa\Entity\Item;
use PDO;
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\UuidInterface;

class ItemModel
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

    public function getById(UuidInterface $id): ?Item
    {
        $stmt = $this->pdo->prepare("SELECT * FROM items WHERE id = :id");
        $stmt->execute([':id' => $id->toString()]);
        $data = $stmt->fetch();

        return $data ? $this->hydrateItem($data) : null;
    }

    public function getByCategory(string $category): array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM items WHERE category = :category");
        $stmt->execute([':category' => $category]);
        $rows = $stmt->fetchAll();

        return array_map([$this, 'hydrateItem'], $rows);
    }

    public function getAllCategories(): array
    {
        $stmt = $this->pdo->query("SELECT DISTINCT category FROM items");
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    public function create(array $itemData): Item
    {
        $item = $this->hydrateItem($itemData);
        $item->setId(Uuid::uuid4());

        $sql = "INSERT INTO items (id, name, description, category, status, updated_at) VALUES (:id, :name, :description, :category, :status, :updated_at)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':id' => $item->getId()->toString(),
            ':name' => $item->getName(),
            ':description' => $item->getDescription(),
            ':category' => $item->getCategory(),
            ':status' => $item->getStatus(),
            ':updated_at' => $item->getUpdatedAt(),
        ]);

        return $item;
    }

    public function update(UuidInterface $id, array $itemData): bool
    {
        $sql = "UPDATE items SET name = :name, description = :description, category = :category, status = :status, updated_at = :updated_at WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute([
            ':id' => $id->toString(),
            ':name' => $itemData['name'],
            ':description' => $itemData['description'],
            ':category' => $itemData['category'],
            ':status' => $itemData['status'],
            ':updated_at' => $itemData['updated_at'],
        ]);
    }

    public function delete(UuidInterface $id): bool
    {
        $stmt = $this->pdo->prepare("DELETE FROM items WHERE id = :id");
        $stmt->execute([':id' => $id->toString()]);
        return $stmt->rowCount() > 0;
    }

    private function hydrateItem(array $data): Item
    {
        $item = new Item();
        $item->setId(Uuid::fromString($data['id']));
        $item->setName($data['name']);
        $item->setDescription($data['description']);
        $item->setCategory($data['category']);
        $item->setStatus($data['status'] ?? 'Available'); // Default to "Available" if status is missing
        $item->setUpdatedAt($data['updated_at'] ?? date('Y-m-d H:i:s')); // Default to current timestamp if missing

        return $item;
    }

    public function getAvailabilityByCategory(string $category, string $startDate, string $endDate): array
    {
        $sql = "
        SELECT i.id, i.name, i.description, i.category, 
               COALESCE(
                   MAX(
                       CASE
                           WHEN ia.start_date <= :end_date AND ia.end_date >= :start_date THEN ia.state
                           ELSE NULL
                       END
                   ),
                   'Available'
               ) AS state
        FROM items i
        LEFT JOIN item_availability ia ON i.id = ia.item_id
        WHERE i.category = :category
        GROUP BY i.id, i.name, i.description, i.category
    ";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':category' => $category,
            ':start_date' => $startDate,
            ':end_date' => $endDate,
        ]);

        $rows = $stmt->fetchAll();

        return array_map(function ($row) {
            $item = $this->hydrateItem($row);
            $item->setStatus($row['state']); // Set status based on availability
            return $item;
        }, $rows);
    }
}