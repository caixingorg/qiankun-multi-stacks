import { spawn } from 'node:child_process';

const mode = process.argv[2] || 'stable';

const matrixByMode = {
  stable: [
    ['main', 'start'],
    ['subapps/legacy-vue2', 'start'],
    ['subapps/wms-vue3', 'start'],
    ['subapps/ops-react', 'start'],
    ['subapps/portal-vite-vue', 'start'],
    ['subapps/console-vite-react', 'start']
  ],
  qiankun: [
    ['main', 'start'],
    ['subapps/legacy-vue2', 'start:qiankun'],
    ['subapps/wms-vue3', 'start:qiankun'],
    ['subapps/ops-react', 'start:qiankun'],
    ['subapps/portal-vite-vue', 'start:qiankun'],
    ['subapps/console-vite-react', 'start:qiankun']
  ],
  rollback: [
    ['main', 'start'],
    ['subapps/legacy-vue2', 'start:rollback:qiankun'],
    ['subapps/wms-vue3', 'start'],
    ['subapps/ops-react', 'start:rollback:qiankun'],
    ['subapps/portal-vite-vue', 'start:qiankun'],
    ['subapps/console-vite-react', 'start:rollback:qiankun']
  ]
};

const selectedMatrix = matrixByMode[mode];

if (!selectedMatrix) {
  console.error(
    '[root] Unknown dev matrix mode:',
    mode,
    '\nAvailable modes:',
    Object.keys(matrixByMode).join(', ')
  );
  process.exit(1);
}

const children = [];
let exiting = false;

function stopAll(signal = 'SIGTERM') {
  if (exiting) {
    return;
  }
  exiting = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

for (const [workspace, script] of selectedMatrix) {
  const child = spawn(
    'npm',
    ['run', script, '--workspace', workspace],
    {
      stdio: 'inherit',
      shell: true,
      env: process.env
    }
  );

  child.on('exit', (code) => {
    if (exiting) {
      return;
    }

    if (code && code !== 0) {
      console.error('[root] workspace failed:', workspace, 'script:', script, 'code:', code);
      stopAll();
      process.exitCode = code;
    }
  });

  children.push(child);
}

process.on('SIGINT', () => {
  stopAll('SIGINT');
});

process.on('SIGTERM', () => {
  stopAll('SIGTERM');
});
