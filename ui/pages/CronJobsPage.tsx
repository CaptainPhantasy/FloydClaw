/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CRON JOBS PAGE
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { PageHeader } from '../components/PageHeader/PageHeader';
import { SchedulerStatusCard } from '../components/SchedulerStatusCard/SchedulerStatusCard';
import { NewJobForm } from '../components/CronJobForm';

/* ═══════════════════════════════════════════════════════════════════════════
 * CRON JOBS PAGE COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

export const CronJobsPage: React.FC = () => {
  const handleJobSubmit = async (data: any) => {
    console.log('Creating job:', data);
    // TODO: Implement job creation logic
  };

  return (
    <div className="cron-jobs-page">
      <PageHeader
        title="Cron Jobs"
        subtitle="Schedule and manage periodic tasks"
      />

      <div className="cron-jobs-grid">
        {/* Left Column: Scheduler Status */}
        <div className="cron-jobs-column-left">
          <SchedulerStatusCard />
        </div>

        {/* Right Column: New Job Form */}
        <div className="cron-jobs-column-right">
          <NewJobForm onSubmit={handleJobSubmit} />
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
 * DISPLAY NAME
 * ═══════════════════════════════════════════════════════════════════════════ */

CronJobsPage.displayName = 'CronJobsPage';

/* ═══════════════════════════════════════════════════════════════════════════
 * DEFAULT EXPORT
 * ═══════════════════════════════════════════════════════════════════════════ */

export default CronJobsPage;
