/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CARD HEADER COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import styles from './CardHeader.module.css';

/* ═══════════════════════════════════════════════════════════════════════════
 * TYPE DEFINITIONS
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface CardHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * CARD HEADER COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  action,
  className = '',
}) => {
  const headerClasses = [styles.cardHeader, className].filter(Boolean).join(' ');

  return (
    <div className={headerClasses}>
      <h2 className={styles.cardHeaderTitle}>{title}</h2>
      {action && <div className={styles.cardHeaderAction}>{action}</div>}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
 * DISPLAY NAME
 * ═══════════════════════════════════════════════════════════════════════════ */

CardHeader.displayName = 'CardHeader';

/* ═══════════════════════════════════════════════════════════════════════════
 * DEFAULT EXPORT
 * ═══════════════════════════════════════════════════════════════════════════ */

export default CardHeader;
