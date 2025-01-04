'use client'

import React from 'react'

import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'

import useScroll from '@/app/hooks/useScroll'
import { cn } from '@/app/utils/helpFunctions'
import StaticLogo from '@/app/components/staticLogo'

const Header = () => {
  const scrolled = useScroll(5)
  const selectedLayout = useSelectedLayoutSegment()

  return (
    <div
      className={cn(`sticky inset-x-0 top-0 z-30 w-full transition-all border-b border-gray-200`, {
        'border-b border-gray-200 bg-white/5 backdrop-blur-lg': scrolled,
        'border-b border-gray-200 bg-white': selectedLayout,
      })}
    >
      <div className='flex h-[47px] items-center justify-between px-4'>
        <div className='flex items-center space-x-4'>
          <Link href='/' className='flex flex-row space-x-3 items-center justify-center md:hidden'>
            <StaticLogo />
          </Link>
        </div>

        <div className='hidden md:block'>
          {/*TODO profil header*/}
          <div className='h-8 w-8 rounded-full bg-zinc-300 flex items-center justify-center text-center'>
            <span className='font-semibold text-sm'>VK</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
