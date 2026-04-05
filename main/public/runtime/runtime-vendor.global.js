(function attachHostRuntimeVendor() {
  // runtime-vendor.global.js 由平台团队提供，主应用在此文件中声明平台级能力。
  // request() 在 runtime-config.js 执行之后才会被调用，因此可以懒读
  // window.__MAIN_RUNTIME_CONFIG__ 取运行时 apiBaseUrl 与 token。

  function getConfig() {
    return window.__MAIN_RUNTIME_CONFIG__ || {};
  }

  function getAuthToken() {
    return window.__MAIN_AUTH_TOKEN__ || '';
  }

  window.HostRuntimeVendor = {
    version: '2026.04.03',
    tenantCode: 'scm-platform',

    formatCurrency(value) {
      return 'CNY ' + Number(value || 0).toFixed(2);
    },

    getFeatureFlags() {
      return {
        enableInjectedVendor: true,
        enableUnifiedTenant: true,
      };
    },

    request(path, payload) {
      var config = getConfig();
      var baseUrl = config.apiBaseUrl || '/api';
      var token = getAuthToken();
      var timeout = payload && typeof payload.timeout === 'number' ? payload.timeout : 8000;
      var body = payload || {};
      var method = body.method || 'POST';
      var controller = typeof AbortController === 'function' ? new AbortController() : null;
      var timer = controller
        ? setTimeout(function () {
            controller.abort();
          }, timeout)
        : null;

      var headers = {
        'Content-Type': 'application/json',
        'x-tenant-code': 'scm-platform',
        'x-vendor-client': 'HostRuntimeVendor',
      };

      if (token) {
        headers['Authorization'] = 'Bearer ' + token;
      }

      return fetch(baseUrl + path, {
        method: method,
        headers: headers,
        body: method !== 'GET' ? JSON.stringify(body) : undefined,
        signal: controller ? controller.signal : undefined,
      })
        .then(function (res) {
          if (!res.ok) {
            if (res.status === 401) {
              throw new Error('[HostRuntimeVendor] AUTH_EXPIRED: 认证已过期，请重新登录 — ' + path);
            }
            throw new Error('[HostRuntimeVendor] HTTP ' + res.status + ' ' + res.statusText + ' — ' + path);
          }
          return res.json();
        })
        .catch(function (error) {
          if (error && error.name === 'AbortError') {
            throw new Error('[HostRuntimeVendor] 请求超时 (' + timeout + 'ms): ' + path);
          }
          throw error;
        })
        .finally(function () {
          if (timer) {
            clearTimeout(timer);
          }
        });
    },
  };
})();
