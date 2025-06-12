import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './index'

// Hooks tipados para usar en lugar de useDispatch y useSelector directamente
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>() 