// HeaderBar renders the top shell header and top-level navigation shortcuts.
import React from 'react';
import { ButtonLink } from '../components/ui/button.jsx';

export function HeaderBar({ menuItems }) {
  return (
    <header className="flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur">
      <div>
        <div className="text-xs text-slate-500">Enterprise Micro Frontend</div>
        <div className="text-xl font-bold text-slate-950">Main App</div>
      </div>
      <nav id="main-topnav" className="flex gap-3">
        {menuItems.map((item) => (
          <ButtonLink key={item.key} href={item.path} label={item.title} />
        ))}
        <ButtonLink href="/" label="Home" tone="primary" />
      </nav>
    </header>
  );
}
