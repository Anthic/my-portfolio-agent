import { sendTelegramLeadAlert, LeadNotificationPayload } from './telegram.js';
import { sendEmailLeadAlert } from './email.js';
import { sendSmsLeadAlert } from './sms.js';

export class NotificationDispatcher {
  static async dispatchLeadNotification(lead: LeadNotificationPayload): Promise<void> {
    const results = await Promise.allSettled([
      sendTelegramLeadAlert(lead),
      sendEmailLeadAlert(lead),
      sendSmsLeadAlert(lead),
    ]);

    results.forEach((res, idx) => {
      const channel = idx === 0 ? 'Telegram' : idx === 1 ? 'Email' : 'SMS';
      if (res.status === 'rejected') {
        console.error(`[WARN] Channel ${channel} failed:`, res.reason);
      }
    });
  }
}
