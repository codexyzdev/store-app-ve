import { clientesDB, inventarioDB, financiamientoDB } from '../src/lib/firebase/database';

// Datos ficticios para clientes
const clientesFicticios = [
  {
    nombre: "María González Rodríguez",
    cedula: "12345678",
    telefono: "04241234567",
    direccion: "Av. Principal, Sector Los Jardines, Casa #45, Valencia"
  },
  {
    nombre: "Carlos Mendoza Silva",
    cedula: "23456789",
    telefono: "04142345678",
    direccion: "Calle Bolívar, Urbanización San José, Edificio Rosa, Apto 3-B, Maracay"
  },
  {
    nombre: "Ana Lucía Pérez",
    cedula: "34567890",
    telefono: "04263456789",
    direccion: "Carrera 15 con Calle 8, Sector Centro, Local Comercial, Caracas"
  },
  {
    nombre: "José Miguel Torres",
    cedula: "45678901",
    telefono: "04164567890",
    direccion: "Urbanización La Floresta, Manzana C, Casa 23, Ciudad Bolívar"
  },
  {
    nombre: "Carmen Elena Vargas",
    cedula: "56789012",
    telefono: "04125678901",
    direccion: "Zona Industrial Norte, Galpón 15, Barquisimeto"
  },
  {
    nombre: "Roberto Antonio Díaz",
    cedula: "67890123",
    telefono: "04246789012",
    direccion: "Calle Los Mangos, Conjunto Residencial Palmarito, Torre 2, Apto 8-A, Maracaibo"
  },
  {
    nombre: "Luisa Fernanda Castro",
    cedula: "78901234",
    telefono: "04147890123",
    direccion: "Avenida Libertador, Centro Comercial Plaza Mayor, Local 45, Valencia"
  },
  {
    nombre: "Pedro Luis Morales",
    cedula: "89012345",
    telefono: "04268901234",
    direccion: "Sector La Candelaria, Calle 12, Casa de color azul, Mérida"
  },
  {
    nombre: "Gabriela Sofía Herrera",
    cedula: "90123456",
    telefono: "04169012345",
    direccion: "Urbanización Los Teques, Manzana 8, Lote 15, Los Teques"
  },
  {
    nombre: "Andrés Felipe Ramos",
    cedula: "01234567",
    telefono: "04120123456",
    direccion: "Calle Real de Sabana Grande, Edificio Central, Piso 5, Oficina 12, Caracas"
  }
];

