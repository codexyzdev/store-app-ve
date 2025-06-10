// Script para ejecutar datos ficticios
// Requiere que el proyecto Next.js esté corriendo o tener acceso a Firebase

async function ejecutarDatosPrueba() {
  console.log('🚀 INICIANDO GENERACIÓN DE DATOS DE PRUEBA\n');
  
  try {
    // Importar dinámicamente las funciones desde el módulo principal
    const { clientesDB, inventarioDB, financiamientoDB } = await import('../src/lib/firebase/database.js');
    
    // Datos de clientes ficticios
    const clientesFicticios = [
      {
        nombre: "María González Rodríguez",
        cedula: "12345678",
        telefono: "04241234567",
        direccion: "Av. Principal, Sector Los Jardines, Casa #45, Valencia",
        createdAt: Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000)
      },
      {
        nombre: "Carlos Mendoza Silva",
        cedula: "23456789",
        telefono: "04142345678",
        direccion: "Calle Bolívar, Urbanización San José, Edificio Rosa, Apto 3-B, Maracay",
        createdAt: Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000)
      },
      {
        nombre: "Ana Lucía Pérez",
        cedula: "34567890",
        telefono: "04263456789",
        direccion: "Carrera 15 con Calle 8, Sector Centro, Local Comercial, Caracas",
        createdAt: Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000)
      },
      {
        nombre: "José Miguel Torres",
        cedula: "45678901",
        telefono: "04164567890",
        direccion: "Urbanización La Floresta, Manzana C, Casa 23, Ciudad Bolívar",
        createdAt: Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000)
      },
      {
        nombre: "Carmen Elena Vargas",
        cedula: "56789012",
        telefono: "04125678901",
        direccion: "Zona Industrial Norte, Galpón 15, Barquisimeto",
        createdAt: Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000)
      }
    ];

    // Datos de productos ficticios
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
        nombre: "Aire Acondicionado 12000 BTU",
        descripcion: "Aire acondicionado split, 12000 BTU, inverter, bajo consumo, incluye instalación",
        precio: 320.00,
        stock: 10,
        stockMinimo: 2,
        categoria: "Electrodomésticos"
      }
    ];

    // Crear clientes
    console.log('👥 Creando clientes...');
    const clientesCreados = [];
    
    for (const cliente of clientesFicticios) {
      try {
        const nuevoCliente = await clientesDB.crear(cliente);
        clientesCreados.push(nuevoCliente);
        console.log(`✅ Cliente: ${nuevoCliente.nombre} (Control: #${nuevoCliente.numeroControl})`);
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ Error creando cliente ${cliente.nombre}:`, error.message);
      }
    }

    // Crear productos
    console.log('\n📦 Creando productos...');
    const productosCreados = [];
    
    for (const producto of productosFicticios) {
      try {
        const nuevoProducto = await inventarioDB.crear(producto);
        productosCreados.push(nuevoProducto);
        console.log(`✅ Producto: ${nuevoProducto.nombre} - $${nuevoProducto.precio}`);
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ Error creando producto ${producto.nombre}:`, error.message);
      }
    }

    // Crear algunos financiamientos
    console.log('\n💰 Creando financiamientos...');
    const financiamientosCreados = [];
    
    if (clientesCreados.length > 0 && productosCreados.length > 0) {
      for (let i = 0; i < 3; i++) {
        const clienteAleatorio = clientesCreados[Math.floor(Math.random() * clientesCreados.length)];
        const productoAleatorio = productosCreados[Math.floor(Math.random() * productosCreados.length)];
        
        const cuotas = [6, 8, 10, 12][Math.floor(Math.random() * 4)];
        const cantidad = Math.floor(Math.random() * 2) + 1;
        const montoBase = productoAleatorio.precio * cantidad;
        const montoConRecargo = montoBase * 1.4;
        
        try {
          const nuevoFinanciamiento = await financiamientoDB.crear({
            clienteId: clienteAleatorio.id,
            monto: parseFloat(montoConRecargo.toFixed(2)),
            cuotas: cuotas,
            fechaInicio: Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000),
            estado: 'activo',
            productoId: productoAleatorio.id,
            productos: [{
              productoId: productoAleatorio.id,
              cantidad: cantidad,
              precioUnitario: productoAleatorio.precio,
              subtotal: montoBase
            }],
            tipoVenta: 'cuotas',
            descripcion: `Financiamiento de ${cantidad} ${productoAleatorio.nombre}(s)`
          });
          
          financiamientosCreados.push(nuevoFinanciamiento);
          console.log(`✅ Financiamiento: ${clienteAleatorio.nombre} - ${productoAleatorio.nombre} (Control: #F-${nuevoFinanciamiento.numeroControl})`);
          
          // Actualizar stock
          await inventarioDB.actualizarStock(productoAleatorio.id, -cantidad);
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`❌ Error creando financiamiento:`, error.message);
        }
      }
    }

    console.log('\n🎉 DATOS CREADOS EXITOSAMENTE!');
    console.log(`📊 Resumen:`);
    console.log(`   👥 Clientes: ${clientesCreados.length}`);
    console.log(`   📦 Productos: ${productosCreados.length}`);
    console.log(`   💰 Financiamientos: ${financiamientosCreados.length}`);
    console.log('\n🦈 ¡Los Tiburones está listo para probar!');

  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

// Ejecutar
ejecutarDatosPrueba(); 