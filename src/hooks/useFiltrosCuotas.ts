import { useState, useMemo } from "react";
import { FinanciamientoConDatos } from "./useCuotasAtrasadas";

export function useFiltrosCuotas(financiamientos: FinanciamientoConDatos[]) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroSeveridad, setFiltroSeveridad] = useState<
    "todos" | "baja" | "media" | "alta" | "critica"
  >("todos");
  const [vistaCompacta, setVistaCompacta] = useState(false);

  const financiamientosFiltrados = useMemo(() => {
    return financiamientos.filter((item) => {
      // Filtro por severidad
      if (filtroSeveridad !== "todos" && item.severidad !== filtroSeveridad) {
        return false;
      }

      // Filtro por búsqueda
      if (busqueda) {
        const textoBusqueda = busqueda.toLowerCase();
        return (
          item.cliente.nombre.toLowerCase().includes(textoBusqueda) ||
          item.cliente.cedula.includes(textoBusqueda) ||
          item.cliente.telefono.includes(textoBusqueda) ||
          item.producto.nombre.toLowerCase().includes(textoBusqueda) ||
          item.numeroControl.toString().includes(textoBusqueda)
        );
      }

      return true;
    });
  }, [financiamientos, busqueda, filtroSeveridad]);

  const financiamientosOrdenados = useMemo(() => {
    return financiamientosFiltrados.sort((a, b) => {
      const ordenSeveridad = { critica: 4, alta: 3, media: 2, baja: 1 };
      if (ordenSeveridad[a.severidad] !== ordenSeveridad[b.severidad]) {
        return ordenSeveridad[b.severidad] - ordenSeveridad[a.severidad];
      }
      return b.cuotasAtrasadas - a.cuotasAtrasadas;
    });
  }, [financiamientosFiltrados]);

  return {
    busqueda,
    setBusqueda,
    filtroSeveridad,
    setFiltroSeveridad,
    vistaCompacta,
    setVistaCompacta,
    financiamientosOrdenados,
  };
} 