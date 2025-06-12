import { useEffect, useState } from "react";
import {
  financiamientoDB,
  FinanciamientoCuota,
  clientesDB,
  Cliente,
  inventarioDB,
  Producto,
  cobrosDB,
  Cobro,
} from "@/lib/firebase/database";

interface UseFinanciamientoDataReturn {
  financiamientos: FinanciamientoCuota[];
  clientes: Cliente[];
  productos: Producto[];
  cobros: Cobro[];
  loading: boolean;
  error: string | null;
}

export const useFinanciamientoData = (): UseFinanciamientoDataReturn => {
  const [financiamientos, setFinanciamientos] = useState<FinanciamientoCuota[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubFinanciamientos: (() => void) | undefined;
    let unsubClientes: (() => void) | undefined;
    let unsubProductos: (() => void) | undefined;
    let unsubCobros: (() => void) | undefined;

    const setupSubscriptions = async () => {
      try {
        // Suscripción a financiamientos
        unsubFinanciamientos = financiamientoDB.suscribir((data) => {
          setFinanciamientos(data);
          setLoading(false);
        });

        // Suscripción a clientes
        unsubClientes = clientesDB.suscribir((data) => {
          setClientes(data);
        });

        // Suscripción a productos
        unsubProductos = inventarioDB.suscribir((data) => {
          setProductos(data);
        });

        // Suscripción a cobros (opcional, verificar si existe)
        if (cobrosDB.suscribir) {
          unsubCobros = cobrosDB.suscribir((data) => {
            setCobros(data);
          });
        } else {
          // Si no existe la suscripción, obtener datos una vez
          try {
            const cobrosData = await cobrosDB.obtenerTodos?.();
            if (cobrosData) {
              setCobros(cobrosData);
            }
          } catch (err) {
            console.warn("No se pudieron cargar los cobros:", err);
          }
        }
      } catch (err) {
        console.error("Error al configurar suscripciones:", err);
        setError("Error al cargar los datos. Por favor, recarga la página.");
        setLoading(false);
      }
    };

    setupSubscriptions();

    // Cleanup function
    return () => {
      unsubFinanciamientos?.();
      unsubClientes?.();
      unsubProductos?.();
      unsubCobros?.();
    };
  }, []);

  return {
    financiamientos,
    clientes,
    productos,
    cobros,
    loading,
    error,
  };
}; 