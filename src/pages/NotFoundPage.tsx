import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import { PageMeta } from '../components/PageMeta.tsx';

export function NotFoundPage() {
  const { lang } = useApp();

  return (
    <>
      <PageMeta
        titleFr="Page introuvable (404) | UNITRACA"
        titleEn="Page Not Found (404) | UNITRACA"
        descriptionFr="La page demandée est introuvable sur le portail UNITRACA."
        noIndex
      />
      <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-5">
        <p className="text-xs uppercase tracking-widest text-[var(--color-terracotta)] tabular-nums">404</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--color-earth-dark)]">
          {lang === 'en' ? 'Page not found' : 'Page introuvable'}
        </h1>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">
          {lang === 'en'
            ? 'The page you requested does not exist or has been archived.'
            : 'La page que vous recherchez n’existe pas, a été déplacée ou a été archivée.'}
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-block px-6 py-3 text-sm font-medium bg-[var(--color-earth-dark)] text-[var(--color-ivory)] hover:bg-[var(--color-terracotta)] transition-colors"
          >
            {lang === 'en' ? 'Return home' : 'Retour à l’accueil'}
          </Link>
        </div>
      </div>
    </>
  );
}
