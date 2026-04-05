# main/src 问题定位手册

这份文档只服务两类人：

1. 维护 `main` 主应用基座的人
2. 需要接入主应用能力的子应用团队

它不负责解释子应用内部应该怎么写页面、模块、状态或服务层。

接入团队的最小操作清单统一收口到：

- [docs/architecture/子应用接入短清单.md](../../docs/architecture/子应用接入短清单.md)

## 一、先看哪里

如果你第一次接手 `main`，按这个顺序看：

1. `main.js`
   看主应用如何启动、读取配置、渲染壳层、注册 qiankun 子应用。

2. `app-registry.mjs`
   看默认子应用注册表、激活路由、stable/rollback 入口和 rollback 模式。

3. `runtime/`
   重点看：
   - `load-app-manifest.js`
   - `runtime-state.js`
   - `resolve-app-entry.js`
   - `register-subapps.js`
   - `handle-runtime-rollback.js`

4. `navigation/`
   看主应用如何控制一级菜单、跨应用跳转和导航埋点。

5. `shared/`
   看主应用如何向子应用暴露最小共享能力。

6. `layout/`
   最后再看壳层布局和状态展示。

## 二、主应用负责什么

`main` 当前只负责下面这些平台能力：

1. 子应用注册与入口解析
2. 主路由激活规则
3. 全局上下文注入
4. 一级菜单与导航能力
5. 主子应用最小通信通道
6. 运行时配置读取
7. 错误上报与回滚决策
8. 向子应用下发共享 request 与 runtime vendor

## 三、主应用不负责什么

`main` 不负责：

1. 子应用页面怎么拆
2. 子应用 service 层怎么封装
3. 子应用 state 层怎么组织
4. 子应用组件目录怎么命名
5. 子应用 UI 规范怎么推进

## 四、目录职责

### `communication/`

当前只放主子应用事件常量。

先看：

1. `events.js`

### `navigation/`

负责：

1. 一级菜单
2. 菜单与权限联动
3. 跨应用跳转能力

先看：

1. `menu-config.js`
2. `menu-permission.js`
3. `navigate-service.js`
4. `navigation-targets.js`

### `shared/`

负责主应用传给子应用的最小共享能力。

注意：

1. 这些文件是主应用内部实现，不是给子应用直接 import 的跨仓入口。
2. 子应用应在自己仓内维护 `src/bridge/host-api.js` 来消费这些能力。

先看：

1. `shared-kernel.js`
2. `subapp-props.js`
3. `host-adapters/assert-main-contract.js`
4. `host-adapters/resolve-runtime-vendor.js`

### `runtime/`

负责主应用运行期行为。

先看：

1. `load-app-manifest.js`
2. `runtime-state.js`
3. `resolve-app-entry.js`
4. `register-subapps.js`
5. `rollback-policy.js`
6. `handle-runtime-rollback.js`
7. `runtime-summary-builder.js`
8. `runtime-error-reporter.js`

### `runtime/subapps/`

这里只放主应用自己的 qiankun 接入辅助，不上升为独立层概念，也不作为子应用直接依赖入口。

当前文件：

1. `bridge.js`
2. `cleanup.js`
3. `webpack-lifecycle.js`
4. `vite-lifecycle.js`

### `layout/`

负责壳层布局和主内容区。

先看：

1. `render-layout.jsx`
2. `layout-root.jsx`
3. `content-area.jsx`
4. `header-bar.jsx`
5. `sidebar.jsx`
6. `runtime-status-card.jsx`

## 五、问题定位

### 1. 子应用加载不出来

按这个顺序查：

1. `app-registry.mjs`
   检查：
   - `activeRule`
   - `entries`
   - `rollbackMode`

2. `load-app-manifest.js`
   检查：
   - 是否成功读到运行时 manifest
   - 是否回退到了默认 registry

3. `runtime-state.js`
   检查：
   - 当前是否误进 `rollback`
   - 是否被 `debug=1` 参数带偏

4. `resolve-app-entry.js`
   检查：
   - 当前 route 命中的应用是否被切到了 rollback entry
   - 是否命中了 `failApp`

5. `register-subapps.js`
   检查：
   - 注册的 `container`
   - 注入的 `props`

### 2. 打开的不是预期入口

按这个顺序查：

1. `runtime-state.js`
2. `resolve-app-entry.js`
3. `app-registry.mjs`
4. `main/public/config/apps/*.json`

重点判断：

1. 当前 channel 是不是被手动切成了 rollback
2. 当前应用是不是 `dedicated-entry`
3. 生产/测试/staging manifest 是否写错

### 3. rollback 行为不对

按这个顺序查：

1. `rollback-policy.js`
2. `handle-runtime-rollback.js`
3. `runtime-state.js`
4. `app-registry.mjs`

重点判断：

1. 当前应用是不是 `shared-entry`
2. 是否是自动回滚触发
3. 是否是本地 `debug=1` 调试切换

### 4. 导航跳转不对

按这个顺序查：

1. `navigate-service.js`
2. `navigation-targets.js`
3. `menu-config.js`
4. `menu-permission.js`

重点判断：

1. target 是否存在
2. childPath 是否被规范化
3. 是否命中重复跳转短路
4. 一级菜单权限是否把入口挡住了

### 5. 子应用说“拿不到主应用上下文”

按这个顺序查：

1. `register-subapps.js`
   看 host 实际注入了什么 props

2. 子应用自己的 `src/bridge/host-api.js`
   看 getter 是否和注入字段一致

3. 子应用自己的 `assertMainContract(props)` 实现
   看 contract 校验是否能通过

4. `shared/shared-kernel.js`
   看共享能力本身是否存在

### 6. debug 参数好像没生效 / 生效过头

按这个顺序查：

1. `main/public/runtime/runtime-config.js`
2. `services/config-service.js`
3. `runtime-state.js`

当前规则：

1. 只有本地且显式 `debug=1`，才允许手动使用 `channel=rollback`
2. 只有本地且显式 `debug=1`，才允许 `failApp`
3. 自动回滚仍然可以在真实加载失败后生效

## 六、接入检查清单

未来新增子应用时，主应用侧只需要确认下面这些点：

### 1. 注册表信息完整

必须有：

1. `key`
2. `name`
3. `activeRule`
4. `entries`
5. `rollbackMode`

### 2. 主应用传递面完整

当前最小注入面：

1. `actions`
2. `bus`
3. `sharedKernel`
4. `userContext`
5. `envContext`
6. `permissionContext`
7. `navigation`
8. `dependencyPolicy`
9. `contractVersion`

### 3. 子应用接入时至少会用到的主应用入口

1. qiankun `props` 注入字段
2. 子应用自己仓内的 `src/bridge/host-api.js`
3. 子应用自己仓内的 `src/bridge/micro-app.js`

### 4. 主应用不替子应用决定的事

主应用不会替子应用规定：

1. 页面目录怎么拆
2. 业务服务怎么封装
3. 状态层怎么组织
4. UI 组件怎么命名

## 七、阅读原则

如果你要继续优化 `main`，优先级始终是：

1. 先收主应用运行逻辑
2. 再收主应用配置与回滚治理
3. 再收主应用问题定位体验

不要再把优化重点放回对子应用内部实现方式的规范化。

## 八、边界提醒

1. 子应用不要直接 import `main/src/*`
2. 主应用只负责注入能力，不负责规定子应用业务目录与实现细节
3. 子应用把读取 props、contract 校验、runtime vendor 解析、cleanup 收口在自己仓内的 `src/bridge/host-api.js`