// Datos ficticios para productos
const productosFicticios = [
  {
    nombre: "Televisor Smart TV 50\"",
    descripcion: "Televisor LED Smart de 50 pulgadas, 4K Ultra HD, con sistema operativo Android",
    precio: 450.00,
    stock: 15,
    stockMinimo: 3,
    categoria: "Electrónicos"
  },
  {
    nombre: "Refrigeradora Samsung 18 pies",
    descripcion: "Refrigeradora automática de 18 pies cúbicos, color blanco, bajo consumo energético",
    precio: 650.00,
    stock: 8,
    stockMinimo: 2,
    categoria: "Electrodomésticos"
  },
  {
    nombre: "Lavadora LG 12kg",
    descripcion: "Lavadora automática de carga frontal, capacidad 12kg, 15 programas de lavado",
    precio: 380.00,
    stock: 12,
    stockMinimo: 3,
    categoria: "Electrodomésticos"
  },
  {
    nombre: "Sofá Reclinable 3 Puestos",
    descripcion: "Sofá reclinable de cuero sintético, 3 puestos, color marrón, muy cómodo",
    precio: 520.00,
    stock: 6,
    stockMinimo: 2,
    categoria: "Muebles"
  },
  {
    nombre: "Cama Matrimonial + Colchón",
    descripcion: "Cama matrimonial de madera con colchón ortopédico, incluye base y cabecera",
    precio: 280.00,
    stock: 20,
    stockMinimo: 4,
    categoria: "Muebles"
  },
  {
    nombre: "Aire Acondicionado 12000 BTU",
    descripcion: "Aire acondicionado split, 12000 BTU, inverter, bajo consumo, incluye instalación",
    precio: 320.00,
    stock: 10,
    stockMinimo: 2,
    categoria: "Electrodomésticos"
  },
  {
    nombre: "Cocina 4 Hornillas",
    descripcion: "Cocina a gas de 4 hornillas con horno, acero inoxidable, marca reconocida",
    precio: 180.00,
    stock: 14,
    stockMinimo: 3,
    categoria: "Electrodomésticos"
  },
  {
    nombre: "Equipo de Sonido Bluetooth",
    descripcion: "Equipo de sonido con Bluetooth, USB, radio FM, potencia 200W, luces LED",
    precio: 120.00,
    stock: 25,
    stockMinimo: 5,
    categoria: "Electrónicos"
  },
  {
    nombre: "Mesa de Comedor 6 Puestos",
    descripcion: "Mesa de comedor de vidrio templado con 6 sillas tapizadas en cuero",
    precio: 350.00,
    stock: 8,
    stockMinimo: 2,
    categoria: "Muebles"
  },
  {
    nombre: "Laptop HP Core i5",
    descripcion: "Laptop HP con procesador Core i5, 8GB RAM, 256GB SSD, pantalla 15.6\"",
    precio: 480.00,
    stock: 12,
    stockMinimo: 3,
    categoria: "Electrónicos"
  },
  {
    nombre: "Microondas 20 Litros",
    descripcion: "Horno microondas de 20 litros, 5 niveles de potencia, timer digital",
    precio: 85.00,
    stock: 18,
    stockMinimo: 4,
    categoria: "Electrodomésticos"
  },
  {
    nombre: "Closet 3 Puertas",
    descripcion: "Closet de 3 puertas con espejos, 6 compartimientos internos, color blanco",
    precio: 220.00,
    stock: 9,
    stockMinimo: 2,
    categoria: "Muebles"
  }
];

// Función para crear clientes ficticios
async function crearClientesFicticios() {
  console.log('🧑‍🤝‍🧑 Creando clientes ficticios...');
  
  const clientesCreados = [];
  
  for (let i = 0; i < clientesFicticios.length; i++) {
    const cliente = clientesFicticios[i];
    try {
      const nuevoCliente = await clientesDB.crear({
        ...cliente,
        createdAt: Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000) // Fechas aleatorias en los últimos 30 días
      });
      
      clientesCreados.push(nuevoCliente);
      console.log(`✅ Cliente creado: ${nuevoCliente.nombre} (Control: #${nuevoCliente.numeroControl})`);
      
      // Pequeña pausa para evitar problemas de concurrencia
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Error creando cliente ${cliente.nombre}:`, error);
    }
  }
  
  console.log(`\n🎉 Se crearon ${clientesCreados.length} clientes exitosamente!\n`);
  return clientesCreados;
}

// Función para crear productos ficticios
async function crearProductosFicticios() {
  console.log('📦 Creando productos ficticios...');
  
  const productosCreados = [];
  
  for (let i = 0; i < productosFicticios.length; i++) {
    const producto = productosFicticios[i];
    try {
      const nuevoProducto = await inventarioDB.crear(producto);
      
      productosCreados.push(nuevoProducto);
      console.log(`✅ Producto creado: ${nuevoProducto.nombre} - $${nuevoProducto.precio} (Stock: ${nuevoProducto.stock})`);
      
      // Pequeña pausa para evitar problemas de concurrencia
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Error creando producto ${producto.nombre}:`, error);
    }
  }
  
  console.log(`\n🎉 Se crearon ${productosCreados.length} productos exitosamente!\n`);
  return productosCreados;
}

