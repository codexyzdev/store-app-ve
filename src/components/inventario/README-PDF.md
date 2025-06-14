# Generación de PDF para Inventario

Este documento explica cómo usar los componentes de React-PDF implementados para generar PDFs del inventario.

## 📋 Componentes Disponibles

### 1. `InventarioPrint`

**Archivo:** `InventarioPrint.tsx`

Componente principal que define la estructura del documento PDF usando los componentes de React-PDF.

```tsx
import InventarioPrint from "@/components/inventario/InventarioPrint";

// Uso básico
<InventarioPrint productos={listaDeProductos} />;
```

**Características:**

- Documento PDF en formato A4
- Tabla con productos, categorías, precios y stock
- Resumen del inventario con totales
- Fecha de generación automática
- Estilos profesionales con bordes y colores

### 2. `InventarioPDFViewer`

**Archivo:** `InventarioPDFViewer.tsx`

Componente que combina vista previa y descarga de PDF.

```tsx
import InventarioPDFViewer from "@/components/inventario/InventarioPDFViewer";

// Con vista previa
<InventarioPDFViewer productos={productos} showViewer={true} />

// Solo botón de descarga
<InventarioPDFViewer productos={productos} showViewer={false} />
```

**Props:**

- `productos`: Array de productos a incluir en el PDF
- `showViewer` (opcional): Mostrar vista previa del PDF (default: true)

### 3. `InventarioHTML`

**Archivo:** `InventarioHTML.tsx`

Versión HTML del inventario para impresión tradicional (mantiene compatibilidad).

```tsx
import InventarioHTML from "@/components/inventario/InventarioHTML";

<InventarioHTML productos={productos} />;
```

## 🚀 Formas de Uso

### Opción 1: Descarga Directa

```tsx
import { PDFDownloadLink } from "@react-pdf/renderer";
import InventarioPrint from "@/components/inventario/InventarioPrint";

<PDFDownloadLink
  document={<InventarioPrint productos={productos} />}
  fileName='inventario.pdf'
  className='btn-descargar'
>
  {({ loading }) => (loading ? "Generando..." : "Descargar PDF")}
</PDFDownloadLink>;
```

### Opción 2: Vista Previa con Descarga

```tsx
import { PDFViewer } from "@react-pdf/renderer";
import InventarioPrint from "@/components/inventario/InventarioPrint";

<PDFViewer width='100%' height='500px'>
  <InventarioPrint productos={productos} />
</PDFViewer>;
```

### Opción 3: Uso Programático

```tsx
import { BlobProvider } from "@react-pdf/renderer";
import InventarioPrint from "@/components/inventario/InventarioPrint";

<BlobProvider document={<InventarioPrint productos={productos} />}>
  {({ blob, url, loading }) => (
    // Acceso al blob y URL para manipulación avanzada
    <a href={url} target='_blank'>
      Ver PDF
    </a>
  )}
</BlobProvider>;
```

## 📄 Estructura del PDF Generado

El PDF incluye las siguientes secciones:

1. **Título:** "Inventario de Productos"
2. **Tabla de productos** con columnas:
   - \# (Número secuencial)
   - Producto (Nombre)
   - Categoría
   - Precio (Formato moneda)
   - Stock (Cantidad)
   - Total (Precio × Stock)
3. **Fila de total** con el valor total del inventario
4. **Resumen estadístico:**
   - Total de productos
   - Total de unidades en stock
   - Valor total del inventario
   - Fecha de generación

## 🎨 Personalización de Estilos

Los estilos están definidos usando `StyleSheet.create()` de React-PDF:

```tsx
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontSize: 10,
  },
  // ... más estilos
});
```

### Personalizar colores:

- Encabezado: `backgroundColor: "#f5f5f5"`
- Fila total: `backgroundColor: "#e5e5e5"`
- Resumen: `backgroundColor: "#f9f9f9"`

## 🔧 Implementación en la Aplicación

### En la página del inventario:

```tsx
// Estado para controlar el modal PDF
const [mostrarPDF, setMostrarPDF] = useState(false);

// Botón para abrir el modal PDF
<button onClick={() => setMostrarPDF(true)}>
  📄 Generar PDF
</button>

// Modal con el componente PDF
<Modal isOpen={mostrarPDF} onClose={() => setMostrarPDF(false)}>
  <InventarioPDFViewer productos={productosFiltrados} />
</Modal>
```

## 🐛 Solución de Problemas

### Problema: "Cannot resolve module '@react-pdf/renderer'"

**Solución:** Verificar que la dependencia esté instalada:

```bash
npm install @react-pdf/renderer
# o
pnpm add @react-pdf/renderer
```

### Problema: PDF no se genera

**Solución:** Verificar que el array de productos no esté vacío y que tenga la estructura correcta.

### Problema: Estilos no se aplican

**Solución:** Los estilos de React-PDF son diferentes a CSS tradicional. Usar solo propiedades compatibles.

## 📚 Recursos Adicionales

- [Documentación oficial de React-PDF](https://react-pdf.org/)
- [Lista de propiedades CSS compatibles](https://react-pdf.org/styling)
- [Ejemplos de componentes](https://react-pdf.org/components)

## 🔄 Migración desde Impresión HTML

Si vienes de usar impresión HTML tradicional:

1. **Antes:** `window.print()` con estilos CSS
2. **Ahora:** Componentes React-PDF con `StyleSheet`

3. **Ventajas del PDF:**
   - Formato consistente en todos los dispositivos
   - No depende del navegador para la impresión
   - Mejor control sobre el diseño
   - Posibilidad de guardar y compartir fácilmente

## 📝 Ejemplo Completo

Ver el archivo `EjemploPDF.tsx` para un ejemplo completo con todos los métodos de uso.
