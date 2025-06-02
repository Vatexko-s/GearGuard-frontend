'use client'

import React, { useState } from 'react'
import AnimatedLogo from '@/app/components/animatedLogo'
import LoginSampleData from '../../../../public/samples/loginsamples.json'
import { useRouter } from 'next/navigation'

const authentication = (email: string, password: string) => {
  return LoginSampleData.some(user => user.email === email && user.password === password)
}

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const LoginFunctionality = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (authentication(email, password)) {
      setError('')
      router.push('/dashboard')
    } else {
      setError('failed to sign in')
      alert(error)
    }
  }

  return (
    <div className='w-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800'>
      <div className='px-6 py-4'>
        <div className='flex justify-center mx-auto'>
          <AnimatedLogo />
        </div>

        <h3 className='mt-3 text-xl font-medium text-center text-gray-600 dark:text-gray-200'>
          Welcome Back
        </h3>

        <form>
          <div className='w-full mt-4'>
            <input
              className='block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-500 bg-white border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-blue-300'
              type='email'
              placeholder='Email Address'
              aria-label='Email Address'
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className='w-full mt-4'>
            <input
              className='block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-500 bg-white border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-blue-300'
              type='password'
              placeholder='Password'
              aria-label='Password'
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div className='flex items-center justify-between mt-4'>
            <a href='#' className='text-sm text-gray-600 dark:text-gray-200 hover:text-gray-500'>
              Forget Password?
            </a>

            <button
              onClick={LoginFunctionality}
              className='px-6 py-2 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50'
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
