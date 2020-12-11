import winston from 'winston';

export interface LoggerService {
  logger: object;
}

export class WinstonLoggerService implements LoggerService {
  logger: winston.Logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(info => {
            return `[${info.timestamp}]  ${info.level}: ${info.message}`;
          }),
        ),
      }),
    ],
  });
}
