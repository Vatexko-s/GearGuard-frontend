'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ReservationContextType {
  currentReservation: string | null;
  startDate: string | null;
  endDate: string | null;
  setCurrentReservation: (reservationId: string | null, startDate?: string | null, endDate?: string | null) => void;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export const ReservationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentReservation, setCurrentReservation] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const updateReservation = (reservationId: string | null, startDate?: string | null, endDate?: string | null) => {

    setCurrentReservation(reservationId);
    setStartDate(startDate || null);
    setEndDate(endDate || null);
  };

  return (
    <ReservationContext.Provider value={{ currentReservation, startDate, endDate, setCurrentReservation: updateReservation }}>
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservation = (): ReservationContextType => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
};