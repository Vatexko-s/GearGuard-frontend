'use client';

import React from 'react';

interface Item {
    id: string;
    name: string;
    status: string;
}

interface ItemProps {
    item: Item;
}

const Item: React.FC<ItemProps> = ({ item }) => {
    return (
        <div className="flex items-center gap-2 p-2 border rounded shadow">
            <span className="font-semibold">{item.name}</span>
            <p className={`${item.status === 'Available' ? 'text-green-500' : item.status === 'reserved' ? 'text-orange-500' : 'text-red-500'}`}>
                {item.status === 'Available' ? 'Available' : item.status === 'reserved' ? 'Reserved' : 'Not Available'}
            </p>
        </div>
    );
};

export default Item;