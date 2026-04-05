# main 应用文件 / 文件夹说明

## 一、文档目标

这份文档专门解释 `main/` 主应用的目录结构、关键文件职责和推荐阅读顺序。

适用场景：

1. 新人第一次接手主应用
2. 需要快速定位某个运行问题
3. 需要知道某个能力应该改哪个目录

## 二、`main/` 顶层结构

```text
main/
├── components.json
├── index.html
├── package.json
├── vite.config.js
├── public/
├── src/
└── dist/             # 构建产物
```

### 顶层文件说明

#### `components.json`

用途：

1. 记录当前主应用 `shadcn/ui` 风格组件配置
2. 作为主壳组件层的约定文件

#### `index.html`

用途：

1. 主应用浏览器入口
2. 提供 `#app` 根节点
3. 引入 `runtime/runtime-vendor.global.js`
4. 引入 `runtime/runtime-config.js`

#### `package.json`

用途：

1. 定义主应用依赖
2. 定义 `dev / start / build` 命令
3. 记录主应用当前技术栈说明

#### `vite.config.js`

用途：

1. 主应用当前默认构建和开发入口
2. 负责 React + Vite + Tailwind 的基础构建配置

## 三、`main/public/` 说明

```text
main/public/
├── runtime/
│   ├── runtime-config.js
│   └── runtime-vendor.global.js
└── config/
    ├── env/
    │   ├── local.json
    │   ├── test.json
    │   ├── staging.json
    │   └── production.json
    └── apps/
        ├── local.json
        ├── test.json
        ├── staging.json
        └── production.json
```

### `runtime/runtime-config.js`

用途：

1. 浏览器启动时挂载 `window.__MAIN_RUNTIME_CONFIG__`
2. 决定 `env`
3. 决定 `releaseChannel`
4. 决定 `appManifestPath`

### `runtime/runtime-vendor.global.js`

用途：

1. 给子应用提供浏览器全局 `HostRuntimeVendor`
2. 兼容子应用独立运行和 qiankun 挂载两种模式

### `config/env/*.json`

用途：

1. 存放环境级 API 和发布配置
2. `local/test/staging/production` 对应不同运行环境

### `config/apps/*.json`

用途：

1. 存放环境级子应用 manifest
2. 决定子应用 `stable / rollback` 实际入口地址
3. 让注册表支持环境化配置

## 四、`main/src/` 总体结构

```text
main/src/
├── main.js
├── app-registry.mjs
├── README.md
├── communication/
├── components/
├── constants/
├── context/
├── layout/
├── lib/
├── navigation/
├── pages/
├── routes/
├── runtime/
├── services/
├── shared/
├── styles/
└── utils/
```

## 五、关键入口文件

### `main/src/main.js`

用途：

1. 主应用真正启动入口
2. 加载运行时 registry
3. 初始化上下文、事件总线、logger、errorReporter
4. 渲染主壳
5. 注册 qiankun 子应用
6. 统一接管运行时错误

如果你只看一个文件来理解主应用先怎么跑起来，就先看它。

### `main/src/app-registry.mjs`

用途：

1. 定义默认子应用注册表
2. 管理运行时生效的 app registry
3. 提供按 `key`、按 `route` 查找应用的能力
4. 汇总 rollback 信息

如果你想知道：

1. 某个子应用的激活路由是什么
2. 某个子应用 stable / rollback 入口是什么
3. 当前 runtime registry 是怎么被主应用读到的

就看它。

## 六、各目录说明

### `communication/`

当前文件：

- `event-bus.js`

用途：

1. 主子应用最小通信总线
2. 校验是否使用了契约声明的事件名

### `components/`

当前结构：

```text
components/
├── README.md
└── ui/
    ├── badge.jsx
    ├── button.jsx
    ├── card.jsx
    └── sidebar-link.jsx
```

用途：

1. 主壳自己的基础 UI 组件
2. 当前以 `shadcn/ui` 风格组织

### `constants/`

当前主要是占位说明目录。

用途：

1. 预留主应用本域常量位置
2. 与 `shared/constants/` 区分开

### `context/`

当前文件：

1. `index.js`
2. `user-context.js`
3. `env-context.js`
4. `permission-context.js`
5. `auth-context.js`

