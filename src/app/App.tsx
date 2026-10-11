import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../presentation/components/layout/Layout';
import { DashboardPage } from '../presentation/pages/dashboard/DashboardPage';
import { AttendancePage } from '../presentation/pages/attendance/AttendancePage';
import { CertificatesPage } from '../presentation/pages/certificates/CertificatesPage';
import { AnnouncementsPage } from '../presentation/pages/announcements/AnnouncementsPage';
import { SelfCheckinPage } from '../presentation/pages/checkin/SelfCheckinPage';

export const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Rutas públicas directas para auto-checkin desde el móvil del asistente */}
        <Route path="/checkin" element={<SelfCheckinPage />} />
        <Route path="/marcar" element={<SelfCheckinPage />} />

        {/* Rutas administrativas protegidas por el Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="asistencias" element={<AttendancePage />} />
          <Route path="certificados" element={<CertificatesPage />} />
          <Route path="comunicados" element={<AnnouncementsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};


export default App;
