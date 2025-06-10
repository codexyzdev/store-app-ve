# 🦈 Scripts de Datos de Prueba - Los Tiburones

Este directorio contiene scripts para generar datos ficticios y probar el funcionamiento completo del sistema Los Tiburones.

## 📁 Archivos Incluidos

- `generar-datos.ts` - Script principal en TypeScript con todas las funciones
- `ejecutar-datos.js` - Script ejecutable en JavaScript
- `ejecutar.js` - Script alternativo usando require
- `README.md` - Este archivo de instrucciones

## 🚀 Cómo Ejecutar los Scripts

### Opción 1: Usando Node.js directamente

```bash
# Desde la raíz del proyecto
node pruebas/ejecutar-datos.js
```

### Opción 2: Usando npm scripts (recomendado)

Agregar al `package.json` del proyecto:

```json
{
  "scripts": {
    "generar-datos": "node pruebas/ejecutar-datos.js",
    "datos-prueba": "node pruebas/ejecutar-datos.js"
  }
}
```

Luego ejecutar:

```bash
npm run generar-datos
```

### Opción 3: Con el servidor de desarrollo corriendo

Si tienes el servidor Next.js corriendo (`npm run dev`), puedes ejecutar:

```bash
node pruebas/ejecutar-datos.js
```

## 📊 Datos que se Generan

### 👥 Clientes (5 clientes)

- Nombres venezolanos realistas
- Cédulas únicas (8 dígitos)
- Teléfonos con códigos de área venezolanos
- Direcciones detalladas de diferentes ciudades
- Números de control automáticos (#1, #2, #3...)

### 📦 Productos (5 productos)

- Variedad de electrodomésticos y muebles
- Precios realistas en USD
- Stock inicial configurado
- Categorías organizadas
- Stock mínimo establecido

### 💰 Financiamientos (3 financiamientos)

- Asignación aleatoria cliente-producto
- Cuotas variables (6, 8, 10, 12)
- Recargo del 40% sobre precio base
- Fechas de inicio aleatorias (últimos 30 días)
- Números de control automáticos (#F-1, #F-2, #F-3...)
- Actualización automática de stock

## ⚠️ Consideraciones Importantes

### Requisitos Previos

1. **Firebase configurado**: El archivo `.env.local` debe tener las credenciales correctas
2. **Conexión a internet**: Para conectar con Firebase
3. **Base de datos limpia**: Los scripts no verifican duplicados por nombre

### Datos Únicos

- **Cédulas**: Se valida unicidad automáticamente
- **Números de control**: Se generan automáticamente e incrementalmente
- **IDs**: Firebase genera IDs únicos automáticamente

### Posibles Errores

- **Cédula duplicada**: Si ya existe un cliente con la misma cédula
- **Error de conexión**: Verificar credenciales Firebase
- **Problemas de red**: Intentar nuevamente después de unos segundos

## 🔧 Personalización

### Modificar Datos

Puedes editar los arrays `clientesFicticios` y `productosFicticios` en `ejecutar-datos.js` para:

- Cambiar nombres y datos de clientes
- Agregar más productos
- Modificar precios y stock
- Cambiar categorías

### Ajustar Cantidad

Para generar más o menos registros, modifica:

- Array de clientes: agregar/quitar objetos
- Array de productos: agregar/quitar objetos
- Financiamientos: cambiar el bucle `for (let i = 0; i < 3; i++)`

### Configurar Financiamientos

Puedes ajustar:

- Recargo: cambiar `montoBase * 1.4` (40% de recargo)
- Cuotas disponibles: modificar `[6, 8, 10, 12]`
- Cantidad de productos: cambiar `Math.floor(Math.random() * 2) + 1`

## 🎯 Casos de Uso

### Desarrollo

- Probar funcionalidades con datos realistas
- Verificar números de control automáticos
- Testear validaciones de cédula única
- Comprobar cálculos de financiamiento

### Demostraciones

- Mostrar el sistema con datos profesionales
- Ejemplificar flujos completos
- Presentar reportes con información real

### Testing

- Verificar rendimiento con datos de muestra
- Probar búsquedas y filtros
- Validar impresión de documentos

## 📱 Verificación Post-Ejecución

Después de ejecutar los scripts, verifica en la aplicación:

1. **Lista de Clientes**: Deben aparecer con números de control
2. **Inventario**: Productos con stock actualizado
3. **Financiamientos**: Con números F-X y datos correctos
4. **Búsquedas**: Deben funcionar por nombre, cédula y número de control
5. **Plan de Pagos**: Debe generar e imprimir correctamente

## 🆘 Solución de Problemas

### Error "Module not found"

```bash
# Verificar que estás en la raíz del proyecto
cd /path/to/store-app-ve
node pruebas/ejecutar-datos.js
```

### Error de Firebase

```bash
# Verificar variables de entorno
cat .env.local
# Debe contener NEXT_PUBLIC_FIREBASE_* con valores correctos
```

### Datos no aparecen

- Refrescar la página de la aplicación
- Verificar que Firebase esté conectado
- Revisar la consola de desarrollador por errores

¡Listo para probar Los Tiburones! 🦈✨
