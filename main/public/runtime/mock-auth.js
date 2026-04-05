(function () {
  // mock-auth.js — 开发期 SSO 身份模拟
  //
  // 职责：在本地开发环境中模拟真实 SSO / BFF 在 HTML 级完成的两件事：
  //   1. 将用户身份写入 window.__MAIN_USER__
  //   2. 将 Bearer token 写入 window.__MAIN_AUTH_TOKEN__
  //
  // ─── 生产集成替换说明 ──────────────────────────────────────────────────────
  //
  // 生产环境不依赖此文件，而是由以下一种方式写入上述两个变量：
  //
  //   方案 A（服务端渲染注入，推荐）：
  //     BFF / 网关在返回 index.html 时，在 <head> 内内联 <script> 块：
  //       <script>
  //         window.__MAIN_USER__ = /* 服务端序列化的用户 JSON */;
  //         window.__MAIN_AUTH_TOKEN__ = '/* JWT token */';
  //       </script>
  //     该 script 块在 deploy-env.js 之后、runtime-config.js 之前插入即可。
  //
  //   方案 B（OAuth PKCE 纯前端流）：
  //     登录完成后将 token 存入 sessionStorage，在此文件中改为读取：
  //       window.__MAIN_AUTH_TOKEN__ = sessionStorage.getItem('auth_token');
  //       window.__MAIN_USER__ = JSON.parse(sessionStorage.getItem('auth_user') || 'null');
  //
  //   方案 C（登录子应用 qiankun GlobalState 回写）：
  //     登录子应用完成后通过 actions.setGlobalState({ user, token }) 回调，
  //     main 监听到变化后调用 createUserContext() 重建上下文并刷新 Shell。
  //
  // ─── 安全边界 ──────────────────────────────────────────────────────────────
  //
  // 非 localhost 环境此函数提前退出，不注入任何 mock 数据。
  // 即便此文件被意外打包进生产产物，也不会覆盖真实 SSO 写入的数据。

  var hostname = window.location.hostname;
  var isLocalhost =
    hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

  // 非本地环境：跳过，依赖生产 SSO 写入
  if (!isLocalhost) return;

  // 真实 SSO 已先于此脚本写入（例如登录子应用回写场景）：同样跳过
  if (window.__MAIN_USER__ && window.__MAIN_AUTH_TOKEN__) return;

  // ─── 模拟用户身份 ────────────────────────────────────────────────────────
  // 字段格式与生产 SSO userinfo 端点返回值对齐。
  // 对接真实 SSO 时，按此结构映射接口返回字段即可。
  window.__MAIN_USER__ = {
    id: 'dev-u-001',
    name: 'dev-admin',
    displayName: '开发调试用户',
    email: 'dev@localhost.local',
    roles: ['admin', 'ops-manager', 'wms-operator'],
    tenantCode: 'scm-platform',
    tenantName: '供应链平台（本地开发）',
  };

  // ─── 模拟 Bearer token ──────────────────────────────────────────────────
  // 生产环境此处为真实 JWT（由 SSO 签发，有过期时间）。
  // 开发环境使用带时间戳的占位字符串，确保每次刷新值不同（模拟短期有效性）。
  window.__MAIN_AUTH_TOKEN__ = 'mock-bearer-dev-' + Date.now();
})();
