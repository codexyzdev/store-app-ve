import { NextRequest, NextResponse } from 'next/server'

// Rutas que requieren autenticación
const protectedRoutes = [
  '/dashboard',
  '/clientes', 
  '/cobros-del-dia',
  '/cuotas-atrasadas',
  '/inventario',
  '/estadisticas',
  '/configuracion',
  '/financiamiento-cuota',
  '/api'
]

// Rutas públicas
const publicRoutes = ['/login', '/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Obtener token de las cookies
  const authToken = request.cookies.get('auth-token')?.value
  
  // Verificar si la ruta es protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Verificar si la ruta es pública
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  )
  
  // Si es ruta protegida y no hay token, redirigir al login
  if (isProtectedRoute && !authToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Si está autenticado y trata de acceder al login, redirigir al dashboard
  if (authToken && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}