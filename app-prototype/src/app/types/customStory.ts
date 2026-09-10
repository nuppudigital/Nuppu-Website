 import type { CharacterId } from '../data/characters';

export interface Bilingual {
  en: string;
  fi: string;
}

export interface BilingualList {
  en: string[];
  fi: string[];
}

/** A story added through the in-app Story Admin, persisted in IndexedDB. */
export interface CustomStoryRecord {
  id: string;
  title: Bilingual;
  categoryId: string;
  /** Only set when categoryId isn't one of the built-in LIBRARY_CATEGORY_LIST ids. */
  categoryLabel?: Bilingual;
  characterId: CharacterId;
  durationMin: number;
  emotionalSkill: Bilingual;
  description: Bilingual;
  pagesBig: BilingualList;
  microSupportActions: BilingualList;
  conversationStarter: Bilingual;
  photo?: Blob;
  audio?: Blob;
  createdAt: number;
}
