// validate-dynamic-mount.mjs — 动态挂载合同验证
//
// 只验证 Host 侧最小保证：
//   1. route mount 与 dynamic mount 共用同一套 Host props shape
//   2. dynamic mount 会屏蔽 activeSubApp 写入，避免污染 route 语义
//   3. slotKey 重复 mount 时会先卸载旧实例
//   4. update / unmountAll 行为符合 Host 管理器预期
import { createDynamicMountManager } from '../../main/src/runtime/dynamic-mount-manager.js';
import { createSubappHostProps } from '../../main/src/runtime/create-subapp-host-props.js';

const app = {
  key: 'ops',
  name: 'subapp-react-ops',
  activeRule: '/ops',
  entries: {
    stable: '//localhost:7203',
    rollback: '//localhost:7213',
  },
};

const actionsCalls = [];
const actions = {
  setGlobalState(payload) {
    actionsCalls.push(payload);
    return true;
  },
  onGlobalStateChange() {
    return () => {};
  },
};

const mainContext = {
  user: { id: 'u-001', name: 'tester' },
  envContext: { envName: 'test', apiBaseUrl: '/api' },
  permissionContext: { permissions: ['ops:view'] },
  contractVersion: 'v1',
};

// route mount 保持默认 mountMode，不应被 dynamic 能力影响。
const routeProps = createSubappHostProps({
  app,
  actions,
  bus: {},
  sharedKernel: {},
  mainContext,
  governedNavigation: {},
  dependencyPolicy: {},
});

if (routeProps.mountMode !== 'route') {
  throw new Error('route host props mountMode mismatch');
}

// dynamic mount 允许 Host 注入 slotKey 和额外场景信息。
const dynamicProps = createSubappHostProps({
  app,
  actions,
  bus: {},
  sharedKernel: {},
  mainContext,
  governedNavigation: {},
  dependencyPolicy: {},
  mountMode: 'dynamic',
  slotKey: 'home-right',
  extraProps: {
    hostScene: 'home-widget',
  },
});

if (dynamicProps.mountMode !== 'dynamic') {
  throw new Error('dynamic host props mountMode mismatch');
}

if (dynamicProps.slotKey !== 'home-right') {
  throw new Error('dynamic host props slotKey mismatch');
}

if (dynamicProps.hostScene !== 'home-widget') {
  throw new Error('dynamic host props extra props missing');
}

dynamicProps.actions.setGlobalState({
  activeSubApp: 'subapp-react-ops',
  keepMe: 'ok',
});

// dynamic mount 必须剥离 activeSubApp，避免动态实例改写 route 激活状态。
if (actionsCalls.length !== 1 || actionsCalls[0].activeSubApp || actionsCalls[0].keepMe !== 'ok') {
  throw new Error('dynamic host props should strip activeSubApp writes from proxied actions');
}

const loadCalls = [];
const unmountCalls = [];
const updateCalls = [];

function createMockMicroApp(slotKey) {
  return {
    async unmount() {
      unmountCalls.push(slotKey);
    },
    async update(payload) {
      updateCalls.push({ slotKey, payload });
    },
  };
}

const manager = createDynamicMountManager({
  appRegistry: [app],
  actions,
  bus: {},
  sharedKernel: {},
  mainContext,
  governedNavigation: {},
  dependencyPolicy: {},
  logger: null,
  resolveRuntimeEntry(targetApp) {
    return targetApp.entries.stable;
  },
  channelState: { channel: 'stable' },
  loadApp(config, options) {
    loadCalls.push({ config, options });
    return createMockMicroApp(config.props.slotKey);
  },
});

// 第一次挂载：在 slot 上创建一个 ops 动态实例。
await manager.mount({
  slotKey: 'home-right',
  appKey: 'ops',
  container: '#dynamic-slot',
});

// 第二次挂载同一 slot：应先卸载旧实例，再重新挂载。
await manager.mount({
  slotKey: 'home-right',
  appKey: 'ops',
  container: '#dynamic-slot',
  props: { hostScene: 'remount' },
});

// update 用于 Host 主动把运行时 payload 下发给已挂载实例。
await manager.update('home-right', { refreshToken: '123' });
await manager.unmountAll();

if (loadCalls.length !== 2) {
  throw new Error('dynamic manager should call loader for each mount');
}

if (loadCalls[0].config.props.mountMode !== 'dynamic') {
  throw new Error('dynamic manager should inject dynamic mountMode');
}

if (loadCalls[0].config.props.slotKey !== 'home-right') {
  throw new Error('dynamic manager should inject slotKey');
}

if (unmountCalls[0] !== 'home-right') {
  throw new Error('remounting the same slot should unmount the previous dynamic instance first');
}

if (updateCalls.length !== 1 || updateCalls[0].payload.refreshToken !== '123') {
  throw new Error('dynamic manager update should forward payload to mounted instance');
}

if (manager.getMountedApps().length !== 0) {
  throw new Error('dynamic manager should have no mounted apps after unmountAll');
}

console.log('[contracts] dynamic mount validation passed');
