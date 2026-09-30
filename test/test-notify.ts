import axios from 'axios';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

async function testNotifications() {
  console.log('🔔 Testing Notification Channels...\n');

  // 1. Test Telegram
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (botToken && chatId) {
    try {
      const tgRes = await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: chatId,
        text: '🚀 *Hello Anthic!*\nYour Portfolio AI Agent is successfully connected to Telegram!',
        parse_mode: 'Markdown',
      });
      console.log('✅ Telegram Alert Sent! Check your Telegram app. Status:', tgRes.data.ok);
    } catch (e: any) {
      console.error('❌ Telegram Error:', e.response?.data || e.message);
    }
  }

  // 2. Test Resend
  const resendKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.OWNER_EMAIL;

  if (resendKey && ownerEmail) {
    try {
      const resend = new Resend(resendKey);
      const emailRes = await resend.emails.send({
        from: 'Portfolio Agent <onboarding@resend.dev>',
        to: ownerEmail,
        subject: '🚀 AI Agent Connected!',
        html: '<strong>Hello Anthic!</strong><p>Your Portfolio AI Agent email notifications are active and ready.</p>',
      });
      console.log('✅ Resend Email Sent! Check your email inbox. ID:', emailRes.data?.id);
    } catch (e: any) {
      console.error('❌ Resend Error:', e.message);
    }
  }
}

testNotifications().catch(console.error);
