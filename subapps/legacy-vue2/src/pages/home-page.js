import { renderLegacyInfoPanel } from '../components/info-panel';
import { renderLegacyPageShell } from '../components/page-shell';
import { LEGACY_HOME_TITLE } from '../constants/app-constants';
import { getLegacyHostContext } from '../bridge/get-host-context';
import { createLegacyPreviewRecords, createLegacySummary } from '../modules/home-summary';
import { getLegacyApi } from '../services/api';
import { createLegacyStore } from '../stores';

export function renderLegacyHome(h, viewModel) {
  const summary = createLegacySummary(viewModel);
  const hostContext = getLegacyHostContext(viewModel);
  const api = getLegacyApi(viewModel);
  const store = createLegacyStore();
  const records = createLegacyPreviewRecords();

  return renderLegacyPageShell(
    h,
    LEGACY_HOME_TITLE,
    'Legacy order operations keep bridge access, service orchestration and business state separated so the historical stack can still evolve under production governance.',
    [
      renderLegacyInfoPanel(h, 'Host Context', Object.keys(hostContext).map((key) => ({
        label: key,
        value: hostContext[key],
      }))),
      renderLegacyInfoPanel(h, 'Service Meta', [
        { label: 'serviceName', value: api.serviceName },
        { label: 'basePath', value: api.basePath },
        { label: 'runtimeChannel', value: api.runtimeChannel },
        { label: 'transport', value: api.transport },
        { label: 'homeEndpoint', value: api.basePath + api.endpoints.home },
      ]),
      renderLegacyInfoPanel(h, 'Store Meta', [
        { label: 'appName', value: store.appName },
        { label: 'pageKey', value: store.pageKey },
        { label: 'ready', value: String(store.ready) },
      ]),
      renderLegacyInfoPanel(h, 'Business Summary', summary),
      renderLegacyInfoPanel(h, 'Record Preview', records.map((item) => ({
        label: item.id,
        value: item.title + ' / ' + item.status + ' / ' + item.owner,
      }))),
    ]
  );
}
