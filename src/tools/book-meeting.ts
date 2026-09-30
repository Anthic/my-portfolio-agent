import { BookMeetingInput, BookMeetingSchema } from './schemas.js';

export async function executeBookMeeting(args: unknown): Promise<string> {
  const parsed = BookMeetingSchema.safeParse(args);
  const data: BookMeetingInput | null = parsed.success ? parsed.data : null;
  const meetingType = data?.meetingType || 'quick_intro_15m';

 
  const calLinks: Record<string, string> = {
    quick_intro_15m: 'https://cal.com/anthic-kumar-singh/15min',
    technical_interview_30m: 'https://cal.com/anthic-kumar-singh/30min',
    general: 'https://cal.com/anthic-kumar-singh',
  };

  const selectedLink = calLinks[meetingType] || calLinks.general;

  return `You can directly pick a convenient time on Anthic's calendar here: ${selectedLink}. Looking forward to connecting!`;
}
