// RuntimeStatusCard presents current channel and rollback capability at the
// top of the shell content area.
import React from 'react';
import { Card } from '../components/ui/card.jsx';
import { Badge } from '../components/ui/badge.jsx';

export function RuntimeStatusCard({ channel, rollbackModeText, dedicatedApps }) {
  return (
    <Card title="Runtime Summary" className="w-full">
      <div className="mb-2 flex items-center gap-2.5">
        <span className="text-[13px] text-slate-500">Channel</span>
        <Badge tone={channel === 'rollback' ? 'warning' : 'success'}>
          {channel}
        </Badge>
      </div>
      <div className="mb-1.5 text-[13px] text-slate-700">{rollbackModeText}</div>
      <div className="text-[13px] text-slate-700">
        Dedicated rollback apps: {dedicatedApps || 'none'}.
      </div>
    </Card>
  );
}
