import { h } from 'vue';
import { renderPortalInfoPanel } from '../components/info-panel';
import { renderPortalPageShell } from '../components/page-shell';
import { PORTAL_DETAIL_TITLE } from '../constants/app-constants';
import { getPortalHostContext } from '../bridge/get-host-context';
import { createPortalDetailSnapshot } from '../modules/home-summary';
import { getPortalApi } from '../services/api';
import { createPortalStore } from '../stores';

export function renderPortalDetail(viewModel) {
  const hostContext = getPortalHostContext(viewModel);
  const api = getPortalApi(viewModel);
  const store = createPortalStore('detail');
  const detailSnapshot = createPortalDetailSnapshot();

  return renderPortalPageShell(
    PORTAL_DETAIL_TITLE,
    'The announcements page keeps secondary route ownership inside the portal application so workspace sections can evolve without host-side route sprawl.',
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
        { label: 'detailEndpoint', value: api.basePath + api.endpoints.detail },
      ]),
      renderPortalInfoPanel('Page Meta', [
        { label: 'pageKey', value: store.pageKey },
        { label: 'ready', value: String(store.ready) },
        { label: 'focus', value: 'Announcements and workspace guidance' },
      ]),
      renderPortalInfoPanel('Detail Snapshot', detailSnapshot),
    ]
  );
}
