// utils/logger.ts

type LogLevel = 'info' | 'warn' | 'error';

interface LogMessage {
  context: string;
  message: string;
  error?: Error;
  timestamp: string;
}

class Logger {
  private static formatMessage(logMessage: LogMessage): string {
    return `[${logMessage.timestamp}] ${logMessage.context}: ${logMessage.message}`;
  }

  private static log(level: LogLevel, context: string, error: Error | string) {
    if (process.env.NODE_ENV === 'development') {
      const errorObject = error instanceof Error ? error : new Error(error);
      const logMessage: LogMessage = {
        context,
        message: errorObject.message,
        error: errorObject,
        timestamp: new Date().toISOString()
      };

      switch (level) {
        case 'info':
          // eslint-disable-next-line no-console
          console.log(this.formatMessage(logMessage));
          break;
        case 'warn':
          // eslint-disable-next-line no-console
          console.warn(this.formatMessage(logMessage));
          break;
        case 'error':
          // eslint-disable-next-line no-console
          console.error(this.formatMessage(logMessage));
          break;
      }
    }
  }

  static error(context: string, error: Error | string) {
    this.log('error', context, error);
  }

  static warn(context: string, error: Error | string) {
    this.log('warn', context, error);
  }

  static info(context: string, message: string) {
    this.log('info', context, message);
  }
}

export default Logger;