// Función para crear algunos financiamientos de ejemplo
async function crearFinanciamientosFicticios(clientes: any[], productos: any[]) {
  console.log('💰 Creando financiamientos ficticios...');
  
  if (clientes.length === 0 || productos.length === 0) {
    console.log('⚠️  No hay clientes o productos disponibles para crear financiamientos');
    return [];
  }
  
  const financiamientosCreados = [];
  
  // Crear 5 financiamientos de ejemplo
  for (let i = 0; i < 5; i++) {
    const clienteAleatorio = clientes[Math.floor(Math.random() * clientes.length)];
    const productoAleatorio = productos[Math.floor(Math.random() * productos.length)];
    
    // Generar datos aleatorios para el financiamiento
    const cuotas = [4, 6, 8, 10, 12, 15][Math.floor(Math.random() * 6)];
    const cantidad = Math.floor(Math.random() * 3) + 1; // 1-3 productos
    const montoBase = productoAleatorio.precio * cantidad;
    const montoConRecargo = montoBase * 1.5; // 50% de recargo
    
    // Fecha de inicio aleatoria en los últimos 60 días
    const fechaInicio = Date.now() - (Math.random() * 60 * 24 * 60 * 60 * 1000);
    
    try {
      const nuevoFinanciamiento = await financiamientoDB.crear({
        clienteId: clienteAleatorio.id,
        monto: parseFloat(montoConRecargo.toFixed(2)),
        cuotas: cuotas,
        fechaInicio: fechaInicio,
        estado: 'activo' as const,
        productoId: productoAleatorio.id,
        productos: [{
          productoId: productoAleatorio.id,
          cantidad: cantidad,
          precioUnitario: productoAleatorio.precio,
          subtotal: montoBase
        }],
        tipoVenta: 'cuotas' as const,
        descripcion: `Financiamiento de ${cantidad} ${productoAleatorio.nombre}(s)`
      });
      
      financiamientosCreados.push(nuevoFinanciamiento);
      console.log(`✅ Financiamiento creado: ${clienteAleatorio.nombre} - ${productoAleatorio.nombre} (Control: #F-${nuevoFinanciamiento.numeroControl})`);
      console.log(`   💵 Monto: $${nuevoFinanciamiento.monto} en ${cuotas} cuotas`);
      
      // Actualizar stock del producto
      await inventarioDB.actualizarStock(productoAleatorio.id, -cantidad);
      
      // Pequeña pausa
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`❌ Error creando financiamiento:`, error);
    }
  }
  
  console.log(`\n🎉 Se crearon ${financiamientosCreados.length} financiamientos exitosamente!\n`);
  return financiamientosCreados;
}

// Función principal
async function ejecutarScript() {
  console.log('🚀 INICIANDO SCRIPT DE DATOS FICTICIOS - LOS TIBURONES 🦈\n');
  console.log('=' .repeat(60));
  
  try {
    // Crear clientes
    const clientes = await crearClientesFicticios();
    
    // Crear productos
    const productos = await crearProductosFicticios();
    
    // Crear algunos financiamientos
    const financiamientos = await crearFinanciamientosFicticios(clientes, productos);
    
    console.log('=' .repeat(60));
    console.log('🎊 SCRIPT COMPLETADO EXITOSAMENTE! 🎊');
    console.log(`📊 RESUMEN:`);
    console.log(`   👥 Clientes creados: ${clientes.length}`);
    console.log(`   📦 Productos creados: ${productos.length}`);
    console.log(`   💰 Financiamientos creados: ${financiamientos.length}`);
    console.log('\n🦈 ¡Los Tiburones está listo para las pruebas!');
    
  } catch (error) {
    console.error('💥 Error ejecutando el script:', error);
  }
}

// Solo ejecutar si es llamado directamente
if (require.main === module) {
  ejecutarScript();
}

export { ejecutarScript, crearClientesFicticios, crearProductosFicticios, crearFinanciamientosFicticios }; 