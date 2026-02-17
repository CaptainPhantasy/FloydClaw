/**
 * ═══════════════════════════════════════════════════════════════════════════
 * APP LAYOUT COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Master layout shell with sidebar navigation and main content area.
 * Features NavLink for automatic active state styling.
 */

import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import styles from './AppLayout.module.css';

/* ═══════════════════════════════════════════════════════════════════════════
 * SIDEBAR ITEM COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

interface SidebarItemProps {
  to: string;
  icon: string;
  label: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : styles.sidebarItemInactive}`
      }
    >
      <span className={styles.sidebarItemIcon}>{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
 * APP LAYOUT COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

export const AppLayout: React.FC = () => {
  return (
    <div className={styles.appLayout}>
      {/* Sidebar fixed to the left */}
      <aside className={styles.sidebar}>
        {/* Logo / Branding */}
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>
            <div className={styles.sidebarLogoIcon}>🐟</div>
            <div className={styles.sidebarLogoText}>
              <div className={styles.sidebarLogoTitle}>FLOYD</div>
              <div className={styles.sidebarLogoSubtitle}>THE PHISH</div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className={styles.sidebarNav}>
          <div className={styles.sidebarNavSection}>
            <div className={styles.sidebarNavLabel}>Control</div>
            <SidebarItem to="/instances" icon="((o))" label="Instances" />
            <SidebarItem to="/cron" icon="⏱️" label="Cron Jobs" />
          </div>

          <div className={styles.sidebarNavSection}>
            <div className={styles.sidebarNavLabel}>Agent</div>
            <SidebarItem to="/agents" icon="📁" label="Agents" />
          </div>
        </nav>

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          <div className={styles.sidebarFooterText}>
            <span>v1.0.0</span>
            <span className={styles.sidebarFooterDivider}>•</span>
            <span>Floyd Harness</span>
          </div>
        </div>
      </aside>

      {/* Main Workspace where pages render */}
      <main className={styles.mainWorkspace}>
        {/* Top bar with health status */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.headerTitle}>Dashboard</h1>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.healthIndicator}>
              <div className={styles.healthIndicatorDot} aria-hidden="true" />
              <span className={styles.healthIndicatorText}>Health OK</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
 * DISPLAY NAME
 * ═══════════════════════════════════════════════════════════════════════════ */

AppLayout.displayName = 'AppLayout';

/* ═══════════════════════════════════════════════════════════════════════════
 * DEFAULT EXPORT
 * ═══════════════════════════════════════════════════════════════════════════ */

export default AppLayout;
