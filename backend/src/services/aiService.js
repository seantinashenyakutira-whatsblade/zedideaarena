const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_KEY;
const MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b:free';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const cache = new Map();

function getCacheKey(type, userId) {
  return `${type}_${userId}`;
}

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.value;
  return null;
}

function setCache(key, value) {
  cache.set(key, { value, ts: Date.now() });
}

async function callAI(systemPrompt, userPrompt, maxTokens = 200) {
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'sk-or-...') {
    return null;
  }
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://zedideaarena.com',
        'X-Title': 'ZedIdeaArena',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

function buildUserContext(user) {
  const parts = [];
  if (user.name) parts.push(`Name: ${user.name}`);
  if (user.role) parts.push(`Role: ${user.role}`);
  if (user.country) parts.push(`Country: ${user.country}`);
  if (user.interests?.length) parts.push(`Interests: ${user.interests.join(', ')}`);
  if (user.profession) parts.push(`Profession: ${user.profession}`);
  return parts.join('\n');
}

async function generateSubject(emailType, user) {
  const key = getCacheKey(`subj_${emailType}`, user.id || user.email);
  const cached = getCached(key);
  if (cached) return cached;

  const context = buildUserContext(user);
  const prompt = `Write a short email subject line (max 60 chars, no quotes) for a ${emailType} email from Sean, founder of ZedIdeaArena. Keep it warm, first-person, no clickbait.\n\nUser context:\n${context}`;

  const result = await callAI(
    'You write short, warm, first-person email subject lines for a startup founder. Max 60 characters. No quotes, no emojis. Return only the subject line text.',
    prompt,
    60
  );

  if (result) {
    setCache(key, result);
    return result;
  }
  return null;
}

async function generateIntro(emailType, user) {
  const key = getCacheKey(`intro_${emailType}`, user.id || user.email);
  const cached = getCached(key);
  if (cached) return cached;

  const context = buildUserContext(user);
  const prompt = `Write a 1-2 sentence personal email intro from Sean (founder of ZedIdeaArena) to a waitlist member. Warm, first-person, mentions something relevant to the user.\n\nEmail type: ${emailType}\nUser:\n${context}`;

  const result = await callAI(
    `You are Sean, founder of ZedIdeaArena — a platform where ideas compete, get noticed, and win real rewards. You write warm, first-person, authentic emails to your waitlist community. Max 2 sentences. No markdown. No emojis. Return only the intro paragraph.`,
    prompt,
    150
  );

  if (result) {
    setCache(key, result);
    return result;
  }
  return null;
}

async function generateFollowUpQuestion(user) {
  const key = getCacheKey('followup', user.id || user.email);
  const cached = getCached(key);
  if (cached) return cached;

  const context = buildUserContext(user);
  const result = await callAI(
    `You are Sean, founder of ZedIdeaArena. Write one personal question to learn more about a waitlist member's interests, tailored to their profile. Max 15 words. Return only the question.`,
    `Generate a follow-up question for this user:\n${context}`,
    60
  );

  if (result) {
    setCache(key, result);
    return result;
  }
  return null;
}

module.exports = {
  generateSubject,
  generateIntro,
  generateFollowUpQuestion,
};
