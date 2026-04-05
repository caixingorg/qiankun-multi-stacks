import { h } from 'vue';
import { renderWmsCard } from './ui-card';

export function renderWmsInfoPanel(title, rows) {
  return renderWmsCard(title, rows.map((item) =>
    h('p', { class: 'wms-ui-card__row' }, [
      h('span', { class: 'wms-ui-card__label' }, item.label),
      h('span', { class: 'wms-ui-card__value' }, item.value),
    ])
  ));
}
