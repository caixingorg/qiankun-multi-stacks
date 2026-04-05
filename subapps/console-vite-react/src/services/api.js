function createRequestExecutor(viewModel = {}) {
  if (typeof viewModel.requestClient === 'function') {
    return (path, payload = {}) => viewModel.requestClient(path, payload);
  }

  return async (path, payload = {}) => {
    const response = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-runtime-channel': viewModel.runtimeChannel || 'stable',
      },
      body: JSON.stringify(payload),
    });

    return {
      ok: response.ok,
      status: response.status,
      path,
      payload,
    };
  };
}

export function getConsoleApi(viewModel = {}) {
  const runtimeChannel = viewModel.runtimeChannel || 'stable';
  const request = createRequestExecutor(viewModel);
  const endpoints = {
    home: '/audit-log',
    detail: '/alerts',
  };

  return {
    serviceName: 'console-alert-service',
    basePath: '/api/console/alerts',
    runtimeChannel,
    transport: viewModel.requestTransport || 'browser-fetch',
    endpoints,
    fetchHomeData() {
      return request('/api/console/alerts' + endpoints.home, {
        intent: 'console-audit-log',
        runtimeChannel,
      });
    },
    fetchDetailData() {
      return request('/api/console/alerts' + endpoints.detail, {
        intent: 'console-alerts',
        runtimeChannel,
      });
    },
  };
}
