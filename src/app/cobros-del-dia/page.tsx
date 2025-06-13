"use client";

import { useEffect, useState } from "react";
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
import BusquedaCobros from "@/components/cobranza/BusquedaCobros";
import TablaCobros from "@/components/cobranza/TablaCobros";
import ResumenDelDiaCobros from "@/components/cobranza/ResumenDelDiaCobros";
import ListaCobrosRealizados from "@/components/cobranza/ListaCobrosRealizados";
import ListaCobrosPendientes from "@/components/cobranza/ListaCobrosPendientes";

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
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const unsubCobros = cobrosDB.suscribir((data) => {
      // Filtrar solo los cobros de hoy
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const manana = new Date(hoy);
      manana.setDate(hoy.getDate() + 1);
      const cobrosHoy = data.filter((cobro) => {
        const fechaCobro = new Date(cobro.fecha);
        return fechaCobro >= hoy && fechaCobro < manana;
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

  // Filtrar cobros por cliente o cédula
  const cobrosFiltrados = cobrosAgrupadosArray.filter((grupo) => {
    const nombre = grupo.nombre.toLowerCase();
    const cedula = grupo.cedula.toLowerCase();
    return (
      nombre.includes(busqueda.toLowerCase()) ||
      cedula.includes(busqueda.toLowerCase())
    );
  });

  // Calcular cobros pendientes para hoy
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const pendientesHoy: any[] = [];

  prestamos.forEach((prestamo) => {
    if (prestamo.estado !== "activo" && prestamo.estado !== "atrasado") return;
    const cliente = clientes.find((c) => c.id === prestamo.clienteId);
    const producto = productos.find((p) => p.id === prestamo.productoId);
    const fechaInicio = new Date(prestamo.fechaInicio);
    const cobrosPrestamo = cobros.filter(
      (c) => c.prestamoId === prestamo.id && c.tipo === "cuota"
    );
    for (let i = 0; i < prestamo.cuotas; i++) {
      const fechaCuota = new Date(fechaInicio);
      fechaCuota.setDate(fechaInicio.getDate() + i * 7);
      if (fechaCuota.getTime() === hoy.getTime()) {
        if (cobrosPrestamo.length > i) continue; // Ya pagada
        pendientesHoy.push({
          clienteId: prestamo.clienteId,
          nombre: cliente ? cliente.nombre : "-",
          cedula: cliente ? cliente.cedula : "",
          telefono: cliente ? cliente.telefono : undefined,
          producto: producto ? producto.nombre : "",
          monto: prestamo.monto / prestamo.cuotas,
          cuota: i + 1,
        });
      }
    }
  });

  return (
    <div className='p-4 max-w-7xl mx-auto'>
      <h1 className='text-2xl font-bold mb-6'>Cobros del Día</h1>

      {loading ? (
        <div className='flex justify-center items-center min-h-[200px]'>
          <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600'></div>
        </div>
      ) : (
        <>
          {/* Resumen solo de cobros del día */}
          <ResumenDelDiaCobros cobros={cobros} prestamos={prestamos} />
          {/* Lista de cobros pendientes para hoy */}
          <ListaCobrosPendientes
            pendientes={pendientesHoy}
            onRegistrarCobro={(pendiente) => {}}
            onContactarCliente={(pendiente) => {}}
          />
          {/* Lista de cobros realizados */}
          <ListaCobrosRealizados
            cobrosAgrupados={cobrosFiltrados}
            onVerHistorial={(clienteId) => {}}
            onImprimirRecibo={(cobro) => {}}
          />
          {/* Buscador de cobros */}
          <BusquedaCobros busqueda={busqueda} onBusquedaChange={setBusqueda} />
          {/* Tabla de cobros agrupados */}
          <TablaCobros
            cobrosAgrupados={cobrosFiltrados}
            prestamos={prestamos}
          />
        </>
      )}
    </div>
  );
}
