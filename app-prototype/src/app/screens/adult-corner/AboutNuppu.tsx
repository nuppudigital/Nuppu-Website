import { useNavigate } from 'react-router';
import { ArrowLeft, BookOpen, Lock, Shield, Sparkles } from 'lucide-react';
import { MobileScreen } from '../../components/MobileScreen';

const SECTIONS = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Why Nuppu was created',
    body: 'Nuppu was born from a simple belief: every child deserves gentle, calm support in understanding their feelings. We wanted to bring that support into everyday bedtime moments, in a way that feels like a warm friend rather than a screen.',
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: 'How stories are based on SEL principles',
    body: 'Every story is grounded in Social and Emotional Learning (SEL) — helping children recognize, express, and regulate emotions such as courage, empathy, and calm. Story content and narrative material are written and reviewed by the Nuppu Digital team together with education professionals.',
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: 'How AI is used safely',
    body: 'AI remains as invisible as possible and works only as a controlled background tool. Your child never chats with AI directly — there is no free text input and no open conversation. Every AI-assisted story passes through a safety pipeline: input validation, topic normalization, locked-prompt generation, content review, and a manually written fallback story if anything looks uncertain.',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Privacy & child protection',
    body: 'We collect only what is needed to personalize stories — a name or nickname, an age group, and interests. Age is anonymized from the start by using age groups instead of an exact birthdate. You can view, export, or delete your child\'s data at any time.',
  },
];

export function AboutNuppu() {
  const navigate = useNavigate();

  return (
    <MobileScreen>
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#D4C5F9]/25 via-[#C9BBF5]/10 to-white">
        <div className="bg-gradient-to-r from-[#6E4FD1] to-[#C9BBF5] px-6 pt-8 pb-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">About Nuppu</h1>
        </div>

        <div className="px-6 py-6 flex flex-col gap-4">
          {SECTIONS.map((section) => (
            <div key={section.title} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="w-10 h-10 rounded-xl bg-[#C9BBF5]/15 text-[#6E4FD1] flex items-center justify-center mb-3">
                {section.icon}
              </div>
              <p className="text-sm font-semibold text-[#35322B] mb-2">{section.title}</p>
              <p className="text-xs text-[#55504A] leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </MobileScreen>
  );
}
