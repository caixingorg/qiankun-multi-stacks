export function createConsoleSummary(viewModel = {}) {
  return [
    { label: 'Host source', value: viewModel.fromHost || 'standalone mode' },
    { label: 'App name', value: viewModel.appName || 'unknown' },
    { label: 'Mode', value: viewModel.mode || 'standalone' },
    { label: 'Shared kernel time', value: viewModel.sharedTime || 'N/A' },
    { label: 'Module meta', value: viewModel.moduleMeta || 'N/A' },
    { label: 'Runtime channel', value: viewModel.runtimeChannel || 'stable' },
    { label: 'Vendor version', value: viewModel.vendorVersion || 'N/A' },
  ];
}

export function createConsolePreviewRecords() {
  return [
    { id: 'CS-5001', title: 'Audit anomaly digest', status: 'new', owner: 'audit-team' },
    { id: 'CS-5002', title: 'Alert suppression review', status: 'reviewing', owner: 'sec-ops' },
    { id: 'CS-5003', title: 'Escalation routing map', status: 'ready', owner: 'platform-console' },
  ];
}

export function createConsoleDetailSnapshot() {
  return [
    { label: 'recordId', value: 'CS-5002' },
    { label: 'pageIntent', value: 'alert-detail' },
    { label: 'primaryAction', value: 'confirm suppression policy' },
    { label: 'lastUpdated', value: '2026-04-04 10:20' },
  ];
}
