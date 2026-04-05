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

export function getLegacyApi(viewModel = {}) {
  const runtimeChannel = viewModel.runtimeChannel || 'stable';
  const request = createRequestExecutor(viewModel);
  const endpoints = {
    home: '/summary',
    detail: '/history',
  };

  return {
    serviceName: 'legacy-order-service',
    basePath: '/api/legacy/orders',
    runtimeChannel,
    transport: viewModel.requestTransport || 'browser-fetch',
    endpoints,
    fetchHomeData() {
      return request('/api/legacy/orders' + endpoints.home, {
        intent: 'legacy-home',
        runtimeChannel,
      });
    },
    fetchDetailData() {
      return request('/api/legacy/orders' + endpoints.detail, {
        intent: 'legacy-detail',
        runtimeChannel,
      });
    },
  };
}
