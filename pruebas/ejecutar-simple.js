// Script simplificado para generar datos de prueba
// Ejecuta directamente con Firebase

const { initializeApp } = require('firebase/app');
const { 
  getDatabase, 
  ref, 
  set, 
  get, 
  push, 
  runTransaction, 
  update 
} = require('firebase/database');

// Configuración de Firebase se define después de cargar las variables

// Leer variables de entorno desde .env.local ANTES de definir firebaseConfig
require('dotenv').config({ path: '.env.local' });

async function ejecutarDatosPrueba() {
  console.log('🚀 INICIANDO GENERACIÓN DE DATOS DE PRUEBA\n');
  
  try {
    // Verificar que las variables estén cargadas
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      throw new Error('Variables de Firebase no encontradas. Verifica .env.local');
    }
    
    // Configuración actualizada con variables cargadas
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };
    
    // Inicializar Firebase
    console.log('🔥 Conectando con Firebase...');
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);
    console.log('✅ Conexión exitosa con Firebase\n');

    // Función para obtener siguiente número de control
    async function obtenerSiguienteControl(entidad) {
      const contadorRef = ref(database, `contadores/${entidad}`);
      
      try {
        const resultado = await runTransaction(contadorRef, (valorActual) => {
          const nuevoValor = (valorActual || 0) + 1;
          return nuevoValor;
        });
        
        return resultado.snapshot.val();
      } catch (error) {
        console.error('Error al obtener siguiente número de control:', error);
        throw new Error('Error al generar número de control');
      }
    }

    // Función para verificar cédula única
    async function verificarCedulaUnica(cedula, idExcluir) {
      try {
        const snapshot = await get(ref(database, 'clientes'));
        
        if (!snapshot.exists()) {
          return true;
        }
        
        const todosLosClientes = snapshot.val();
        
        const clientesConCedula = Object.values(todosLosClientes).filter(
          cliente => cliente.cedula === cedula
        );
        
        if (idExcluir) {
          const clientesFiltrados = clientesConCedula.filter(
            cliente => cliente.id !== idExcluir
          );
          return clientesFiltrados.length === 0;
        }
        
        return clientesConCedula.length === 0;
      } catch (error) {
        console.error('Error al verificar unicidad de cédula:', error);
        return true;
      }
    }

    // Datos de clientes ficticios
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
        // Verificar cédula única
        const esUnica = await verificarCedulaUnica(cliente.cedula);
        if (!esUnica) {
          console.log(`⚠️  Cliente ${cliente.nombre} ya existe (cédula ${cliente.cedula})`);
          continue;
        }

        // Obtener número de control
        const numeroControl = await obtenerSiguienteControl('clientes');
        
        // Crear cliente
        const clientesRef = ref(database, 'clientes');
        const newClienteRef = push(clientesRef);
        const id = newClienteRef.key;
        
        const nuevoCliente = { 
          ...cliente, 
          id, 
          numeroControl,
          createdAt: Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000)
        };
        
        await set(newClienteRef, nuevoCliente);
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
        const productosRef = ref(database, 'productos');
        const newProductoRef = push(productosRef);
        const id = newProductoRef.key;
        
        const timestamp = Date.now();
        const nuevoProducto = { 
          ...producto, 
          id,
          createdAt: timestamp,
          updatedAt: timestamp
        };
        
        await set(newProductoRef, nuevoProducto);
        productosCreados.push(nuevoProducto);
        console.log(`✅ Producto: ${nuevoProducto.nombre} - $${nuevoProducto.precio}`);
        
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ Error creando producto ${producto.nombre}:`, error.message);
      }
    }

    // Crear financiamientos
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
          // Obtener número de control
          const numeroControl = await obtenerSiguienteControl('financiamientos');
          
          const financiamientosRef = ref(database, 'financiamientos');
          const newFinanciamientoRef = push(financiamientosRef);
          const id = newFinanciamientoRef.key;
          
          const nuevoFinanciamiento = {
            id,
            numeroControl,
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
          };
          
          await set(newFinanciamientoRef, nuevoFinanciamiento);
          financiamientosCreados.push(nuevoFinanciamiento);
          console.log(`✅ Financiamiento: ${clienteAleatorio.nombre} - ${productoAleatorio.nombre} (Control: #F-${nuevoFinanciamiento.numeroControl})`);
          
          // Actualizar stock del producto
          const nuevoStock = productoAleatorio.stock - cantidad;
          await update(ref(database, `productos/${productoAleatorio.id}`), { 
            stock: nuevoStock,
            updatedAt: Date.now()
          });
          
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