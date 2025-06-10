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
        $item->setStatus($data['status']);
        $item->setUpdatedAt($data['updated_at']);

        return $item;
    }
}