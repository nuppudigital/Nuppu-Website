import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';
import { MobileScreen } from '../../components/MobileScreen';
import { ProgressHeader } from '../../components/ProgressHeader';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { CharacterAvatar } from '../../components/CharacterAvatar';
import { CHARACTER_LIST } from '../../data/characters';
import type { CharacterId } from '../../data/characters';
import { STORY_LIST } from '../../data/stories';
import { LIBRARY_CATEGORY_LIST } from '../../data/interestTags';
import { useCustomStories } from '../../context/CustomStoriesContext';
import { useLibraryCategories } from '../../hooks/useStoryCatalog';
import { useObjectUrl } from '../../hooks/useObjectUrl';
import { useLanguage } from '../../i18n/LanguageContext';
import { generateUniqueId } from '../../utils/slugify';
import type { Bilingual, BilingualList, CustomStoryRecord } from '../../types/customStory';

const DEFAULT_TIPS: BilingualList = {
  en: ['Talk with your child about how the story felt.', 'Ask if anything like this has ever happened to them.'],
  fi: ['Keskustele lapsesi kanssa siitä, miltä satu tuntui.', 'Kysy, onko hänelle käynyt joskus samoin.'],
};

const DEFAULT_STARTER: Bilingual = {
  en: 'What did you think of this story?',
  fi: 'Mitä pidit tästä sadusta?',
};

function splitPages(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function splitLines(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-xs font-bold uppercase tracking-wide text-nuppu-gray">{children}</p>;
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-nuppu-gray">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border-2 border-nuppu-border bg-white px-4 py-3 text-sm font-semibold text-nuppu-dark outline-none focus:border-nuppu-blue-deep"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-nuppu-gray">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-none rounded-2xl border-2 border-nuppu-border bg-white px-4 py-3 text-sm font-medium text-nuppu-dark outline-none focus:border-nuppu-blue-deep"
      />
    </label>
  );
}

