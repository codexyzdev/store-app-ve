type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  userId?: string;
  action?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isTest = process.env.NODE_ENV === 'test';

  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    // En tests, solo errores
    if (this.isTest) {
      return level === 'error';
    }
    
    // En desarrollo, todos los niveles
    if (this.isDevelopment) {
      return true;
    }
    
    // En producción, solo warn y error
    return level === 'warn' || level === 'error';
  }

  private output(entry: LogEntry) {
    if (!this.shouldLog(entry.level)) return;

    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌'
    };

    const prefix = `${emoji[entry.level]} [${entry.level.toUpperCase()}]`;
    
    if (this.isDevelopment) {
      // En desarrollo, formato legible
      console.log(`${prefix} ${entry.message}`);
      if (entry.context) {
        console.log('Context:', entry.context);
      }
    } else {
      // En producción, JSON estructurado para logs externos
      if (entry.level === 'error' || entry.level === 'warn') {
        console.log(JSON.stringify(entry));
      }
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.output(this.formatMessage('debug', message, context));
  }

  info(message: string, context?: Record<string, unknown>) {
    this.output(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.output(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>) {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error
    };
    
    this.output(this.formatMessage('error', message, errorContext));
  }

  // Métodos específicos para el dominio de la aplicación
  auth(action: string, userId?: string, context?: Record<string, unknown>) {
    this.info(`AUTH: ${action}`, { ...context, userId, module: 'auth' });
  }

  database(action: string, collection: string, context?: Record<string, unknown>) {
    this.debug(`DB: ${action} in ${collection}`, { ...context, module: 'database' });
  }

  payment(action: string, context?: Record<string, unknown>) {
    this.info(`PAYMENT: ${action}`, { ...context, module: 'payment' });
  }
}

// Instancia singleton
export const logger = new Logger();

// Helper para timing de operaciones
export function withTiming<T>(
  operation: () => Promise<T>,
  label: string,
  context?: Record<string, unknown>
): Promise<T> {
  const start = performance.now();
  
  return operation()
    .then(result => {
      const duration = performance.now() - start;
      logger.debug(`${label} completed`, { ...context, duration: `${duration.toFixed(2)}ms` });
      return result;
    })
    .catch(error => {
      const duration = performance.now() - start;
      logger.error(`${label} failed`, error, { ...context, duration: `${duration.toFixed(2)}ms` });
      throw error;
    });
} 