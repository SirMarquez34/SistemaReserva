const { createLogger, format, transports } = require('winston');

const isDev = process.env.NODE_ENV !== 'production';

const devFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'HH:mm:ss' }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${extra}`;
  })
);

const prodFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json()
);

const logger = createLogger({
  level: isDev ? 'debug' : 'info',
  format: isDev ? devFormat : prodFormat,
  transports: [new transports.Console()],
});

if (!isDev) {
  logger.add(new transports.File({ filename: 'logs/error.log', level: 'error' }));
  logger.add(new transports.File({ filename: 'logs/combined.log' }));
}

logger.stream = {
  write: (message) => logger.http(message.trimEnd()),
};

module.exports = logger;
