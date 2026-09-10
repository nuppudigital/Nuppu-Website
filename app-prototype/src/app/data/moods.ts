import type { MoodId } from '../context/ChildContext';

export const MOOD_LIST: { id: MoodId; emoji: string }[] = [
  { id: 'happy', emoji: '😊' },
  { id: 'sad', emoji: '😢' },
  { id: 'angry', emoji: '😠' },
  { id: 'tired', emoji: '😴' },
  { id: 'nervous', emoji: '😟' },
];
