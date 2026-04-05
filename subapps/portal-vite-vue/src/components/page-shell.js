import { h } from 'vue';

export function renderPortalPageShell(title, description, children) {
  return h('section', { class: 'portal-page-shell' }, [
    h('header', { class: 'portal-page-shell__header' }, [
      h('h3', { class: 'portal-page-shell__title' }, title),
      h('p', { class: 'portal-page-shell__description' }, description),
    ]),
    h('div', { class: 'portal-page-shell__body' }, children),
  ]);
}
