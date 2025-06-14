import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/store";

// Selector base
const selectFinanciamientoState = (state: RootState) => state.financiamientos;

// Listas y datos memoizados
export const selectFinanciamientos = createSelector(
  selectFinanciamientoState,
  (fin) => fin.financiamientos
);

export const selectFinanciamientosFiltrados = createSelector(
  selectFinanciamientoState,
  (fin) => fin.financiamientosFiltrados
);

export const selectFinanciamientosEstadisticas = createSelector(
  selectFinanciamientoState,
  (fin) => fin.estadisticas
); 