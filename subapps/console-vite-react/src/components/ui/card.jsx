import React from 'react';

export function UiCard({ title, children }) {
  return (
    <section className="subapp-ui-card">
      {title ? <div className="subapp-ui-card__title">{title}</div> : null}
      <div className="subapp-ui-card__body">{children}</div>
    </section>
  );
}
