import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI } from 'better-auth/plugins';
import type { Database } from '@robin/database';
import { users, sessions, accounts, verifications } from '@robin/database';
import nodemailer from 'nodemailer';

// Email sending utility
async function sendEmail(
  message: { to: string; subject: string; html: string },
  config: { host: string; port: number; secure?: boolean; from: string; user?: string; password?: string }
) {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure || false,
    auth: config.user && config.password ? {
      user: config.user,
      pass: config.password,
    } : undefined,
  });

  await transporter.sendMail({
    from: config.from,
    to: message.to,
    subject: message.subject,
    html: message.html,
  });
}

export function createAuth(db: Database, config: {
  baseURL: string;
  secret: string;
  trustedOrigins?: string[];
  emailConfig?: {
    host: string;
    port: number;
    secure?: boolean;
    from: string;
    user?: string;
    password?: string;
  };
}) {
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user: users,
        session: sessions,
        account: accounts,
        verification: verifications,
      },
    }),

    baseURL: config.baseURL,
    secret: config.secret,
    trustedOrigins: config.trustedOrigins || [],

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Set to true to enable email verification
      autoSignIn: true,
      sendResetPassword: async ({ user, url, token }) => {
        // Password reset email
        if (config.emailConfig) {
          await sendEmail({
            to: user.email,
            subject: 'Reset your password - Robin',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #8b5cf6;">Reset your password</h1>
                <p>Hi ${user.name || 'there'},</p>
                <p>We received a request to reset your password. Click the button below to reset it:</p>
                <a href="${url}" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="color: #6b7280; word-break: break-all;">${url}</p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
                <p style="color: #6b7280; font-size: 12px;">Sent from Robin App</p>
              </div>
            `,
          }, config.emailConfig);
        }
      },
    },

    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID || '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        enabled: !!process.env.GITHUB_CLIENT_ID,
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        enabled: !!process.env.GOOGLE_CLIENT_ID,
      },
    },

    plugins: [
      openAPI(),
    ],

    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes
      },
    },

    rateLimit: {
      window: 60,
      max: 10,
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
