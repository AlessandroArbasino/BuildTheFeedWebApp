import { NextResponse } from 'next/server'
import { getGeminiClient } from '../../utils/geminiClient';

let neonClientPromise = null;
const getClient = async () => {
  if (!neonClientPromise) {
    neonClientPromise = (async () => {
      const { neon } = await import('@neondatabase/serverless');
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) throw new Error('DATABASE_URL not configured');
      return neon(connectionString);
    })();
  }
  return await neonClientPromise;
};

export async function POST(request) {
  try {
    const body = await request.json();
    const prompt = (body?.prompt || '').toString().trim();
    if (!prompt) {
      return NextResponse.json({ success: false, error: 'prompt is required' }, { status: 400 });
    }

    // Moderation with Gemini before insertion (using the SDK)
    const MODERATION_PROMPT = process.env.PROMPT_REFINE_INSTRUCTION || process.env.MODERATION_PROMPT;
    if (!MODERATION_PROMPT) {
      return NextResponse.json({ success: false, error: 'Missing configuration: PROMPT_REFINE_INSTRUCTION or MODERATION_PROMPT' }, { status: 500 });
    }
    const moderationInput = `${MODERATION_PROMPT}\n\nUser text:\n${prompt}`;

    let allow = false;
    try {
      let client = await getGeminiClient();
      if (!client) {
        return NextResponse.json({ success: false, error: 'GEMINI_API_KEY/GOOGLE_API_KEY not configured' }, { status: 500 });
      }
      
      const modelName = process.env.DEFAULT_MODEL || 'gemini-2.0-flash';
      const genModel = client.getGenerativeModel({ model: modelName });

      const { response } = await genModel.generateContent(moderationInput);
      const text = (await response.text?.()) || '';
      const normalized = text.trim().toUpperCase();
      allow = normalized === 'SI' || normalized === 'YES';
    } catch (geminiErr) {
      console.error('⚠️ Gemini moderation error:', geminiErr);
      return NextResponse.json({ success: false, error: 'Error during prompt moderation' }, { status: 502 });
    }

    if (!allow) {
      return NextResponse.json({ success: false, error: 'The prompt does not comply with the policy and cannot be inserted' }, { status: 400 });
    }

    const sql = await getClient();
    const result = await sql`INSERT INTO prompt_queue (prompt, create_date)
                                VALUES (${prompt}, ${new Date()})
                                RETURNING id`;

    return NextResponse.json({ success: true, id: result?.[0].id }, { status: 201 });
  } catch (err) {
    console.error('❌ POST /api/prompts error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
