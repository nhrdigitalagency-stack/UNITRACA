import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../lib/api.ts';
import type { LanguageCode, SiteSettings, UserProfile } from '../types/unitraca.ts';

interface AppContextValue {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  user: UserProfile | null;
  authLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  settings: SiteSettings | null;
  refreshSettings: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

function applyThemeToDocument(settings: SiteSettings | null) {
  if (!settings?.theme) return;
  const root = document.documentElement;
  root.style.setProperty('--color-earth-dark', settings.theme.earthDark);
  root.style.setProperty('--color-ivory', settings.theme.ivory);
  root.style.setProperty('--color-terracotta', settings.theme.terracotta);
  root.style.setProperty('--color-forest', settings.theme.forest);
  root.style.setProperty('--color-brass', settings.theme.brass);
  root.style.setProperty('--color-ink', settings.theme.ink);
  root.style.setProperty('--color-muted', settings.theme.muted);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('unitraca_lang');
    return saved === 'en' ? 'en' : 'fr';
  });
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const setLang = useCallback((nextLang: LanguageCode) => {
    setLangState(nextLang);
    localStorage.setItem('unitraca_lang', nextLang);
    document.documentElement.lang = nextLang;
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const refreshUser = useCallback(async () => {
    try {
      const res = await apiRequest<{ user: UserProfile | null }>('/api/auth/me');
      setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const data = await apiRequest<SiteSettings>('/api/site-settings');
      setSettings(data);
      applyThemeToDocument(data);
    } catch {
      // fallback to CSS variables in index.css
    }
  }, []);

  const logout = useCallback(async () => {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  useEffect(() => {
    refreshUser();
    refreshSettings();
  }, [refreshUser, refreshSettings]);

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        user,
        authLoading,
        refreshUser,
        logout,
        settings,
        refreshSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
