import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MobileScreen } from '../../components/MobileScreen';
import { ProgressHeader } from '../../components/ProgressHeader';
import { Button } from '../../components/Button';
import { useLanguage } from '../../i18n/LanguageContext';

export function Feedback() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <MobileScreen>
      <ProgressHeader onBack={() => navigate(-1)} title={t('feedback.title')} />
      <div className="flex flex-1 flex-col gap-4 px-6 pt-3 pb-8">
        <p className="text-sm text-nuppu-secondary">{t('feedback.description')}</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('feedback.placeholder')}
          rows={6}
          className="w-full resize-none rounded-2xl border-2 border-nuppu-border bg-white px-4 py-3.5 text-sm font-medium text-nuppu-dark outline-none focus:border-nuppu-blue-deep"
        />
        {sent ? (
          <p className="rounded-2xl bg-nuppu-mint-light p-4 text-sm font-semibold text-[#2f5c39]">{t('feedback.thanks')}</p>
        ) : (
          <Button
            disabled={!text.trim()}
            onClick={() => {
              setSent(true);
              setText('');
            }}
          >
            {t('feedback.submit')}
          </Button>
        )}
      </div>
    </MobileScreen>
  );
}