用途：

1. 聚合主应用自己的用户、环境、认证、权限上下文
2. 供 shell 和 shared kernel 使用

### `layout/`

当前文件：

1. `render-layout.jsx`
2. `layout-root.jsx`
3. `header-bar.jsx`
4. `sidebar.jsx`
5. `content-area.jsx`
6. `runtime-status-card.jsx`

用途：

1. 渲染主壳结构
2. 控制内容区是显示主应用页面还是子应用 viewport
3. 在同一棵 React 树里直接渲染 runtime summary，而不是额外挂第二个 root

### `lib/`

当前文件：

- `utils.js`

用途：

1. 放 UI 组件层最小通用函数
2. 当前主要提供 `cn`

### `navigation/`

当前文件：

1. `menu-config.js`
2. `menu-permission.js`
3. `navigate-service.js`

用途：

1. 管理一级菜单
2. 管理菜单与权限联动
3. 接管子应用触发的导航请求

### `pages/`

当前文件：

1. `home-page.jsx`
2. `error-page.jsx`

用途：

1. 主应用自己的页面
2. 当路由不属于子应用时显示

### `routes/`

当前文件：

1. `index.js`
2. `app-routes.js`
3. `resolve-main-page.js`

用途：

1. 维护主应用顶层路由常量
2. 判断当前应该显示主应用页面还是子应用容器

### `runtime/`

当前结构：

```text
runtime/
├── load-app-manifest.js
├── runtime-state.js
├── resolve-app-entry.js
├── runtime-error-reporter.js
├── register-subapps.js
├── rollback-policy.js
├── handle-runtime-rollback.js
├── runtime-summary-builder.js
├── subapps/
└── runtime-vendor/
```

用途：

1. 主应用运行期行为收口
2. 管理 manifest、channelState、entry、rollback、子应用注册、错误处理

#### `runtime/subapps/`

用途：

1. 放 qiankun 接入辅助
2. 包括：
   - `cleanup.js`
   - `bridge.js`
   - `webpack-lifecycle.js`
   - `vite-lifecycle.js`

#### `runtime/runtime-vendor/`

用途：

1. 管理 `HostRuntimeVendor` 形状
2. 管理全局挂载能力

### `services/`

当前文件：

1. `config-service.js`
2. `request-client.js`
3. `logger.js`

用途：

1. 配置读取
2. 请求层统一入口
3. 日志统一入口

### `shared/`

当前结构：

```text
shared/
├── app-context.js
├── dependency-policy.js
├── shared-kernel.js
├── constants/
├── host-adapters/
├── ui/
└── utils/
```

用途：

1. 放主应用暴露给子应用的最小共享能力
2. 注意这里已经是 `main` 内部共享层，不再是根目录 `shared/`

### `styles/`

当前文件：

1. `globals.css`
2. `README.md`

用途：

1. 主壳全局样式
2. 只有主应用能定义全局样式基线

### `utils/`

当前主要是占位说明目录。

用途：

1. 预留主应用本域工具函数位置
2. 避免和 `shared/utils/` 混用

## 七、推荐排查入口

### 1. 子应用为什么没加载

先看：

1. `main/src/app-registry.mjs`
2. `main/src/runtime/resolve-app-entry.js`
3. `main/src/runtime/register-subapps.js`

### 2. rollback 为什么不对

先看：

1. `main/src/runtime/runtime-state.js`
2. `main/src/runtime/resolve-app-entry.js`
3. `main/src/runtime/handle-runtime-rollback.js`

### 3. 导航为什么不对

先看：

1. `main/src/navigation/menu-config.js`
2. `main/src/navigation/menu-permission.js`
3. `main/src/navigation/navigate-service.js`

### 4. 子应用拿到了什么上下文

先看：

1. `main/src/shared/shared-kernel.js`
2. `main/src/runtime/register-subapps.js`
3. 子应用自己的 `src/bridge/host-api.js`

## 八、最后建议

理解 `main` 时，不要一开始从 UI 组件往里读。  
最稳的顺序永远是：

1. `main.js`
2. `app-registry.mjs`
3. `runtime/`
4. `navigation/`
5. `context/`
6. `shared/`
7. `layout/`
8. `components/ui/`
