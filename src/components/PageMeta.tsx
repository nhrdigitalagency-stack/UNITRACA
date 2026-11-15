import { useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';

interface PageMetaProps {
  titleFr: string;
  titleEn?: string;
  descriptionFr: string;
  descriptionEn?: string;
  noIndex?: boolean;
}

export function PageMeta({
  titleFr,
  titleEn,
  descriptionFr,
  descriptionEn,
  noIndex = false,
}: PageMetaProps) {
  const { lang } = useApp();

  useEffect(() => {
    const title = lang === 'en' && titleEn ? titleEn : titleFr;
    const description = lang === 'en' && descriptionEn ? descriptionEn : descriptionFr;

    document.title = title;
    document.documentElement.lang = lang;

    const setMeta = (selector: string, attr: string, content: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        if (selector.includes('property=')) {
          const prop = selector.match(/property="([^"]+)"/)?.[1];
          if (prop) el.setAttribute('property', prop);
        } else if (selector.includes('name=')) {
          const name = selector.match(/name="([^"]+)"/)?.[1];
          if (name) el.setAttribute('name', name);
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attr, content);
    };

    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);

    let robotsEl = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (noIndex) {
      if (!robotsEl) {
        robotsEl = document.createElement('meta');
        robotsEl.setAttribute('name', 'robots');
        document.head.appendChild(robotsEl);
      }
      robotsEl.setAttribute('content', 'noindex, nofollow');
    } else if (robotsEl) {
      robotsEl.remove();
    }
  }, [lang, titleFr, titleEn, descriptionFr, descriptionEn, noIndex]);

  return null;
}
