import { h } from 'vue';

export function renderWmsPageShell(title, description, children) {
  return h('section', { class: 'wms-page-shell' }, [
    h('header', { class: 'wms-page-shell__header' }, [
      h('h3', { class: 'wms-page-shell__title' }, title),
      h('p', { class: 'wms-page-shell__description' }, description),
    ]),
    h('div', { class: 'wms-page-shell__body' }, children),
  ]);
}
