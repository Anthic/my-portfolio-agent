import { supabase } from '../lib/supabase.js';
import { NotificationDispatcher } from '../notify/dispatcher.js';

import { CaptureLeadInput, CaptureLeadSchema } from './schemas.js';

export async function executeCaptureLead(args: unknown): Promise<string> {
  const parseResult = CaptureLeadSchema.safeParse(args);

  if (!parseResult.success) {
    console.warn('[WARN] capture_lead schema validation failed:', parseResult.error);
    return "I couldn't process your contact details completely. Could you please provide your name and an email or phone number?";
  }

  const lead = parseResult.data;

 
  try {
    const { error } = await supabase.from('leads').insert([
      {
        name: lead.name,
        email: lead.email || null,
        phone: lead.phone || null,
        company: lead.company || null,
        role_offered: lead.roleOffered || null,
        message: lead.message,
        ref: lead.ref || 'chat-widget',
        status: 'new',
      },
    ]);

    if (error) {
      console.error('[ERROR] Supabase lead insertion error:', error.message);
    } else {
      console.log(`[INFO] Lead recorded in Supabase for ${lead.name}`);
    }
  } catch (dbErr: any) {
    console.error('[ERROR] Database exception in executeCaptureLead:', dbErr.message);
  }


  // Await notification delivery so serverless function does not freeze before HTTP dispatch
  await NotificationDispatcher.dispatchLeadNotification(lead);


  return `Thank you, ${lead.name}! I have securely recorded your details and sent an instant priority notification directly to Anthic's phone and email. He will reach out to you as soon as possible.`;
}
