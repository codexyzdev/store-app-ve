import { configureStore } from '@reduxjs/toolkit'
import uiSlice from './slices/uiSlice'
import clientesSlice from './slices/clientesSlice'
import financiamientosSlice from './slices/financiamientosSlice'
import cuotasAtrasadasSlice from './slices/cuotasAtrasadasSlice'

// Importaremos más slices aquí conforme los vayamos creando

export const store = configureStore({
  reducer: {
    ui: uiSlice,
    clientes: clientesSlice,
    financiamientos: financiamientosSlice,
    cuotasAtrasadas: cuotasAtrasadasSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store 