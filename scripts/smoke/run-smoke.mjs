import { spawnSync } from 'node:child_process';

const checks = [
  ['npm', 'run', 'contracts:registry'],
  ['npm', 'run', 'contracts:runtime-vendor'],
  ['npm', 'run', 'contracts:cleanup-bag'],
  ['npm', 'run', 'contracts:main'],
  ['npm', 'run', 'contracts:config'],
  ['npm', 'run', 'contracts:bridge'],
  ['npm', 'run', 'build:main'],
  ['npm', 'run', 'build:subapp:legacy'],
  ['npm', 'run', 'build:subapp:wms'],
  ['npm', 'run', 'build:subapp:ops'],
  ['npm', 'run', 'build:subapp:vite-vue'],
  ['npm', 'run', 'build:subapp:vite-react']
];

console.log('[smoke] Running baseline smoke flow');

checks.forEach((command, index) => {
  console.log('[smoke]', String(index + 1) + '/' + checks.length, command.join(' '));
  const result = spawnSync(command[0], command.slice(1), {
    stdio: 'inherit',
    shell: false
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
});

console.log('[smoke] Baseline smoke flow passed');
