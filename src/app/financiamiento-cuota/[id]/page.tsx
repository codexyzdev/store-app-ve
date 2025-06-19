"use client";

import React from "react";
import Modal from "@/components/Modal";
import { ProtectedRoute } from "@/components/auth/protected-route";
import {
  ClienteDetalle,
  FinanciamientosListContainer,
  EmptyFinanciamientosState,
  FinanciamientoItem,
  ModalPagoCuota,
  PlanPagosPrint,
} from "@/components/financiamiento";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useFinanciamientoDetail } from "@/hooks/useFinanciamientoDetail";
import { PagoData } from "@/services/financiamientoService";

// Componente principal del contenido
const FinanciamientoDetailContent = () => {
  const {
    cliente,
    financiamientosCliente,
    isLoading,
    abonando,
    getProductosNombres,
    handlePagarCuota,
    imprimirPlanPagos,
    getCobrosFinanciamiento,
    calcularInfoFinanciamiento,
    modals,
  } = useFinanciamientoDetail();

  if (isLoading) {
    return (
      <LoadingSpinner
        message='Cargando información del cliente...'
        fullScreen={true}
      />
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className=' mx-auto px-4 py-6'>
       

        {/* Información del cliente */}
        {cliente ? (
          <div className='mb-8'>
            <ClienteDetalle cliente={cliente} />
          </div>
        ) : (
          <div className='mb-8 bg-white rounded-2xl shadow-sm p-6 animate-pulse'>
            <div className='h-4 bg-gray-200 rounded w-3/4 mb-4'></div>
            <div className='h-4 bg-gray-200 rounded w-1/2'></div>
          </div>
        )}

        {/* Lista de financiamientos */}
        <FinanciamientosListContainer
          totalFinanciamientos={financiamientosCliente.length}
          clienteNombre={cliente?.nombre}
        >
          {financiamientosCliente.length === 0 ? (
            <EmptyFinanciamientosState clienteNombre={cliente?.nombre} />
          ) : (
            <div className='space-y-8'>
              {financiamientosCliente.map((financiamiento, index) => {
                const info = calcularInfoFinanciamiento(financiamiento);
                const cobros = getCobrosFinanciamiento(financiamiento.id);
                const productoNombre = getProductosNombres(financiamiento);

                return (
                  <FinanciamientoItem
                    key={financiamiento.id}
                    financiamiento={financiamiento}
                    index={index}
                    productoNombre={productoNombre}
                    info={info}
                    cobros={cobros}
                    onPagarCuota={() =>
                      modals.openModal(`pago-${financiamiento.id}`)
                    }
                    onTogglePlan={() =>
                      modals.toggleModal(`plan-${financiamiento.id}`)
                    }
                    onToggleHistorial={() =>
                      modals.toggleModal(`historial-${financiamiento.id}`)
                    }
                    onImprimir={() => imprimirPlanPagos(financiamiento.id)}
                    isPlanOpen={modals.isOpen(`plan-${financiamiento.id}`)}
                    isHistorialOpen={modals.isOpen(
                      `historial-${financiamiento.id}`
                    )}
                    cargando={!!abonando[financiamiento.id]}
                  />
                );
              })}
            </div>
          )}
        </FinanciamientosListContainer>
      </div>

      {/* Modales de pago de cuota */}
      {financiamientosCliente.map((financiamiento) => {
        const info = calcularInfoFinanciamiento(financiamiento);

        return (
          <ModalPagoCuota
            key={`modal-${financiamiento.id}`}
            isOpen={modals.isOpen(`pago-${financiamiento.id}`)}
            onClose={() => modals.closeModal(`pago-${financiamiento.id}`)}
            prestamo={{
              id: financiamiento.id,
              monto: financiamiento.monto,
              cuotas: financiamiento.cuotas,
            }}
            valorCuota={info.valorCuota}
            cuotasPendientes={info.cuotasPendientes || 0}
            cuotasAtrasadas={info.cuotasAtrasadas}
            cuotasPagadas={info.cuotasPagadas}
            onPagar={(data: PagoData) =>
              handlePagarCuota(financiamiento.id, data)
            }
            cargando={!!abonando[financiamiento.id]}
          />
        );
      })}

      {/* Modales de impresión */}
      {financiamientosCliente.map((financiamiento) => (
        <Modal
          key={`print-${financiamiento.id}`}
          isOpen={modals.isOpen(`impresion-${financiamiento.id}`)}
          onClose={() => modals.closeModal(`impresion-${financiamiento.id}`)}
          title={`Plan de Pagos - ${cliente?.nombre || "Cliente"}`}
        >
          <div className='print-container'>
            {cliente && (
              <PlanPagosPrint
                financiamiento={financiamiento}
                cliente={cliente}
                cobros={getCobrosFinanciamiento(financiamiento.id)}
                valorCuota={financiamiento.monto / financiamiento.cuotas}
              />
            )}
          </div>
        </Modal>
      ))}

      {/* Estilos para impresión */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            .no-print { display: none !important; }
            .print-container {
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .fixed.inset-0 > div:first-child { display: none !important; }
            .fixed.inset-0 .plan-pagos-print {
              position: static !important;
              transform: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              margin: 0 !important;
              padding: 20px !important;
            }
          }
        `,
        }}
      />
    </div>
  );
};

// Componente principal exportado
const FinanciamientoClientePage = () => {
  return (
    <ProtectedRoute>
      <FinanciamientoDetailContent />
    </ProtectedRoute>
  );
};

export default FinanciamientoClientePage;
