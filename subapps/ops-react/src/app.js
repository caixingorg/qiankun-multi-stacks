import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { OpsHomePage } from './pages/home-page.jsx';
import { OpsDetailPage } from './pages/detail-page.jsx';
import { UiButton } from './components/ui/button.jsx';
import { buildOpsInternalPath, resolveOpsPageKey } from './routes';

let root = null;

function App(props) {
  const viewModel = props.viewModel || {};
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const currentPageKey = resolveOpsPageKey(currentPath);
  const CurrentPage = currentPageKey === 'detail' ? OpsDetailPage : OpsHomePage;

  function navigateWithin(pageKey) {
    const nextPath = buildOpsInternalPath(currentPath, pageKey);

    if (nextPath === window.location.pathname) {
      return;
    }

    window.history.pushState(
      {
        app: 'ops-react',
        pageKey,
      },
      '',
      nextPath
    );
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  return (
    <div
      className="react-ops-root"
      style={{
        padding: '12px',
        border: '1px solid #82c091',
        background: '#f3fff5',
        color: '#114b1f',
      }}
    >
      <CurrentPage viewModel={viewModel} />
      <div style={{ marginTop: '12px' }}>
        <p style={{ margin: '0 0 8px', fontWeight: 'bold' }}>In-app pages</p>
        <UiButton active={currentPageKey === 'home'} onClick={() => navigateWithin('home')}>
          Dashboard
        </UiButton>
        <UiButton active={currentPageKey === 'detail'} onClick={() => navigateWithin('detail')}>
          Insights
        </UiButton>
      </div>
      <div style={{ marginTop: '12px' }}>
        <p style={{ margin: '0 0 8px', fontWeight: 'bold' }}>Cross-app navigation</p>
        {(viewModel.navigationTargets || []).map((target) => (
          <UiButton
            key={target.key}
            onClick={() => viewModel.onNavigate && viewModel.onNavigate(target)}
          >
            {target.title} {target.childPath || ''}
          </UiButton>
        ))}
      </div>
    </div>
  );
}

export function renderApp(props = {}) {
  console.log('[react] render with props:', props);
  const mountPoint = props.container
    ? props.container.querySelector('#app')
    : document.getElementById('app');

  root = createRoot(mountPoint);
  root.render(<App {...props} />);
}

export function unmountApp() {
  if (root) {
    root.unmount();
    root = null;
  }
}
