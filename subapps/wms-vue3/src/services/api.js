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

export function getWmsApi(viewModel = {}) {
  const runtimeChannel = viewModel.runtimeChannel || 'stable';
  const request = createRequestExecutor(viewModel);
  const endpoints = {
    home: '/board',
    detail: '/tasks',
  };

  return {
    serviceName: 'wms-wave-service',
    basePath: '/api/wms/waves',
    runtimeChannel,
    transport: viewModel.requestTransport || 'browser-fetch',
    endpoints,
    fetchHomeData() {
      return request('/api/wms/waves' + endpoints.home, {
        intent: 'wave-board',
        runtimeChannel,
      });
    },
    fetchDetailData() {
      return request('/api/wms/waves' + endpoints.detail, {
        intent: 'wave-task-board',
        runtimeChannel,
      });
    },
  };
}
