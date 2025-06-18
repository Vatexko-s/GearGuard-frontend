'use client';

import React from 'react';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import useScroll from '@/app/hooks/useScroll';
import { cn } from '@/app/utils/helpFunctions';
import StaticLogo from '@/app/components/staticLogo';
import { useAuth } from '@/app/contexts/AuthContext';
import { useReservation } from '@/app/contexts/ReservationContext';

const Header = () => {
  const scrolled = useScroll(5);
  const selectedLayout = useSelectedLayoutSegment();
  const { username } = useAuth();
  const { currentReservation } = useReservation();

  return (
    <div
      className={cn(
        `sticky inset-x-0 top-0 z-30 w-full transition-all border-b border-gray-200`,
        {
          'border-b border-gray-200 bg-white/5 backdrop-blur-lg': scrolled,
          'border-b border-gray-200 bg-white': selectedLayout,
        }
      )}
    >
      <div className="flex h-[47px] items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="flex flex-row space-x-3 items-center justify-center md:hidden"
          >
            <StaticLogo />
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <span className="text-sm font-semibold text-gray-700">{username || 'Guest'}</span>
          <span className="text-sm font-semibold text-gray-700">
            {currentReservation ? `Reservation: ${currentReservation}` : 'No Reservation Selected'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Header;