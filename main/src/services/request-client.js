// Request client 是 main 持有的 HTTP 入口，负责向所有请求注入身份与环境元数据。
//
// 认证 token 由登录流程写入 window.__MAIN_AUTH_TOKEN__，main 不负责管理 token
// 生命周期，只负责在请求时读取并注入到 Authorization header。
export function createRequestClient({ envContext, userContext }) {
  const baseUrl = (envContext && envContext.apiBaseUrl) ? envContext.apiBaseUrl : '/api';
  const userId = (userContext && userContext.id) ? userContext.id : 'anonymous';
  const envName = (envContext && envContext.envName) ? envContext.envName : 'local';

  function getAuthToken() {
    return (typeof window !== 'undefined' && window.__MAIN_AUTH_TOKEN__) || '';
  }

  return {
    async request(path, payload = {}) {
      const { method = 'POST', timeout = 8000, ...body } = payload;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': userId,
        'x-env-name': envName,
        'x-auth-owner': 'main-request-client',
      };

      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = 'Bearer ' + token;
      }

      try {
        const response = await fetch(baseUrl + path, {
          method,
          headers,
          body: method !== 'GET' ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        if (!response.ok) {
          // 401 单独报错，调用方可通过 message.includes('AUTH_EXPIRED') 判断并車转登录页
          if (response.status === 401) {
            throw new Error('[request-client] AUTH_EXPIRED: 认证已过期，请重新登录 — ' + path);
          }
          throw new Error('[request-client] HTTP ' + response.status + ' ' + response.statusText + ' — ' + path);
        }

        return response.json();
      } catch (err) {
        if (err.name === 'AbortError') {
          throw new Error('[request-client] 请求超时 (' + timeout + 'ms): ' + path);
        }
        throw err;
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
