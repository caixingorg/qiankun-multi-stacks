import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ConsoleHomePage } from './pages/home-page.jsx';
import { ConsoleDetailPage } from './pages/detail-page.jsx';
import { UiButton } from './components/ui/button.jsx';
import { buildConsoleInternalPath, resolveConsolePageKey } from './routes';

let root = null;

function App({ viewModel }) {
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

  const currentPageKey = resolveConsolePageKey(currentPath);
  const CurrentPage = currentPageKey === 'detail' ? ConsoleDetailPage : ConsoleHomePage;

  function navigateWithin(pageKey) {
    const nextPath = buildConsoleInternalPath(currentPath, pageKey);

    if (nextPath === window.location.pathname) {
      return;
    }

    window.history.pushState(
      {
        app: 'console-vite-react',
        pageKey,
      },
      '',
      nextPath
    );
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  return (
    <section className="vite-react-root">
      <CurrentPage viewModel={viewModel} />
      <div style={{ marginTop: '12px' }}>
        <p style={{ margin: '0 0 8px', fontWeight: 'bold' }}>In-app pages</p>
        <UiButton active={currentPageKey === 'home'} onClick={() => navigateWithin('home')}>
          Audit Log
        </UiButton>
        <UiButton active={currentPageKey === 'detail'} onClick={() => navigateWithin('detail')}>
          Alerts
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
    </section>
  );
}

export function renderApp(props = {}) {
  const mountPoint = props.container
    ? props.container.querySelector('#root')
    : document.getElementById('root');
  const viewModel = props.viewModel || {};

  root = createRoot(mountPoint);
  root.render(<App viewModel={viewModel} />);
}

export function unmountApp() {
  if (root) {
    root.unmount();
    root = null;
  }
}
