import { format, transports } from 'winston';
import { TelegramTransport } from './telegram.transport';

const isDev = process.env.NODE_ENV !== 'production';

const telegramErrorTransport = new TelegramTransport({
  level: 'error',
  token: process.env.TELE_ERRORS_BOT_TOKEN,
  chatId: process.env.TELE_ERRORS_CHAT_ID,
});

export const winstonConfig = {
  level: isDev ? 'debug' : 'info',
  format: format.combine(
    format.errors({ stack: true }),
    format.splat(),
  ),
  transports: [
    new transports.Console({
      level: isDev ? 'debug' : 'info',
      format: isDev
        ? format.combine(
            format.colorize(),
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf(({ timestamp, level, message, context, stack }) => {
              return stack
                ? `${timestamp} [${level}]${context ? ` [${context}]` : ''} ${message}\n${stack}`
                : `${timestamp} [${level}]${context ? ` [${context}]` : ''} ${message}`;
            }),
          )
        : format.combine(format.timestamp(), format.json()),
    }),
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: format.combine(format.timestamp(), format.json()),
    }),
    telegramErrorTransport,
  ],
};
