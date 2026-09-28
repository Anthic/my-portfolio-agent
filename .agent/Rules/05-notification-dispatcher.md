# RULE 05: NON-BLOCKING MULTI-CHANNEL NOTIFICATION DISPATCHER

## 1. Zero-Blocking Asynchronous Execution
- **Strict Rule**: Notification dispatch must **NEVER block the streaming response** to the recruiter.
- The tool executor must dispatch notifications in the background using `Promise.allSettled()`.
- If one notification channel fails (e.g. SMS provider timeout), others must still deliver, and the user must not see an error.

## 2. Notification Channels

### Channel 1: Telegram Bot (Primary Instant Alert)
- **API**: `https://api.telegram.org/bot<TOKEN>/sendMessage`
- **Payload Formatting**: HTML or MarkdownV2.
- **Message Content**:
  ```
  🔥 NEW RECRUITER LEAD CAPTURED!

  👤 Name: John Doe
  🏢 Company: Acme Corp
  💼 Role: Senior AI Engineer
  ✉️ Email: john@acme.com
  📞 Phone: +1 555 123 4567
  💬 Message: We want to discuss our upcoming agentic AI project.
  🔗 Ref: linkedin-outreach
  ```
- **Action Buttons (Inline Keyboard)**:
  - Button 1 (WhatsApp Direct): `https://wa.me/<CLEAN_PHONE>?text=Hi%20John,%20Anthic%20here!`
  - Button 2 (Email Direct): `mailto:john@acme.com?subject=Regarding%20Portfolio%20Inquiry`

### Channel 2: Resend Email (Formal Lead Backup)
- Sends clean HTML summary to `OWNER_EMAIL`.
- Provides an immutable email record in the developer's primary inbox.

### Channel 3: BD SMS Gateway (Offline Direct SMS)
- **Gateway**: BulkSMSBD / Greenweb API.
- **Goal**: Guaranteed delivery when mobile data or Wi-Fi is turned off.
- **SMS Content**: Concatenated short alert (<160 chars):
  `Lead: [Name] from [Company] ([Phone/Email]). Check Telegram for details.`

## 3. Event-Driven Alert Matrix

| Event | Telegram | Resend Email | BD SMS | Supabase Record |
| :--- | :---: | :---: | :---: | :---: |
| **Lead Captured (`capture_lead`)** | ✅ Instant | ✅ Backup | ✅ Instant | ✅ Logged |
| **New Chat Session Started** | ✅ Silent Ping | ❌ | ❌ | ✅ Logged |
| **Tracked Link Visit (`?ref=google`)** | ✅ Short Ping (Deduped) | ❌ | ❌ | ✅ Logged |
| **Random Direct Web Visit** | ❌ (No Spam) | ❌ | ❌ | ✅ Anonymized |
