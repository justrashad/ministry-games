import { useEffect, useRef, useState } from 'react';
import { CornerDownLeft } from 'lucide-react';
import { useT } from '../../i18n/i18n';

interface FcAnswerInputProps {
  questionKey: string;
  onSubmit: (text: string) => void;
  size?: 'tv' | 'host';
  autoFocus?: boolean;
}

/** Large answer box. Clears itself whenever the question changes so answers never linger. */
export function FcAnswerInput({ questionKey, onSubmit, size = 'host', autoFocus = true }: FcAnswerInputProps) {
  const t = useT();
  const [text, setText] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText('');
    if (autoFocus) ref.current?.focus();
  }, [questionKey, autoFocus]);

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    onSubmit(value);
    setText('');
  };

  const big = size === 'tv';
  return (
    <form
      className="flex w-full items-stretch gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <label className="sr-only" htmlFor={`fc-answer-${size}`}>
        {t('Type the answer')}
      </label>
      <input
        id={`fc-answer-${size}`}
        ref={ref}
        className={`input flex-1 font-display ${big ? '!min-h-[clamp(3.5rem,8vh,6rem)] !rounded-2xl text-center !text-[clamp(1.4rem,3vw,3rem)]' : '!min-h-[56px] text-xl'}`}
        value={text}
        maxLength={80}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder={t('Type the answer')}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" className={`btn btn-gold ${big ? 'btn-xl' : 'btn-lg'}`} disabled={!text.trim()}>
        <CornerDownLeft aria-hidden className="btn-icon" />
        <span>{t('Submit')}</span>
      </button>
    </form>
  );
}
