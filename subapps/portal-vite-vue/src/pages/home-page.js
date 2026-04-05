import { h } from 'vue';
import { renderPortalInfoPanel } from '../components/info-panel';
import { renderPortalPageShell } from '../components/page-shell';
import { PORTAL_HOME_TITLE } from '../constants/app-constants';
import { getPortalHostContext } from '../bridge/get-host-context';
import { createPortalPreviewRecords, createPortalSummary } from '../modules/home-summary';
import { getPortalApi } from '../services/api';
import { createPortalStore } from '../stores';

export function renderPortalHome(viewModel) {
  const summary = createPortalSummary(viewModel);
  const hostContext = getPortalHostContext(viewModel);
  const api = getPortalApi(viewModel);
  const store = createPortalStore();
  const records = createPortalPreviewRecords();

  return renderPortalPageShell(
    PORTAL_HOME_TITLE,
    'Portal workspace delivery keeps page composition and service boundaries explicit so operational content can grow without turning the entry module into a bottleneck.',
    [
      renderPortalInfoPanel('Host Context', Object.keys(hostContext).map((key) => ({
        label: key,
        value: hostContext[key],
      }))),
      renderPortalInfoPanel('Service Meta', [
        { label: 'serviceName', value: api.serviceName },
        { label: 'basePath', value: api.basePath },
        { label: 'runtimeChannel', value: api.runtimeChannel },
        { label: 'transport', value: api.transport },
        { label: 'homeEndpoint', value: api.basePath + api.endpoints.home },
      ]),
      renderPortalInfoPanel('Store Meta', [
        { label: 'appName', value: store.appName },
        { label: 'pageKey', value: store.pageKey },
        { label: 'ready', value: String(store.ready) },
      ]),
      renderPortalInfoPanel('Business Summary', summary),
      renderPortalInfoPanel('Record Preview', records.map((item) => ({
        label: item.id,
        value: item.title + ' / ' + item.status + ' / ' + item.owner,
      }))),
    ]
  );
}
