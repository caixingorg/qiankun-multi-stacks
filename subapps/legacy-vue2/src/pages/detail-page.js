import { renderLegacyInfoPanel } from '../components/info-panel';
import { renderLegacyPageShell } from '../components/page-shell';
import { LEGACY_DETAIL_TITLE } from '../constants/app-constants';
import { getLegacyHostContext } from '../bridge/get-host-context';
import { createLegacyDetailSnapshot } from '../modules/home-summary';
import { getLegacyApi } from '../services/api';
import { createLegacyStore } from '../stores';

export function renderLegacyDetail(h, viewModel) {
  const hostContext = getLegacyHostContext(viewModel);
  const api = getLegacyApi(viewModel);
  const store = createLegacyStore('detail');
  const detailSnapshot = createLegacyDetailSnapshot();

  return renderLegacyPageShell(
    h,
    LEGACY_DETAIL_TITLE,
    'The detail page keeps route ownership inside the child application while preserving clear boundaries with the host shell.',
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
        { label: 'detailEndpoint', value: api.basePath + api.endpoints.detail },
      ]),
      renderLegacyInfoPanel(h, 'Page Meta', [
        { label: 'pageKey', value: store.pageKey },
        { label: 'ready', value: String(store.ready) },
        { label: 'focus', value: 'Order history and migration follow-up' },
      ]),
      renderLegacyInfoPanel(h, 'Detail Snapshot', detailSnapshot),
    ]
  );
}
