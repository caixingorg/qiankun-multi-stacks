import Vue from 'vue';
import { renderLegacyButton } from './components/ui-button';
import {
  buildLegacyInternalPath,
  resolveLegacyPageKey
} from './routes';
import { renderLegacyHome } from './pages/home-page';
import { renderLegacyDetail } from './pages/detail-page';

let instance = null;

export function renderApp(props = {}) {
  const { container } = props;
  const viewModel = props.viewModel || {};
  const mountPoint = container
    ? container.querySelector('#app')
    : document.getElementById('app');

  instance = new Vue({
    data() {
      return {
        currentPath: window.location.pathname,
      };
    },
    created() {
      this.handlePopState = () => {
        this.currentPath = window.location.pathname;
      };
      window.addEventListener('popstate', this.handlePopState);
    },
    beforeDestroy() {
      window.removeEventListener('popstate', this.handlePopState);
    },
    methods: {
      navigateWithin(pageKey) {
        const nextPath = buildLegacyInternalPath(this.currentPath, pageKey);

        if (nextPath === window.location.pathname) {
          return;
        }

        window.history.pushState(
          {
            app: 'legacy-vue2',
            pageKey,
          },
          '',
          nextPath
        );
        window.dispatchEvent(new PopStateEvent('popstate'));
      },
    },
    render(h) {
      const currentPageKey = resolveLegacyPageKey(this.currentPath);
      const renderCurrentPage = currentPageKey === 'detail' ? renderLegacyDetail : renderLegacyHome;

      return h('div', {
        class: 'legacy-root',
        style: {
          padding: '12px',
          border: '1px solid #ccc',
          background: '#fffaf2',
          color: '#5f3a00',
        },
      }, [
        renderCurrentPage(h, viewModel),
        h('div', {
          style: {
            marginTop: '12px',
          },
        }, [
          h('p', { class: 'legacy-actions-title' }, 'In-app pages'),
          renderLegacyButton(h, 'Pending Orders', {
            active: currentPageKey === 'home',
            onClick: () => this.navigateWithin('home'),
          }),
          renderLegacyButton(h, 'Order History', {
            active: currentPageKey === 'detail',
            onClick: () => this.navigateWithin('detail'),
          }),
        ]),
        h('div', {
          style: {
            marginTop: '12px',
          },
        }, [
          h('p', { class: 'legacy-actions-title' }, 'Cross-app navigation'),
          ...(viewModel.navigationTargets || []).map((target) =>
            renderLegacyButton(h, target.title + ' ' + (target.childPath || ''), {
              onClick: () => viewModel.onNavigate && viewModel.onNavigate(target),
            })
          ),
        ]),
      ]);
    },
  });

  instance.$mount(mountPoint);
}

export function unmountApp() {
  if (instance) {
    instance.$destroy();
    instance.$el.innerHTML = '';
    instance = null;
  }
}
