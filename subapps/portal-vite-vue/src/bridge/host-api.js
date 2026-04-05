const REQUIRED_MAIN_CONTEXT_KEYS = [
  'userContext',
  'envContext',
  'permissionContext',
  'navigation',
  'sharedKernel',
  'dependencyPolicy',
  'contractVersion',
];

const CONTRACT_VERSION = 'v1';

const HostEvents = {
  hostBroadcast: 'host:broadcast',
};

const SubappEvents = {
  mounted: 'subapp:notify',
  runtimeError: 'subapp:runtime-error',
};

export function getHostSharedKernel(props) {
  return props && props.sharedKernel ? props.sharedKernel : {};
}

export function getHostNavigation(props) {
  return props && props.navigation ? props.navigation : {};
}

export function getDependencyPolicy(props) {
  return props && props.dependencyPolicy ? props.dependencyPolicy : {};
}

export function assertMainContract(props) {
  const missingKeys = REQUIRED_MAIN_CONTEXT_KEYS.filter((key) => !(key in (props || {})));

  if (missingKeys.length) {
    throw new Error('Main contract missing keys: ' + missingKeys.join(', '));
  }

  if (props.contractVersion !== CONTRACT_VERSION) {
    throw new Error(
      'Main contract version mismatch: expected ' +
      CONTRACT_VERSION +
      ', got ' +
      String(props.contractVersion)
    );
  }

  return true;
}

export function resolveRuntimeVendor(target = window) {
  return target.HostRuntimeVendor || {};
}

export function createCleanup() {
  const cleanups = [];

  function addCleanup(fn) {
    if (typeof fn === 'function') {
      cleanups.push(fn);
    }
  }

  return {
    add(fn) {
      addCleanup(fn);
    },
    addEventListener(target, eventName, handler) {
      if (!target || typeof target.addEventListener !== 'function') {
        return;
      }

      target.addEventListener(eventName, handler);
      addCleanup(() => target.removeEventListener(eventName, handler));
    },
    setInterval(handler, delay) {
      const timer = window.setInterval(handler, delay);
      addCleanup(() => window.clearInterval(timer));
      return timer;
    },
    setTimeout(handler, delay) {
      const timer = window.setTimeout(handler, delay);
      addCleanup(() => window.clearTimeout(timer));
      return timer;
    },
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

function createBridge(props, appId) {
  const sharedKernel = getHostSharedKernel(props);
  const navigation = getHostNavigation(props);
  const dependencyPolicy = getDependencyPolicy(props);

  return {
    sharedKernel,
    navigation,
    dependencyPolicy,
    registerGlobalState(cleanupBag, activeSubApp) {
      if (!(props.actions && props.actions.onGlobalStateChange)) {
        return;
      }

      const off = props.actions.onGlobalStateChange((state, prev) => {
        console.log('[' + appId + '] global state changed:', state, prev);
      }, true);

      cleanupBag.add(() => off && off());
      props.actions.setGlobalState({ activeSubApp });
    },
    registerHostBroadcast(cleanupBag, handler) {
      if (!(props.bus && props.bus.on)) {
        return;
      }

      const off = props.bus.on(HostEvents.hostBroadcast, handler);
      cleanupBag.add(() => off && off());
    },
    emitMounted() {
      if (props.bus && props.bus.emit) {
        props.bus.emit(SubappEvents.mounted, {
          app: appId,
          message: 'mounted'
        });
      }
    },
    emitRuntimeError({ stage = 'unknown', error, extra = {} } = {}) {
      if (!(props.bus && props.bus.emit)) {
        return;
      }

      props.bus.emit(SubappEvents.runtimeError, {
        app: props.appName || appId,
        stage,
        scope: 'subapp-runtime',
        message: error && error.message ? error.message : String(error),
        ...extra,
      });
    }
  };
}

export function createViteSubapp({
  appId,
  activeSubApp,
  onBootstrap,
  onMount,
  onUnmount
}) {
  let currentContext = null;

  return {
    async bootstrap() {
      console.log('[' + appId + '] bootstrap');
      if (typeof onBootstrap === 'function') {
        await onBootstrap();
      }
    },
    async mount(props) {
      console.log('[' + appId + '] mount', props);

      const cleanupBag = createCleanup();
      const hostBridge = createBridge(props, appId);

      hostBridge.registerGlobalState(cleanupBag, activeSubApp);
      hostBridge.registerHostBroadcast(cleanupBag, (payload) => {
        console.log('[' + appId + '] bus message from host:', payload);
      });
      hostBridge.emitMounted();

      currentContext = {
        appId,
        activeSubApp,
        cleanupBag,
        hostBridge,
        props
      };

      try {
        if (typeof onMount === 'function') {
          await onMount(currentContext);
        }
      } catch (error) {
        let pendingError = error;
        hostBridge.emitRuntimeError({
          stage: 'mount',
          error,
        });
        try {
          cleanupBag.flush();
        } catch (flushError) {
          hostBridge.emitRuntimeError({
            stage: 'mount-cleanup',
            error: flushError,
          });
          pendingError = pendingError || flushError;
        }
        currentContext = null;
        throw pendingError;
      }
    },
    async unmount() {
      console.log('[' + appId + '] unmount');

      let pendingError = null;

      try {
        if (typeof onUnmount === 'function' && currentContext) {
          await onUnmount(currentContext);
        }
      } catch (error) {
        if (currentContext && currentContext.hostBridge) {
          currentContext.hostBridge.emitRuntimeError({
            stage: 'unmount',
            error,
          });
        }
        pendingError = error;
      }

      if (currentContext && currentContext.cleanupBag) {
        try {
          currentContext.cleanupBag.flush();
        } catch (flushError) {
          if (currentContext.hostBridge) {
            currentContext.hostBridge.emitRuntimeError({
              stage: 'unmount-cleanup',
              error: flushError,
            });
          }
          pendingError = pendingError || flushError;
        }
      }

      currentContext = null;

      if (pendingError) {
        throw pendingError;
      }
    }
  };
}

export const createViteMicroApp = createViteSubapp;
