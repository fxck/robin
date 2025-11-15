import { createAuth } from '@robin/auth';
import { db } from './db';
import { getRedis } from './redis';

// useRuntimeConfig is auto-imported by Nitro
const config = useRuntimeConfig();

export const auth = createAuth(db, {
  baseURL: config.public.apiBase,
  secret: process.env.AUTH_SECRET || 'development-secret-change-in-production-make-it-at-least-32-chars',
  trustedOrigins: [config.public.appUrl],
  redis: getRedis(), // Use Redis for session storage
  emailConfig: process.env.SMTP_HOST ? {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    secure: process.env.SMTP_SECURE === 'true',
    from: process.env.EMAIL_FROM || 'noreply@robin.local',
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
  } : undefined,
});
