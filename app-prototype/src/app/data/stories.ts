export interface ClassicStory {
  id: string;
  title: string;
  emoji: string;
  category: string;
  duration: string;
  color: string;
  description: string;
}

export const CLASSIC_STORIES: ClassicStory[] = [
  {
    id: 'lunas-brave-day',
    title: "Luna's Brave Day",
    emoji: '🌙',
    category: 'Emotions',
    duration: '12 min',
    color: 'from-[#D4C5F9]/50 to-[#A8D5E2]/50',
    description: 'Luna learns that being brave doesn\'t mean not being scared — it means trying anyway.',
  },
  {
    id: 'the-friendship-garden',
    title: 'The Friendship Garden',
    emoji: '🌻',
    category: 'Friendship',
    duration: '10 min',
    color: 'from-[#B8DDB8]/50 to-[#C9EDE1]/60',
    description: 'A story about how small acts of kindness help friendships grow, just like flowers.',
  },
  {
    id: 'ocean-of-feelings',
    title: 'Ocean of Feelings',
    emoji: '🌊',
    category: 'Emotions',
    duration: '15 min',
    color: 'from-[#A8D5E2]/50 to-[#B8D4C7]/50',
    description: 'Join a curious fish as they explore the many waves of feelings we all have.',
  },
  {
    id: 'goodnight-stars',
    title: 'Goodnight Stars',
    emoji: '⭐',
    category: 'Bedtime',
    duration: '8 min',
    color: 'from-[#B8D4C7]/40 to-[#D4C5F9]/50',
    description: 'A calming bedtime tale about the stars watching over every sleepy child.',
  },
  {
    id: 'the-problem-solvers',
    title: 'The Problem Solvers',
    emoji: '🔍',
    category: 'Problem-solving',
    duration: '14 min',
    color: 'from-[#E8C468]/50 to-[#FFD4C4]/50',
    description: 'Two clever friends work together to solve a tricky puzzle in their neighborhood.',
  },
  {
    id: 'mountain-adventure',
    title: 'Mountain Adventure',
    emoji: '🏔️',
    category: 'Adventure',
    duration: '16 min',
    color: 'from-[#A8D5E2]/50 to-[#B8DDB8]/50',
    description: 'An exciting climb teaches patience, teamwork, and the joy of reaching new heights.',
  },
  {
    id: 'the-kindness-quest',
    title: 'The Kindness Quest',
    emoji: '💝',
    category: 'Friendship',
    duration: '11 min',
    color: 'from-[#F5B5A8]/50 to-[#FFD4C4]/50',
    description: 'A gentle quest to collect acts of kindness and share them with the whole town.',
  },
  {
    id: 'rainbow-feelings',
    title: 'Rainbow Feelings',
    emoji: '🌈',
    category: 'Emotions',
    duration: '13 min',
    color: 'from-[#F9E5A8]/50 via-[#F5B5A8]/50 to-[#D4C5F9]/50',
    description: 'Every color of the rainbow represents a feeling — and all of them are welcome.',
  },
];

export const CATEGORIES = [
  'All',
  'AI Stories',
  'Emotions',
  'Bedtime',
  'Friendship',
  'Adventure',
  'Problem-solving',
];
