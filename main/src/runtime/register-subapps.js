// register-subapps.js — 子应用 qiankun 注册
//
// 将运行时注册表转换为 qiankun registerMicroApps 没有的描述符数组，
// 并将 Host 注入内容（SharedKernel、导航、权限上下文等）包装到 props 中传入子应用。
//
// 设计原则：
//   - 注册内容来自 main.js，本文件不自己创建任何单例
//   - onBeforeLoad 地址研、日志记录、qiankun 全局状态同步全在此处帯走
import { registerMicroApps } from 'qiankun';
import { createSubappHostProps } from './create-subapp-host-props.js';

export function registerSubapps({
  appRegistry,
  actions,
  bus,
  sharedKernel,
  mainContext,
  governedNavigation,
  dependencyPolicy,
  logger,
  resolveRuntimeEntry,
  channelState,
  onBeforeLoad,
}) {
  registerMicroApps(
    // 将注册表映射为 qiankun 期望的描述符数组
    appRegistry.map((app) => ({
      name: app.name,
      // 根据当前发布通道解析实际入口 URL
      entry: resolveRuntimeEntry(app, channelState),
      container: '#subapp-viewport',
      activeRule: app.activeRule,
      // props: Host 向子应用注入的全部能力对象
      props: createSubappHostProps({
        app,
        actions,
        bus,
        sharedKernel,
        mainContext,
        governedNavigation,
        dependencyPolicy,
      }),
    })),
    {
      // 加载前：更新当前激活子应用名，记录日志
      beforeLoad: [
        (app) => {
          if (typeof onBeforeLoad === 'function') {
            return onBeforeLoad(app);
          }

          logger.info('before-load', { app: app.name });
          return actions.setGlobalState({ activeSubApp: app.name });
        },
      ],
      // 挂载前：记录日志
      beforeMount: [(app) => logger.info('before-mount', { app: app.name })],
      // 卸载后：记录日志
      afterUnmount: [(app) => logger.info('after-unmount', { app: app.name })],
    }
  );
}

// 别名，向后兼容旧调用方
export const registerMainMicroApps = registerSubapps;
