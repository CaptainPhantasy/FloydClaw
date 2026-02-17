/**
 * ═══════════════════════════════════════════════════════════════════════════
 * INSTANCES PAGE
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { PageHeader } from '../components/PageHeader/PageHeader';
import { Card } from '../components/Card/Card';
import { CardHeader } from '../components/Card/CardHeader';
import { InstanceList } from '../components/InstanceList/InstanceList';

/* ═══════════════════════════════════════════════════════════════════════════
 * INSTANCES PAGE COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

export const InstancesPage: React.FC = () => {
  return (
    <div className="instances-page">
      <PageHeader
        title="Instances"
        subtitle="Manage and monitor connected OpenClaw instances"
      />

      <Card>
        <CardHeader
          title="Connected Instances"
          action={
            <button type="button" className="btn-primary">
              Refresh
            </button>
          }
        />
        <InstanceList />
      </Card>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
 * DISPLAY NAME
 * ═══════════════════════════════════════════════════════════════════════════ */

InstancesPage.displayName = 'InstancesPage';

/* ═══════════════════════════════════════════════════════════════════════════
 * DEFAULT EXPORT
 * ═══════════════════════════════════════════════════════════════════════════ */

export default InstancesPage;
