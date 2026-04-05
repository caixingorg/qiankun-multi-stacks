import './public-path';
import './styles/index.css';
import { bootstrap, mount, unmount } from './bridge/micro-app';
import { startStandalone } from './bridge/standalone';

export { bootstrap, mount, unmount };

if (!window.__POWERED_BY_QIANKUN__) {
  startStandalone();
}
