import React from 'react';
import { CONSOLE_DETAIL_TITLE } from '../constants/app-constants';
import { InfoPanel } from '../components/info-panel.jsx';
import { PageShell } from '../components/page-shell.jsx';
import { getConsoleHostContext } from '../bridge/get-host-context';
import { createConsoleDetailSnapshot } from '../modules/home-summary';
import { getConsoleApi } from '../services/api';
import { createConsoleStore } from '../stores';

export function ConsoleDetailPage({ viewModel }) {
  const hostContext = getConsoleHostContext(viewModel);
  const api = getConsoleApi(viewModel);
  const store = createConsoleStore('detail');
  const detailSnapshot = createConsoleDetailSnapshot();

  return (
    <PageShell
      title={CONSOLE_DETAIL_TITLE}
      description="The detail page keeps alert review inside the child application while continuing to consume the host bridge contract."
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
          { label: 'focus', value: 'Alert handling and review workflow' },
        ]}
      />
      <InfoPanel title="Detail Snapshot" rows={detailSnapshot} />
    </PageShell>
  );
}
