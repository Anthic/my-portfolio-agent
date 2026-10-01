import axios from 'axios';
import { env } from '../config/env.js';

export interface LeadNotificationPayload {
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  roleOffered?: string | null;
  message: string;
  ref?: string | null;
}

export async function sendTelegramLeadAlert(lead: LeadNotificationPayload): Promise<boolean> {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[WARN] Telegram Bot Token or Chat ID not configured');
    return false;
  }


  const text = `
🚀 *NEW RECRUITER / CLIENT LEAD!*

👤 *Name:* ${lead.name}
🏢 *Company:* ${lead.company || 'Not specified'}
💼 *Role/Topic:* ${lead.roleOffered || 'General Inquiry'}
✉️ *Email:* ${lead.email || 'N/A'}
📞 *Phone:* ${lead.phone || 'N/A'}
💬 *Message:* ${lead.message}
🔗 *Source/Ref:* ${lead.ref || 'Direct Chat'}
⏰ *Time:* ${new Date().toLocaleString()}
`.trim();

  
  const inlineButtons: Array<Array<{ text: string; url: string }>> = [];

  if (lead.phone) {
    const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
    inlineButtons.push([
      {
        text: '💬 WhatsApp Direct',
        url: `https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(lead.name)},%20Anthic%20here!`,
      },
    ]);
  }



  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      reply_markup: inlineButtons.length > 0 ? { inline_keyboard: inlineButtons } : undefined,
    });
    console.log(`[INFO] Telegram lead alert sent for ${lead.name}`);
    return true;
  } catch (err: any) {
    console.error('[ERROR] Failed to send Telegram alert:', err.response?.data || err.message);
    return false;
  }
}

export async function sendTelegramReferralAlert(
  ref: string,
  meta: { referrer?: string; country?: string; city?: string } = {}
): Promise<boolean> {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return false;

  const text = `
🎯 *VIP / TRACKED VISITOR ALERT!*

🔗 *Referral Campaign:* \`${ref}\`
🌐 *Referrer:* ${meta.referrer || 'Direct Link'}
📍 *Location:* ${meta.city ? `${meta.city}, ${meta.country}` : 'Unknown Location'}
⏰ *Time:* ${new Date().toLocaleString()}
`.trim();

  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      disable_notification: true, // Silent ping
    });
    console.log(`[INFO] Telegram referral ping sent for ref: ${ref}`);
    return true;
  } catch (err: any) {
    console.warn('[WARN] Failed to send Telegram referral ping:', err.message);
    return false;
  }
}

