import React from 'react'
import Image from "next/image";

interface ItemCardProps {
    availableItems: number,
    availability: boolean,
}

const ItemCard: React.FC<ItemCardProps> = ({availableItems, availability}) => {
    return (
        <div
            className="flex flex-col justify-start items-center w-64 h-64 border-dashed border border-zinc-500 rounded-lg">
            <Image
                src=''
                alt='Image'
                className='m-0 rounded-lg w-full h-48 object-cover'
                width={0}
                height={0}
            />
            <div className="flex flex-row justify-around w-full">
                <p className="">{availableItems} Items</p>
                <p className={`${availability ? 'text-green-400' : 'text-rose-700'}`}>{availability ? 'Available' : 'Not Available'}</p>
            </div>
            <button className="p-2 border-dashed border border-zinc-500 rounded-lg " type="button">Add to reservation
            </button>
        </div>
    )
}

export default ItemCard