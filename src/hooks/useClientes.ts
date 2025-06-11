import { useState, useEffect, useCallback } from 'react';
import { clientesDB, Cliente } from '@/lib/firebase/database';

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = clientesDB.suscribir((data) => {
      setClientes(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Funciones auxiliares reutilizables con useCallback para evitar re-creación
  const getClienteById = useCallback((id: string): Cliente | null => {
    return clientes.find((c) => c.id === id) || null;
  }, [clientes]);

  const getClienteNombre = useCallback((id: string): string => {
    const cliente = clientes.find((c) => c.id === id);
    return cliente ? cliente.nombre : "-";
  }, [clientes]);

  const getClienteCedula = useCallback((id: string): string => {
    const cliente = clientes.find((c) => c.id === id);
    return cliente ? cliente.cedula || "" : "";
  }, [clientes]);

  const getClienteTelefono = useCallback((id: string): string => {
    const cliente = clientes.find((c) => c.id === id);
    return cliente ? cliente.telefono : "";
  }, [clientes]);

  const getClienteDireccion = useCallback((id: string): string => {
    const cliente = clientes.find((c) => c.id === id);
    return cliente ? cliente.direccion || "" : "";
  }, [clientes]);

  // Buscar clientes por múltiples criterios
  const buscarClientes = useCallback((termino: string): Cliente[] => {
    if (!termino.trim()) return clientes;

    const terminoLower = termino.toLowerCase();
    return clientes.filter((cliente) =>
      cliente.nombre.toLowerCase().includes(terminoLower) ||
      cliente.telefono.includes(termino) ||
      (cliente.direccion && cliente.direccion.toLowerCase().includes(terminoLower)) ||
      (cliente.cedula && cliente.cedula.includes(termino)) ||
      (cliente.numeroControl && cliente.numeroControl.toString().includes(termino))
    );
  }, [clientes]);

  // Formatear teléfono para WhatsApp
  const formatearTelefonoWhatsApp = useCallback((telefono: string): string => {
    const numeroLimpio = telefono.replace(/\D/g, "");
    return numeroLimpio.startsWith("58") ? numeroLimpio : `58${numeroLimpio}`;
  }, []);

  // Obtener iniciales del nombre
  const getIniciales = useCallback((nombre: string): string => {
    return nombre
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }, []);

  // Estadísticas de clientes
  const getEstadisticas = useCallback(() => {
    return {
      total: clientes.length,
      conTelefono: clientes.filter(c => c.telefono).length,
      conDireccion: clientes.filter(c => c.direccion).length,
      conCedula: clientes.filter(c => c.cedula).length
    };
  }, [clientes]);

  return {
    clientes,
    loading,
    getClienteById,
    getClienteNombre,
    getClienteCedula,
    getClienteTelefono,
    getClienteDireccion,
    buscarClientes,
    formatearTelefonoWhatsApp,
    getIniciales,
    getEstadisticas
  };
} 