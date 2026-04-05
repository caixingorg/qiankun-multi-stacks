import './styles.css';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { registerMicroApp } from './bridge/micro-app';
import { startStandalone } from './bridge/standalone';

registerMicroApp();

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  startStandalone();
}
