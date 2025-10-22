/**
 * Utility to initialize and share the Gemini client and API key
 */

let geminiClient = null;

/**
 * Returns the API key for Google Generative AI
 */
export const getGoogleApiKey = () => {
  return process.env.GEMINI_API_KEY || '';
};

/**
 * Initializes and returns a GoogleGenerativeAI singleton
 */
export async function initializeGeminiClient()
{
  const apiKey = getGoogleApiKey();
  if (!apiKey) {
    console.warn('⚠️  GEMINI_API_KEY/GOOGLE_API_KEY not configured');
    return false;
  }
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    geminiClient = new GoogleGenerativeAI(apiKey);
    console.log('✅ Gemini client initialized');
    return true;
  } catch (err) {
    console.error('❌ Gemini initialization error:', err?.message || err);
    return false;
  }
};

/**
 * Returns the existing client or attempts to initialize it
 */
export async function getGeminiClient() {
  if (geminiClient) return geminiClient;
  const ok = await initializeGeminiClient();
  return ok ? geminiClient : null;
};
