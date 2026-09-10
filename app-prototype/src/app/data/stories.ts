import type { CharacterId } from './characters';

export interface StoryMeta {
  id: string;
  characterId: CharacterId;
  durationMin: number;
  categories: string[];
}

export const STORY_LIST: StoryMeta[] = [
  { id: 'big-feeling', characterId: 'nuppu', durationMin: 6, categories: ['feelings', 'friendship'] },
  { id: 'quiet-evening', characterId: 'muru', durationMin: 4, categories: ['safety'] },
  { id: 'own-thing', characterId: 'hippu', durationMin: 5, categories: ['courage'] },
  { id: 'tricky-puzzle', characterId: 'lumo', durationMin: 5, categories: ['thinking'] },
];

export function getStoryMeta(id: string): StoryMeta | undefined {
  return STORY_LIST.find((story) => story.id === id);
}
