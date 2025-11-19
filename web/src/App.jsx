import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage.jsx';
import BuildPage from '@/pages/BuildPage.jsx';
import TemplatesPage from '@/pages/TemplatesPage.jsx';
import TemplateDetailPage from '@/pages/TemplateDetailPage.jsx';
import ToolsDirectoryPage from '@/pages/ToolsDirectoryPage.jsx';
import ToolViewerRoute from '@/pages/ToolViewerRoute.jsx';
import MyToolsPage from '@/pages/MyToolsPage.jsx';
import ProfilePage from '@/pages/ProfilePage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/build" element={<BuildPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/templates/:id" element={<TemplateDetailPage />} />
        <Route path="/tools" element={<ToolsDirectoryPage />} />
        <Route path="/tools/:slug" element={<ToolViewerRoute />} />
        <Route path="/my-tools" element={<MyToolsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
