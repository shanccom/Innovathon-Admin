import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../presentation/components/layout/Layout';
import { DashboardPage } from '../presentation/pages/dashboard/DashboardPage';
import { AttendancePage } from '../presentation/pages/attendance/AttendancePage';
import { CertificatesPage } from '../presentation/pages/certificates/CertificatesPage';
import { AnnouncementsPage } from '../presentation/pages/announcements/AnnouncementsPage';
import { SettingsPage } from '../presentation/pages/settings/SettingsPage';

export const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="asistencias" element={<AttendancePage />} />
          <Route path="certificados" element={<CertificatesPage />} />
          <Route path="comunicados" element={<AnnouncementsPage />} />
          <Route path="configuracion" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
