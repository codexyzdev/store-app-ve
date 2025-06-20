# Corrección de Inconsistencias de Datos - Los Tiburones

## Problema Identificado

Se detectaron inconsistencias en el cálculo de cuotas atrasadas y datos relacionados entre diferentes vistas de la aplicación:

1. **Vista de financiamiento individual**: Mostraba 4 cuotas atrasadas
2. **Vista de cuotas atrasadas**: Mostraba diferentes números de cuotas atrasadas para el mismo financiamiento
3. **Vista resumen de cliente**: Mostraba 3 cuotas atrasadas para el mismo registro
4. **Barra de progreso**: No contaba las cuotas iniciales correctamente

## Causa Raíz

Múltiples lógicas de cálculo dispersas en diferentes archivos:

- `useFinanciamientosRedux.ts`: Usaba `semanasTranscurridas + 1`
- `calcularCuotasAtrasadas` (utils): Usaba solo `semanasPasadas`
- `useCuotasAtrasadasRedux.ts`: Tenía su propia lógica de cálculo
- `financiamientoService.ts`: Otra implementación diferente
- Filtros inconsistentes de cobros (algunos requerían `numeroCuota > 0`, otros no)

**PROBLEMA ESPECÍFICO CON CUOTAS INICIALES:**

- Las cuotas iniciales ocupan las **últimas posiciones** del plan (ej: semanas 14 y 15)
- No se contabilizaban correctamente para el progreso total
- Causaban discrepancias entre el cálculo temporal y el plan visual
- Formula incorrecta: `semanasTranscurridas + 1` vs `semanasTranscurridas`

## Solución Implementada

### 1. Función Unificada de Cálculo (`src/utils/financiamiento.ts`)

Creamos una **única fuente de verdad** para todos los cálculos:

```typescript
export function calcularCuotasAtrasadas(financiamiento, cobros): number;
export function calcularInfoFinanciamiento(
  financiamiento,
  cobros
): InfoCompleta;
export function calcularMontoAtrasado(financiamiento, cobros): number;
export function determinarEstadoFinanciamiento(financiamiento, cobros): Estado;
```

### 2. Lógica Unificada

- **Cuotas esperadas**: `semanas transcurridas + 1` (primera semana se cuenta)
- **Filtros de cobros**: Consistente `(tipo === 'cuota' || tipo === 'inicial') && id && id !== 'temp'`
- **Cuotas pagadas**: Solo cuotas regulares (no iniciales) para cálculo de atrasos
- **Progreso**: Limitado a máximo 100%

### 3. Archivos Actualizados

#### `src/hooks/useFinanciamientosRedux.ts`

- ✅ Usa `calcularInfoFinanciamiento` unificada
- ✅ Eliminada lógica duplicada de cálculo

#### `src/hooks/useCuotasAtrasadasRedux.ts`

- ✅ Usa `calcularCuotasAtrasadas` y `calcularMontoAtrasado` unificadas
- ✅ Simplificado cálculo de días de atraso
- ✅ Eliminada lógica duplicada

#### `src/store/slices/financiamientosSlice.ts`

- ✅ Usa `determinarEstadoFinanciamiento` unificada
- ✅ Usa `calcularCuotasAtrasadas` para estadísticas
- ✅ Eliminada función local duplicada

#### `src/utils/financiamientoHelpers.ts`

- ✅ Refactorizado para usar funciones unificadas
- ✅ Mantiene compatibilidad con interfaz existente

#### `src/services/financiamientoService.ts`

- ✅ Usa función unificada para cálculos
- ✅ Mantiene compatibilidad con API existente

### 4. Correcciones de TypeScript y React

- ✅ Eliminado `React.memo` incorrecto en `FinanciamientoSummaryCard`
- ✅ Corregidos props de `ModalPagoCuota` y `Modal`
- ✅ Corregido props de `ProtectedRoute children`
- ✅ **Agregadas keys únicas en loops de JSX**: Corregido error "Each child in a list should have a unique key prop"

## Beneficios Obtenidos

1. **Consistencia Total**: Todos los componentes usan la misma lógica de cálculo
2. **Mantenibilidad**: Un solo lugar para actualizar lógica de negocio
3. **Redux como Fuente Única**: Los hooks de Redux se mantienen como la única fuente de verdad
4. **Rendimiento**: Eliminación de cálculos duplicados
5. **Menor Complejidad**: Código más limpio y fácil de entender

## Resultado Final

✅ **Todas las vistas ahora muestran datos consistentes**
✅ **Redux mantiene su rol como única fuente de verdad**  
✅ **Eliminadas las inconsistencias en cálculos**
✅ **Código más mantenible y escalable**
✅ **Errores de TypeScript corregidos**

## Archivos Modificados

- `src/utils/financiamiento.ts` - ⭐ Función unificada principal
- `src/hooks/useFinanciamientosRedux.ts`
- `src/hooks/useCuotasAtrasadasRedux.ts`
- `src/store/slices/financiamientosSlice.ts`
- `src/utils/financiamientoHelpers.ts`
- `src/services/financiamientoService.ts`
- `src/components/financiamiento/FinanciamientoSummaryCard.tsx`
- `src/app/financiamiento-cuota/[id]/page.tsx`

## Notas Técnicas

- Se mantuvieron todos los estilos existentes
- No se modificó la estructura de componentes de UI
- La API de los hooks de Redux permanece igual
- Compatibilidad total con el código existente
