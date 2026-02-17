/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AGENT DETAIL WORKSPACE COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import styles from './AgentDetailWorkspace.module.css';
import type { AgentStatus } from '../AgentCard';

/* ═══════════════════════════════════════════════════════════════════════════
 * TYPE DEFINITIONS
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface AgentDetailWorkspaceProps {
  agentId: string;
  agent?: {
    id: string;
    icon: string;
    title: string;
    subtitle: string;
    status: AgentStatus;
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
 * AGENT DETAIL WORKSPACE COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

export const AgentDetailWorkspace: React.FC<AgentDetailWorkspaceProps> = ({
  agentId,
  agent,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'tools'>('overview');

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'files' as const, label: 'Files' },
    { id: 'tools' as const, label: 'Tools' },
  ];

  return (
    <div className={styles.agentDetailWorkspace}>
      {/* Header */}
      <div className={styles.agentDetailHeader}>
        <div className={styles.agentDetailIcon}>{agent?.icon || '📁'}</div>
        <div>
          <h2 className={styles.agentDetailTitle}>{agent?.title || agentId}</h2>
          <p className={styles.agentDetailSubtitle}>{agent?.subtitle || agentId}</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className={styles.tabsNav}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : styles.tabInactive}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Panel */}
      <div className={styles.tabContentPanel}>
        {activeTab === 'overview' && (
          <div className={styles.tabContent}>
            <div className={styles.dataGrid}>
              <div className={styles.dataGridRow}>
                <span className={styles.dataGridLabel}>Agent ID</span>
                <span className={styles.dataGridValue}>{agentId}</span>
              </div>
              <div className={styles.dataGridRow}>
                <span className={styles.dataGridLabel}>Status</span>
                <span className={styles.dataGridValue}>{agent?.status || 'offline'}</span>
              </div>
              <div className={styles.dataGridRow}>
                <span className={styles.dataGridLabel}>Sessions</span>
                <span className={styles.dataGridValue}>0</span>
              </div>
              <div className={styles.dataGridRow}>
                <span className={styles.dataGridLabel}>Memory</span>
                <span className={styles.dataGridValue}>--</span>
              </div>
            </div>

            <div className={styles.agentDetailActions}>
              <select className={styles.agentDetailSelect}>
                <option>Actions</option>
                <option>Start Session</option>
                <option>Restart Agent</option>
                <option>Stop Agent</option>
              </select>
              <button type="button" className={styles.agentDetailButton}>
                Save
              </button>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className={styles.tabContent}>
            <p className={styles.tabContentEmpty}>No files configured for this agent</p>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className={styles.tabContent}>
            <p className={styles.tabContentEmpty}>No tools configured for this agent</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
 * DISPLAY NAME
 * ═══════════════════════════════════════════════════════════════════════════ */

AgentDetailWorkspace.displayName = 'AgentDetailWorkspace';

/* ═══════════════════════════════════════════════════════════════════════════
 * DEFAULT EXPORT
 * ═══════════════════════════════════════════════════════════════════════════ */

export default AgentDetailWorkspace;
