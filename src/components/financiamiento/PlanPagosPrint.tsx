"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { useAppSelector } from "@/store/hooks";
import { FinanciamientoCuota, Cliente, Cobro } from "@/lib/firebase/database";

interface PlanPagosPrintProps {
  prestamo: FinanciamientoCuota;
  cliente: Cliente;
  cobros: Cobro[];
  valorCuota: number;
}

interface Cuota {
  numero: number;
  fechaTentativa: Date;
  estado: "pendiente" | "pagada";
  fechaPago?: Date;
  tipo?: "inicial" | "regular";
}

// Estilos para el PDF en formato A6
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 15,
    fontSize: 8,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    paddingBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2563eb",
  },
  subtitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 2,
  },
  fecha: {
    fontSize: 7,
    color: "#666666",
  },
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  infoBlock: {
    flex: 1,
    marginRight: 8,
  },
  infoTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#374151",
  },
  infoText: {
    fontSize: 7,
    marginBottom: 2,
    color: "#6b7280",
  },
  table: {
    width: "100%",
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#374151",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  tableRowPagada: {
    backgroundColor: "#f0f9ff",
  },
  tableCell: {
    fontSize: 6,
    color: "#6b7280",
    textAlign: "center",
  },
  tableCellBold: {
    fontSize: 6,
    fontWeight: "bold",
    color: "#374151",
    textAlign: "center",
  },
  // Anchos de columnas optimizados para A6
  col1: { width: "8%" }, // #
  col2: { width: "20%" }, // Fecha
  col3: { width: "15%" }, // Monto
  col4: { width: "18%" }, // Estado
  col5: { width: "20%" }, // Fecha Pago
  col6: { width: "19%" }, // Firma
  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    backgroundColor: "#f9fafb",
    padding: 6,
    borderRadius: 4,
  },
  summaryColumn: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 3,
    color: "#374151",
  },
  summaryText: {
    fontSize: 7,
    marginBottom: 1,
    color: "#6b7280",
  },
  nextPayment: {
    backgroundColor: "#fef3c7",
    padding: 4,
    borderRadius: 3,
    marginBottom: 8,
  },
  nextPaymentText: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#92400e",
    textAlign: "center",
  },
  footer: {
    marginTop: "auto",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  terms: {
    marginBottom: 6,
  },
  termsTitle: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#374151",
  },
  termsList: {
    marginLeft: 8,
  },
  termsItem: {
    fontSize: 6,
    marginBottom: 1,
    color: "#6b7280",
  },
  signatures: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  signatureBlock: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 8,
  },
  signatureLine: {
    width: "80%",
    height: 1,
    backgroundColor: "#d1d5db",
    marginBottom: 2,
  },
  signatureText: {
    fontSize: 6,
    fontWeight: "bold",
    textAlign: "center",
    color: "#374151",
  },
  signatureSubtext: {
    fontSize: 5,
    textAlign: "center",
    color: "#6b7280",
  },
});

