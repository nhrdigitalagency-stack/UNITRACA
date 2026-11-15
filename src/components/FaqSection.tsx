import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ChevronDown, HelpCircle, Search } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { EASE_OUT_EXPO } from './MotionReveal.tsx';
import type { FaqItem } from '../types/unitraca.ts';

interface FaqSectionProps {
  items: FaqItem[];
  loading?: boolean;
  showHeader?: boolean;
  showSearch?: boolean;
  maxItems?: number;
  sectionNumber?: string;
}

export function FaqSection({
  items,
  loading = false,
  showHeader = true,
  showSearch = false,
  maxItems,
  sectionNumber = '08',
}: FaqSectionProps) {
  const { lang } = useApp();
  const prefersReduced = useReducedMotion();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [query, setQuery] = useState<string>('');
  const [openIds, setOpenIds] = useState<number[]>([]);

  useEffect(() => {
    if (items.length > 0 && openIds.length === 0) {
      setOpenIds([items[0].id]);
    }
  }, [items, openIds.length]);

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(items.map((i) => i.category)))],
    [items]
  );

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = items.filter((item) => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        item.question_fr.toLowerCase().includes(q) ||
        item.question_en.toLowerCase().includes(q) ||
        item.answer_fr.toLowerCase().includes(q) ||
        item.answer_en.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
    return maxItems ? list.slice(0, maxItems) : list;
  }, [items, categoryFilter, query, maxItems]);

  function toggleFaq(id: number) {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  const allFilteredOpen =
    filteredItems.length > 0 && filteredItems.every((i) => openIds.includes(i.id));

  function toggleExpandAll() {
    if (allFilteredOpen) {
      setOpenIds([]);
    } else {
      setOpenIds(filteredItems.map((i) => i.id));
    }
  }

  return (
    <div className="space-y-8">
      {showHeader && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-logo-red)] font-semibold">
              {sectionNumber} · {lang === 'en' ? 'Frequently Asked Questions' : 'Foire Aux Questions (FAQ)'}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-[var(--color-earth-dark)]">
              {lang === 'en'
                ? 'Essential Questions & Answers'
                : 'Réponses claires sur le cadre d’UNITRACA'}
            </h2>
            <p className="text-sm text-[var(--color-logo-red)] font-medium">
              {lang === 'en'
                ? 'Transparency on admissions, distance courses, cultural rights, and medical safeguards'
                : 'Fonctionnement des cours, inscriptions à distance, absence de diplôme d’État et garde-fous éthiques'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleExpandAll}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-[var(--color-ivory-border)] bg-[var(--color-ivory)] text-[var(--color-earth-dark)] hover:border-[var(--color-logo-red)] active:scale-95 transition-all"
            >
              {allFilteredOpen
                ? lang === 'en'
                  ? 'Collapse all'
                  : 'Tout replier'
                : lang === 'en'
                  ? 'Expand all'
                  : 'Tout déplier'}
            </button>
            {maxItems && (
              <Link
                to="/faq"
                className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--color-logo-red)] text-white hover:bg-[var(--color-earth-dark)] transition-all"
              >
                {lang === 'en' ? 'View full FAQ page' : 'Voir toute la FAQ'}
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Search & Category Filter Controls */}
      <div className="space-y-4">
        {showSearch && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[var(--color-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  lang === 'en'
                    ? 'Search a question, topic, or keyword…'
                    : 'Rechercher une question, une thématique ou un mot-clé…'
                }
                aria-label={lang === 'en' ? 'Search FAQ' : 'Rechercher dans la FAQ'}
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)] text-[var(--color-ink)] focus:border-[var(--color-logo-red)] transition-colors"
              />
            </div>
            {!showHeader && (
              <button
                type="button"
                onClick={toggleExpandAll}
                className="px-4 py-3 rounded-xl text-xs font-semibold border border-[var(--color-ivory-border)] bg-[var(--color-ivory)] text-[var(--color-earth-dark)] hover:border-[var(--color-logo-red)] active:scale-95 transition-all whitespace-nowrap"
              >
                {allFilteredOpen
                  ? lang === 'en'
                    ? 'Collapse all'
                    : 'Tout replier'
                  : lang === 'en'
                    ? 'Expand all'
                    : 'Tout déplier'}
              </button>
            )}
          </div>
        )}

        {/* Category Filter Buttons in Brand Palette */}
        <div
          role="tablist"
          aria-label={lang === 'en' ? 'FAQ Categories' : 'Catégories de la FAQ'}
          className="flex flex-wrap gap-2"
        >
          {categories.map((cat) => {
            const isSelected = categoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? 'bg-[var(--color-logo-red)] text-white shadow-sm'
                    : 'bg-[var(--color-ivory)] border border-[var(--color-ivory-border)] text-[var(--color-earth-dark)] hover:border-[var(--color-logo-red)] hover:text-[var(--color-logo-red)]'
                }`}
              >
                {cat === 'all' ? (lang === 'en' ? 'All topics' : 'Toutes les thématiques') : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expandable Accordion List with Smooth Height/Opacity Choreography */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-20 rounded-2xl border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)]/50 animate-pulse"
            />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl glass-surface p-8 text-center space-y-3">
          <HelpCircle className="w-8 h-8 text-[var(--color-logo-red)] mx-auto" />
          <p className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
            {lang === 'en'
              ? 'No matching question found'
              : 'Aucune question ne correspond à votre recherche'}
          </p>
          <p className="text-xs text-[var(--color-muted)]">
            {lang === 'en'
              ? 'Try another keyword or reset the category filter.'
              : 'Essayez un autre mot-clé ou réinitialisez le filtre de thématique.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setCategoryFilter('all');
              setQuery('');
            }}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-[var(--color-logo-red)] text-white"
          >
            {lang === 'en' ? 'Reset filters' : 'Réinitialiser les filtres'}
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredItems.map((item, idx) => {
            const isOpen = openIds.includes(item.id);
            const panelId = `faq-panel-${item.id}`;
            const btnId = `faq-button-${item.id}`;

            return (
              <motion.div
                key={item.id}
                layout={!prefersReduced}
                initial={prefersReduced ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: Math.min(idx * 0.04, 0.25), ease: EASE_OUT_EXPO }}
                className={`rounded-2xl transition-colors duration-200 overflow-hidden border ${
                  isOpen
                    ? 'bg-[var(--color-ivory)] border-[var(--color-logo-red)] shadow-md'
                    : 'glass-surface border-[var(--color-ivory-border)] hover:border-[var(--color-brass)]'
                }`}
              >
                <button
                  id={btnId}
                  type="button"
                  onClick={() => toggleFaq(item.id)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="w-full px-5 sm:px-7 py-5 text-left flex items-start sm:items-center justify-between gap-4 hover:bg-[var(--color-ivory-soft)]/40 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <span className="hidden sm:inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-earth-dark)] text-[var(--color-ivory)] text-xs font-semibold tabular-nums shrink-0 mt-0.5">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="space-y-1">
                      <span className="inline-block text-[11px] uppercase tracking-widest text-[var(--color-logo-red)] font-semibold">
                        {item.category}
                      </span>
                      <h3 className="font-display text-xl sm:text-2xl font-semibold text-[var(--color-earth-dark)] leading-snug">
                        {lang === 'en' ? item.question_en : item.question_fr}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isOpen
                        ? 'bg-[var(--color-logo-red)] text-white rotate-180'
                        : 'bg-[var(--color-ivory-soft)] text-[var(--color-earth-dark)]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={btnId}
                      initial={prefersReduced ? { opacity: 1 } : { height: 0, opacity: 0 }}
                      animate={prefersReduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                      exit={prefersReduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-7 pb-6 pt-3 sm:pl-[4.75rem] border-t border-[var(--color-ivory-border)]/70 bg-[var(--color-ivory)] space-y-3">
                        <p className="text-sm sm:text-base leading-relaxed text-[var(--color-ink)]/90">
                          {lang === 'en' ? item.answer_en : item.answer_fr}
                        </p>
                        <div className="flex items-center justify-between pt-2 text-xs text-[var(--color-muted)]">
                          <span>
                            {lang === 'en'
                              ? 'Source: UNITRACA Editorial Charter'
                              : 'Source : Charte éditoriale et institutionnelle UNITRACA'}
                          </span>
                          <Link
                            to="/contact"
                            className="font-semibold text-[var(--color-logo-red)] hover:underline"
                          >
                            {lang === 'en' ? 'Ask for clarification →' : 'Demander une précision →'}
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
