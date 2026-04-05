import { createApp, h } from 'vue';
import { renderPortalButton } from './components/ui-button';
import {
  buildPortalInternalPath,
  resolvePortalPageKey
} from './routes';
import { renderPortalHome } from './pages/home-page';
import { renderPortalDetail } from './pages/detail-page';

let instance = null;

function createRootComponent(viewModel) {
  return {
    name: 'ViteVuePortal',
    data() {
      return {
        currentPath: window.location.pathname,
      };
    },
    mounted() {
      this.handlePopState = () => {
        this.currentPath = window.location.pathname;
      };
      window.addEventListener('popstate', this.handlePopState);
    },
    beforeUnmount() {
      window.removeEventListener('popstate', this.handlePopState);
    },
    methods: {
      navigateWithin(pageKey) {
        const nextPath = buildPortalInternalPath(this.currentPath, pageKey);

        if (nextPath === window.location.pathname) {
          return;
        }

        window.history.pushState(
          {
            app: 'portal-vite-vue',
            pageKey,
          },
          '',
          nextPath
        );
        window.dispatchEvent(new PopStateEvent('popstate'));
      },
    },
    render() {
      const currentPageKey = resolvePortalPageKey(this.currentPath);
      const currentPage = currentPageKey === 'detail'
        ? renderPortalDetail(viewModel)
        : renderPortalHome(viewModel);

      return h('section', { class: 'vite-vue-root' }, [
        currentPage,
        h('div', {
          style: {
            marginTop: '12px',
          },
        }, [
          h('p', { class: 'portal-actions-title' }, 'In-app pages'),
          renderPortalButton('Workspace', {
            active: currentPageKey === 'home',
            onClick: () => this.navigateWithin('home'),
          }),
          renderPortalButton('Announcements', {
            active: currentPageKey === 'detail',
            onClick: () => this.navigateWithin('detail'),
          }),
        ]),
        h('div', {
          style: {
            marginTop: '12px',
          },
        }, [
          h('p', { class: 'portal-actions-title' }, 'Cross-app navigation'),
          ...(viewModel.navigationTargets || []).map((target) =>
            renderPortalButton(target.title + ' ' + (target.childPath || ''), {
              onClick: () => viewModel.onNavigate && viewModel.onNavigate(target),
            })
          ),
        ]),
      ]);
    },
  };
}

export function renderApp(props = {}) {
  const mountPoint = props.container
    ? props.container.querySelector('#app')
    : document.getElementById('app');
  const viewModel = props.viewModel || {};

  instance = createApp(createRootComponent(viewModel));
  instance.mount(mountPoint);
}

export function unmountApp() {
  if (instance) {
    instance.unmount();
    instance = null;
  }
}
