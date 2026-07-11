const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(process.cwd(), '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function main() {
  const key = process.env.GEMINI_API_KEY;
  console.log('KEY_PREFIX', key && key.slice(0, 8));
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    generationConfig: { temperature: 0, responseMimeType: 'application/json' },
  });

  const result = await model.generateContent('Return exactly: {"ok":true}');
  console.log(result.response.text());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
