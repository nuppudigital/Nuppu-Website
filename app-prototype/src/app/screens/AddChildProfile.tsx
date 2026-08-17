import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router';
import { Plus, ShieldCheck } from 'lucide-react';
import { MobileScreen } from '../components/MobileScreen';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { AVATAR_MAP, type AvatarId } from '../utils/avatars';
import { AGE_GROUPS, useChild, type AgeGroupId } from '../context/ChildContext';

const INTEREST_OPTIONS = [
  'Animals',
  'Space',
  'Dinosaurs',
  'Ocean',
  'Nature',
  'Adventure',
  'Music',
  'Art',
];

const AGE_GROUP_ORDER: AgeGroupId[] = ['little', 'big', 'super'];

export function AddChildProfile() {
  const navigate = useNavigate();
  const { childData, updateChildData } = useChild();

  const [avatar, setAvatar] = useState<AvatarId>((childData.avatar as AvatarId) || 'bunny');
  const [name, setName] = useState(childData.name);
  const [ageGroup, setAgeGroup] = useState<AgeGroupId>(childData.ageGroup);
  const [interests, setInterests] = useState<string[]>(childData.interests);
  const [customInterest, setCustomInterest] = useState('');
  const [topic, setTopic] = useState(childData.topic);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    );
  };

  const addCustomInterest = () => {
    const trimmed = customInterest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests((prev) => [...prev, trimmed]);
    }
    setCustomInterest('');
  };

  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateChildData({ customAvatar: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleContinue = () => {
    updateChildData({ name, ageGroup, avatar, interests, topic: topic.trim().slice(0, 60) });
    navigate('/preferences');
  };

  return (
    <MobileScreen>
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#D4C5F9]/30 via-[#C9BBF5]/15 to-white px-6 py-8">
        <ProgressBar step={2} />

        <h1 className="text-2xl font-bold text-[#35322B] mb-1 mt-6">Create your child's profile</h1>
        <p className="text-sm text-[#6B6660] mb-6">Let's personalize their experience</p>

        <p className="text-sm font-semibold text-[#55504A] mb-3">Choose an avatar</p>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {(Object.keys(AVATAR_MAP) as AvatarId[]).map((id) => (
            <button
              key={id}
              onClick={() => setAvatar(id)}
              className={`aspect-square rounded-2xl overflow-hidden transition-all ${
                avatar === id ? 'ring-4 ring-[#6E4FD1] scale-110' : 'ring-1 ring-gray-200'
              }`}
            >
              <ImageWithFallback
                src={AVATAR_MAP[id].image}
                alt={AVATAR_MAP[id].name}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        <label className="text-xs text-[#6E4FD1] font-medium cursor-pointer mb-6 inline-block">
          Or upload a custom photo
          <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
        </label>

        <div className="flex flex-col gap-4 mb-6">
          <Input
            label="Child's name or nickname"
            placeholder="Emma"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <p className="text-sm font-semibold text-[#55504A] mb-1">Who's joining today?</p>
        <p className="text-xs text-[#6B6660] mb-3">
          The age group helps us choose the right language, themes, and content for your child.
        </p>
        <div className="flex flex-col gap-2.5 mb-6">
          {AGE_GROUP_ORDER.map((id) => {
            const group = AGE_GROUPS[id];
            const selected = ageGroup === id;
            return (
              <button
                key={id}
                onClick={() => setAgeGroup(id)}
                className={`text-left rounded-2xl border-2 px-4 py-3 transition-all flex items-center gap-3 ${
                  selected
                    ? 'border-[#6E4FD1] bg-[#C9BBF5]/15'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-full overflow-hidden shrink-0 ${
                    id === 'super' ? 'ring-2 ring-[#D4C5F9]' : ''
                  }`}
                >
                  <ImageWithFallback
                    src={AVATAR_MAP.bunny.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#35322B]">
                    {group.label} <span className="text-[#6B6660] font-normal">· {group.range}</span>
                  </p>
                  <p className="text-xs text-[#6B6660] mt-0.5">{group.description}</p>
                </div>
                <span
                  className={`w-5 h-5 rounded-full border-2 shrink-0 ${
                    selected ? 'border-[#6E4FD1] bg-[#6E4FD1]' : 'border-gray-300'
                  }`}
                />
              </button>
            );
          })}
        </div>

        <p className="text-sm font-semibold text-[#55504A] mb-3">What do they love?</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {INTEREST_OPTIONS.map((interest) => {
            const selected = interests.includes(interest);
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                  selected
                    ? 'bg-gradient-to-r from-[#6E4FD1] to-[#C9BBF5] text-white shadow'
                    : 'bg-white border border-gray-200 text-[#55504A]'
                }`}
              >
                {interest}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Add your own interest"
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomInterest()}
          />
          <button
            onClick={addCustomInterest}
            className="shrink-0 w-12 h-12 rounded-xl bg-[#C9BBF5]/25 text-[#6E4FD1] flex items-center justify-center"
            aria-label="Add interest"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm font-semibold text-[#55504A] mb-1">Anything specific to include? (optional)</p>
        <Input
          placeholder="e.g. starting school, a new sibling..."
          value={topic}
          maxLength={60}
          onChange={(e) => setTopic(e.target.value)}
        />
        <div className="flex items-start gap-2 mt-3 mb-8 bg-[#B8DDB8]/15 border border-[#B8DDB8]/60 rounded-xl p-3">
          <ShieldCheck className="w-4 h-4 text-[#55504A] shrink-0 mt-0.5" />
          <p className="text-xs text-[#55504A] leading-relaxed">
            Any written topic is always reviewed and adapted to be safe and age-appropriate for
            your child. It won't start a conversation with AI.
          </p>
        </div>

        <Button fullWidth disabled={!name} onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </MobileScreen>
  );
}

export function ProgressBar({ step, total = 5 }: { step: number; total?: number }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: total }, (_, i) => i + 1).map((s) => (
        <div
          key={s}
          className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-[#6E4FD1]' : 'bg-gray-200'}`}
        />
      ))}
    </div>
  );
}
