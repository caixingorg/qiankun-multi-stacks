// Sidebar renders the first-level application list owned by the shell.
import React from 'react';
import { SidebarLink } from '../components/ui/sidebar-link.jsx';

export function Sidebar({ menuItems }) {
  return (
    <aside className="border-r border-slate-200 bg-white/70 p-5">
      <div className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">Applications</div>
      <nav id="main-sidemenu">
        {menuItems.map((item) => (
          <SidebarLink key={item.key} item={item} />
        ))}
      </nav>
    </aside>
  );
}
