import { Resend } from 'resend';
import { env } from '../config/env.js';
import { LeadNotificationPayload } from './telegram.js';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendEmailLeadAlert(lead: LeadNotificationPayload): Promise<boolean> {
  if (!resend || !env.OWNER_EMAIL) {
    console.warn('[WARN] Resend API key or Owner Email not configured');
    return false;
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0f172a; color: white; padding: 20px;">
        <h2 style="margin: 0; font-size: 20px;">🚀 New Portfolio AI Lead</h2>
      </div>
      <div style="padding: 20px; background-color: #f8fafc;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #64748b;"><strong>Name:</strong></td><td>${lead.name}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;"><strong>Company:</strong></td><td>${lead.company || 'N/A'}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;"><strong>Role/Inquiry:</strong></td><td>${lead.roleOffered || 'General'}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;"><strong>Email:</strong></td><td><a href="mailto:${lead.email}">${lead.email || 'N/A'}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;"><strong>Phone:</strong></td><td>${lead.phone || 'N/A'}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;"><strong>Message:</strong></td><td>${lead.message}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;"><strong>Source Ref:</strong></td><td>${lead.ref || 'Direct Web'}</td></tr>
        </table>
      </div>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: 'Portfolio AI Agent <onboarding@resend.dev>',
      to: env.OWNER_EMAIL,
      subject: `🔥 New Lead: ${lead.name} (${lead.company || 'Recruiter'})`,
      html,
    });
    console.log(`[INFO] Resend email dispatched. ID: ${data.data?.id}`);
    return true;
  } catch (err: any) {
    console.error('[ERROR] Failed to send Resend email:', err.message);
    return false;
  }
}
