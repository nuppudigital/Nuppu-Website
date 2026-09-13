import type { CharacterId } from './characters';

export interface StoryMeta {
  id: string;
  characterId: CharacterId;
  /** For a "common" story, which character's picture represents it on cards and headers. */
  defaultCharacterId?: CharacterId;
  durationMin: number;
  categories: string[];
}

export const STORY_LIST: StoryMeta[] = [
  { id: 'nupun-kiukkupilvi', characterId: 'common', defaultCharacterId: 'nuppu', durationMin: 6, categories: ['feelings'] },
  { id: 'nupun-suuri-ilo', characterId: 'common', defaultCharacterId: 'nuppu', durationMin: 5, categories: ['feelings'] },
  {
    id: 'pastellimetsan-taitopaiva',
    characterId: 'common',
    durationMin: 9,
    categories: ['friendship', 'feelings'],
  },
];

export function getStoryMeta(id: string): StoryMeta | undefined {
  return STORY_LIST.find((story) => story.id === id);
}
