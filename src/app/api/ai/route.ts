import { sanitizeUserInput as baseSanitizeUserInput } from '../../../utils/sanitize';
import { validateUserInput, validatePostContent, MAX_POST_LENGTH } from '../../../utils/validation';

// Enhanced sanitization for AI output
function sanitizeUserInput(input: string): string {
  let sanitized = baseSanitizeUserInput(input);
  // Remove SQL keywords and common prompt injection patterns
  sanitized = sanitized.replace(/DROP TABLE/gi, '').replace(/System:/gi, '').replace(/Assistant:/gi, '');
  return sanitized;
}

// AI API route: POST /api/ai
// Expects: { activity: string, context: string, style: string }
// Returns: { post: string, hashtags: string[] }

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as any;
    const { activity, context, style } = body;
    // Sanitize and validate input
    const sanitizedActivity = sanitizeUserInput(activity || '');
    const sanitizedContext = sanitizeUserInput(context || '');
    const styleValue = typeof style === 'string' ? style : 'Technical';

    const activityValidation = validateUserInput(sanitizedActivity);
    const contextValidation = validateUserInput(sanitizedContext);
    if (!activityValidation.isValid) {
      return new Response(JSON.stringify({ error: 'Invalid activity', details: activityValidation.error }), { status: 400 });
    }
    if (!contextValidation.isValid) {
      return new Response(JSON.stringify({ error: 'Invalid context', details: contextValidation.error }), { status: 400 });
    }

    // Generate prompt
    const prompt = `SYSTEM: You are a LinkedIn post generator. Generate professional posts only.\nGITHUB_ACTIVITY: ${sanitizedActivity}\nUSER_CONTEXT: ${sanitizedContext}\nSTYLE: ${styleValue}\n\nRespond with valid JSON: {"post": "...", "hashtags": ["..."]}`;

    // --- AI API call (mocked for now) ---
    // In production, call OpenAI, Anthropic, or Gemini API here
    // For now, return a mock response using sanitized input only
    let post = `Here's a LinkedIn post about: ${sanitizedActivity} (${sanitizedContext}) [${styleValue}]`;
    // Final output sanitization
    post = sanitizeUserInput(post);
    const aiResponse = {
      post,
      hashtags: ['#AI', '#LinkedIn', '#Dev']
    };

    // Validate AI response
    const postValidation = validatePostContent(aiResponse.post);
    if (!postValidation.isValid) {
      return new Response(JSON.stringify({ error: 'Generated post invalid', details: postValidation.error }), { status: 500 });
    }
    if (!Array.isArray(aiResponse.hashtags) || !aiResponse.hashtags.every(h => typeof h === 'string')) {
      return new Response(JSON.stringify({ error: 'Invalid hashtags format' }), { status: 500 });
    }

    return new Response(JSON.stringify(aiResponse), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Internal server error', details: err.message }), { status: 500 });
  }
} 