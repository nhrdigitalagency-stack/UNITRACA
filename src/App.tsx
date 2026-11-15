import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext.tsx';
import { Layout } from './components/Layout.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { OrganizationPage } from './pages/OrganizationPage.tsx';
import { FounderPage } from './pages/FounderPage.tsx';
import { VisionPage } from './pages/VisionPage.tsx';
import { TeachingsPage } from './pages/TeachingsPage.tsx';
import { TeachingDetailPage } from './pages/TeachingDetailPage.tsx';
import { AgendaPage } from './pages/AgendaPage.tsx';
import { EventDetailPage } from './pages/EventDetailPage.tsx';
import { MediaLibraryPage } from './pages/MediaLibraryPage.tsx';
import { MediaDetailPage } from './pages/MediaDetailPage.tsx';
import { HeritageDossiersPage } from './pages/HeritageDossiersPage.tsx';
import { HeritageDossierDetailPage } from './pages/HeritageDossierDetailPage.tsx';
import { RegistrationPage } from './pages/RegistrationPage.tsx';
import { MemberSpacePage } from './pages/MemberSpacePage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { FaqPage } from './pages/FaqPage.tsx';
import { PrivacyPage } from './pages/PrivacyPage.tsx';
import { TermsPage } from './pages/TermsPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/unitraca" element={<OrganizationPage />} />
            <Route path="/fondateur" element={<FounderPage />} />
            <Route path="/vision-et-valeurs" element={<VisionPage />} />
            <Route path="/enseignements" element={<TeachingsPage />} />
            <Route path="/enseignements/:slug" element={<TeachingDetailPage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/agenda/:slug" element={<EventDetailPage />} />
            <Route path="/mediatheque" element={<MediaLibraryPage />} />
            <Route path="/mediatheque/:slug" element={<MediaDetailPage />} />
            <Route path="/patrimoines" element={<HeritageDossiersPage />} />
            <Route path="/patrimoines/:slug" element={<HeritageDossierDetailPage />} />
            <Route path="/inscription" element={<RegistrationPage />} />
            <Route path="/espace-membre" element={<MemberSpacePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/confidentialite" element={<PrivacyPage />} />
            <Route path="/conditions" element={<TermsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
