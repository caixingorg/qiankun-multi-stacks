import { h } from 'vue';

export function renderPortalCard(title, children) {
  return h('section', { class: 'portal-ui-card' }, [
    title
      ? h('div', { class: 'portal-ui-card__title' }, title)
      : null,
    h('div', { class: 'portal-ui-card__body' }, children),
  ]);
}
