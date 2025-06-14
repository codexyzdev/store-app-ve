import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { Cliente } from "@/lib/firebase/database";

interface ClientesPrintProps {
  clientes: Cliente[];
}

// Crear estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontSize: 10,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 20,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: "#cccccc",
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#f5f5f5",
    fontWeight: "bold",
  },
  tableColNumber: {
    width: "8%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#cccccc",
    padding: 5,
  },
  tableColName: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#cccccc",
    padding: 5,
  },
  tableColControl: {
    width: "12%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#cccccc",
    padding: 5,
  },
  tableColPhone: {
    width: "18%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#cccccc",
    padding: 5,
  },
  tableColCedula: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#cccccc",
    padding: 5,
  },
  tableColDate: {
    width: "17%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#cccccc",
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: "bold",
  },
  tableCell: {
    fontSize: 8,
  },
  tableCellCenter: {
    fontSize: 8,
    textAlign: "center",
  },
  tableCellRight: {
    fontSize: 8,
    textAlign: "right",
  },
  summary: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 3,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 9,
    marginBottom: 2,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#666",
    borderTop: "1px solid #e0e0e0",
    paddingTop: 10,
  },
});

const ClientesPrint: React.FC<ClientesPrintProps> = ({ clientes }) => {
  const totalClientes = clientes.length;
  const clientesConTelefono = clientes.filter(
    (c) => c.telefono && c.telefono.trim() !== ""
  ).length;
  const clientesConCedula = clientes.filter(
    (c) => c.cedula && c.cedula.trim() !== ""
  ).length;

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <Text style={styles.title}>Lista de Clientes</Text>

        <View style={styles.table}>
          {/* Encabezados de la tabla */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableColNumber}>
              <Text style={styles.tableCellHeader}>#</Text>
            </View>
            <View style={styles.tableColName}>
              <Text style={styles.tableCellHeader}>Nombre</Text>
            </View>
            <View style={styles.tableColControl}>
              <Text style={styles.tableCellHeader}>Control</Text>
            </View>
            <View style={styles.tableColPhone}>
              <Text style={styles.tableCellHeader}>Teléfono</Text>
            </View>
            <View style={styles.tableColCedula}>
              <Text style={styles.tableCellHeader}>Cédula</Text>
            </View>
            <View style={styles.tableColDate}>
              <Text style={styles.tableCellHeader}>Registro</Text>
            </View>
          </View>

          {/* Filas de datos */}
          {clientes.map((cliente, index) => (
            <View style={styles.tableRow} key={cliente.id}>
              <View style={styles.tableColNumber}>
                <Text style={styles.tableCellCenter}>{index + 1}</Text>
              </View>
              <View style={styles.tableColName}>
                <Text style={styles.tableCell}>
                  {cliente.nombre?.length > 25
                    ? `${cliente.nombre.substring(0, 22)}...`
                    : cliente.nombre}
                </Text>
              </View>
              <View style={styles.tableColControl}>
                <Text style={styles.tableCellCenter}>
                  #{cliente.numeroControl}
                </Text>
              </View>
              <View style={styles.tableColPhone}>
                <Text style={styles.tableCell}>
                  {cliente.telefono || "N/A"}
                </Text>
              </View>
              <View style={styles.tableColCedula}>
                <Text style={styles.tableCell}>{cliente.cedula || "N/A"}</Text>
              </View>
              <View style={styles.tableColDate}>
                <Text style={styles.tableCellCenter}>
                  {new Date(cliente.createdAt).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Resumen de clientes */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Resumen de Clientes</Text>
          <Text style={styles.summaryText}>
            Total de clientes registrados: {totalClientes}
          </Text>
          
          <Text style={styles.summaryText}>
            Fecha de generación:{" "}
            {new Date().toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        {/* Pie de página */}
        <Text style={styles.footer}>
          Sistema de Gestión de Clientes - Página 1 de 1
        </Text>
      </Page>
    </Document>
  );
};

export default ClientesPrint;
