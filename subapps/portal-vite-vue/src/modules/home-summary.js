export function createPortalSummary(viewModel = {}) {
  return [
    { label: 'Host source', value: viewModel.fromHost || 'standalone mode' },
    { label: 'App name', value: viewModel.appName || 'unknown' },
    { label: 'Mode', value: viewModel.mode || 'standalone' },
    { label: 'Shared kernel time', value: viewModel.sharedTime || 'N/A' },
    { label: 'Module meta', value: viewModel.moduleMeta || 'N/A' },
    { label: 'Vendor version', value: viewModel.vendorVersion || 'N/A' },
    { label: 'Tenant', value: viewModel.vendorTenant || 'N/A' },
  ];
}

export function createPortalPreviewRecords() {
  return [
    { id: 'PT-4001', title: 'Workspace launch cards', status: 'published', owner: 'portal-team' },
    { id: 'PT-4002', title: 'Announcement banner review', status: 'editing', owner: 'content-ops' },
    { id: 'PT-4003', title: 'Quick links refresh', status: 'scheduled', owner: 'design-system' },
  ];
}

export function createPortalDetailSnapshot() {
  return [
    { label: 'recordId', value: 'PT-4002' },
    { label: 'pageIntent', value: 'announcement-detail' },
    { label: 'primaryAction', value: 'publish announcement' },
    { label: 'lastUpdated', value: '2026-04-04 10:15' },
  ];
}
