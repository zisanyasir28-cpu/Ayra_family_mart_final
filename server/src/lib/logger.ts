import pino from 'pino';

const isDev = process.env['NODE_ENV'] !== 'production';
const isTest = process.env['NODE_ENV'] === 'test';

// Pino logger config:
//  • Structured JSON in production (works with Datadog, Loki, ELK, etc.)
//  • Pretty-printed in dev for readability
//  • Silent in tests (avoid noise — tests can still capture via custom transport)
//  • Redacts sensitive fields (auth header, cookies, password fields, tokens)
export const logger = pino({
  level: isTest ? 'silent' : (process.env['LOG_LEVEL'] ?? (isDev ? 'debug' : 'info')),
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["set-cookie"]',
      '*.password',
      '*.passwordHash',
      '*.accessToken',
      '*.refreshToken',
      '*.token',
    ],
    remove: true,
  },
  ...(isDev && !isTest && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize:      true,
        translateTime: 'HH:MM:ss',
        ignore:        'pid,hostname',
      },
    },
  }),
});
