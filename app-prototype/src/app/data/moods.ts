export interface Mood {
  id: string;
  emoji: string;
  label: string;
  color: string;
}

export const MOODS: Mood[] = [
  { id: 'Happy', emoji: '😊', label: 'Happy', color: 'bg-yellow-100 border-yellow-300' },
  { id: 'Calm', emoji: '😌', label: 'Calm', color: 'bg-green-100 border-green-300' },
  { id: 'Sad', emoji: '😢', label: 'Sad', color: 'bg-blue-100 border-blue-300' },
  { id: 'Scared', emoji: '😰', label: 'Scared', color: 'bg-purple-100 border-purple-300' },
  { id: 'Angry', emoji: '😠', label: 'Angry', color: 'bg-red-100 border-red-300' },
  { id: 'Confused', emoji: '😕', label: 'Confused', color: 'bg-orange-100 border-orange-300' },
];
