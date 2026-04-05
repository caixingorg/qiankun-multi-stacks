// Logger is intentionally small so every main module can emit a consistent
// payload shape before a real observability backend is introduced.
export function createLogger(appName = 'main-app') {
  function buildPayload(scope, eventName, payload = {}) {
    return {
      scope,
      appName,
      eventName,
      ts: new Date().toISOString(),
      ...payload,
    };
  }

  return {
    info(eventName, payload = {}) {
      console.log('[info][' + appName + ']', buildPayload('main', eventName, payload));
    },
    warn(eventName, payload = {}) {
      // warn 用于非预期但非致命场景：manifest 降级、token 缺失等。
      // 与 info / error 保持相同的 payload 结构，便于统一采集。
      console.warn('[warn][' + appName + ']', buildPayload('main', eventName, payload));
    },
    error(eventName, payload = {}) {
      const scope = payload.scope || 'main';
      console.error('[error][' + appName + ']', buildPayload(scope, eventName, payload));
    },
  };
}
