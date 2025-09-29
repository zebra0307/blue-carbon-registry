/**
 * Debug logger utility for the Blue Carbon Registry application
 * Provides structured logging with different log levels and context tracking
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  context?: string;
  data?: any;
}

class Logger {
  private isDebugMode: boolean;
  private context: string;

  constructor(context: string = 'App') {
    // Enable debug mode in development
    this.isDebugMode = process.env.NODE_ENV !== 'production';
    this.context = context;
  }

  /**
   * Set the logger context
   */
  setContext(context: string) {
    this.context = context;
    return this;
  }

  /**
   * Create a child logger with a new context
   */
  child(childContext: string): Logger {
    return new Logger(`${this.context}:${childContext}`);
  }

  /**
   * Debug level log - only shown in development
   */
  debug(message: string, options?: LogOptions) {
    this.log('debug', message, options);
    return this;
  }

  /**
   * Info level log
   */
  info(message: string, options?: LogOptions) {
    this.log('info', message, options);
    return this;
  }

  /**
   * Warning level log
   */
  warn(message: string, options?: LogOptions) {
    this.log('warn', message, options);
    return this;
  }

  /**
   * Error level log
   */
  error(message: string | Error, options?: LogOptions) {
    const errorMessage = message instanceof Error ? message.message : message;
    const errorStack = message instanceof Error ? message.stack : undefined;
    
    this.log('error', errorMessage, {
      ...options,
      data: {
        ...(options?.data || {}),
        stack: errorStack
      }
    });
    return this;
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, options?: LogOptions) {
    // Skip debug logs in production
    if (level === 'debug' && !this.isDebugMode) return;
    
    const context = options?.context || this.context;
    const timestamp = new Date().toISOString();
    const data = options?.data ? ` | ${JSON.stringify(options.data)}` : '';

    let consoleMethod: Function;
    
    switch (level) {
      case 'debug':
        consoleMethod = console.debug;
        break;
      case 'info':
        consoleMethod = console.info;
        break;
      case 'warn':
        consoleMethod = console.warn;
        break;
      case 'error':
        consoleMethod = console.error;
        break;
      default:
        consoleMethod = console.log;
    }

    // Format: [LEVEL] [Timestamp] [Context] Message | Data
    consoleMethod(`[${level.toUpperCase()}] [${timestamp}] [${context}] ${message}${data}`);
  }

  /**
   * Log the start of a process
   */
  logStart(processName: string, data?: any) {
    return this.info(`⏳ Starting: ${processName}`, { data });
  }

  /**
   * Log the successful completion of a process
   */
  logSuccess(processName: string, data?: any) {
    return this.info(`✅ Completed: ${processName}`, { data });
  }

  /**
   * Log a failure in a process
   */
  logFailure(processName: string, error: Error | string, data?: any) {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    return this.error(`❌ Failed: ${processName}`, { 
      data: { ...data, error: errorObj.message, stack: errorObj.stack }
    });
  }

  /**
   * Measure execution time of an async function
   */
  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      this.debug(`⏱️ Starting: ${name}`);
      const result = await fn();
      const elapsed = Math.round(performance.now() - start);
      this.debug(`⏱️ Completed: ${name} (${elapsed}ms)`);
      return result;
    } catch (error) {
      const elapsed = Math.round(performance.now() - start);
      this.error(`⏱️ Failed: ${name} (${elapsed}ms)`, { data: { error } });
      throw error;
    }
  }
}

// Create the default application logger
export const logger = new Logger('BlueCarbonRegistry');

// Export specialized loggers for different parts of the application
export const ipfsLogger = logger.child('IPFS');
export const blockchainLogger = logger.child('Blockchain');
export const formLogger = logger.child('Forms');
export const apiLogger = logger.child('API');