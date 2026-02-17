/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AGENTS PAGE
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader/PageHeader';
import { AgentCard } from '../components/AgentCard';
import { AgentDetailWorkspace } from '../components/AgentDetailWorkspace/AgentDetailWorkspace';
import type { AgentStatus } from '../components/AgentCard';

/* ═══════════════════════════════════════════════════════════════════════════
 * AGENTS PAGE COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

export const AgentsPage: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<string>('main');

  const agents = [
    {
      id: 'main',
      icon: '🦞',
      title: 'main',
      subtitle: 'main',
      isActive: selectedAgent === 'main',
      isDefault: true,
      status: 'online' as AgentStatus,
    },
    {
      id: 'dev',
      icon: '🔧',
      title: 'dev',
      subtitle: 'Development Agent',
      isActive: selectedAgent === 'dev',
      isDefault: false,
      status: 'idle' as AgentStatus,
    },
    {
      id: 'test',
      icon: '🧪',
      title: 'test',
      subtitle: 'Testing Agent',
      isActive: selectedAgent === 'test',
      isDefault: false,
      status: 'online' as AgentStatus,
    },
    {
      id: 'deploy',
      icon: '🚀',
      title: 'deploy',
      subtitle: 'Deployment Agent',
      isActive: selectedAgent === 'deploy',
      isDefault: false,
      status: 'offline' as AgentStatus,
    },
  ];

  const handleAgentClick = (id: string) => {
    setSelectedAgent(id);
  };

  return (
    <div className="agents-page">
      <PageHeader
        title="Agents"
        subtitle="Manage and configure your multi-agent system"
      />

      <div className="agents-layout">
        {/* Left Column: Agent List */}
        <div className="agents-column-left">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              id={agent.id}
              icon={agent.icon}
              title={agent.title}
              subtitle={agent.subtitle}
              isActive={agent.isActive}
              isDefault={agent.isDefault}
              status={agent.status}
              onClick={handleAgentClick}
              animated
            />
          ))}
        </div>

        {/* Right Column: Agent Detail Workspace */}
        <div className="agents-column-right">
          <AgentDetailWorkspace
            agentId={selectedAgent}
            agent={agents.find((a) => a.id === selectedAgent)}
          />
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
 * DISPLAY NAME
 * ═══════════════════════════════════════════════════════════════════════════ */

AgentsPage.displayName = 'AgentsPage';

/* ═══════════════════════════════════════════════════════════════════════════
 * DEFAULT EXPORT
 * ═══════════════════════════════════════════════════════════════════════════ */

export default AgentsPage;
