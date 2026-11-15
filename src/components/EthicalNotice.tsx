import { useApp } from '../context/AppContext.tsx';
import { getT } from '../i18n/translations.ts';

interface EthicalNoticeProps {
  variant?: 'health' | 'provisional';
  customText?: string;
}

export function EthicalNotice({ variant = 'health', customText }: EthicalNoticeProps) {
  const { lang } = useApp();
  const t = getT(lang);

  const title =
    variant === 'health'
      ? t.common.healthWarningTitle
      : lang === 'en'
        ? 'Editorial Validation Notice'
        : 'Note de rigueur éditoriale';

  const body =
    customText ||
    (variant === 'health'
      ? t.common.healthWarningText
      : lang === 'en'
        ? 'Information marked as pending confirmation reflects available public communications and remains open to official validation by UNITRACA.'
        : 'Les éléments signalés comme à confirmer s’appuient sur les communications publiques disponibles et restent ouverts à validation officielle par UNITRACA.');

  return (
    <aside
      aria-label={title}
      className="border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)]/70 px-5 py-4 text-sm text-[var(--color-earth-dark)]"
    >
      <p className="text-xs uppercase tracking-widest text-[var(--color-terracotta)] font-medium mb-1">
        {title}
      </p>
      <p className="leading-relaxed text-[var(--color-ink)]/90">{body}</p>
    </aside>
  );
}
