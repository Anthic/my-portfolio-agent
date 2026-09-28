import { env } from '../src/config/env.js';
import { redis } from '../src/lib/redis.js';
import { supabase } from '../src/lib/supabase.js';
import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';

async function testAll() {
  console.log('🚀 Testing Connections...\n');

  // 1. Test Upstash Redis
  if (redis) {
    try {
      await redis.set('test_key', 'test_val', { ex: 10 });
      const val = await redis.get('test_key');
      console.log('✅ Upstash Redis Connected! Read/Write working. Key value:', val);
    } catch (err: any) {
      console.error('❌ Upstash Redis Error:', err.message);
    }
  } else {
    console.log('⚠️ Upstash Redis skipped.');
  }

  // 2. Test Supabase
  try {
    const { data, error } = await supabase.from('leads').select('count', { count: 'exact', head: true });
    if (error) {
      if (error.code === '42P01') {
        console.log('⚠️ Supabase Connected, but "leads" table not created yet (Run SQL in Rules/07-database-schema.md).');
      } else {
        console.error('❌ Supabase Error:', error.message);
      }
    } else {
      console.log('✅ Supabase Connected! "leads" table is ready and reachable.');
    }
  } catch (err: any) {
    console.error('❌ Supabase Connection Error:', err.message);
  }

  // 3. Test Gemini API Key
  try {
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Reply with the word "PONG" only.',
    });
    console.log('✅ Gemini API Connected! Response:', response.text?.trim());
  } catch (err: any) {
    console.error('❌ Gemini Error:', err.message);
  }

  // 4. Test Groq API Key
  if (env.GROQ_API_KEY) {
    try {
      const groq = new Groq({ apiKey: env.GROQ_API_KEY });
      const models = await groq.models.list();
      const modelIds = models.data.map(m => m.id);
      console.log('All Available Groq models:\n', modelIds.join('\n '));
      const modelToUse = modelIds.find(id => id.includes('qwen') || id.includes('llama-3') || id.includes('gpt-oss')) || modelIds[0];
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: 'Say "GROQ_OK"' }],
        model: modelToUse,
      });
      console.log(`✅ Groq API Connected with [${modelToUse}]! Response:`, chatCompletion.choices[0]?.message?.content?.trim());
    } catch (err: any) {
      console.error('❌ Groq Error:', err.message);
    }
  }

  // 5. Test OpenRouter API Key
  if (env.OPENROUTER_API_KEY) {
    try {
      const { OpenAI } = await import('openai');
      const openRouter = new OpenAI({
        apiKey: env.OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
      });
      const res = await openRouter.chat.completions.create({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [{ role: 'user', content: 'Say "OPENROUTER_OK"' }],
      });
      console.log('✅ OpenRouter Connected! Response:', res.choices[0]?.message?.content?.trim());
    } catch (err: any) {
      console.error('❌ OpenRouter Error:', err.message);
    }
  }

  console.log('\n🏁 Connection check complete.');
}

testAll().catch(console.error);
