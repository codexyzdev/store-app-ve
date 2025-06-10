const { ejecutarScript } = require('./generar-datos.ts');

// Ejecutar el script de datos ficticios
ejecutarScript()
  .then(() => {
    console.log('\n✨ Script ejecutado correctamente!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error ejecutando el script:', error);
    process.exit(1);
  }); 