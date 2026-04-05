import React from 'react';

export function PageShell({ title, description, children }) {
  return (
    <section className="subapp-page-shell">
      <header className="subapp-page-shell__header">
        <h3 className="subapp-page-shell__title">{title}</h3>
        <p className="subapp-page-shell__description">{description}</p>
      </header>
      <div className="subapp-page-shell__body">{children}</div>
    </section>
  );
}
