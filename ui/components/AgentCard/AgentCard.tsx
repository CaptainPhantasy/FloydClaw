/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AGENT CARD COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * The sidebar card for displaying agent status.
 * Features the "Flame-Glass" effect for active states.
 * 
 * @example
 * ```tsx
 * <AgentCard
 *   id="main"
 *   icon="🦞"
 *   title="main"
 *   subtitle="main"
 *   isActive={selectedAgent === 'main'}
 *   isDefault={true}
 *   status="online"
 *   onClick={() => setSelectedAgent('main')}
 * />
 * ```
 */

import React from 'react';
import styles from './AgentCard.module.css';

/* ═══════════════════════════════════════════════════════════════════════════
 * TYPE DEFINITIONS
 * ═══════════════════════════════════════════════════════════════════════════ */

export type AgentStatus = 'online' | 'offline' | 'idle' | 'busy';

export interface AgentCardProps {
  /** Unique identifier for the agent */
  id: string;
  
  /** Emoji or icon to display */
  icon: string;
  
  /** Primary title (agent name) */
  title: string;
  
  /** Secondary subtitle (typically the agent ID) */
  subtitle: string;
  
  /** Whether this agent is currently active/selected */
  isActive?: boolean;
  
  /** Whether this is the default agent */
  isDefault?: boolean;
  
  /** Agent online status indicator */
  status?: AgentStatus;
  
  /** Enable entry animation */
  animated?: boolean;
  
  /** Click handler */
  onClick?: (id: string) => void;
  
  /** Additional CSS class names */
  className?: string;
  
  /** Accessibility label */
  ariaLabel?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

export const AgentCard: React.FC<AgentCardProps> = ({
  id,
  icon,
  title,
  subtitle,
  isActive = false,
  isDefault = false,
  status,
  animated = false,
  onClick,
  className = '',
  ariaLabel,
}) => {
  // Build class list
  const cardClasses = [
    styles.agentCard,
    isActive ? styles.agentCardActive : styles.agentCardDefault,
    isActive ? 'flameGlassActive' : '',
    animated ? styles.agentCardAnimated : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const badgeClasses = [
    styles.agentCardBadge,
    isActive ? styles.agentCardBadgeActive : styles.agentCardBadgeDefault,
  ].join(' ');

  const statusClasses = [
    styles.agentCardStatus,
    status === 'online' && styles.agentCardStatusOnline,
    status === 'offline' && styles.agentCardStatusOffline,
    status === 'idle' && styles.agentCardStatusIdle,
    status === 'busy' && styles.agentCardStatusOnline, // busy uses online styling
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    onClick?.(id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(id);
    }
  };

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel || `Agent ${title}${isActive ? ' (active)' : ''}${isDefault ? ' (default)' : ''}`}
      aria-pressed={isActive}
    >
      {/* Left Side: Status + Icon + Text */}
      <div className={styles.agentCardContent}>
        {/* Optional Status Indicator */}
        {status && <div className={statusClasses} aria-hidden="true" />}
        
        {/* Icon */}
        <div className={styles.agentCardIcon} aria-hidden="true">
          {icon}
        </div>
        
        {/* Title & Subtitle */}
        <div className={styles.agentCardText}>
          <span className={styles.agentCardTitle}>
            {title}
          </span>
          <span className={styles.agentCardSubtitle}>
            {subtitle}
          </span>
        </div>
      </div>

      {/* Right Side: Default Badge */}
      {isDefault && (
        <div className={badgeClasses}>
          <span className={styles.agentCardBadgeText}>
            Default
          </span>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
 * DISPLAY NAME
 * ═══════════════════════════════════════════════════════════════════════════ */

AgentCard.displayName = 'AgentCard';

/* ═══════════════════════════════════════════════════════════════════════════
 * DEFAULT EXPORT
 * ═══════════════════════════════════════════════════════════════════════════ */

export default AgentCard;
