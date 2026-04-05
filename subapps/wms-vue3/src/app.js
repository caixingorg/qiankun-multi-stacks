import { createApp, h } from 'vue';
import { renderWmsButton } from './components/ui-button';
import {
  buildWmsInternalPath,
  resolveWmsPageKey
} from './routes';
import { renderWmsHome } from './pages/home-page';
import { renderWmsDetail } from './pages/detail-page';

let instance = null;

function rootComponent(viewModel) {
  return {
    name: 'WmsSubapp',
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
        const nextPath = buildWmsInternalPath(this.currentPath, pageKey);

        if (nextPath === window.location.pathname) {
          return;
        }

        window.history.pushState(
          {
            app: 'wms-vue3',
            pageKey,
          },
          '',
          nextPath
        );
        window.dispatchEvent(new PopStateEvent('popstate'));
      },
    },
    render() {
      const currentPageKey = resolveWmsPageKey(this.currentPath);
      const currentPage = currentPageKey === 'detail'
        ? renderWmsDetail(viewModel)
        : renderWmsHome(viewModel);

      return h('div', {
        class: 'wms-root',
        style: {
          padding: '12px',
          border: '1px solid #8ab4f8',
          background: '#f2f8ff',
          color: '#09396b',
        },
      }, [
        currentPage,
        h('div', {
          style: {
            marginTop: '12px',
          },
        }, [
          h('p', { class: 'wms-actions-title' }, 'In-app pages'),
          renderWmsButton('Wave Board', {
            active: currentPageKey === 'home',
            onClick: () => this.navigateWithin('home'),
          }),
          renderWmsButton('Task Board', {
            active: currentPageKey === 'detail',
            onClick: () => this.navigateWithin('detail'),
          }),
        ]),
        h('div', {
          style: {
            marginTop: '12px',
          },
        }, [
          h('p', { class: 'wms-actions-title' }, 'Cross-app navigation'),
          ...(viewModel.navigationTargets || []).map((target) =>
            renderWmsButton(target.title + ' ' + (target.childPath || ''), {
              onClick: () => viewModel.onNavigate && viewModel.onNavigate(target),
            })
          ),
        ]),
      ]);
    },
  };
}

export function renderApp(props = {}) {
  const { container } = props;
  const mountPoint = container
    ? container.querySelector('#app')
    : document.getElementById('app');
  const viewModel = props.viewModel || {};

  instance = createApp(rootComponent(viewModel));
  instance.mount(mountPoint);
}

export function unmountApp() {
  if (instance) {
    instance.unmount();
    instance = null;
  }
}
