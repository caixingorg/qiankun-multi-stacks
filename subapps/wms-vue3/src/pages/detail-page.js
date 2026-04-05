import { h } from 'vue';
import { renderWmsInfoPanel } from '../components/info-panel';
import { renderWmsPageShell } from '../components/page-shell';
import { WMS_DETAIL_TITLE } from '../constants/app-constants';
import { getWmsHostContext } from '../bridge/get-host-context';
import { createWmsDetailSnapshot } from '../modules/home-summary';
import { getWmsApi } from '../services/api';
import { createWmsStore } from '../stores';

export function renderWmsDetail(viewModel) {
  const hostContext = getWmsHostContext(viewModel);
  const api = getWmsApi(viewModel);
  const store = createWmsStore('detail');
  const detailSnapshot = createWmsDetailSnapshot();

  return renderWmsPageShell(
    WMS_DETAIL_TITLE,
    'The task board page shows how the child app can own a second route while keeping warehouse state and host bridge concerns separated.',
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
        { label: 'detailEndpoint', value: api.basePath + api.endpoints.detail },
      ]),
      renderWmsInfoPanel('Page Meta', [
        { label: 'pageKey', value: store.pageKey },
        { label: 'ready', value: String(store.ready) },
        { label: 'focus', value: 'Task board and wave execution' },
      ]),
      renderWmsInfoPanel('Detail Snapshot', detailSnapshot),
    ]
  );
}
