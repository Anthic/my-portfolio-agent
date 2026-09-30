import { LLMRouter } from '../src/llm/router.js';

async function testLeadCapture() {
  console.log('🧪 Testing Lead Capture Tool Calling...\n');

  const recruiterMessage = "Hi Anthic, I am Alex from Google (alex@google.com, +14155552671). We are looking for a Senior AI Engineer and would love to interview you.";

  console.log(`User: ${recruiterMessage}\n\nAgent Response:\n`);

  await LLMRouter.streamChat(recruiterMessage, [], {
    onChunk: (chunk) => process.stdout.write(chunk),
  });

  console.log('\n\n✅ Test Finished! Check your Telegram and Supabase leads table!');
}

testLeadCapture();
