# 🚀 Ejecutar Datos de Prueba - Guía Rápida

## ⚡ Comando Rápido

```bash
npm run generar-datos
```

## 📋 Lista de Verificación Previa

- [ ] Firebase configurado en `.env.local`
- [ ] Conexión a internet activa
- [ ] Proyecto en la raíz correcta

## 🎯 Resultado Esperado

```
🚀 INICIANDO GENERACIÓN DE DATOS DE PRUEBA

👥 Creando clientes...
✅ Cliente: María González Rodríguez (Control: #1)
✅ Cliente: Carlos Mendoza Silva (Control: #2)
✅ Cliente: Ana Lucía Pérez (Control: #3)
✅ Cliente: José Miguel Torres (Control: #4)
✅ Cliente: Carmen Elena Vargas (Control: #5)

📦 Creando productos...
✅ Producto: Televisor Smart TV 50" - $450
✅ Producto: Refrigeradora Samsung 18 pies - $650
✅ Producto: Lavadora LG 12kg - $380
✅ Producto: Sofá Reclinable 3 Puestos - $520
✅ Producto: Aire Acondicionado 12000 BTU - $320

💰 Creando financiamientos...
✅ Financiamiento: María González Rodríguez - Televisor Smart TV 50" (Control: #F-1)
✅ Financiamiento: Carlos Mendoza Silva - Refrigeradora Samsung 18 pies (Control: #F-2)
✅ Financiamiento: Ana Lucía Pérez - Lavadora LG 12kg (Control: #F-3)

🎉 DATOS CREADOS EXITOSAMENTE!
📊 Resumen:
   👥 Clientes: 5
   📦 Productos: 5
   💰 Financiamientos: 3

🦈 ¡Los Tiburones está listo para probar!
```

## 🔄 Si Algo Sale Mal

```bash
# Verificar ubicación
pwd
# Debe mostrar: /home/.../store-app-ve

# Verificar Firebase
cat .env.local | grep FIREBASE

# Ejecutar nuevamente
npm run generar-datos
```

¡Listo! 🦈✨
