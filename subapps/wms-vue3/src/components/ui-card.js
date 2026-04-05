import { h } from 'vue';

export function renderWmsCard(title, children) {
  return h('section', { class: 'wms-ui-card' }, [
    title
      ? h('div', { class: 'wms-ui-card__title' }, title)
      : null,
    h('div', { class: 'wms-ui-card__body' }, children),
  ]);
}
