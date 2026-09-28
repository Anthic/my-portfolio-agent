import { LLMRouter } from '../src/llm/router.js';
import { SessionMemory } from '../src/memory/session-memory.js';

async function testAgent() {
  console.log('🤖 Testing AI Agent with Session Memory & Grounded Knowledge...\n');

  const sessionId = 'test-session-123';
  const query = "what is anthic  cv details?";

  console.log(`User: ${query}\nAssistant: `);

  const history = await SessionMemory.getHistory(sessionId);

  const reply = await LLMRouter.streamChat(query, history, {
    onChunk: (chunk) => process.stdout.write(chunk),
  });

  await SessionMemory.appendMessage(sessionId, { role: 'user', content: query });
  await SessionMemory.appendMessage(sessionId, { role: 'assistant', content: reply });

  console.log('\n\n--- Testing Second Turn (Memory Retrieval) ---');
  const followUp = "What was his CGPA in his hsc?";
  console.log(`User: ${followUp}\nAssistant: `);

  const updatedHistory = await SessionMemory.getHistory(sessionId);
  await LLMRouter.streamChat(followUp, updatedHistory, {
    onChunk: (chunk) => process.stdout.write(chunk),
  });

  console.log('\n\n✅ Multi-turn AI Agent Test Complete!');
}

testAgent().catch(console.error);
