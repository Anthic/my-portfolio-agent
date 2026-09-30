import axios from 'axios';
import { env } from '../config/env.js';
import { LeadNotificationPayload } from './telegram.js';

export async function sendSmsLeadAlert(lead: LeadNotificationPayload): Promise<boolean> {
  const apiKey = env.SMS_API_KEY;
  const phone = env.MY_PHONE;

  if (!apiKey || !phone) {
    return false;
  }

  const message = `Lead: ${lead.name} from ${lead.company || 'Client'} (${lead.email || lead.phone || 'No Contact'}). Check Telegram.`;

  try {
  
    await axios.post('http://bulksmsbd.net/api/smsapi', {
      api_key: apiKey,
      type: 'text',
      number: phone,
      senderid: '880961761xxxx',
      message: message.slice(0, 155), 
    });
    console.log('[INFO] Offline SMS alert dispatched');
    return true;
  } catch (err: any) {
    console.warn('[WARN] SMS gateway failed (skipping):', err.message);
    return false;
  }
}
