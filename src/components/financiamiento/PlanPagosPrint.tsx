"use client";

import React from "react";
import { Prestamo, Cliente, Cobro } from "@/lib/firebase/database";

interface PlanPagosPrintProps {
  prestamo: Prestamo;
  cliente: Cliente;
  cobros: Cobro[];
  valorCuota: number;
  productosNombres?: string;
}

interface Cuota {
  numero: number;
  fechaTentativa: Date;
  estado: "pendiente" | "pagada";
  fechaPago?: Date;
  tipo?: "inicial" | "regular";
}

const PlanPagosPrint: React.FC<PlanPagosPrintProps> = ({
  prestamo,
  cliente,
  cobros,
  valorCuota,
  productosNombres,
}) => {
  // Generar las cuotas del plan de pagos
  const generarCuotas = (): Cuota[] => {
    // Separar cobros por tipo
    const cobrosIniciales = cobros.filter((c) => c.tipo === "inicial");
    const cobrosRegulares = cobros.filter((c) => c.tipo === "cuota");

    // Generar las 15 cuotas semanales
    const cuotas: Cuota[] = Array.from({ length: prestamo.cuotas }, (_, i) => {
      // Cuotas regulares empiezan 7 días después de la fecha de inicio
      const fechaTentativa = new Date(prestamo.fechaInicio);
      fechaTentativa.setDate(fechaTentativa.getDate() + (i + 1) * 7);

      return {
        numero: i + 1,
        fechaTentativa,
        estado: "pendiente",
        tipo: "regular",
      };
    });

    // Marcar cuotas iniciales como pagadas (en las últimas posiciones)
    cobrosIniciales.forEach((cobro) => {
      if (
        cobro.numeroCuota &&
        cobro.numeroCuota >= 1 &&
        cobro.numeroCuota <= prestamo.cuotas
      ) {
        const cuotaIndex = cobro.numeroCuota - 1;
        cuotas[cuotaIndex].estado = "pagada";
        cuotas[cuotaIndex].fechaPago = new Date(cobro.fecha);
        cuotas[cuotaIndex].tipo = "inicial";
      }
    });

    // Marcar cuotas regulares como pagadas (desde las primeras posiciones)
    cobrosRegulares.forEach((cobro) => {
      if (
        cobro.numeroCuota &&
        cobro.numeroCuota >= 1 &&
        cobro.numeroCuota <= prestamo.cuotas
      ) {
        const cuotaIndex = cobro.numeroCuota - 1;
        cuotas[cuotaIndex].estado = "pagada";
        cuotas[cuotaIndex].fechaPago = new Date(cobro.fecha);
        cuotas[cuotaIndex].tipo = "regular";
      }
    });

    return cuotas;
  };

  const cuotas = generarCuotas();
  const cuotasPagadas = cuotas.filter((c) => c.estado === "pagada").length;
  const cuotasPendientes = prestamo.cuotas - cuotasPagadas;
  const montoPendiente = cuotasPendientes * valorCuota;
  const proximaCuota = cuotas.find((c) => c.estado === "pendiente");

  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const fechaEmision = new Date().toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className='print-document'>
      {/* Header del documento */}
      <div className='print-header'>
        <div className='header-content'>
          <img
            src='/logo-los-tiburones.webp'
            alt='Los Tiburones'
            className='company-logo'
          />
          <div className='header-text'>
            <h1>LOS TIBURONES</h1>
            <h2>PLAN DE PAGOS - FINANCIAMIENTO</h2>
          </div>
        </div>
        <p>Fecha: {fechaEmision}</p>
      </div>

      {/* Información del cliente y préstamo */}
      <div className='print-info-grid'>
        <div className='print-info-block'>
          <h3>CLIENTE</h3>
          <p>
            <strong>Nombre:</strong> {cliente.nombre}
          </p>
          {cliente.numeroControl && (
            <p>
              <strong>Control:</strong> #{cliente.numeroControl}
            </p>
          )}
          <p>
            <strong>Cédula:</strong> {cliente.cedula || "N/A"}
          </p>
          <p>
            <strong>Teléfono:</strong> {cliente.telefono}
          </p>
        </div>

        <div className='print-info-block'>
          <h3>FINANCIAMIENTO</h3>
          {prestamo.numeroControl && (
            <p>
              <strong>Control:</strong> #F-{prestamo.numeroControl}
            </p>
          )}
          <p>
            <strong>Productos:</strong> {productosNombres || "N/A"}
          </p>
          <p>
            <strong>Total:</strong> ${prestamo.monto.toFixed(0)}
          </p>
          <p>
            <strong>Cuotas:</strong> {prestamo.cuotas} x $
            {valorCuota.toFixed(0)}
          </p>
          <p>
            <strong>Inicio:</strong>{" "}
            {formatearFecha(new Date(prestamo.fechaInicio))}
          </p>
        </div>
      </div>

      {/* Tabla de pagos */}
      <table className='print-table'>
        <thead>
          <tr>
            <th>#</th>
            <th>FECHA PROGRAMADA</th>
            <th>MONTO</th>
            <th>TIPO</th>
            <th>FECHA PAGO</th>
            <th>FIRMA</th>
          </tr>
        </thead>
        <tbody>
          {cuotas.map((cuota) => (
            <tr
              key={cuota.numero}
              className={cuota.estado === "pagada" ? "pagada" : "pendiente"}
            >
              <td>{cuota.numero}</td>
              <td>{formatearFecha(cuota.fechaTentativa)}</td>
              <td>${valorCuota.toFixed(0)}</td>
              <td>
                {cuota.estado === "pagada"
                  ? cuota.tipo === "inicial"
                    ? "INICIAL ✓"
                    : "REGULAR ✓"
                  : "PENDIENTE"}
              </td>
              <td>{cuota.fechaPago ? formatearFecha(cuota.fechaPago) : "-"}</td>
              <td className='signature-cell'></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Resumen */}
      <div className='print-summary'>
        <h3>RESUMEN</h3>
        <div className='summary-grid'>
          <div>
            <p>
              <strong>Pagadas:</strong> {cuotasPagadas}/{prestamo.cuotas}
            </p>
            <p>
              <strong>Pendientes:</strong> {cuotasPendientes}
            </p>
          </div>
          <div>
            <p>
              <strong>Pagado:</strong> $
              {(cuotasPagadas * valorCuota).toFixed(0)}
            </p>
            <p>
              <strong>Pendiente:</strong> ${montoPendiente.toFixed(0)}
            </p>
          </div>
        </div>
        {proximaCuota && (
          <div className='next-payment'>
            <strong>
              PRÓXIMO: {formatearFecha(proximaCuota.fechaTentativa)} - $
              {valorCuota.toFixed(0)}
            </strong>
          </div>
        )}
      </div>

      {/* Footer compacto */}
      <div className='print-footer'>
        <div className='terms'>
          <h4>TÉRMINOS Y CONDICIONES:</h4>
          <ul>
            <li>Pagos puntuales en fechas establecidas</li>
            <li>Conservar documento como comprobante de pagos</li>
            <li>Consultas e información al teléfono de contacto</li>
            <li>Documento válido con firma de ambas partes</li>
          </ul>
        </div>

        <div className='contact-info'>
          <h4>LOS TIBURONES</h4>
          <p>📞 Teléfono: [Tu número de contacto]</p>
          <p>📍 Dirección: [Tu dirección comercial]</p>
          <p>📧 Email: alejandrobaez938@gmail.com</p>
        </div>

        <div className='signatures'>
          <div className='signature-block'>
            <div className='signature-line'></div>
            <p>
              <strong>COMERCIANTE</strong>
              <br />
              Alejandro Baez
            </p>
          </div>
          <div className='signature-block'>
            <div className='signature-line'></div>
            <p>
              <strong>CLIENTE</strong>
              <br />
              {cliente.nombre}
              {cliente.cedula && (
                <>
                  <br />
                  C.I: {cliente.cedula}
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanPagosPrint;
