import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI } from 'better-auth/plugins';
import type { Database } from '@robin/database';
import { users, sessions, accounts, verifications } from '@robin/database';
import nodemailer from 'nodemailer';
import type { Redis } from 'ioredis';

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
  appURL: string;
  redis?: Redis;
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

    advanced: {
      defaultCookieAttributes: {
        sameSite: 'lax', // Same domain - use lax for better security
        secure: true, // Always use secure in production
      },
    },

    // Use Redis for session storage (faster than PostgreSQL)
    secondaryStorage: config.redis ? {
      get: async (key) => {
        const value = await config.redis!.get(key);
        return value;
      },
      set: async (key, value, ttl) => {
        if (ttl) {
          // Better Auth uses seconds, Redis SET EX also uses seconds
          await config.redis!.set(key, value, 'EX', ttl);
        } else {
          await config.redis!.set(key, value);
        }
      },
      delete: async (key) => {
        await config.redis!.del(key);
      },
    } : undefined,

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true, // Enable email verification (but users can still use the app)
      autoSignIn: true, // Auto sign-in even if email is not verified
      sendResetPassword: async ({ user, url }) => {
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
        clientId: process.env['GITHUB_CLIENT_ID'] || '',
        clientSecret: process.env['GITHUB_CLIENT_SECRET'] || '',
        enabled: !!process.env['GITHUB_CLIENT_ID'],
        // Redirect to frontend after OAuth callback
        callbackURL: `${config.appURL}/dashboard`,
      },
      google: {
        clientId: process.env['GOOGLE_CLIENT_ID'] || '',
        clientSecret: process.env['GOOGLE_CLIENT_SECRET'] || '',
        enabled: !!process.env['GOOGLE_CLIENT_ID'],
        // Redirect to frontend after OAuth callback
        callbackURL: `${config.appURL}/dashboard`,
      },
    },

    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: false,
      sendVerificationEmail: async ({ user, url, token }) => {
        console.log('[Better Auth] Verification URL generated:', url);
        console.log('[Better Auth] Token:', token);
        const verificationUrl = `${config.appURL}/verify-email?token=${token}`;

        if (config.emailConfig) {
          await sendEmail({
            to: user.email,
            subject: 'Verify your email - Robin',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #8b5cf6;">Verify your email</h1>
                <p>Hi ${user.name || 'there'},</p>
                <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
                <a href="${verificationUrl}" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Verify Email</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="color: #6b7280; word-break: break-all;">${verificationUrl}</p>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't create an account, please ignore this email.</p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
                <p style="color: #6b7280; font-size: 12px;">Sent from Robin App</p>
              </div>
            `,
          }, config.emailConfig);
        }
      },
    },

    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            // Send welcome email after user creation
            console.log('[Better Auth] Sending welcome email to:', user.email);

            if (config.emailConfig) {
              try {
                await sendEmail({
                  to: user.email,
                  subject: 'Welcome to Robin!',
                  html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                      <h1 style="color: #8b5cf6;">Welcome to Robin!</h1>
                      <p>Hi ${user.name || 'there'},</p>
                      <p>Thanks for joining Robin! We're excited to have you as part of our community.</p>
                      <p>Robin is a modern blogging platform where you can share your thoughts, ideas, and stories with the world.</p>
                      <h2 style="color: #8b5cf6; font-size: 18px; margin-top: 30px;">Getting Started</h2>
                      <ul style="line-height: 1.8;">
                        <li>Create your first post in the Content Manager</li>
                        <li>Customize your profile settings</li>
                        <li>Explore posts from other writers</li>
                      </ul>
                      <a href="${config.appURL}/admin/posts" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Start Writing</a>
                      <p style="margin-top: 30px;">If you have any questions or need help, feel free to reach out to our support team.</p>
                      <p>Happy writing!</p>
                      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
                      <p style="color: #6b7280; font-size: 12px;">Sent from Robin App</p>
                    </div>
                  `,
                }, config.emailConfig);
                console.log('[Better Auth] Welcome email sent successfully to:', user.email);
              } catch (error) {
                console.error('[Better Auth] Failed to send welcome email:', error);
                // Don't throw - we don't want to fail user creation if email fails
              }
            }
          },
        },
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
      max: 100,
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
