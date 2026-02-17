/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PAGE HEADER COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import styles from './PageHeader.module.css';

/* ═══════════════════════════════════════════════════════════════════════════
 * TYPE DEFINITIONS
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * PAGE HEADER COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  children,
  className = '',
}) => {
  const headerClasses = [styles.pageHeader, className].filter(Boolean).join(' ');

  return (
    <div className={headerClasses}>
      <h1 className={styles.pageHeaderTitle}>{title}</h1>
      {subtitle && <p className={styles.pageHeaderSubtitle}>{subtitle}</p>}
      {children}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
 * DISPLAY NAME
 * ═══════════════════════════════════════════════════════════════════════════ */

PageHeader.displayName = 'PageHeader';

/* ═══════════════════════════════════════════════════════════════════════════
 * DEFAULT EXPORT
 * ═══════════════════════════════════════════════════════════════════════════ */

export default PageHeader;
