import { 
  getAuth, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from './config'

export const auth = getAuth()

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  role: 'admin' | 'manager' | 'cajero' | 'cobrador'
  permissions: string[]
  createdAt: number
  lastLogin: number
  isActive: boolean
}

export const ROLE_PERMISSIONS = {
  admin: [
    'read:all', 'write:all', 'delete:all',
    'manage:users', 'view:reports', 'manage:system'
  ],
  manager: [
    'read:all', 'write:most', 
    'manage:inventory', 'manage:clients', 'manage:financing',
    'view:reports', 'manage:collections'
  ],
  cajero: [
    'read:clients', 'write:clients', 
    'read:financing', 'write:financing',
    'read:transactions', 'write:transactions'
  ],
  cobrador: [
    'read:clients', 'read:financing',
    'read:collections', 'write:collections',
    'update:payments'
  ]
}

// Obtener perfil del usuario
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid)
    const snapshot = await getDoc(userRef)
    
    if (snapshot.exists()) {
      return snapshot.data() as UserProfile
    }
    
    return null
  } catch (error) {
    console.error('Error obteniendo perfil:', error)
    return null
  }
}

// Actualizar último login
export async function updateLastLogin(uid: string) {
  try {
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, { lastLogin: Date.now() })
  } catch (error) {
    console.error('Error actualizando último login:', error)
  }
}

// Función de login
export async function loginUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    await updateLastLogin(userCredential.user.uid)
    return { success: true, user: userCredential.user }
  } catch (error: any) {
    return { 
      success: false, 
      error: getErrorMessage(error.code) 
    }
  }
}

// Función de logout
export async function logoutUser() {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error al cerrar sesión' }
  }
}

// Mensajes de error en español
function getErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/invalid-email': 'Email inválido',
    'auth/user-disabled': 'Usuario deshabilitado',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/invalid-credential': 'Email o contraseña incorrectos'
  }
  
  return errorMessages[errorCode] || 'Error de autenticación'
} 