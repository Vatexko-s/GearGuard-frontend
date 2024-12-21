'use client'

import { createContext, useContext, PropsWithChildren, useState } from 'react'

interface AuthContext {
  user: string | undefined
  authIsReady: boolean
  isLoggedIn: boolean
}

const AuthContext = createContext<AuthContext>({
  user: undefined,
  authIsReady: false,
  isLoggedIn: false,
})

export const AuthContextProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<string | undefined>('Jožko')
  const [authIsReady, setAuthIsReady] = useState<boolean>(true)
  const isLoggedIn = user !== undefined

  return (
    <AuthContext.Provider value={{ user, authIsReady, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuthContext must be used within LoadingAuthProvider')
  }

  return context
}
