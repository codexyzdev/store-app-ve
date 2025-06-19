import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { FinanciamientoConDatos } from "@/hooks/useCuotasAtrasadasRedux";

// Registrar fuente (opcional, usa fuentes del sistema si no se especifica)
// Font.register({
//   family: 'Open Sans',
//   src: 'https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0e.ttf'
// });

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 15,
    fontSize: 8,
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#000000",
  },
  subtitle: {
    fontSize: 7,
    textAlign: "center",
    marginBottom: 10,
    color: "#666666",
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: "#bfbfbf",
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableHeaderRow: {
    backgroundColor: "#f0f0f0",
  },
  tableColHeader: {
    width: "14.28%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#bfbfbf",
    padding: 3,
  },
  tableCol: {
    width: "14.28%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#bfbfbf",
    padding: 2,
  },
  tableColNum: {
    width: "8%",
  },
  tableColNombre: {
    width: "25%",
  },
  tableColTelefono: {
    width: "15%",
  },
  tableColCuotas: {
    width: "12%",
  },
  tableColMonto: {
    width: "15%",
  },
  tableColSeveridad: {
    width: "12%",
  },
  tableColFecha: {
    width: "13%",
  },
  tableCellHeader: {
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCell: {
    fontSize: 6,
    textAlign: "left",
  },
  tableCellCenter: {
    textAlign: "center",
  },
  tableCellRight: {
    textAlign: "right",
  },
  summary: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
  },
  summaryTitle: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 7,
    marginBottom: 2,
  },
  footer: {
    position: "absolute",
    bottom: 15,
    left: 15,
    right: 15,
    textAlign: "center",
    fontSize: 6,
    color: "#666666",
  },
  severidadCritica: {
    color: "#dc2626",
    fontWeight: "bold",
  },
  severidadAlta: {
    color: "#ea580c",
    fontWeight: "bold",
  },
  severidadMedia: {
    color: "#d97706",
  },
  severidadBaja: {
    color: "#059669",
  },
});

interface CuotasMorosasPDFProps {
  financiamientos: FinanciamientoConDatos[];
}

const CuotasMorosasPDF: React.FC<CuotasMorosasPDFProps> = ({
  financiamientos,
}) => {
  const morosos = financiamientos.filter((f) => f.cuotasAtrasadas >= 2);

  const totalMorosos = morosos.length;
  const montoTotalAtrasado = morosos.reduce(
    (sum, m) => sum + m.montoAtrasado,
    0
  );
  const cuotasTotalAtrasadas = morosos.reduce(
    (sum, m) => sum + m.cuotasAtrasadas,
    0
  );

  const getSeveridadStyle = (severidad: string) => {
    switch (severidad) {
      case "critica":
        return styles.severidadCritica;
      case "alta":
        return styles.severidadAlta;
      case "media":
        return styles.severidadMedia;
      default:
        return styles.severidadBaja;
    }
  };

  return (
    <Document>
      <Page size='A6' style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text>CLIENTES MOROSOS</Text>
        </View>

        <View style={styles.subtitle}>
          <Text>
            Reporte generado el {new Date().toLocaleDateString("es-ES")}
          </Text>
        </View>

        {/* Tabla */}
        <View style={styles.table}>
          {/* Header de tabla */}
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <View style={[styles.tableColHeader, styles.tableColNum]}>
              <Text style={styles.tableCellHeader}>#</Text>
            </View>
            <View style={[styles.tableColHeader, styles.tableColNombre]}>
              <Text style={styles.tableCellHeader}>Cliente</Text>
            </View>
            <View style={[styles.tableColHeader, styles.tableColTelefono]}>
              <Text style={styles.tableCellHeader}>Teléfono</Text>
            </View>
            <View style={[styles.tableColHeader, styles.tableColCuotas]}>
              <Text style={styles.tableCellHeader}>Cuotas</Text>
            </View>
            <View style={[styles.tableColHeader, styles.tableColMonto]}>
              <Text style={styles.tableCellHeader}>Monto $</Text>
            </View>
            <View style={[styles.tableColHeader, styles.tableColSeveridad]}>
              <Text style={styles.tableCellHeader}>Estado</Text>
            </View>
            <View style={[styles.tableColHeader, styles.tableColFecha]}>
              <Text style={styles.tableCellHeader}>Ult. Pago</Text>
            </View>
          </View>

          {/* Filas de datos */}
          {morosos.map((moroso, index) => (
            <View key={moroso.id} style={styles.tableRow}>
              <View style={[styles.tableCol, styles.tableColNum]}>
                <Text style={[styles.tableCell, styles.tableCellCenter]}>
                  {index + 1}
                </Text>
              </View>
              <View style={[styles.tableCol, styles.tableColNombre]}>
                <Text style={styles.tableCell}>
                  {moroso.cliente.nombre.length > 15
                    ? `${moroso.cliente.nombre.substring(0, 15)}...`
                    : moroso.cliente.nombre}
                </Text>
              </View>
              <View style={[styles.tableCol, styles.tableColTelefono]}>
                <Text style={[styles.tableCell, styles.tableCellCenter]}>
                  {moroso.cliente.telefono || "-"}
                </Text>
              </View>
              <View style={[styles.tableCol, styles.tableColCuotas]}>
                <Text style={[styles.tableCell, styles.tableCellCenter]}>
                  {moroso.cuotasAtrasadas}
                </Text>
              </View>
              <View style={[styles.tableCol, styles.tableColMonto]}>
                <Text style={[styles.tableCell, styles.tableCellRight]}>
                  ${moroso.montoAtrasado.toFixed(0)}
                </Text>
              </View>
              <View style={[styles.tableCol, styles.tableColSeveridad]}>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellCenter,
                    getSeveridadStyle(moroso.severidad),
                  ]}
                >
                  {moroso.severidad.toUpperCase()}
                </Text>
              </View>
              <View style={[styles.tableCol, styles.tableColFecha]}>
                <Text style={[styles.tableCell, styles.tableCellCenter]}>
                  {moroso.ultimaCuota
                    ? new Date(moroso.ultimaCuota.fecha).toLocaleDateString(
                        "es-ES"
                      )
                    : "-"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Resumen */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>RESUMEN EJECUTIVO</Text>
          <Text style={styles.summaryText}>
            • Total clientes morosos: {totalMorosos}
          </Text>
          <Text style={styles.summaryText}>
            • Monto total atrasado: ${montoTotalAtrasado.toFixed(2)}
          </Text>
          <Text style={styles.summaryText}>
            • Cuotas atrasadas: {cuotasTotalAtrasadas}
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Los Tiburones - Sistema de Gestión Financiera | Página 1 de 1
        </Text>
      </Page>
    </Document>
  );
};

export default CuotasMorosasPDF;
