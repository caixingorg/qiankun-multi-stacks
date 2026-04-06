// dynamic-mount-demo.jsx — Host 动态挂载示例
//
// 目的：
//   1. 给主应用维护者一个最小可见的 dynamic mount 使用样例
//   2. 证明 route mount 之外，Host 也可以主动控制子应用生命周期
//   3. 演示 slotKey / container / mount / unmount 的基本用法
import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { getDynamicMountManager } from '@/runtime/dynamic-mount-manager.js';

const DEMO_SLOT_KEY = 'home-dynamic-demo';
const DEMO_APP_KEY = 'ops';

export function DynamicMountDemo() {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [statusText, setStatusText] = useState('Idle');

  async function handleMount() {
    if (!containerRef.current) {
      setStatusText('Container missing');
      return;
    }

    try {
      const manager = getDynamicMountManager();

      // 由 Host 显式指定 appKey、slotKey 和容器 DOM，子应用本身不参与挂载决策。
      await manager.mount({
        slotKey: DEMO_SLOT_KEY,
        appKey: DEMO_APP_KEY,
        container: containerRef.current,
        props: {
          hostScene: 'home-dynamic-demo',
        },
      });

      setMounted(true);
      setStatusText('Mounted subapp-react-ops dynamically');
    } catch (error) {
      setStatusText(error && error.message ? error.message : String(error));
    }
  }

  async function handleUnmount() {
    try {
      const manager = getDynamicMountManager();
      await manager.unmount(DEMO_SLOT_KEY);
      setMounted(false);
      setStatusText('Unmounted dynamic instance');
    } catch (error) {
      setStatusText(error && error.message ? error.message : String(error));
    }
  }

  useEffect(() => {
    // 首页卸载时自动清理该示例实例，避免离开页面后残留动态挂载内容。
    return () => {
      try {
        const manager = getDynamicMountManager();
        manager.unmount(DEMO_SLOT_KEY);
      } catch (error) {
        // manager 未初始化或实例已不存在时，无需额外处理。
      }
    };
  }, []);

  return (
    <Card title="Dynamic Mount Demo" className="grid gap-4">
      <div className="text-sm leading-6 text-slate-700">
        This panel demonstrates host-owned qiankun dynamic mount. It does not replace the
        default route mount path.
      </div>
      <div className="flex flex-wrap gap-3">
        <Button tone="primary" onClick={handleMount} disabled={mounted}>
          Mount Ops Subapp
        </Button>
        <Button tone="default" onClick={handleUnmount} disabled={!mounted}>
          Unmount Demo
        </Button>
      </div>
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Status: {statusText}
      </div>
      <section
        ref={containerRef}
        className="min-h-[280px] rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
      />
    </Card>
  );
}
