// HomePage is the shell-owned landing page when the current route does not
// activate any child micro frontend.
import React from 'react';
import { Card } from '@/components/ui/card.jsx';

export function HomePage() {
  return (
    <div className="grid gap-4">
      <Card title="Welcome">
        This is the main application home page. Use the sidebar to enter each
        micro frontend module.
      </Card>
      <Card title="Template Goals">
        The current template focuses on structure, contracts, runtime guards,
        and a stable shell rather than business detail pages.
      </Card>
    </div>
  );
}
