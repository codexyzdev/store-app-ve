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
    const cobrosOrdenados = [...cobros].sort((a, b) => a.fecha - b.fecha);

    // Generar las cuotas semanales
    const cuotas: Cuota[] = Array.from({ length: prestamo.cuotas }, (_, i) => {
      const fechaTentativa = new Date(prestamo.fechaInicio);
      fechaTentativa.setDate(fechaTentativa.getDate() + i * 7);
      return {
        numero: i + 1,
        fechaTentativa,
        estado: "pendiente",
      };
    });

    // Asignar cobros a cuotas en orden
    let cuotaIndex = 0;
    for (const cobro of cobrosOrdenados) {
      let montoRestante = cobro.monto;
      while (montoRestante >= valorCuota - 0.01 && cuotaIndex < cuotas.length) {
        if (cuotas[cuotaIndex].estado === "pendiente") {
          cuotas[cuotaIndex].estado = "pagada";
          cuotas[cuotaIndex].fechaPago = new Date(cobro.fecha);
          montoRestante -= valorCuota;
        }
        cuotaIndex++;
      }
    }

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
        <h1>STORE APP VE</h1>
        <h2>PLAN DE PAGOS - PRÉSTAMO</h2>
        <p>Fecha: {fechaEmision}</p>
      </div>

      {/* Información del cliente y préstamo */}
      <div className='print-info-grid'>
        <div className='print-info-block'>
          <h3>CLIENTE</h3>
          <p>
            <strong>Nombre:</strong> {cliente.nombre}
          </p>
          <p>
            <strong>Cédula:</strong> {cliente.cedula || "N/A"}
          </p>
          <p>
            <strong>Teléfono:</strong> {cliente.telefono}
          </p>
        </div>

        <div className='print-info-block'>
          <h3>PRÉSTAMO</h3>
          <p>
            <strong>ID:</strong> #{prestamo.id.slice(-8)}
          </p>
          <p>
            <strong>Productos:</strong> {productosNombres || "N/A"}
          </p>
          <p>
            <strong>Total:</strong> ${prestamo.monto.toFixed(2)}
          </p>
          <p>
            <strong>Cuotas:</strong> {prestamo.cuotas} x $
            {valorCuota.toFixed(2)}
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
            <th>FECHA</th>
            <th>MONTO</th>
            <th>ESTADO</th>
            <th>PAGADO</th>
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
              <td>${valorCuota.toFixed(2)}</td>
              <td>{cuota.estado === "pagada" ? "✓" : "PEND"}</td>
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
              {(cuotasPagadas * valorCuota).toFixed(2)}
            </p>
            <p>
              <strong>Pendiente:</strong> ${montoPendiente.toFixed(2)}
            </p>
          </div>
        </div>
        {proximaCuota && (
          <div className='next-payment'>
            <strong>
              PRÓXIMO: {formatearFecha(proximaCuota.fechaTentativa)} - $
              {valorCuota.toFixed(2)}
            </strong>
          </div>
        )}
      </div>

      {/* Footer compacto */}
      <div className='print-footer'>
        <div className='terms'>
          <h4>TÉRMINOS:</h4>
          <ul>
            <li>Pagos puntuales en fechas establecidas</li>
            <li>Conservar documento como comprobante</li>
            <li>Consultas al teléfono de la empresa</li>
          </ul>
        </div>

        <div className='signatures'>
          <div className='signature-block'>
            <div className='signature-line'></div>
            <p>
              <strong>PRESTAMISTA</strong>
            </p>
          </div>
          <div className='signature-block'>
            <div className='signature-line'></div>
            <p>
              <strong>CLIENTE</strong>
              <br />
              {cliente.nombre}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanPagosPrint;
