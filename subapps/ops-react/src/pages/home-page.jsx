import React from 'react';
import { OPS_HOME_TITLE } from '../constants/app-constants';
import { InfoPanel } from '../components/info-panel.jsx';
import { PageShell } from '../components/page-shell.jsx';
import { getOpsHostContext } from '../bridge/get-host-context';
import { createOpsPreviewRecords, createOpsSummary } from '../modules/home-summary';
import { getOpsApi } from '../services/api';
import { createOpsStore } from '../stores';

export function OpsHomePage({ viewModel }) {
  const summary = createOpsSummary(viewModel);
  const hostContext = getOpsHostContext(viewModel);
  const api = getOpsApi(viewModel);
  const store = createOpsStore();
  const records = createOpsPreviewRecords();

  return (
    <PageShell
      title={OPS_HOME_TITLE}
      description="Operations monitoring keeps pages, service adapters and state slices separated so incident workflows can evolve without overloading the host shell."
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
          { label: 'homeEndpoint', value: api.basePath + api.endpoints.home },
        ]}
      />
      <InfoPanel
        title="Store Meta"
        rows={[
          { label: 'appName', value: store.appName },
          { label: 'pageKey', value: store.pageKey },
          { label: 'ready', value: String(store.ready) },
        ]}
      />
      <InfoPanel title="Business Summary" rows={summary} />
      <InfoPanel
        title="Record Preview"
        rows={records.map((item) => ({
          label: item.id,
          value: item.title + ' / ' + item.status + ' / ' + item.owner,
        }))}
      />
    </PageShell>
  );
}
