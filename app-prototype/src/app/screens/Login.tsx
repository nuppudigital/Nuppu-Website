import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ShieldCheck, Mail, Lock, User } from 'lucide-react';
import { MobileScreen } from '../components/MobileScreen';
import { Bilingual } from '../components/Bilingual';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useLanguage } from '../i18n/LanguageContext';
import nuppuMark from '../../assets/png/NUPPU MARK.png';

function LogoMark() {
  return <img src={nuppuMark} alt="Nuppu" className="h-12 w-12 object-contain" />;
}

export function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <MobileScreen bgClassName="bg-white">
      <div className="flex flex-col items-center gap-3 rounded-b-[2rem] bg-nuppu-butter px-8 py-10 text-center">
        <LogoMark />
        <Bilingual
          k={mode === 'signin' ? 'auth.welcomeBack' : 'auth.createTitle'}
          as="h1"
          className="font-display text-2xl font-bold text-nuppu-dark"
          secondaryClassName="text-sm"
        />
      </div>

      <form
        className="flex flex-1 flex-col gap-4 px-6 pt-6"
        onSubmit={(e) => {
          e.preventDefault();
          navigate('/welcome');
        }}
      >
        {mode === 'signup' && <Input label={t('auth.nameLabel')} icon={User} placeholder={t('auth.namePlaceholder')} />}
        <Input label={t('auth.emailLabel')} type="email" icon={Mail} placeholder={t('auth.emailPlaceholder')} />
        <Input label={t('auth.passwordLabel')} type="password" icon={Lock} placeholder="••••••••" />

        {mode === 'signin' && (
          <button
            type="button"
            className="self-end text-sm font-bold text-nuppu-blue-deep"
            onClick={() => window.alert('Password reset is not part of this prototype.')}
          >
            {t('auth.forgotPassword')}
          </button>
        )}

        <Button type="submit" className="mt-2">
          {mode === 'signin' ? t('auth.signIn') : t('auth.createButton')}
        </Button>

        {mode === 'signin' ? (
          <>
            <div className="flex items-center gap-3 py-1 text-sm font-semibold text-nuppu-gray">
              <span className="h-px flex-1 bg-nuppu-border" />
              {t('common.or')}
              <span className="h-px flex-1 bg-nuppu-border" />
            </div>
            <Button type="button" variant="outline" onClick={() => setMode('signup')}>
              {t('auth.createAccount')}
            </Button>
          </>
        ) : (
          <button type="button" className="text-sm font-bold text-nuppu-blue-deep" onClick={() => setMode('signin')}>
            {t('auth.backToSignIn')}
          </button>
        )}

        <div className="mt-auto flex items-start gap-2 rounded-2xl bg-nuppu-lavender-light p-4 text-sm text-nuppu-dark">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-nuppu-blue-deep" />
          <Bilingual k="auth.parentNote" secondaryClassName="text-xs" />
        </div>
        <div className="pb-6" />
      </form>
    </MobileScreen>
  );
}
