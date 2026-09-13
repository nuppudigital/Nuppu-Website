// Toy keyword list for the prototype's "what happens when a topic looks scary"
// demo. Production filtering happens server-side against a real moderation
// pipeline — this is illustrative only, as the on-screen demo note says.
const FLAGGED_WORDS = ['monster', 'hirviö', 'ghost', 'kummitus', 'zombie', 'zombi', 'blood', 'veri', 'war', 'sota'];

export function isTopicBlocked(topic: string): boolean {
  const normalized = topic.trim().toLowerCase();
  if (!normalized) return false;
  return FLAGGED_WORDS.some((word) => normalized.includes(word));
}
