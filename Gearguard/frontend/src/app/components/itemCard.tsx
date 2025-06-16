import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useToast } from '@/app/contexts/ToastService';
import { useAuth } from '@/app/contexts/AuthContext';
import { CheckCircle, AlertCircle } from 'react-feather';

interface ItemCardProps {
    name: string;
    description: string;
    category: string;
    status: 'Available' | 'Not available' | 'Reserved';
    updatedAt: string;
    itemId: string;
}

const categoryIcons: Record<string, JSX.Element> = {
    microphones: <Icon icon="lucide:mic" width="24" height="24" />,
    cables: <Icon icon="lucide:cable" width="24" height="24" />,
    accessories: <Icon icon="lucide:box" width="24" height="24" />,
    speakers: <Icon icon="lucide:speaker" width="24" height="24" />,
};

const ItemCard: React.FC<ItemCardProps> = ({ name, description, category, status, updatedAt, itemId }) => {
    const toast = useToast();
    const { token } = useAuth();
    const [reservations, setReservations] = useState<{ id: string; status: string }[]>([]);
    const [selectedReservation, setSelectedReservation] = useState<string | null>(null);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8081/api/v1/reservations', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch reservations');
                }

                const data = await response.json();
                setReservations(data);
            } catch (err) {
                toast?.open(
                    <div className="flex gap-2 bg-red-300 p-4 rounded-lg shadow-lg">
                        <AlertCircle size={40} />
                        <div>
                            <h3 className="font-bold">Error</h3>
                            <p className="text-sm">{err instanceof Error ? err.message : 'An unknown error occurred'}</p>
                        </div>
                    </div>
                );
            }
        };

        if (token) {
            fetchReservations();
        }
    }, [token]);

    const handleAddToReservation = async () => {
        if (!selectedReservation) {
            toast?.open(
                <div className="flex gap-2 bg-yellow-300 p-4 rounded-lg shadow-lg">
                    <AlertCircle size={40} />
                    <div>
                        <h3 className="font-bold">Warning</h3>
                        <p className="text-sm">Please select a reservation</p>
                    </div>
                </div>
            );
            return;
        }

        try {
            const addItemResponse = await fetch(
                `http://127.0.0.1:8081/api/v1/reservations/${selectedReservation}/items`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ item_id: itemId }),
                }
            );

            if (!addItemResponse.ok) {
                throw new Error('Failed to add item to reservation');
            }

            const updateStatusResponse = await fetch(
                `http://127.0.0.1:8081/api/v1/items/${itemId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status: 'reserved' }),
                }
            );

            if (!updateStatusResponse.ok) {
                throw new Error('Failed to update item status');
            }

            toast?.open(
                <div className="flex gap-2 bg-orange-300 p-4 rounded-lg shadow-lg">
                    <CheckCircle size={40} />
                    <div>
                        <h3 className="font-bold">Success</h3>
                        <p className="text-sm">Item added to reservation and status updated to reserved</p>
                    </div>
                </div>
            );
        } catch (err) {
            toast?.open(
                <div className="flex gap-2 bg-red-300 p-4 rounded-lg shadow-lg">
                    <AlertCircle size={40} />
                    <div>
                        <h3 className="font-bold">Error</h3>
                        <p className="text-sm">{err instanceof Error ? err.message : 'An unknown error occurred'}</p>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="flex flex-col justify-start items-center w-80 h-45 border border-zinc-500 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 mt-4">
                {categoryIcons[category] || <Icon icon="lucide:box" width="24" height="24" />}
                <h3 className="text-xl font-bold">{name}</h3>
            </div>
            <div className="flex flex-col items-center w-full mt-4">
                <p className="text-sm text-center">{description}</p>
                <p className={`${status === 'Available' ? 'text-green-500' : status === 'Reserved' ? 'text-orange-500' : 'text-red-500'}`}>
                    {status === 'Available' ? 'Available' : status === 'Reserved' ? 'Reserved' : 'Not available'}
                </p>
                <p className="text-xs text-gray-500">Last updated: {new Date(updatedAt).toLocaleString()}</p>
            </div>
            {reservations.length > 0 && (
                <select
                    className="mt-4 px-4 py-2 border rounded"
                    value={selectedReservation || ''}
                    onChange={(e) => setSelectedReservation(e.target.value)}
                >
                    <option value="" disabled>
                        Select a reservation
                    </option>
                    {reservations.map((reservation) => (
                        <option key={reservation.id} value={reservation.id}>
                            {reservation.id} ({reservation.status})
                        </option>
                    ))}
                </select>
            )}
            <button
                className="px-6 py-3 border border-zinc-500 rounded-lg bg-blue-100 text-white text-lg font-semibold mt-4 mb-5 hover:bg-blue-200 focus:ring-4 focus:ring-blue-300 shadow-lg transform hover:scale-105 transition-transform duration-300 flex justify-center items-center"
                type="button"
                onClick={handleAddToReservation}
            >
                <Icon icon="lucide:plus" width="28" height="28" color="gray" />
            </button>
        </div>
    );
};

export default ItemCard;