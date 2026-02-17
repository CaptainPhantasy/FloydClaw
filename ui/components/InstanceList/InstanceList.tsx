/**
 * ═══════════════════════════════════════════════════════════════════════════
 * INSTANCE LIST COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import styles from './InstanceList.module.css';

/* ═══════════════════════════════════════════════════════════════════════════
 * TYPE DEFINITIONS
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface Instance {
  id: string;
  name: string;
  tags: string[];
  lastActive: string;
  uptime: string;
  status: 'online' | 'offline' | 'idle';
}

/* ═══════════════════════════════════════════════════════════════════════════
 * INSTANCE ROW COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

interface InstanceRowProps {
  instance: Instance;
}

const InstanceRow: React.FC<InstanceRowProps> = ({ instance }) => {
  const statusClasses = [
    styles.instanceStatus,
    instance.status === 'online' && styles.instanceStatusOnline,
    instance.status === 'offline' && styles.instanceStatusOffline,
    instance.status === 'idle' && styles.instanceStatusIdle,
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.instanceRow}>
      {/* Left Side: Name + Tags */}
      <div className={styles.instanceLeft}>
        <div className={styles.instanceName}>
          <div className={statusClasses} aria-hidden="true" />
          <span>{instance.name}</span>
        </div>
        <div className={styles.instanceTags}>
          {instance.tags.map((tag) => (
            <span key={tag} className={styles.instanceTag}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Right Side: Times + Status */}
      <div className={styles.instanceRight}>
        <div className={styles.instanceTime}>
          <span className={styles.instanceTimeLabel}>Last Active:</span>
          <span className={styles.instanceTimeValue}>{instance.lastActive}</span>
        </div>
        <div className={styles.instanceTime}>
          <span className={styles.instanceTimeLabel}>Uptime:</span>
          <span className={styles.instanceTimeValue}>{instance.uptime}</span>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
 * INSTANCE LIST COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

export const InstanceList: React.FC = () => {
  // Mock data - replace with actual API calls
  const instances: Instance[] = [
    {
      id: '1',
      name: 'Production',
      tags: ['prod', 'main'],
      lastActive: '2m ago',
      uptime: '45d 12h',
      status: 'online',
    },
    {
      id: '2',
      name: 'Staging',
      tags: ['staging', 'test'],
      lastActive: '15m ago',
      uptime: '2d 8h',
      status: 'online',
    },
    {
      id: '3',
      name: 'Development',
      tags: ['dev', 'local'],
      lastActive: '1h ago',
      uptime: '0d 0h',
      status: 'idle',
    },
  ];

  return (
    <div className={styles.instanceList}>
      {instances.map((instance) => (
        <InstanceRow key={instance.id} instance={instance} />
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
 * DISPLAY NAME
 * ═══════════════════════════════════════════════════════════════════════════ */

InstanceList.displayName = 'InstanceList';

/* ═══════════════════════════════════════════════════════════════════════════
 * DEFAULT EXPORT
 * ═══════════════════════════════════════════════════════════════════════════ */

export default InstanceList;
