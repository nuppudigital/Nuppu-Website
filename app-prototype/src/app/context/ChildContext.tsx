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
}

const CHILD_DATA_KEY = 'nuppu-child-data';
const STORIES_KEY = 'nuppu-generated-stories';
const PLAN_KEY = 'nuppu-plan';

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

const ChildContext = createContext<ChildContextType | undefined>(undefined);

export function ChildProvider({ children }: { children: ReactNode }) {
  const [childData, setChildData] = useState<ChildData>(loadChildData);
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null);
  const [generatedStories, setGeneratedStories] = useState<GeneratedStory[]>(loadStories);
  const [currentStory, setCurrentStory] = useState<GeneratedStory | null>(null);
  const [plan, setPlan] = useState<PlanTier>(loadPlan);

  useEffect(() => {
    localStorage.setItem(CHILD_DATA_KEY, JSON.stringify(childData));
  }, [childData]);

  useEffect(() => {
    localStorage.setItem(STORIES_KEY, JSON.stringify(generatedStories));
  }, [generatedStories]);

  useEffect(() => {
    localStorage.setItem(PLAN_KEY, plan);
  }, [plan]);

  const updateChildData = (data: Partial<ChildData>) => {
    setChildData((prev) => ({ ...prev, ...data }));
  };

  const addGeneratedStory = (story: GeneratedStory) => {
    setGeneratedStories((prev) => [story, ...prev]);
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
