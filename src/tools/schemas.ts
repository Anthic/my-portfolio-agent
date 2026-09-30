import { z } from 'zod';


export const CaptureLeadSchema = z.object({
  name: z.string().describe("The visitor or recruiter's full name"),
  email: z.string().email("Valid email required").optional().describe("Their professional email"),
  phone: z.string().optional().describe("Their phone or WhatsApp number"),
  company: z.string().optional().describe("Company or organization name they represent"),
  roleOffered: z.string().optional().describe("Job title, role, or project context offered to Anthic"),
  message: z.string().describe("Summary of what they want or what was discussed in chat"),
  ref: z.string().optional().describe("Source referral if present"),
});

export type CaptureLeadInput = z.infer<typeof CaptureLeadSchema>;


export const BookMeetingSchema = z.object({
  meetingType: z.enum(['quick_intro_15m', 'technical_interview_30m', 'general']).default('quick_intro_15m'),
  visitorName: z.string().optional(),
});

export type BookMeetingInput = z.infer<typeof BookMeetingSchema>;


export const AGENT_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'capture_lead',
      description: 'Call this whenever a visitor, client, or recruiter shares their contact details, expresses interest in hiring Anthic, or wants to connect.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: "The visitor's name" },
          email: { type: 'string', description: 'Their contact email' },
          phone: { type: 'string', description: 'Their phone or WhatsApp number' },
          company: { type: 'string', description: 'Company or organization' },
          roleOffered: { type: 'string', description: 'The role or project opportunity' },
          message: { type: 'string', description: 'Summary of the discussion/inquiry' },
          ref: { type: 'string', description: 'Source reference' },
        },
        required: ['name', 'message'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'book_meeting',
      description: 'Call this when the user asks to schedule a call, interview, or meeting with Anthic.',
      parameters: {
        type: 'object',
        properties: {
          meetingType: {
            type: 'string',
            enum: ['quick_intro_15m', 'technical_interview_30m', 'general'],
            description: 'Type of meeting desired',
          },
          visitorName: { type: 'string', description: "The visitor's name" },
        },
      },
    },
  },
];