export function StoryAdminForm() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const { stories: customStories, addStory, updateStory } = useCustomStories();
  const categories = useLibraryCategories();

  const existing = useMemo(() => customStories.find((s) => s.id === editId), [customStories, editId]);
  const isEdit = Boolean(editId);

  const [titleEn, setTitleEn] = useState(existing?.title.en ?? '');
  const [titleFi, setTitleFi] = useState(existing?.title.fi ?? '');
  const [characterId, setCharacterId] = useState<CharacterId>(existing?.characterId ?? 'nuppu');
  const [durationMin, setDurationMin] = useState(String(existing?.durationMin ?? 5));
  const [categoryMode, setCategoryMode] = useState<'existing' | 'new'>(
    existing && !LIBRARY_CATEGORY_LIST.includes(existing.categoryId) ? 'new' : 'existing',
  );
  const [existingCategoryId, setExistingCategoryId] = useState(existing?.categoryId ?? categories[0]?.id ?? 'feelings');
  const [newCategoryEn, setNewCategoryEn] = useState(existing?.categoryLabel?.en ?? '');
  const [newCategoryFi, setNewCategoryFi] = useState(existing?.categoryLabel?.fi ?? '');
  const [emotionalSkillEn, setEmotionalSkillEn] = useState(existing?.emotionalSkill.en ?? '');
  const [emotionalSkillFi, setEmotionalSkillFi] = useState(existing?.emotionalSkill.fi ?? '');
  const [descriptionEn, setDescriptionEn] = useState(existing?.description.en ?? '');
  const [descriptionFi, setDescriptionFi] = useState(existing?.description.fi ?? '');
  const [pagesBigEnText, setPagesBigEnText] = useState(existing?.pagesBig.en.join('\n\n') ?? '');
  const [pagesBigFiText, setPagesBigFiText] = useState(existing?.pagesBig.fi.join('\n\n') ?? '');
  const [microActionsEnText, setMicroActionsEnText] = useState(existing?.microSupportActions.en.join('\n') ?? '');
  const [microActionsFiText, setMicroActionsFiText] = useState(existing?.microSupportActions.fi.join('\n') ?? '');
  const [conversationStarterEn, setConversationStarterEn] = useState(existing?.conversationStarter.en ?? '');
  const [conversationStarterFi, setConversationStarterFi] = useState(existing?.conversationStarter.fi ?? '');

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [removeAudio, setRemoveAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const photoPreviewUrl = useObjectUrl(photoFile ?? existing?.photo);
  const audioPreviewUrl = useObjectUrl(audioFile ?? (removeAudio ? null : existing?.audio));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!titleEn.trim() || !titleFi.trim()) {
      setError('Please fill in the title in both languages.');
      return;
    }

    const pagesEn = splitPages(pagesBigEnText);
    const pagesFi = splitPages(pagesBigFiText);
    if (pagesEn.length === 0 || pagesFi.length === 0) {
      setError('Please write the story text in both languages.');
      return;
    }

    if (!descriptionEn.trim() || !descriptionFi.trim()) {
      setError('Please fill in the description in both languages.');
      return;
    }

    let categoryId = existingCategoryId;
    let categoryLabel: Bilingual | undefined;
    if (categoryMode === 'new') {
      if (!newCategoryEn.trim() || !newCategoryFi.trim()) {
        setError('Please name the new category in both languages.');
        return;
      }
      const takenIds = [...LIBRARY_CATEGORY_LIST, ...categories.map((c) => c.id)].filter(
        (id) => id !== existing?.categoryId,
      );
      categoryId = existing && !LIBRARY_CATEGORY_LIST.includes(existing.categoryId) ? existing.categoryId : generateUniqueId(newCategoryEn, takenIds);
      categoryLabel = { en: newCategoryEn.trim(), fi: newCategoryFi.trim() };
    }

    if (!photoFile && !existing?.photo) {
      setError('Please choose a cover photo.');
      return;
    }

    const takenStoryIds = [...STORY_LIST.map((s) => s.id), ...customStories.map((s) => s.id)].filter(
      (id) => id !== editId,
    );
    const id = existing ? existing.id : generateUniqueId(titleEn, takenStoryIds);

    const microEn = splitLines(microActionsEnText);
    const microFi = splitLines(microActionsFiText);

    const record: CustomStoryRecord = {
      id,
      title: { en: titleEn.trim(), fi: titleFi.trim() },
      categoryId,
      categoryLabel,
      characterId,
      durationMin: Math.max(1, Math.min(30, Number(durationMin) || 5)),
      emotionalSkill: {
        en: emotionalSkillEn.trim() || titleEn.trim(),
        fi: emotionalSkillFi.trim() || titleFi.trim(),
      },
      description: { en: descriptionEn.trim(), fi: descriptionFi.trim() },
      pagesBig: { en: pagesEn, fi: pagesFi },
      microSupportActions: {
        en: microEn.length ? microEn : DEFAULT_TIPS.en,
        fi: microFi.length ? microFi : DEFAULT_TIPS.fi,
      },
      conversationStarter: {
        en: conversationStarterEn.trim() || DEFAULT_STARTER.en,
        fi: conversationStarterFi.trim() || DEFAULT_STARTER.fi,
      },
      photo: photoFile ?? existing?.photo,
      audio: audioFile ?? (removeAudio ? undefined : existing?.audio),
      createdAt: existing?.createdAt ?? Date.now(),
    };

    setSaving(true);
    try {
      if (existing) await updateStory(record);
      else await addStory(record);
      navigate(-1);
    } catch (err) {
      console.error('Failed to save custom story:', err);
      setError('Something went wrong saving this story. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileScreen bgClassName="bg-white">
      <ProgressHeader onBack={() => navigate(-1)} title={isEdit ? 'Edit story' : 'Add story'} />
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 px-6 pt-3 pb-10">
        <section>
          <SectionLabel>Title</SectionLabel>
          <div className="flex flex-col gap-3">
            <Field label="Title (English)" value={titleEn} onChange={setTitleEn} placeholder="e.g. Nuppu and the Big Feeling" />
            <Field label="Title (Finnish)" value={titleFi} onChange={setTitleFi} placeholder="esim. Nuppu ja iso tunne" />
          </div>
        </section>

        <section>
          <SectionLabel>Friend / theme colour</SectionLabel>
          <div className="grid grid-cols-4 gap-2">
            {CHARACTER_LIST.map((character) => {
              const selected = characterId === character.id;
              return (
                <button
                  type="button"
                  key={character.id}
                  onClick={() => setCharacterId(character.id)}
                  className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-2 ${
                    selected ? 'border-nuppu-blue-deep bg-nuppu-lavender-light' : 'border-nuppu-border'
                  }`}
                >
                  <CharacterAvatar species={character.species!} wheelchair={character.wheelchair} className="h-10 w-auto" />
                  <span className="text-xs font-bold text-nuppu-dark">{t(`characters.${character.id}.name`)}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <SectionLabel>Emotional skill category</SectionLabel>
          <div className="mb-3 flex gap-2">
            <Chip selected={categoryMode === 'existing'} onClick={() => setCategoryMode('existing')} type="button">
              Existing category
            </Chip>
            <Chip selected={categoryMode === 'new'} onClick={() => setCategoryMode('new')} type="button">
              New category
            </Chip>
          </div>
          {categoryMode === 'existing' ? (
            <select
              value={existingCategoryId}
              onChange={(e) => setExistingCategoryId(e.target.value)}
              className="w-full rounded-2xl border-2 border-nuppu-border bg-white px-4 py-3 text-sm font-semibold text-nuppu-dark outline-none focus:border-nuppu-blue-deep"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex flex-col gap-3">
              <Field label="New category name (English)" value={newCategoryEn} onChange={setNewCategoryEn} placeholder="e.g. Gratitude" />
              <Field label="New category name (Finnish)" value={newCategoryFi} onChange={setNewCategoryFi} placeholder="esim. Kiitollisuus" />
            </div>
          )}
        </section>

        <section>
          <Field label="Duration (minutes)" type="number" value={durationMin} onChange={setDurationMin} />
        </section>

        <section>
          <SectionLabel>Emotional skill phrase</SectionLabel>
          <p className="mb-2 text-xs text-nuppu-gray">Shown as the short subtitle in lists and on the story detail screen.</p>
          <div className="flex flex-col gap-3">
            <Field label="Emotional skill (English)" value={emotionalSkillEn} onChange={setEmotionalSkillEn} placeholder="e.g. Recognising emotions" />
            <Field label="Emotional skill (Finnish)" value={emotionalSkillFi} onChange={setEmotionalSkillFi} placeholder="esim. Tunteiden tunnistaminen" />
          </div>
        </section>

        <section>
          <SectionLabel>Description</SectionLabel>
          <div className="flex flex-col gap-3">
            <TextAreaField label="Description (English)" value={descriptionEn} onChange={setDescriptionEn} rows={3} />
            <TextAreaField label="Description (Finnish)" value={descriptionFi} onChange={setDescriptionFi} rows={3} />
          </div>
        </section>

        <section>
          <SectionLabel>Story text</SectionLabel>
          <p className="mb-2 text-xs text-nuppu-gray">Leave a blank line between pages — each paragraph becomes one page in the reader.</p>
          <div className="flex flex-col gap-3">
            <TextAreaField label="Story text (English)" value={pagesBigEnText} onChange={setPagesBigEnText} rows={8} />
            <TextAreaField label="Story text (Finnish)" value={pagesBigFiText} onChange={setPagesBigFiText} rows={8} />
          </div>
        </section>

        <section>
          <SectionLabel>Cover photo</SectionLabel>
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-nuppu-dark file:mr-3 file:rounded-full file:border-0 file:bg-nuppu-lavender-light file:px-4 file:py-2 file:text-sm file:font-bold file:text-nuppu-blue-deep"
          />
          {photoPreviewUrl && <img src={photoPreviewUrl} alt="" className="mt-3 h-32 w-32 rounded-2xl object-cover" />}
        </section>

        <section>
          <SectionLabel>Audio narration (optional)</SectionLabel>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => {
              setAudioFile(e.target.files?.[0] ?? null);
              setRemoveAudio(false);
            }}
            className="block w-full text-sm text-nuppu-dark file:mr-3 file:rounded-full file:border-0 file:bg-nuppu-lavender-light file:px-4 file:py-2 file:text-sm file:font-bold file:text-nuppu-blue-deep"
          />
          {audioPreviewUrl && (
            <div className="mt-3">
              <audio controls src={audioPreviewUrl} className="w-full" />
              <button
                type="button"
                className="mt-2 text-xs font-bold text-nuppu-red"
                onClick={() => {
                  setAudioFile(null);
                  setRemoveAudio(true);
                }}
              >
                Remove audio
              </button>
            </div>
          )}
        </section>

        <section>
          <SectionLabel>Parent tips (optional)</SectionLabel>
          <p className="mb-2 text-xs text-nuppu-gray">Shown in the Adult Corner's micro-support for this story. Leave blank to use a generic default.</p>
          <div className="flex flex-col gap-3">
            <TextAreaField
              label="Tips for parents, one per line (English)"
              value={microActionsEnText}
              onChange={setMicroActionsEnText}
              rows={3}
            />
            <TextAreaField
              label="Tips for parents, one per line (Finnish)"
              value={microActionsFiText}
              onChange={setMicroActionsFiText}
              rows={3}
            />
            <Field label="Conversation starter (English)" value={conversationStarterEn} onChange={setConversationStarterEn} />
            <Field label="Conversation starter (Finnish)" value={conversationStarterFi} onChange={setConversationStarterFi} />
          </div>
        </section>

        {error && <p className="text-sm font-bold text-nuppu-red">{error}</p>}

        <Button type="submit" disabled={saving}>
          {isEdit ? 'Save changes' : 'Add story'}
        </Button>
      </form>
    </MobileScreen>
  );
}
