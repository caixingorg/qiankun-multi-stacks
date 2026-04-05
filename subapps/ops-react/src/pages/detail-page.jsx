import React from 'react';
import { OPS_DETAIL_TITLE } from '../constants/app-constants';
import { InfoPanel } from '../components/info-panel.jsx';
import { PageShell } from '../components/page-shell.jsx';
import { getOpsHostContext } from '../bridge/get-host-context';
import { createOpsDetailSnapshot } from '../modules/home-summary';
import { getOpsApi } from '../services/api';
import { createOpsStore } from '../stores';

export function OpsDetailPage({ viewModel }) {
  const hostContext = getOpsHostContext(viewModel);
  const api = getOpsApi(viewModel);
  const store = createOpsStore('detail');
  const detailSnapshot = createOpsDetailSnapshot();

  return (
    <PageShell
      title={OPS_DETAIL_TITLE}
      description="The second page keeps route ownership inside the child app and shows how later insight views can extend the same template."
    >
      <InfoPanel
        title="Host Context"
        rows={Object.keys(hostContext).map((key) => ({
          label: key,
          value: hostContext[key],
        }))}
      />
      <InfoPanel
        title="Service Meta"
        rows={[
          { label: 'serviceName', value: api.serviceName },
          { label: 'basePath', value: api.basePath },
          { label: 'runtimeChannel', value: api.runtimeChannel },
          { label: 'transport', value: api.transport },
          { label: 'detailEndpoint', value: api.basePath + api.endpoints.detail },
        ]}
      />
      <InfoPanel
        title="Page Meta"
        rows={[
          { label: 'pageKey', value: store.pageKey },
          { label: 'ready', value: String(store.ready) },
          { label: 'focus', value: 'Insight panels and incident review' },
        ]}
      />
      <InfoPanel title="Detail Snapshot" rows={detailSnapshot} />
    </PageShell>
  );
}
