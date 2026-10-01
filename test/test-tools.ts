import { LLMRouter } from '../src/llm/router.js';

async function testLeadCapture() {
  console.log('🧪 Testing Lead Capture Tool Calling...\n');

  const recruiterMessage = "notify anthic that i am jamil my email is anthickumarsingh@gamil.com and 01717182035 is my phone number 20/10/2026 his interview notify him";

  console.log(`User: ${recruiterMessage}\n\nAgent Response:\n`);

  await LLMRouter.streamChat(recruiterMessage, [], {
    onChunk: (chunk) => process.stdout.write(chunk),
  });

  console.log('\n\n✅ Test Finished! Check your Telegram and Supabase leads table!');
}

testLeadCapture();
