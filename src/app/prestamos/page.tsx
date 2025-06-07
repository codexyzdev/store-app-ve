"use client";

import { useEffect, useState } from "react";
import {
  prestamosDB,
  Prestamo,
  clientesDB,
  Cliente,
  inventarioDB,
  Producto,
  cobrosDB,
  Cobro,
} from "@/lib/firebase/database";
import Modal from "@/components/Modal";
import NuevoClienteForm from "@/components/clientes/NuevoClienteForm";
import PrestamosHeader from "@/components/prestamos/PrestamosHeader";
import BusquedaPrestamos from "@/components/prestamos/BusquedaPrestamos";
import TablaPrestamos from "@/components/prestamos/TablaPrestamos";
import ListaPrestamos from "@/components/prestamos/ListaPrestamos";
import { calcularCuotasAtrasadas } from "@/utils/prestamos";

export default function PrestamosPage() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalNuevoCliente, setModalNuevoCliente] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const unsubPrestamos = prestamosDB.suscribir((data) => {
      setPrestamos(data);
      setLoading(false);
    });
    const unsubClientes = clientesDB.suscribir(setClientes);
    const unsubProductos = inventarioDB.suscribir(setProductos);
    const unsubCobros = cobrosDB.suscribir
      ? cobrosDB.suscribir(setCobros)
      : () => {};
    return () => {
      unsubPrestamos();
      unsubClientes();
      unsubProductos();
      unsubCobros();
    };
  }, []);

  const getClienteNombre = (id: string) => {
    const cliente = clientes.find((c) => c.id === id);
    return cliente ? cliente.nombre : "-";
  };

  const getClienteCedula = (id: string) => {
    const cliente = clientes.find((c) => c.id === id);
    return cliente ? cliente.cedula : "";
  };

  const getUltimaCuota = (prestamoId: string) => {
    const cobrosPrestamo = cobros
      .filter((c) => c.prestamoId === prestamoId && c.tipo === "cuota")
      .sort((a, b) => b.fecha - a.fecha);
    return cobrosPrestamo[0] || null;
  };

  // Filtrar préstamos por cliente, producto, monto o cédula
  const prestamosFiltrados = prestamos.filter((prestamo) => {
    // Solo mostrar préstamos a cuotas
    if (prestamo.tipoVenta !== "cuotas") return false;

    const clienteNombre = (
      getClienteNombre(prestamo.clienteId) || ""
    ).toLowerCase();
    const clienteCedula = (
      getClienteCedula(prestamo.clienteId) || ""
    ).toLowerCase();
    const monto = prestamo.monto.toFixed(2);
    return (
      clienteNombre.includes(busqueda.toLowerCase()) ||
      clienteCedula.includes(busqueda.toLowerCase()) ||
      monto.includes(busqueda)
    );
  });

  type GrupoPrestamos = {
    clienteId: string;
    nombre: string;
    cedula: string;
    prestamos: Prestamo[];
  };

  const prestamosAgrupados = prestamosFiltrados.reduce(
    (acc: Record<string, GrupoPrestamos>, prestamo: Prestamo) => {
      const clienteId = prestamo.clienteId;
      if (!acc[clienteId]) {
        acc[clienteId] = {
          clienteId,
          nombre: getClienteNombre(clienteId),
          cedula: getClienteCedula(clienteId),
          prestamos: [],
        };
      }
      acc[clienteId].prestamos.push(prestamo);
      return acc;
    },
    {}
  );

  const prestamosAgrupadosArray: GrupoPrestamos[] =
    Object.values(prestamosAgrupados);

  return (
    <div className='p-4 max-w-5xl mx-auto'>
      <PrestamosHeader />
      <BusquedaPrestamos busqueda={busqueda} onBusquedaChange={setBusqueda} />
      <Modal
        isOpen={modalNuevoCliente}
        onClose={() => setModalNuevoCliente(false)}
        title='Nuevo Cliente'
      >
        <NuevoClienteForm
          onClienteCreado={(cliente) => {
            setModalNuevoCliente(false);
            setBusqueda(cliente.nombre);
            clientesDB.suscribir(setClientes);
          }}
          onCancel={() => setModalNuevoCliente(false)}
        />
      </Modal>
      {loading ? (
        <div className='flex justify-center items-center min-h-[200px]'>
          <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600'></div>
        </div>
      ) : (
        <>
          <TablaPrestamos
            prestamosAgrupados={prestamosAgrupadosArray}
            productos={productos}
            cobros={cobros}
            calcularCuotasAtrasadas={calcularCuotasAtrasadas}
            getUltimaCuota={getUltimaCuota}
          />
          <ListaPrestamos
            prestamosAgrupados={prestamosAgrupadosArray}
            productos={productos}
            cobros={cobros}
            calcularCuotasAtrasadas={calcularCuotasAtrasadas}
            getUltimaCuota={getUltimaCuota}
          />
        </>
      )}
    </div>
  );
}
