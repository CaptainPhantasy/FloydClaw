/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SCHEDULER STATUS CARD COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import styles from './SchedulerStatusCard.module.css';

/* ═══════════════════════════════════════════════════════════════════════════
 * SCHEDULER STATUS CARD COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

export const SchedulerStatusCard: React.FC = () => {
  return (
    <div className={styles.schedulerStatusCard}>
      <h3 className={styles.schedulerStatusTitle}>Scheduler Status</h3>
      
      <div className={styles.schedulerStatusGrid}>
        {/* Active Jobs Count */}
        <div className={styles.schedulerStatusItem}>
          <div className={styles.schedulerStatusLabel}>ACTIVE</div>
          <div className={styles.schedulerStatusValue}>YES</div>
        </div>

        {/* Total Jobs Count */}
        <div className={styles.schedulerStatusItem}>
          <div className={styles.schedulerStatusLabel}>JOBS</div>
          <div className={styles.schedulerStatusValue}>8</div>
        </div>

        {/* Next Wake Countdown */}
        <div className={styles.schedulerStatusItem}>
          <div className={styles.schedulerStatusLabel}>NEXT WAKE</div>
          <div className={styles.schedulerStatusValue}>12m 34s</div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
 * DISPLAY NAME
 * ═══════════════════════════════════════════════════════════════════════════ */

SchedulerStatusCard.displayName = 'SchedulerStatusCard';

/* ═══════════════════════════════════════════════════════════════════════════
 * DEFAULT EXPORT
 * ═══════════════════════════════════════════════════════════════════════════ */

export default SchedulerStatusCard;
