'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth, getUserProfile, UserProfile } from '@/lib/firebase/auth'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isManager: boolean
  canManageInventory: boolean
  canManageCollections: boolean
  canViewReports: boolean
  canManageUsers: boolean
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        
        const profile = await getUserProfile(firebaseUser.uid)
        if (profile && profile.isActive) {
          setUserProfile(profile)
        } else {
          setUserProfile(null)
          setUser(null)
        }
      } else {
        setUser(null)
        setUserProfile(null)
      }
      
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  const hasPermission = (permission: string): boolean => {
    if (!userProfile) return false
    return userProfile.permissions.includes(permission) || 
           userProfile.permissions.includes('write:all')
  }

  const value: AuthContextType = {
    user,
    userProfile,
    isLoading,
    isAuthenticated: !!user && !!userProfile,
    isAdmin: userProfile?.role === 'admin',
    isManager: ['admin', 'manager'].includes(userProfile?.role || ''),
    canManageInventory: ['admin', 'manager'].includes(userProfile?.role || ''),
    canManageCollections: ['admin', 'manager', 'cobrador'].includes(userProfile?.role || ''),
    canViewReports: ['admin', 'manager'].includes(userProfile?.role || ''),
    canManageUsers: userProfile?.role === 'admin',
    hasPermission
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
} 