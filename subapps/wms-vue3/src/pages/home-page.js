import { h } from 'vue';
import { renderWmsInfoPanel } from '../components/info-panel';
import { renderWmsPageShell } from '../components/page-shell';
import { WMS_HOME_TITLE } from '../constants/app-constants';
import { getWmsHostContext } from '../bridge/get-host-context';
import { createWmsPreviewRecords, createWmsSummary } from '../modules/home-summary';
import { getWmsApi } from '../services/api';
import { createWmsStore } from '../stores';

export function renderWmsHome(viewModel) {
  const summary = createWmsSummary(viewModel);
  const hostContext = getWmsHostContext(viewModel);
  const api = getWmsApi(viewModel);
  const store = createWmsStore();
  const records = createWmsPreviewRecords();

  return renderWmsPageShell(
    WMS_HOME_TITLE,
    'WMS operations keep page composition, service access and workflow derivation separated so warehouse execution can scale without collapsing into a single entry file.',
    [
      renderWmsInfoPanel('Host Context', Object.keys(hostContext).map((key) => ({
        label: key,
        value: hostContext[key],
      }))),
      renderWmsInfoPanel('Service Meta', [
        { label: 'serviceName', value: api.serviceName },
        { label: 'basePath', value: api.basePath },
        { label: 'runtimeChannel', value: api.runtimeChannel },
        { label: 'transport', value: api.transport },
        { label: 'homeEndpoint', value: api.basePath + api.endpoints.home },
      ]),
      renderWmsInfoPanel('Store Meta', [
        { label: 'appName', value: store.appName },
        { label: 'pageKey', value: store.pageKey },
        { label: 'ready', value: String(store.ready) },
      ]),
      renderWmsInfoPanel('Business Summary', summary),
      renderWmsInfoPanel('Record Preview', records.map((item) => ({
        label: item.id,
        value: item.title + ' / ' + item.status + ' / ' + item.owner,
      }))),
    ]
  );
}
