import { render } from '@react-email/components';
import type { ReactElement } from 'react';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: ReactElement;
  replyTo?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
}

interface SendEmailResponse {
  success: boolean;
  id?: string;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using the Inbound API
 * @see https://docs.inbound.new/api-reference/emails/send-email
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResponse> {
  const apiKey = process.env.INBOUND_API_KEY;
  const fromEmail = process.env.INBOUND_FROM_EMAIL;

  if (!apiKey) {
    console.error('INBOUND_API_KEY is not set');
    return { success: false, error: 'Email service not configured' };
  }

  if (!fromEmail) {
    console.error('INBOUND_FROM_EMAIL is not set');
    return { success: false, error: 'Sender email not configured' };
  }

  try {
    // Render the React email to HTML
    const html = await render(options.react);
    // Also generate plain text version
    const text = await render(options.react, { plainText: true });

    const response = await fetch('https://inbound.new/api/v2/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html,
        text,
        ...(options.replyTo && { reply_to: options.replyTo }),
        ...(options.cc && { cc: options.cc }),
        ...(options.bcc && { bcc: options.bcc }),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Inbound email API error:', data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
      };
    }

    console.log('Email sent successfully:', data);
    return {
      success: true,
      id: data.id,
      messageId: data.messageId,
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

