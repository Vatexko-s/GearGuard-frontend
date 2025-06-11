<?php

namespace pwa\Entity;

use Ramsey\Uuid\UuidInterface;

class Reservation implements \JsonSerializable
{
    private UuidInterface $id;
    private UuidInterface $userId;
    private array $items = [];
    private string $startDate;
    private string $endDate;
    private string $status;

    public function getId(): UuidInterface
    {
        return $this->id;
    }

    public function setId(UuidInterface $id): void
    {
        $this->id = $id;
    }

    public function getUserId(): UuidInterface
    {
        return $this->userId;
    }

    public function setUserId(UuidInterface $userId): void
    {
        $this->userId = $userId;
    }

    public function getItems(): array
    {
        return $this->items;
    }

    public function setItems(array $items): void
    {
        $this->items = $items;
    }

    public function getStartDate(): string
    {
        return $this->startDate;
    }

    public function setStartDate(string $startDate): void
    {
        $this->startDate = $startDate;
    }

    public function getEndDate(): string
    {
        return $this->endDate;
    }

    public function setEndDate(string $endDate): void
    {
        $this->endDate = $endDate;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): void
    {
        $this->status = $status;
    }

    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id->toString(),
            'user_id' => $this->userId->toString(),
            'items' => $this->items,
            'start_date' => $this->startDate,
            'end_date' => $this->endDate,
            'status' => $this->status,
        ];
    }
}