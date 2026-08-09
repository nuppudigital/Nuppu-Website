const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface StoryGenerationParams {
  childName: string;
  emotion: string;
  interests: string[];
  ageGroupLabel: string;
  /** Optional free-text topic. Always pre-checked and normalized before use — see safety pipeline below. */
  topic?: string;
}

export interface GeneratedStory {
  id: string;
  title: string;
  content: string;
  emotion: string;
  interests: string[];
  emoji: string;
  duration: string;
  color: string;
  selTheme: string;
}

export interface StorySuggestion {
  emoji: string;
  title: string;
  theme: string;
}

const EMOTION_COLORS: Record<string, string> = {
  Happy: 'from-[#F9E5A8] to-[#FFD4C4]',
  Sad: 'from-[#C9BBF5] to-[#C9EDE1]',
  Scared: 'from-[#D4C5F9] to-[#FFD4C4]',
  Angry: 'from-[#FFD4C4] to-[#F9E5A8]',
  Calm: 'from-[#B8DDB8] to-[#C9EDE1]',
  Confused: 'from-[#F9E5A8] to-[#D4C5F9]',
};

const EMOTION_SEL_THEMES: Record<string, string> = {
  Happy: 'Joy & Gratitude',
  Sad: 'Understanding Sadness',
  Scared: 'Courage & Safety',
  Angry: 'Managing Big Feelings',
  Calm: 'Mindfulness & Calm',
  Confused: 'Problem-Solving & Clarity',
};

const FALLBACK_SUGGESTIONS: StorySuggestion[] = [
  { emoji: '🦋', title: "Butterfly's Journey", theme: 'Change & Growth' },
  { emoji: '🌟', title: 'The Wishing Star', theme: 'Hope & Dreams' },
  { emoji: '🌈', title: 'After the Storm', theme: 'Resilience' },
  { emoji: '🐉', title: 'The Gentle Dragon', theme: 'Courage & Kindness' },
];

function getEmotionColor(emotion: string): string {
  return EMOTION_COLORS[emotion] ?? 'from-[#D4C5F9] to-[#FFD4C4]';
}

function getSelTheme(emotion: string): string {
  return EMOTION_SEL_THEMES[emotion] ?? 'Emotional Awareness';
}

function calculateDuration(wordCount: number): string {
  const minutes = Math.max(1, Math.round(wordCount / 150));
  return `${minutes} min`;
}

function stripCodeFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

/**
 * AI safety pipeline (see Nuppu App user journey, phase 5).
 * A real backend would run these as separate, auditable steps; here they're
 * kept as small pure functions so the pipeline stages stay visible in the
 * prototype's code, even though moderation itself is out of scope for a demo.
 */
const SAFETY_PIPELINE_STEPS = [
  'Pre-check (input validation)',
  'Normalization (topic tagging)',
  'AI generation (locked prompt)',
  'Post-check (content review)',
] as const;

function preCheckTopic(topic: string | undefined): string | undefined {
  const trimmed = topic?.trim().slice(0, 60);
  return trimmed || undefined;
}

function normalizeTopic(topic: string | undefined): string | undefined {
  if (!topic) return undefined;
  // A real pipeline would tag/classify the topic here; the prototype just normalizes whitespace/case.
  return topic.replace(/\s+/g, ' ').trim();
}

function postCheckContent(content: string): boolean {
  // Placeholder for a real moderation pass. Empty or implausibly short output fails the check.
  return content.trim().split(/\s+/).length >= 30;
}

function buildStoryPrompt({ childName, emotion, interests, ageGroupLabel, topic }: StoryGenerationParams): string {
  const interestList = interests.join(', ') || 'friendship and adventure';
  const topicLine = topic ? ` Gently weave in this topic if appropriate: ${topic}.` : '';
  return `Create a short, uplifting therapeutic story for a child named ${childName} in the "${ageGroupLabel}" age group, who is currently feeling ${emotion}. Feature themes related to: ${interestList}.${topicLine} 3-4 paragraphs, ~150-200 words, age-appropriate language, no scary or violent content, end with a comforting lesson. Occasionally mention ${childName} by name. Return JSON: { "title": string, "emoji": string, "content": string }`;
}

async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

function buildFallbackStory(params: StoryGenerationParams): GeneratedStory {
  const { childName, emotion, interests } = params;
  const interestList = interests[0] ?? 'adventure';
  const content = `Once upon a time, there was a wonderful child named ${childName} who felt ${emotion.toLowerCase()}. ${childName} loved ${interestList}, and one day decided to take a deep breath and look around at the world with curious eyes.\n\nAlong the way, ${childName} met a gentle friend who listened carefully and reminded ${childName} that every feeling is okay to have. Feelings come and go, just like clouds drifting across the sky.\n\nBy the end of the day, ${childName} felt lighter and braver, knowing that it's always okay to ask for help and to talk about feelings with someone who cares.\n\nAnd so, ${childName} learned that being ${emotion.toLowerCase()} is just one small part of a big, beautiful story — and that story always keeps getting better.`;
  const wordCount = content.split(/\s+/).length;

  return {
    id: `ai-${Date.now()}`,
    title: `${childName}'s ${emotion} Day`,
    content,
    emotion,
    interests,
    emoji: '🌟',
    duration: calculateDuration(wordCount),
    color: getEmotionColor(emotion),
    selTheme: getSelTheme(emotion),
  };
}

export async function generateStory(rawParams: StoryGenerationParams): Promise<GeneratedStory> {
  const params: StoryGenerationParams = {
    ...rawParams,
    topic: normalizeTopic(preCheckTopic(rawParams.topic)),
  };

  try {
    const prompt = buildStoryPrompt(params);
    const raw = await callGemini(prompt);
    const cleaned = stripCodeFences(raw);
    const parsed = JSON.parse(cleaned) as { title: string; emoji: string; content: string };

    if (!postCheckContent(parsed.content)) {
      throw new Error('Content failed post-check');
    }

    const wordCount = parsed.content.split(/\s+/).length;

    return {
      id: `ai-${Date.now()}`,
      title: parsed.title,
      content: parsed.content,
      emotion: params.emotion,
      interests: params.interests,
      emoji: parsed.emoji || '🌟',
      duration: calculateDuration(wordCount),
      color: getEmotionColor(params.emotion),
      selTheme: getSelTheme(params.emotion),
    };
  } catch (error) {
    console.warn('Story generation failed, using fallback story:', error);
    return buildFallbackStory(params);
  }
}

export async function generateStorySuggestions(
  params: StoryGenerationParams,
  count = 4,
): Promise<StorySuggestion[]> {
  try {
    const interestList = params.interests.join(', ') || 'friendship and adventure';
    const prompt = `Suggest ${count} short therapeutic story ideas for a child in the "${params.ageGroupLabel}" age group named ${params.childName} feeling ${params.emotion}, related to themes: ${interestList}. Return JSON array: [{ "emoji": string, "title": string, "theme": string }]`;
    const raw = await callGemini(prompt);
    const cleaned = stripCodeFences(raw);
    const parsed = JSON.parse(cleaned) as StorySuggestion[];
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Invalid suggestions');
    return parsed.slice(0, count);
  } catch (error) {
    console.warn('Story suggestions failed, using fallback suggestions:', error);
    return FALLBACK_SUGGESTIONS.slice(0, count);
  }
}

export { SAFETY_PIPELINE_STEPS };
