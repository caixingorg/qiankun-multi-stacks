// User context 是 main 的用户身份入口。
//
// 【当前状态】本地开发 fixture，硬编码了一个测试用户。
//
// 【生产集成点】替换方式取决于登录架构：
//   - SSO / OAuth：登录成功后将用户信息写入 window.__MAIN_USER__，
//     然后在此处读取并构建 userContext。
//   - 服务端渲染注入：由服务端在 HTML 中内联 window.__MAIN_USER__，
//     脚本加载时直接读取。
//   - 独立登录子应用：由登录子应用通过 qiankun GlobalState 回写，
//     main 监听变化后调用 createUserContext() 重新构建。
//
// Auth token（用于请求头 Authorization）由登录流程单独写入
// window.__MAIN_AUTH_TOKEN__，request-client 在发请求时懒读，
// 不需要在 userContext 中携带。
export function createUserContext() {
  const runtimeWindow = typeof window !== 'undefined' ? window : null;
  const injected = runtimeWindow && runtimeWindow.__MAIN_USER__;
  const hostname = runtimeWindow && runtimeWindow.location ? runtimeWindow.location.hostname : 'localhost';
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

  if (injected) {
    return {
      id: injected.id || 'anonymous',
      name: injected.name || 'anonymous',
      displayName: injected.displayName || injected.name || 'Anonymous',
      authenticated: true,
    };
  }

  if (isLocalHost) {
    // DEV FIXTURE — 仅 localhost 可注入本地调试用户，非本地环境不得合成业务用户身份。
    return {
      id: 'u-001',
      name: 'supply-chain-admin',
      displayName: 'Supply Chain Admin',
      authenticated: true,
      authSource: 'local-fixture',
    };
  }

  return {
    id: 'anonymous',
    name: 'anonymous',
    displayName: 'Anonymous',
    authenticated: false,
    authSource: 'missing-runtime-injection',
  };
}
