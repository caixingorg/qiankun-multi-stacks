// error-boundary.jsx — Shell 布局错误边界
//
// 当任意 Layout 子组件（HeaderBar、Sidebar、ContentArea）抛出运行时错误时，
// React 18 会 unmount 整棵树——这意味着 shell 框架消失，用户看到空白页。
// ErrorBoundary 捕获错误，渲染一个最小可操作的降级 UI，用户至少能看到刷新提示。
//
// 注意：ErrorBoundary 必须是 class component，React 不支持函数式错误边界。
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Shell 布局渲染错误:', error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            fontFamily: 'sans-serif',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <div>
            <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              界面渲染出错
            </p>
            <p style={{ fontSize: '13px', marginBottom: '16px' }}>
              部分内容无法显示，请刷新页面重试
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 20px',
                fontSize: '13px',
                background: '#1e293b',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
