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

export function getOpsApi(viewModel = {}) {
  const runtimeChannel = viewModel.runtimeChannel || 'stable';
  const request = createRequestExecutor(viewModel);
  const endpoints = {
    home: '/dashboard',
    detail: '/insights',
  };

  return {
    serviceName: 'ops-insight-service',
    basePath: '/api/ops/insights',
    runtimeChannel,
    transport: viewModel.requestTransport || 'browser-fetch',
    endpoints,
    fetchHomeData() {
      return request('/api/ops/insights' + endpoints.home, {
        intent: 'ops-dashboard',
        runtimeChannel,
      });
    },
    fetchDetailData() {
      return request('/api/ops/insights' + endpoints.detail, {
        intent: 'ops-insights',
        runtimeChannel,
      });
    },
  };
}
