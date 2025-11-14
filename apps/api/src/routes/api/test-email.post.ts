import { defineEventHandler, readBody } from 'h3';
import nodemailer from 'nodemailer';

/**
 * Test endpoint for email sending (development only)
 * POST /api/test-email
 * Body: { to: string, subject?: string }
 */
export default defineEventHandler(async (event) => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    throw createError({
      statusCode: 403,
      message: 'Test endpoint not available in production',
    });
  }

  const body = await readBody(event);
  const { to, subject = 'Test Email from Robin' } = body;

  if (!to) {
    throw createError({
      statusCode: 400,
      message: 'Email recipient (to) is required',
    });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mailpit',
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER && process.env.SMTP_PASSWORD ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    } : undefined,
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@robin.local',
      to,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8b5cf6;">Test Email from Robin</h1>
          <p>This is a test email to verify your SMTP configuration is working correctly.</p>
          <p><strong>Configuration:</strong></p>
          <ul>
            <li>SMTP Host: ${process.env.SMTP_HOST || 'mailpit'}</li>
            <li>SMTP Port: ${process.env.SMTP_PORT || '1025'}</li>
            <li>From: ${process.env.EMAIL_FROM || 'noreply@robin.local'}</li>
          </ul>
          <p style="color: #10b981;">✅ If you're seeing this, your email setup is working!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #6b7280; font-size: 14px;">
            Sent at: ${new Date().toISOString()}<br>
            Environment: ${process.env.NODE_ENV || 'development'}
          </p>
        </div>
      `,
    });

    return {
      success: true,
      message: 'Test email sent successfully',
      info: {
        messageId: info.messageId,
        to,
        from: process.env.EMAIL_FROM || 'noreply@robin.local',
      },
    };
  } catch (error) {
    log.error('Failed to send test email:', error);
    throw createError({
      statusCode: 500,
      message: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
});
