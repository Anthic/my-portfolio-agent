# RULE 04: TOOLS & FUNCTION CALLING SPECIFICATION

Every tool used by the agent must be strictly defined with **Zod** schemas and handled through deterministic executors.

## 1. Tool Catalog

### A. `capture_lead` (Critical Conversion Tool)
- **Description**: Invoked when a recruiter or client expresses interest in hiring, collaboration, or shares contact details (email, phone, company).
- **Zod Schema**:
  ```typescript
  import { z } from 'zod';

  export const CaptureLeadSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email required").optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    roleOffered: z.string().optional(),
    message: z.string().min(1, "Message or notes from discussion"),
    ref: z.string().optional(), // campaign or company ref e.g. 'google'
  });
  ```
- **Behavior**:
  - Saves record to Supabase `leads` table.
  - Fires non-blocking notifications to Telegram, Resend, and BD SMS Gateway.
  - Returns friendly confirmation to user: *"Thank you! I have saved your details and sent an immediate priority notification to Anthic."*

### B. `search_profile` (Knowledge Lookup Tool)
- **Description**: Searches specific career aspects, tech stack details, or project case studies.
- **Zod Schema**:
  ```typescript
  export const SearchProfileSchema = z.object({
    query: z.string().describe("The specific technical or career topic to query"),
    category: z.enum(["skills", "projects", "education", "experience", "general"]).default("general"),
  });
  ```

### C. `book_meeting` (Meeting & Cal.com Scheduling)
- **Description**: Provides a direct calendar scheduling link when the visitor wants to set up an interview or call.
- **Zod Schema**:
  ```typescript
  export const BookMeetingSchema = z.object({
    meetingType: z.enum(["quick_intro_15m", "technical_interview_30m", "general"]).default("quick_intro_15m"),
    visitorName: z.string().optional(),
  });
  ```
- **Returns**: Cal.com URL e.g. `https://cal.com/anthic-kumar/15min`.

### D. `navigate_portfolio` (Client-Side Action Signal)
- **Description**: Directs the frontend chat client to scroll to a specific section or open a project modal.
- **Zod Schema**:
  ```typescript
  export const NavigatePortfolioSchema = z.object({
    targetSection: z.enum(["hero", "about", "work", "skills", "experience", "contact"]),
    projectSlug: z.string().optional(),
  });
  ```
- **Returns**: Emits a custom SSE event `event: navigate` so the client-side JavaScript can smoothly scroll the page behind the chat widget.
