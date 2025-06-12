import { useState, useEffect, useMemo } from 'react'
import { 
  Cliente, 
  FinanciamientoCuota, 
  Cobro,
  financiamientoDB,
  cobrosDB 
} from '@/lib/firebase/database'
import { calcularCuotasAtrasadas } from '@/utils/financiamiento'

export interface ClienteFinanciero extends Cliente {
  // Métricas financieras
  totalFinanciado: number
  balancePendiente: number
  financiamientosActivos: number
  financiamientosCompletados: number
  cuotasAtrasadas: number
  diasAtrasoPromedio: number
  porcentajePagosAlDia: number
  
  // Estado del cliente
  estadoFinanciero: 'excelente' | 'bueno' | 'regular' | 'malo' | 'critico' | 'nuevo'
  riesgo: 'bajo' | 'medio' | 'alto' | 'critico'
  
  // Próximas acciones
  proximoVencimiento: number | null
  montoProximoVencimiento: number
  
  // Detalles financieros
  financiamientos: FinanciamientoCuota[]
  historialCompleto: boolean
}

export function useClientesFinancieros(clientes: Cliente[]) {
  const [financiamientos, setFinanciamientos] = useState<FinanciamientoCuota[]>([])
  const [cobros, setCobros] = useState<Cobro[]>([])
  const [loading, setLoading] = useState(true)

  // Suscribirse a financiamientos y cobros
  useEffect(() => {
    const unsubFinanciamientos = financiamientoDB.suscribir((data) => {
      setFinanciamientos(data)
    })
    
    const unsubCobros = cobrosDB.suscribir((data) => {
      setCobros(data)
      setLoading(false)
    })

    return () => {
      unsubFinanciamientos()
      unsubCobros()
    }
  }, [])

  // Calcular información financiera para cada cliente
  const clientesFinancieros = useMemo((): ClienteFinanciero[] => {
    return clientes.map(cliente => {
      // Financiamientos del cliente
      const financiamientosCliente = financiamientos.filter(f => f.clienteId === cliente.id)
      
      // Métricas básicas
      const totalFinanciado = financiamientosCliente.reduce((sum, f) => sum + f.monto, 0)
      const financiamientosActivos = financiamientosCliente.filter(f => f.estado === 'activo' || f.estado === 'atrasado').length
      const financiamientosCompletados = financiamientosCliente.filter(f => f.estado === 'completado').length
      
      // Calcular balance pendiente y cuotas atrasadas
      let balancePendiente = 0
      let cuotasAtrasadasTotal = 0
      let diasAtrasoTotal = 0
      let financiamientosConAtraso = 0
      
      financiamientosCliente.forEach(financiamiento => {
        const cobrosFinanciamiento = cobros.filter(c => 
          c.financiamientoId === financiamiento.id && 
          (c.tipo === 'cuota' || c.tipo === 'inicial')
        )
        
        const totalCobrado = cobrosFinanciamiento.reduce((sum, c) => sum + c.monto, 0)
        const pendiente = Math.max(0, financiamiento.monto - totalCobrado)
        balancePendiente += pendiente
        
        if (financiamiento.tipoVenta === 'cuotas' && pendiente > 0) {
          const cuotasAtrasadas = calcularCuotasAtrasadas(financiamiento, cobrosFinanciamiento)
          cuotasAtrasadasTotal += cuotasAtrasadas
          
          if (cuotasAtrasadas > 0) {
            financiamientosConAtraso++
            // Calcular días de atraso basado en fecha de inicio y cuotas atrasadas
            const milisegundosPorSemana = 7 * 24 * 60 * 60 * 1000
            const diasAtraso = cuotasAtrasadas * 7 // Asumiendo pagos semanales
            diasAtrasoTotal += diasAtraso
          }
        }
      })
      
      const diasAtrasoPromedio = financiamientosConAtraso > 0 ? diasAtrasoTotal / financiamientosConAtraso : 0
      
      // Calcular porcentaje de pagos al día
      const totalFinanciamientosConCuotas = financiamientosCliente.filter(f => f.tipoVenta === 'cuotas').length
      const financiamientosAlDia = totalFinanciamientosConCuotas - financiamientosConAtraso
      const porcentajePagosAlDia = totalFinanciamientosConCuotas > 0 
        ? (financiamientosAlDia / totalFinanciamientosConCuotas) * 100 
        : 100
      
      // Determinar estado financiero
      let estadoFinanciero: ClienteFinanciero['estadoFinanciero'] = 'nuevo'
      if (totalFinanciado > 0) {
        if (cuotasAtrasadasTotal === 0 && balancePendiente === 0) {
          estadoFinanciero = 'excelente'
        } else if (cuotasAtrasadasTotal === 0) {
          estadoFinanciero = 'bueno'
        } else if (cuotasAtrasadasTotal <= 2) {
          estadoFinanciero = 'regular'
        } else if (cuotasAtrasadasTotal <= 5) {
          estadoFinanciero = 'malo'
        } else {
          estadoFinanciero = 'critico'
        }
      }
      
      // Determinar nivel de riesgo
      let riesgo: ClienteFinanciero['riesgo'] = 'bajo'
      if (cuotasAtrasadasTotal > 0) {
        if (cuotasAtrasadasTotal <= 2) riesgo = 'medio'
        else if (cuotasAtrasadasTotal <= 5) riesgo = 'alto'
        else riesgo = 'critico'
      }
      
      // Calcular próximo vencimiento (simplificado - próxima semana)
      const ahora = Date.now()
      const proximaSemana = ahora + (7 * 24 * 60 * 60 * 1000)
      let proximoVencimiento: number | null = null
      let montoProximoVencimiento = 0
      
      if (financiamientosActivos > 0) {
        proximoVencimiento = proximaSemana
        // Calcular monto aproximado del próximo vencimiento
        const financiamientosConCuotas = financiamientosCliente.filter(f => 
          f.tipoVenta === 'cuotas' && (f.estado === 'activo' || f.estado === 'atrasado')
        )
        montoProximoVencimiento = financiamientosConCuotas.reduce((sum, f) => {
          const valorCuota = Math.round(f.monto / f.cuotas)
          return sum + valorCuota
        }, 0)
      }

      return {
        ...cliente,
        totalFinanciado,
        balancePendiente,
        financiamientosActivos,
        financiamientosCompletados,
        cuotasAtrasadas: cuotasAtrasadasTotal,
        diasAtrasoPromedio,
        porcentajePagosAlDia,
        estadoFinanciero,
        riesgo,
        proximoVencimiento,
        montoProximoVencimiento,
        financiamientos: financiamientosCliente,
        historialCompleto: totalFinanciado > 0
      }
    })
  }, [clientes, financiamientos, cobros])

  // Utilidades para filtrado
  const filtrarPorEstadoFinanciero = (estado: ClienteFinanciero['estadoFinanciero']) => {
    return clientesFinancieros.filter(c => c.estadoFinanciero === estado)
  }

  const filtrarPorRiesgo = (nivelRiesgo: ClienteFinanciero['riesgo']) => {
    return clientesFinancieros.filter(c => c.riesgo === nivelRiesgo)
  }

  const clientesConAtrasos = clientesFinancieros.filter(c => c.cuotasAtrasadas > 0)
  const clientesAlDia = clientesFinancieros.filter(c => c.financiamientosActivos > 0 && c.cuotasAtrasadas === 0)
  const clientesNuevos = clientesFinancieros.filter(c => c.estadoFinanciero === 'nuevo')

  // Estadísticas generales
  const estadisticasFinancieras = {
    totalClientes: clientesFinancieros.length,
    clientesActivos: clientesFinancieros.filter(c => c.financiamientosActivos > 0).length,
    clientesConAtrasos: clientesConAtrasos.length,
    clientesAlDia: clientesAlDia.length,
    clientesNuevos: clientesNuevos.length,
    totalBalancePendiente: clientesFinancieros.reduce((sum, c) => sum + c.balancePendiente, 0),
    totalFinanciadoHistorico: clientesFinancieros.reduce((sum, c) => sum + c.totalFinanciado, 0),
    promedioAtrasos: clientesConAtrasos.length > 0 
      ? clientesConAtrasos.reduce((sum, c) => sum + c.cuotasAtrasadas, 0) / clientesConAtrasos.length 
      : 0
  }

  return {
    clientesFinancieros,
    loading,
    estadisticasFinancieras,
    filtrarPorEstadoFinanciero,
    filtrarPorRiesgo,
    clientesConAtrasos,
    clientesAlDia,
    clientesNuevos
  }
} 