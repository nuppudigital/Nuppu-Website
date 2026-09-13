import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getAllStories, putStory, deleteStoryRecord } from '../utils/customStoriesDb';
import type { CustomStoryRecord } from '../types/customStory';

interface StoryUrls {
  photo?: string;
  audio?: string;
}

function urlsFor(story: CustomStoryRecord): StoryUrls {
  return {
    photo: story.photo ? URL.createObjectURL(story.photo) : undefined,
    audio: story.audio ? URL.createObjectURL(story.audio) : undefined,
  };
}

function revoke(urls: StoryUrls | undefined) {
  if (urls?.photo) URL.revokeObjectURL(urls.photo);
  if (urls?.audio) URL.revokeObjectURL(urls.audio);
}

interface CustomStoriesContextValue {
  stories: CustomStoryRecord[];
  loading: boolean;
  addStory: (story: CustomStoryRecord) => Promise<void>;
  updateStory: (story: CustomStoryRecord) => Promise<void>;
  deleteStory: (id: string) => Promise<void>;
  getPhotoUrl: (id: string) => string | undefined;
  getAudioUrl: (id: string) => string | undefined;
}

const CustomStoriesContext = createContext<CustomStoriesContextValue | null>(null);

export function CustomStoriesProvider({ children }: { children: ReactNode }) {
  const [stories, setStories] = useState<CustomStoryRecord[]>([]);
  const [urlMap, setUrlMap] = useState<Map<string, StoryUrls>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getAllStories<CustomStoryRecord>()
      .then((loaded) => {
        if (cancelled) return;
        setStories(loaded);
        setUrlMap(new Map(loaded.map((story) => [story.id, urlsFor(story)])));
      })
      .catch((err) => console.error('Failed to load custom stories from IndexedDB:', err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const addStory = async (story: CustomStoryRecord) => {
    await putStory(story);
    setStories((prev) => [...prev, story]);
    setUrlMap((prev) => new Map(prev).set(story.id, urlsFor(story)));
  };

  const updateStory = async (story: CustomStoryRecord) => {
    await putStory(story);
    setStories((prev) => prev.map((s) => (s.id === story.id ? story : s)));
    setUrlMap((prev) => {
      revoke(prev.get(story.id));
      return new Map(prev).set(story.id, urlsFor(story));
    });
  };

  const deleteStory = async (id: string) => {
    await deleteStoryRecord(id);
    setStories((prev) => prev.filter((s) => s.id !== id));
    setUrlMap((prev) => {
      revoke(prev.get(id));
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  const value = useMemo<CustomStoriesContextValue>(
    () => ({
      stories,
      loading,
      addStory,
      updateStory,
      deleteStory,
      getPhotoUrl: (id) => urlMap.get(id)?.photo,
      getAudioUrl: (id) => urlMap.get(id)?.audio,
    }),
    [stories, loading, urlMap],
  );

  return <CustomStoriesContext.Provider value={value}>{children}</CustomStoriesContext.Provider>;
}

export function useCustomStories(): CustomStoriesContextValue {
  const ctx = useContext(CustomStoriesContext);
  if (!ctx) throw new Error('useCustomStories must be used within a CustomStoriesProvider');
  return ctx;
}
