import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type AgeGroupId = 'little' | 'big' | 'super';

export interface AgeGroupInfo {
  id: AgeGroupId;
  label: string;
  range: string;
  description: string;
}

export const AGE_GROUPS: Record<AgeGroupId, AgeGroupInfo> = {
  little: {
    id: 'little',
    label: 'Little Nuppu',
    range: 'Ages 2–4',
    description: 'Short, calm stories and emotional moments.',
  },
  big: {
    id: 'big',
    label: 'Big Nuppu',
    range: 'Ages 5–8',
    description: 'Stories about friendship, courage, and everyday situations.',
  },
  super: {
    id: 'super',
    label: 'Super Nuppu',
    range: 'Ages 9–12',
    description: 'Deeper stories and reflections about emotions.',
  },
};

export type PlanTier = 'freemium' | 'premium';

export type StoryMode = 'book' | 'audio';

export interface DailyMood {
  emotion: string;
  date: string;
}

export interface ChildData {
  name: string;
  ageGroup: AgeGroupId;
  avatar: string;
  customAvatar: string | null;
  interests: string[];
  topic: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
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

interface ChildContextType {
  childData: ChildData;
  updateChildData: (data: Partial<ChildData>) => void;
  currentEmotion: string | null;
  setCurrentEmotion: (emotion: string) => void;
  generatedStories: GeneratedStory[];
  addGeneratedStory: (story: GeneratedStory) => void;
  currentStory: GeneratedStory | null;
  setCurrentStory: (story: GeneratedStory | null) => void;
  plan: PlanTier;
  setPlan: (plan: PlanTier) => void;
  dailyMood: DailyMood | null;
  setDailyMood: (emotion: string) => void;
  storyMode: StoryMode;
  setStoryMode: (mode: StoryMode) => void;
  categoryListenCounts: Record<string, number>;
  recordCategoryListen: (category: string) => void;
}

const CHILD_DATA_KEY = 'nuppu-child-data';
const STORIES_KEY = 'nuppu-generated-stories';
const PLAN_KEY = 'nuppu-plan';
const DAILY_MOOD_KEY = 'nuppu-daily-mood';
const STORY_MODE_KEY = 'nuppu-story-mode';
const CATEGORY_LISTENS_KEY = 'nuppu-category-listens';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

const DEFAULT_CHILD_DATA: ChildData = {
  name: 'Emma',
  ageGroup: 'little',
  avatar: 'bunny',
  customAvatar: null,
  interests: ['Animals', 'Nature', 'Adventure'],
  topic: '',
  parentName: '',
  parentEmail: '',
  parentPhone: '',
};

function loadChildData(): ChildData {
  try {
    const raw = localStorage.getItem(CHILD_DATA_KEY);
    if (!raw) return DEFAULT_CHILD_DATA;
    const parsed = JSON.parse(raw);
    // Migrate prototypes saved before the age-group model existed.
    if (parsed && typeof parsed.age === 'string' && !parsed.ageGroup) {
      const age = parseInt(parsed.age, 10);
      parsed.ageGroup = age >= 9 ? 'super' : age >= 5 ? 'big' : 'little';
    }
    return { ...DEFAULT_CHILD_DATA, ...parsed };
  } catch {
    return DEFAULT_CHILD_DATA;
  }
}

function loadStories(): GeneratedStory[] {
  try {
    const raw = localStorage.getItem(STORIES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function loadPlan(): PlanTier {
  const raw = localStorage.getItem(PLAN_KEY);
  return raw === 'premium' ? 'premium' : raw === 'freemium' ? 'freemium' : 'premium';
}

function loadDailyMood(): DailyMood | null {
  try {
    const raw = localStorage.getItem(DAILY_MOOD_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DailyMood;
    return parsed.date === todayKey() ? parsed : null;
  } catch {
    return null;
  }
}

function loadStoryMode(): StoryMode {
  return localStorage.getItem(STORY_MODE_KEY) === 'audio' ? 'audio' : 'book';
}

function loadCategoryListenCounts(): Record<string, number> {
  try {
    const raw = localStorage.getItem(CATEGORY_LISTENS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

const ChildContext = createContext<ChildContextType | undefined>(undefined);

export function ChildProvider({ children }: { children: ReactNode }) {
  const [childData, setChildData] = useState<ChildData>(loadChildData);
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null);
  const [generatedStories, setGeneratedStories] = useState<GeneratedStory[]>(loadStories);
  const [currentStory, setCurrentStory] = useState<GeneratedStory | null>(null);
  const [plan, setPlan] = useState<PlanTier>(loadPlan);
  const [dailyMood, setDailyMoodState] = useState<DailyMood | null>(loadDailyMood);
  const [storyMode, setStoryMode] = useState<StoryMode>(loadStoryMode);
  const [categoryListenCounts, setCategoryListenCounts] = useState<Record<string, number>>(
    loadCategoryListenCounts,
  );

  useEffect(() => {
    localStorage.setItem(CHILD_DATA_KEY, JSON.stringify(childData));
  }, [childData]);

  useEffect(() => {
    localStorage.setItem(STORIES_KEY, JSON.stringify(generatedStories));
  }, [generatedStories]);

  useEffect(() => {
    localStorage.setItem(PLAN_KEY, plan);
  }, [plan]);

  useEffect(() => {
    if (dailyMood) localStorage.setItem(DAILY_MOOD_KEY, JSON.stringify(dailyMood));
  }, [dailyMood]);

  useEffect(() => {
    localStorage.setItem(STORY_MODE_KEY, storyMode);
  }, [storyMode]);

  useEffect(() => {
    localStorage.setItem(CATEGORY_LISTENS_KEY, JSON.stringify(categoryListenCounts));
  }, [categoryListenCounts]);

  const updateChildData = (data: Partial<ChildData>) => {
    setChildData((prev) => ({ ...prev, ...data }));
  };

  const addGeneratedStory = (story: GeneratedStory) => {
    setGeneratedStories((prev) => [story, ...prev]);
  };

  const setDailyMood = (emotion: string) => {
    setDailyMoodState({ emotion, date: todayKey() });
  };

  const recordCategoryListen = (category: string) => {
    setCategoryListenCounts((prev) => ({ ...prev, [category]: (prev[category] ?? 0) + 1 }));
  };

  return (
    <ChildContext.Provider
      value={{
        childData,
        updateChildData,
        currentEmotion,
        setCurrentEmotion,
        generatedStories,
        addGeneratedStory,
        currentStory,
        setCurrentStory,
        plan,
        setPlan,
        dailyMood,
        setDailyMood,
        storyMode,
        setStoryMode,
        categoryListenCounts,
        recordCategoryListen,
      }}
    >
      {children}
    </ChildContext.Provider>
  );
}

export function useChild(): ChildContextType {
  const ctx = useContext(ChildContext);
  if (!ctx) throw new Error('useChild must be used within a ChildProvider');
  return ctx;
}
