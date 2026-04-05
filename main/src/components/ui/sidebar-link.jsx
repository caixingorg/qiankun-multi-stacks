// SidebarLink renders one first-level application entry in the shell sidebar.
import React from 'react';
import { cn } from './utils.js';

export function SidebarLink({ item }) {
  return (
    <a
      href={item.path}
      data-menu-key={item.key}
      className={cn(
        'mb-1 flex items-center rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-sm text-slate-900 transition-all hover:border-slate-200 hover:bg-white'
      )}
    >
      {item.title}
    </a>
  );
}
