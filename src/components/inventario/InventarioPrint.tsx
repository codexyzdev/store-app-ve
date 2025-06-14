import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { Producto as ProductoType } from "@/lib/firebase/database";

interface InventarioPrintProps {
  productos: ProductoType[];
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
  tableColHeader: {
    width: "16.66%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#cccccc",
    padding: 5,
  },
  tableCol: {
    width: "16.66%",
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
  tableCellRight: {
    fontSize: 8,
    textAlign: "right",
  },
  tableCellCenter: {
    fontSize: 8,
    textAlign: "center",
  },
  totalRow: {
    backgroundColor: "#e5e5e5",
    fontWeight: "bold",
  },
  totalCol: {
    width: "83.33%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#cccccc",
    padding: 5,
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
});

const InventarioPrint: React.FC<InventarioPrintProps> = ({ productos }) => {
  const totalInventario = productos.reduce(
    (acc, p) => acc + p.precio * p.stock,
    0
  );
  const totalProductos = productos.length;
  const totalStock = productos.reduce((acc, p) => acc + p.stock, 0);

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <Text style={styles.title}>Inventario de Productos</Text>

        <View style={styles.table}>
          {/* Encabezados de la tabla */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>#</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Producto</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Categoría</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Precio</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Stock</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Total</Text>
            </View>
          </View>

          {/* Filas de datos */}
          {productos.map((producto, index) => (
            <View style={styles.tableRow} key={producto.id}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellCenter}>{index + 1}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{producto.nombre}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{producto.categoria}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellRight}>
                  ${producto.precio.toFixed(2)}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellRight}>{producto.stock}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellRight}>
                  ${(producto.precio * producto.stock).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}

          {/* Fila de total */}
          {productos.length > 0 && (
            <View style={[styles.tableRow, styles.totalRow]}>
              <View style={styles.totalCol}>
                <Text style={[styles.tableCellRight, { fontWeight: "bold" }]}>
                  TOTAL INVENTARIO
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={[styles.tableCellRight, { fontWeight: "bold" }]}>
                  ${totalInventario.toFixed(2)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Resumen del inventario */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Resumen del Inventario</Text>
          <Text style={styles.summaryText}>
            Total de productos: {totalProductos}
          </Text>
          <Text style={styles.summaryText}>
            Total de unidades en stock: {totalStock}
          </Text>
          <Text style={styles.summaryText}>
            Valor total del inventario: ${totalInventario.toFixed(2)}
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
      </Page>
    </Document>
  );
};

export default InventarioPrint;
