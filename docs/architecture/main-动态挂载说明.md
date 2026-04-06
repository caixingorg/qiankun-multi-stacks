# main 动态挂载说明

## 一、目标

这份文档只说明一件事：

**`main` 现在如何支持 qiankun 动态挂载，以及它和现有路由挂载的边界。**

## 二、默认模式仍然是路由挂载

当前默认模式没有变：

1. 子应用仍然优先通过 `registerMicroApps`
2. 主内容区默认容器仍然是 `#subapp-viewport`
3. 是否激活仍然由 `activeRule` 决定

也就是说：

**route mount 仍然是主路径，dynamic mount 只是补充能力。**

## 三、动态挂载现在解决什么问题

动态挂载用于 Host 自己需要按需控制子应用实例的时候，例如：

1. 把子应用挂到非 `#subapp-viewport` 的容器
2. 在 tab / drawer / panel 中按需加载子应用
3. 同一路由下由 Host 显式控制 mount / update / unmount

## 四、当前规则

### 1. 动态挂载是 Host-owned

只能由 `main` 自己调用，不是给子应用自挂载用的。

### 2. route mount 和 dynamic mount 共用一套平台语义

两条路径复用：

1. app registry
2. entry 解析
3. host props 注入
4. channel / rollback 语义
5. 错误上报通道

### 3. 一轮只做最小能力

当前支持：

1. `mount`
2. `update`
3. `unmount`
4. `unmountAll`

当前不支持：

1. keep-alive 编排
2. 多实例缓存恢复
3. 子应用自己决定挂载容器
4. 替代现有 route mount 主路径

## 五、代码入口

### route mount

看：

1. `main/src/runtime/register-subapps.js`
2. `main/src/layout/content-area.jsx`

### dynamic mount

看：

1. `main/src/runtime/create-subapp-host-props.js`
2. `main/src/runtime/dynamic-mount-manager.js`
3. `main/src/main.js`
4. `main/src/pages/dynamic-mount-demo.jsx`

## 六、最小使用方式

Host 侧代码可直接读取动态挂载管理器：

```js
import { getDynamicMountManager } from '@/runtime/dynamic-mount-manager.js';

const manager = getDynamicMountManager();

await manager.mount({
  slotKey: 'home-right',
  appKey: 'ops',
  container: document.getElementById('home-right-slot'),
  props: {
    hostScene: 'home-widget',
  },
});

await manager.update('home-right', {
  refreshToken: '123',
});

await manager.unmount('home-right');
```

当前仓库也已经内置一个 Host 示例：

1. 首页 `HomePage` 会渲染 `dynamic-mount-demo.jsx`
2. 点击 `Mount Ops Subapp` 即可把 `ops` 子应用动态挂到首页内的示例容器
3. 点击 `Unmount Demo` 或离开首页时会自动卸载该实例

## 七、边界提醒

1. 不要因为支持 dynamic mount，就去删除现有 `registerMicroApps` 主路径
2. 不要让子应用自己读 DOM 再决定挂到哪里
3. 不要把 `activeSubApp` 这种 route 语义直接复用成 dynamic 实例语义
4. dynamic mount 仍然必须服从主应用 registry 和 host props 契约

## 八、一句话结论

`main` 现在采用的是：

**route mount 为主，Host-owned dynamic mount 为补充**。
