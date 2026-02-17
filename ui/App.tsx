/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FLOYD THE PHISH - MAIN APPLICATION
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * React Router SPA with sidebar navigation and flame-glass styling.
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/AppLayout/AppLayout';
import { InstancesPage } from './pages/InstancesPage';
import { CronJobsPage } from './pages/CronJobsPage';
import { AgentsPage } from './pages/AgentsPage';

/* ═══════════════════════════════════════════════════════════════════════════
 * APPLICATION COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<InstancesPage />} />
          <Route path="instances" element={<InstancesPage />} />
          <Route path="cron" element={<CronJobsPage />} />
          <Route path="agents" element={<AgentsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
 * DISPLAY NAME
 * ═══════════════════════════════════════════════════════════════════════════ */

App.displayName = 'App';

/* ═══════════════════════════════════════════════════════════════════════════
 * DEFAULT EXPORT
 * ═══════════════════════════════════════════════════════════════════════════ */

export default App;