const PlanPagosPDFDocument: React.FC<{
  prestamo: FinanciamientoCuota;
  cliente: Cliente;
  cobros: Cobro[];
  valorCuota: number;
  productos: any[];
}> = ({ prestamo, cliente, cobros, valorCuota, productos }) => {
  // Generar las cuotas del plan de pagos
  const generarCuotas = (): Cuota[] => {
    // Separar cobros por tipo
    const cobrosIniciales = cobros.filter((c) => c.tipo === "inicial");
    const cobrosRegulares = cobros.filter((c) => c.tipo === "cuota");

    // Generar las cuotas semanales
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

    // Marcar cuotas iniciales como pagadas
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

    // Marcar cuotas regulares como pagadas
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

  // Función para enumerar productos duplicados
  const getProductosEnumerados = (): string => {
    if (prestamo.productos && prestamo.productos.length > 0) {
      const productosContados: {
        [key: string]: { nombre: string; cantidad: number };
      } = {};

      prestamo.productos.forEach((prodFinanciamiento) => {
        const producto = productos.find(
          (p) => p.id === prodFinanciamiento.productoId
        );
        const nombre = producto?.nombre || "Producto no encontrado";

        if (productosContados[nombre]) {
          productosContados[nombre].cantidad += prodFinanciamiento.cantidad;
        } else {
          productosContados[nombre] = {
            nombre,
            cantidad: prodFinanciamiento.cantidad,
          };
        }
      });

      return Object.values(productosContados)
        .map((item) =>
          item.cantidad > 1 ? `${item.nombre} (${item.cantidad})` : item.nombre
        )
        .join(", ");
    } else {
      // Producto individual (compatibilidad con financiamientos antiguos)
      const producto = productos.find((p) => p.id === prestamo.productoId);
      return producto?.nombre || "Producto no encontrado";
    }
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
    <Document>
      <Page size='A6' style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>LOS TIBURONES</Text>
            <Text style={styles.subtitle}>PLAN DE PAGOS</Text>
          </View>
          <Text style={styles.fecha}>Fecha: {fechaEmision}</Text>
        </View>

        {/* Información del cliente y financiamiento */}
        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>CLIENTE</Text>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: "bold" }}>Nombre:</Text>{" "}
              {cliente.nombre}
            </Text>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: "bold" }}>Cédula:</Text>{" "}
              {cliente.cedula || "N/A"}
            </Text>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: "bold" }}>Dirección:</Text>{" "}
              {cliente.direccion || "N/A"}
            </Text>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: "bold" }}>Código:</Text> #
              {cliente.numeroControl}
            </Text>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>FINANCIAMIENTO</Text>
            {prestamo.numeroControl && (
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: "bold" }}>Control:</Text> #F-
                {prestamo.numeroControl}
              </Text>
            )}
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: "bold" }}>Productos:</Text>{" "}
              {getProductosEnumerados()}
            </Text>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: "bold" }}>Total:</Text> $
              {prestamo.monto.toFixed(0)}
            </Text>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: "bold" }}>Cuotas:</Text>{" "}
              {prestamo.cuotas} x ${valorCuota.toFixed(0)}
            </Text>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: "bold" }}>Inicio:</Text>{" "}
              {formatearFecha(new Date(prestamo.fechaInicio))}
            </Text>
          </View>
        </View>

        {/* Tabla de pagos */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.col1]}>#</Text>
            <Text style={[styles.tableHeaderCell, styles.col2]}>FECHA</Text>
            <Text style={[styles.tableHeaderCell, styles.col3]}>MONTO</Text>
            <Text style={[styles.tableHeaderCell, styles.col4]}>ESTADO</Text>
            <Text style={[styles.tableHeaderCell, styles.col5]}>PAGO</Text>
            <Text style={[styles.tableHeaderCell, styles.col6]}>FIRMA</Text>
          </View>

          {cuotas.map((cuota) => (
            <View
              key={cuota.numero}
              style={[
                styles.tableRow,
                cuota.estado === "pagada" ? styles.tableRowPagada : {},
              ]}
            >
              <Text style={[styles.tableCellBold, styles.col1]}>
                {cuota.numero}
              </Text>
              <Text style={[styles.tableCell, styles.col2]}>
                {formatearFecha(cuota.fechaTentativa)}
              </Text>
              <Text style={[styles.tableCell, styles.col3]}>
                ${valorCuota.toFixed(0)}
              </Text>
              <Text style={[styles.tableCell, styles.col4]}>
                {cuota.estado === "pagada"
                  ? cuota.tipo === "inicial"
                    ? "INICIAL ✓"
                    : "REGULAR ✓"
                  : "PENDIENTE"}
              </Text>
              <Text style={[styles.tableCell, styles.col5]}>
                {cuota.fechaPago ? formatearFecha(cuota.fechaPago) : "-"}
              </Text>
              <Text style={[styles.tableCell, styles.col6]}>
                {/* Espacio para firma */}
              </Text>
            </View>
          ))}
        </View>

        {/* Resumen */}
        <View style={styles.summary}>
          <View style={styles.summaryColumn}>
            <Text style={styles.summaryTitle}>RESUMEN</Text>
            <Text style={styles.summaryText}>
              Pagadas: {cuotasPagadas}/{prestamo.cuotas}
            </Text>
            <Text style={styles.summaryText}>
              Pendientes: {cuotasPendientes}
            </Text>
          </View>
          <View style={styles.summaryColumn}>
            <Text style={styles.summaryText}>
              Pagado: ${(cuotasPagadas * valorCuota).toFixed(0)}
            </Text>
            <Text style={styles.summaryText}>
              Pendiente: ${montoPendiente.toFixed(0)}
            </Text>
          </View>
        </View>

        {/* Próximo pago */}
        {proximaCuota && (
          <View style={styles.nextPayment}>
            <Text style={styles.nextPaymentText}>
              PRÓXIMO: {formatearFecha(proximaCuota.fechaTentativa)} - $
              {valorCuota.toFixed(0)}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.terms}>
            <Text style={styles.termsTitle}>TÉRMINOS:</Text>
            <View style={styles.termsList}>
              <Text style={styles.termsItem}>
                • Pagos puntuales en fechas establecidas
              </Text>
              <Text style={styles.termsItem}>
                • Conservar documento como comprobante
              </Text>
              <Text style={styles.termsItem}>
                • Documento válido con firmas
              </Text>
            </View>
          </View>

          <View style={styles.signatures}>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureText}>COMERCIANTE</Text>
              <Text style={styles.signatureSubtext}>Alejandro Baez</Text>
            </View>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureText}>CLIENTE</Text>
              <Text style={styles.signatureSubtext}>
                {cliente.nombre}
                {cliente.cedula && `\nC.I: ${cliente.cedula}`}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

const PlanPagosPrint: React.FC<PlanPagosPrintProps> = ({
  prestamo,
  cliente,
  cobros,
  valorCuota,
}) => {
  // Obtener productos del store de Redux
  const productos = useAppSelector((state) => state.inventario.productos);

  const nombreArchivo = `plan-pagos-${cliente.nombre.replace(/\s+/g, "-")}-${
    prestamo.numeroControl || prestamo.id
  }.pdf`;

  return (
    <div className='plan-pagos-print'>
      {/* Visor del PDF */}
      <div className='pdf-viewer mb-4' style={{ height: "500px" }}>
        <PDFViewer width='100%' height='100%'>
          <PlanPagosPDFDocument
            prestamo={prestamo}
            cliente={cliente}
            cobros={cobros}
            valorCuota={valorCuota}
            productos={productos}
          />
        </PDFViewer>
      </div>

      {/* Botón de descarga */}
      <div className='pdf-actions flex justify-center'>
        <PDFDownloadLink
          document={
            <PlanPagosPDFDocument
              prestamo={prestamo}
              cliente={cliente}
              cobros={cobros}
              valorCuota={valorCuota}
              productos={productos}
            />
          }
          fileName={nombreArchivo}
          className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors'
        >
          {({ loading }) => (loading ? "Generando PDF..." : "Descargar PDF")}
        </PDFDownloadLink>
      </div>
    </div>
  );
};

export default PlanPagosPrint;
