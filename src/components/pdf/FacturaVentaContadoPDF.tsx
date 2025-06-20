import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { VentaContado, Cliente, Producto } from "@/lib/firebase/database";
import { formatNumeroControl, formatearCedula } from "@/utils/format";

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 15,
    fontSize: 9,
    fontFamily: "Helvetica",
  },
  header: {
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 10,
    color: "#666666",
    marginBottom: 2,
  },
  section: {
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  label: {
    fontWeight: "bold",
    minWidth: 80,
  },
  value: {
    flex: 1,
    textAlign: "right",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    marginVertical: 8,
  },
  footer: {
    marginTop: "auto",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#cccccc",
  },
  footerText: {
    fontSize: 8,
    color: "#666666",
    textAlign: "center",
  },
  totalSection: {
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000000",
  },
});

interface FacturaVentaContadoPDFProps {
  venta: VentaContado;
  cliente: Cliente | null;
  productos: Producto[];
}

const FacturaVentaContadoPDF: React.FC<FacturaVentaContadoPDFProps> = ({
  venta,
  cliente,
  productos,
}) => (
  <Document>
    <Page size='A6' style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>LOS TIBURONES</Text>
        <Text style={styles.subtitle}>Venta al Contado</Text>
        <Text style={styles.subtitle}>
          Factura N° {formatNumeroControl(venta.numeroControl, "C")}
        </Text>
      </View>

      {/* Información del Cliente */}
      <View style={styles.section}>
        <Text style={[styles.label, { marginBottom: 5 }]}>
          DATOS DEL CLIENTE
        </Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nombre:</Text>
          <Text style={styles.value}>{cliente?.nombre || "N/A"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Cédula:</Text>
          <Text style={styles.value}>V{formatearCedula(cliente?.cedula || "")}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Teléfono:</Text>
          <Text style={styles.value}>{cliente?.telefono || "N/A"}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Información de la Venta */}
      <View style={styles.section}>
        <Text style={[styles.label, { marginBottom: 5 }]}>
          DATOS DE LA VENTA
        </Text>
        <View style={styles.row}>
          <Text style={styles.label}>Fecha:</Text>
          <Text style={styles.value}>
            {new Date(venta.fecha).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
      </View>

      {/* Lista de Productos */}
      <View style={styles.section}>
        <Text style={[styles.label, { marginBottom: 5 }]}>
          PRODUCTOS ADQUIRIDOS
        </Text>
        {venta.productos && venta.productos.length > 0 ? (
          venta.productos.map((item, index) => {
            const producto = productos.find((p) => p.id === item.productoId);
            return (
              <View key={index} style={{ marginBottom: 3 }}>
                <View style={styles.row}>
                  <Text style={styles.label}>
                    {producto?.nombre || "Producto no encontrado"}:
                  </Text>
                  <Text style={styles.value}>
                    {item.cantidad} x ${item.precioUnitario.toFixed(0)} = $
                    {item.subtotal.toFixed(0)}
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          // Fallback para ventas antiguas con un solo producto
          <View style={styles.row}>
            <Text style={styles.label}>Producto:</Text>
            <Text style={styles.value}>
              {productos.find((p) => p.id === venta.productoId)?.nombre ||
                "N/A"}
            </Text>
          </View>
        )}
      </View>

      {/* Total */}
      <View style={styles.totalSection}>
        {/* Mostrar información de descuento si existe */}
        {venta.montoDescuento && venta.montoDescuento > 0 && (
          <>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { fontSize: 10 }]}>
                SUBTOTAL:
              </Text>
              <Text style={[styles.totalValue, { fontSize: 11 }]}>
                ${venta.montoOriginal?.toLocaleString("es-ES")}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text
                style={[styles.totalLabel, { fontSize: 10, color: "#d97706" }]}
              >
                DESCUENTO{" "}
                {venta.descuentoTipo === "porcentaje" && venta.descuentoValor
                  ? `(${venta.descuentoValor}%)`
                  : ""}
                :
              </Text>
              <Text
                style={[styles.totalValue, { fontSize: 11, color: "#d97706" }]}
              >
                -${venta.montoDescuento.toLocaleString("es-ES")}
              </Text>
            </View>
            <View style={[styles.divider, { marginVertical: 5 }]} />
          </>
        )}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL PAGADO:</Text>
          <Text style={styles.totalValue}>
            ${venta.monto.toLocaleString("es-ES")}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Gracias por su compra</Text>
        <Text style={styles.footerText}>
          Fecha de emisión: {new Date().toLocaleDateString("es-ES")}
        </Text>
      </View>
    </Page>
  </Document>
);

export default FacturaVentaContadoPDF;
