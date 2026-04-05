// cleanup.js — 资源清理代票
//
// createCleanup() 创建一个统一的资源管理器，子应用在 mount 期间将所有
// 监听器、定时器、动画帧等都登记到 bag 中，unmount 时调用 flush()
// 一次性释放所有资源，避免内存泄漏。
export function createCleanup() {
  const cleanups = [];

  // 内部登记函数，仅接受函数类型
  function addCleanup(fn) {
    if (typeof fn === 'function') {
      cleanups.push(fn);
    }
  }

  return {
    // 手动登记任意清理函数
    add(fn) {
      addCleanup(fn);
    },

    // 封装 addEventListener，自动将对应的 removeEventListener 入队
    addEventListener(target, eventName, handler) {
      if (!target || typeof target.addEventListener !== 'function') {
        return;
      }

      target.addEventListener(eventName, handler);
      addCleanup(() => target.removeEventListener(eventName, handler));
    },

    // 封装 setInterval，自动将 clearInterval 入队
    setInterval(handler, delay) {
      const timer = window.setInterval(handler, delay);
      addCleanup(() => window.clearInterval(timer));
      return timer;
    },

    // 封装 setTimeout，自动将 clearTimeout 入队
    setTimeout(handler, delay) {
      const timer = window.setTimeout(handler, delay);
      addCleanup(() => window.clearTimeout(timer));
      return timer;
    },

    // 封装 requestAnimationFrame，自动将 cancelAnimationFrame 入队
    requestAnimationFrame(handler) {
      if (typeof window.requestAnimationFrame !== 'function') {
        return null;
      }

      const frame = window.requestAnimationFrame(handler);
      addCleanup(() => {
        if (typeof window.cancelAnimationFrame === 'function') {
          window.cancelAnimationFrame(frame);
        }
      });
      return frame;
    },

    // 按 LIFO 顺序执行所有已登记的清理函数。
    // 单个错误直接抛出；多个错误利用自定义消息共同抛出以不丢失
    flush() {
      const errors = [];

      while (cleanups.length) {
        const cleanup = cleanups.pop();
        try {
          cleanup();
        } catch (error) {
          errors.push(error);
        }
      }

      if (errors.length === 1) {
        throw errors[0];
      }

      if (errors.length > 1) {
        throw new Error('Cleanup bag flush encountered ' + errors.length + ' errors.');
      }
    }
  };
}

// 别名，向后兼容旧调用方
export const createCleanupBag = createCleanup;
