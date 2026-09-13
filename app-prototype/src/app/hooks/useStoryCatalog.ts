import { useLanguage } from '../i18n/LanguageContext';
import { useCustomStories } from '../context/CustomStoriesContext';
import { STORY_LIST, getStoryMeta } from '../data/stories';
import { BUILT_IN_AUDIO } from '../data/storyAudio';
import { LIBRARY_CATEGORY_LIST } from '../data/interestTags';
import type { CharacterId } from '../data/characters';

export interface Chapter {
  title: string;
  time: string;
}

export interface ResolvedStory {
  id: string;
  isCustom: boolean;
  characterId: CharacterId;
  durationMin: number;
  categories: string[];
  photoUrl?: string;
  audioUrl?: string;
  title: string;
  subtitleShort: string;
  description: string;
  emotionalSkill: string;
  pagesBig: string[];
  pagesLittle: string[];
  pageCharacters?: CharacterId[];
  pageCharactersLittle?: CharacterId[];
  defaultCharacterId?: CharacterId;
  microSupportSkill: string;
  microSupportActions: string[];
  conversationStarter: string;
  chapters?: Chapter[];
}

export function useStoryCatalog() {
  const { language, t, tRaw } = useLanguage();
  const { stories: customStories, getPhotoUrl, getAudioUrl } = useCustomStories();

  function resolve(id: string): ResolvedStory | undefined {
    const custom = customStories.find((s) => s.id === id);
    if (custom) {
      const pages = custom.pagesBig[language];
      return {
        id: custom.id,
        isCustom: true,
        characterId: custom.characterId,
        durationMin: custom.durationMin,
        categories: [custom.categoryId],
        photoUrl: getPhotoUrl(custom.id),
        audioUrl: getAudioUrl(custom.id),
        title: custom.title[language],
        subtitleShort: custom.emotionalSkill[language],
        description: custom.description[language],
        emotionalSkill: custom.emotionalSkill[language],
        pagesBig: pages,
        pagesLittle: pages,
        pageCharacters: undefined,
        pageCharactersLittle: undefined,
        defaultCharacterId: undefined,
        microSupportSkill: custom.emotionalSkill[language],
        microSupportActions: custom.microSupportActions[language],
        conversationStarter: custom.conversationStarter[language],
        chapters: undefined,
      };
    }

    const meta = getStoryMeta(id);
    if (!meta) return undefined;
    return {
      id: meta.id,
      isCustom: false,
      characterId: meta.characterId,
      durationMin: meta.durationMin,
      categories: meta.categories,
      photoUrl: undefined,
      audioUrl: BUILT_IN_AUDIO[id],
      title: t(`storyContent.${id}.title`),
      subtitleShort: t(`storyContent.${id}.subtitleShort`),
      description: t(`storyContent.${id}.description`),
      emotionalSkill: t(`storyContent.${id}.emotionalSkill`),
      pagesBig: tRaw<string[]>(`storyContent.${id}.pagesBig`),
      pagesLittle: tRaw<string[]>(`storyContent.${id}.pagesLittle`),
      pageCharacters: tRaw<CharacterId[]>(`storyContent.${id}.pageCharacters`),
      pageCharactersLittle: tRaw<CharacterId[]>(`storyContent.${id}.pageCharactersLittle`),
      defaultCharacterId: meta.defaultCharacterId,
      microSupportSkill: t(`storyContent.${id}.microSupportSkill`),
      microSupportActions: tRaw<string[]>(`storyContent.${id}.microSupportActions`),
      conversationStarter: t(`storyContent.${id}.conversationStarter`),
      chapters: tRaw<Chapter[]>(`storyContent.${id}.chapters`),
    };
  }

  const allIds = [...STORY_LIST.map((s) => s.id), ...customStories.map((s) => s.id)];
  const all = allIds.map(resolve).filter((s): s is ResolvedStory => Boolean(s));

  return { resolve, all };
}

/** For a "common" story (not owned by one character), use its assigned default
 * character's picture if it has one, otherwise the neutral Nuppu logo mark. */
export function coverCharacterId(story: Pick<ResolvedStory, 'characterId' | 'defaultCharacterId'>): CharacterId {
  if (story.characterId !== 'common') return story.characterId;
  return story.defaultCharacterId ?? 'common';
}

export interface LibraryCategory {
  id: string;
  label: string;
}

export function useLibraryCategories(): LibraryCategory[] {
  const { language, t } = useLanguage();
  const { stories: customStories } = useCustomStories();

  const builtIn = LIBRARY_CATEGORY_LIST.filter((id) => id !== 'all').map((id) => ({ id, label: t(`categories.${id}`) }));

  const extra = new Map<string, LibraryCategory>();
  customStories.forEach((story) => {
    if (!LIBRARY_CATEGORY_LIST.includes(story.categoryId) && story.categoryLabel && !extra.has(story.categoryId)) {
      extra.set(story.categoryId, { id: story.categoryId, label: story.categoryLabel[language] });
    }
  });

  return [...builtIn, ...extra.values()];
}
