"use client";

import React, { useEffect, useState } from "react";
import {
  cobrosDB,
  Cobro,
  clientesDB,
  Cliente,
  prestamosDB,
  Prestamo,
  inventarioDB,
  Producto,
} from "@/lib/firebase/database";
import ResumenCobros from "@/components/cobranza/ResumenCobros";
import TablaCobros from "@/components/cobranza/TablaCobros";
import ResumenCuotasPendientes from "@/components/cobranza/ResumenCuotasPendientes";

interface GrupoCobros {
  clienteId: string;
  nombre: string;
  cedula: string;
  cobros: Cobro[];
}

export default function CobrosDelDiaPage() {
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubCobros = cobrosDB.suscribir((data) => {
      // Filtrar solo los cobros de hoy
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const cobrosHoy = data.filter((cobro) => {
        const fechaCobro = new Date(cobro.fecha);
        return fechaCobro >= hoy;
      });
      setCobros(cobrosHoy);
      setLoading(false);
    });
    const unsubClientes = clientesDB.suscribir(setClientes);
    const unsubPrestamos = prestamosDB.suscribir(setPrestamos);
    const unsubProductos = inventarioDB.suscribir(setProductos);

    return () => {
      unsubCobros();
      unsubClientes();
      unsubPrestamos();
      unsubProductos();
    };
  }, []);

  const getClienteNombre = (id: string) => {
    const cliente = clientes.find((c: Cliente) => c.id === id);
    return cliente ? cliente.nombre : "-";
  };

  const getClienteCedula = (id: string) => {
    const cliente = clientes.find((c: Cliente) => c.id === id);
    return cliente ? cliente.cedula : "";
  };

  // Agrupar cobros por cliente
  const cobrosAgrupados = cobros.reduce(
    (acc: Record<string, GrupoCobros>, cobro: Cobro) => {
      const prestamo = prestamos.find(
        (p: Prestamo) => p.id === cobro.prestamoId
      );
      if (!prestamo) return acc;

      const clienteId = prestamo.clienteId;
      if (!acc[clienteId]) {
        acc[clienteId] = {
          clienteId,
          nombre: getClienteNombre(clienteId),
          cedula: getClienteCedula(clienteId),
          cobros: [],
        };
      }
      acc[clienteId].cobros.push(cobro);
      return acc;
    },
    {}
  );

  const cobrosAgrupadosArray: GrupoCobros[] = Object.values(cobrosAgrupados);

  // Calcular totales
  const totalCobros = cobros.length;
  const montoTotal = cobros.reduce(
    (sum: number, cobro: Cobro) => sum + cobro.monto,
    0
  );

  return (
    <div className='p-4 max-w-7xl mx-auto'>
      <h1 className='text-2xl font-bold mb-6'>Cobros del Día</h1>

      {loading ? (
        <div className='flex justify-center items-center min-h-[200px]'>
          <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600'></div>
        </div>
      ) : (
        <>
          <ResumenCobros totalCobros={totalCobros} montoTotal={montoTotal} />
          <ResumenCuotasPendientes
            prestamos={prestamos}
            productos={productos}
            clientes={clientes}
          />
          <TablaCobros
            cobrosAgrupados={cobrosAgrupadosArray}
            prestamos={prestamos}
          />
        </>
      )}
    </div>
  );
}
