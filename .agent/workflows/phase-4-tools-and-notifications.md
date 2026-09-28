# WORKFLOW PHASE 4: TOOLS & NOTIFICATION DISPATCHER

## Objectives
Implement Zod-validated tool definitions and build the multi-channel background alerting pipeline.

## Step-by-Step Execution Plan

### Step 4.1: Notification Handlers
- Create `src/notify/telegram.ts`:
  - Posts MarkdownV2 / HTML formatted alerts to `TELEGRAM_CHAT_ID`.
  - Appends inline URL button for instant WhatsApp chat: `https://wa.me/<number>?text=...`.
- Create `src/notify/email.ts`:
  - Uses `resend` to send structured lead notification to `OWNER_EMAIL`.
- Create `src/notify/sms.ts`:
  - Calls BD SMS Gateway endpoint (e.g. BulkSMSBD/Greenweb) for instant offline text alert.
- Create `src/notify/dispatcher.ts`:
  - Orchestrates `Promise.allSettled([telegram, email, sms, supabase])` non-blocking.

### Step 4.2: Tool Executors
- Create `src/tools/capture-lead.ts`:
  - Validates lead payload with Zod.
  - Calls `dispatcher.dispatchLeadNotification(leadData)`.
  - Returns user confirmation message.
- Create `src/tools/book-meeting.ts`:
  - Returns Cal.com link tailored for the requested meeting type.
- Create `src/tools/search-profile.ts`:
  - Performs keyword or semantic profile lookup.

### Verification Check
- Test dispatcher script in isolation to confirm Telegram message lands with clickable buttons.
