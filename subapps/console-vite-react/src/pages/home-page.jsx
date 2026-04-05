import React from 'react';
import { CONSOLE_HOME_TITLE } from '../constants/app-constants';
import { InfoPanel } from '../components/info-panel.jsx';
import { PageShell } from '../components/page-shell.jsx';
import { getConsoleHostContext } from '../bridge/get-host-context';
import { createConsolePreviewRecords, createConsoleSummary } from '../modules/home-summary';
import { getConsoleApi } from '../services/api';
import { createConsoleStore } from '../stores';

export function ConsoleHomePage({ viewModel }) {
  const summary = createConsoleSummary(viewModel);
  const hostContext = getConsoleHostContext(viewModel);
  const api = getConsoleApi(viewModel);
  const store = createConsoleStore();
  const records = createConsolePreviewRecords();

  return (
    <PageShell
      title={CONSOLE_HOME_TITLE}
      description="Console audit operations keep pages, modules, bridge data and service adapters separated so alert governance can expand without eroding host boundaries."
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
