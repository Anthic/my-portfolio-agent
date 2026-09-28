import http from 'node:http';

const postData = JSON.stringify({
  message: 'Give me a 2-sentence summary of Anthic and his main skills.',
  sessionId: 'test-session-user',
});

const req = http.request(
  {
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/chat',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  },
  (res) => {
    console.log(`\n📡 Connected to Server! HTTP Status: ${res.statusCode}`);
    console.log('🤖 Streaming Response from AI Agent:\n');

    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.text) {
              process.stdout.write(data.text);
            }
          } catch {
            // ignore non-json ping
          }
        }
      }
    });

    res.on('end', () => {
      console.log('\n\n✅ Stream Finished Successfully!\n');
    });
  }
);

req.on('error', (e: any) => {
  if (e.code === 'ECONNREFUSED') {
    console.error('❌ Connection Refused: সার্ভারটি চালু নেই!');
    console.error('👉 দয়া করে অন্য একটি টার্মিনালে আগে "npm run dev" চালু রাখুন, তারপর "npm test" দিন।');
  } else {
    console.error(`❌ Request error: ${e.code || ''} ${e.message}`);
  }
});

req.write(postData);
req.end();
