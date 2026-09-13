import { createContext, useContext, useState, type ReactNode } from 'react';

export type AgeBand = 'little' | 'big' | 'super';
export type AvatarSpecies = 'bunny' | 'bear' | 'cat' | 'fox';
export type MoodId = 'happy' | 'sad' | 'energetic' | 'angry' | 'tired' | 'nervous';
export type SubscriptionPlan = 'basic' | 'premium';

export const DEFAULT_PERMITTED_THEMES = ['feelings', 'friendship', 'safeEveryday', 'natureAnimals', 'imagination'];
export const MAX_CUSTOM_INTERESTS = 3;

interface ContinueReading {
  storyId: string;
  page: number;
}

interface ChildContextValue {
  name: string;
  setName: (name: string) => void;
  ageBand: AgeBand;
  setAgeBand: (band: AgeBand) => void;
  avatarSpecies: AvatarSpecies;
  setAvatarSpecies: (species: AvatarSpecies) => void;
  interests: string[];
  toggleInterest: (id: string) => void;
  customInterests: string[];
  addCustomInterest: (label: string) => void;
  removeCustomInterest: (label: string) => void;
  freeTopic: string;
  setFreeTopic: (topic: string) => void;
  consentGiven: boolean;
  setConsentGiven: (given: boolean) => void;
  onboardingComplete: boolean;
  setOnboardingComplete: (done: boolean) => void;
  mood: MoodId | null;
  setMood: (mood: MoodId) => void;
  personalizationOn: boolean;
  setPersonalizationOn: (on: boolean) => void;
  permittedThemes: string[];
  toggleTheme: (id: string) => void;
  freeTopicAllowed: boolean;
  setFreeTopicAllowed: (on: boolean) => void;
  favouriteFriendId: string;
  storiesReadTotal: number;
  storiesReadThisWeek: number;
  markStoryRead: () => void;
  continueReading: ContinueReading | null;
  setContinueReading: (value: ContinueReading | null) => void;
  subscriptionPlan: SubscriptionPlan;
  setSubscriptionPlan: (plan: SubscriptionPlan) => void;
  resetOnboarding: () => void;
}

const ChildContext = createContext<ChildContextValue | null>(null);

export function ChildProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState('Venla');
  const [ageBand, setAgeBand] = useState<AgeBand>('big');
  const [avatarSpecies, setAvatarSpecies] = useState<AvatarSpecies>('cat');
  const [interests, setInterests] = useState<string[]>(['animals', 'nature', 'crafts', 'baking', 'friends']);
  const [customInterests, setCustomInterests] = useState<string[]>([]);
  const [freeTopic, setFreeTopic] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [mood, setMood] = useState<MoodId | null>('happy');
  const [personalizationOn, setPersonalizationOn] = useState(true);
  const [permittedThemes, setPermittedThemes] = useState<string[]>(DEFAULT_PERMITTED_THEMES);
  const [freeTopicAllowed, setFreeTopicAllowed] = useState(false);
  const [storiesReadTotal, setStoriesReadTotal] = useState(12);
  const [storiesReadThisWeek, setStoriesReadThisWeek] = useState(4);
  const [continueReading, setContinueReading] = useState<ContinueReading | null>({
    storyId: 'big-feeling',
    page: 4,
  });
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>('premium');

  const toggleInterest = (id: string) => {
    setInterests((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const addCustomInterest = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    setCustomInterests((prev) =>
      prev.length >= MAX_CUSTOM_INTERESTS || prev.some((i) => i.toLowerCase() === trimmed.toLowerCase())
        ? prev
        : [...prev, trimmed],
    );
  };

  const removeCustomInterest = (label: string) => {
    setCustomInterests((prev) => prev.filter((i) => i !== label));
  };

  const toggleTheme = (id: string) => {
    setPermittedThemes((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const markStoryRead = () => {
    setStoriesReadTotal((prev) => prev + 1);
    setStoriesReadThisWeek((prev) => prev + 1);
  };

  const resetOnboarding = () => {
    setOnboardingComplete(false);
  };

  const value: ChildContextValue = {
    name,
    setName,
    ageBand,
    setAgeBand,
    avatarSpecies,
    setAvatarSpecies,
    interests,
    toggleInterest,
    customInterests,
    addCustomInterest,
    removeCustomInterest,
    freeTopic,
    setFreeTopic,
    consentGiven,
    setConsentGiven,
    onboardingComplete,
    setOnboardingComplete,
    mood,
    setMood,
    personalizationOn,
    setPersonalizationOn,
    permittedThemes,
    toggleTheme,
    freeTopicAllowed,
    setFreeTopicAllowed,
    favouriteFriendId: 'hippu',
    storiesReadTotal,
    storiesReadThisWeek,
    markStoryRead,
    continueReading,
    setContinueReading,
    subscriptionPlan,
    setSubscriptionPlan,
    resetOnboarding,
  };

  return <ChildContext.Provider value={value}>{children}</ChildContext.Provider>;
}

export function useChild(): ChildContextValue {
  const ctx = useContext(ChildContext);
  if (!ctx) throw new Error('useChild must be used within a ChildProvider');
  return ctx;
}
