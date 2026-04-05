import { createCleanup } from '../../main/src/runtime/subapps/cleanup.js';

const events = [];
const cleared = [];
let nextTimerId = 0;
let nextFrameId = 100;

const fakeWindow = {
  setInterval(handler, delay) {
    nextTimerId += 1;
    events.push(['setInterval', delay]);
    return nextTimerId;
  },
  clearInterval(id) {
    cleared.push(id);
  },
  setTimeout(handler, delay) {
    nextTimerId += 1;
    events.push(['setTimeout', delay]);
    return nextTimerId;
  },
  clearTimeout(id) {
    cleared.push(id);
  },
  requestAnimationFrame(handler) {
    nextFrameId += 1;
    events.push(['requestAnimationFrame']);
    return nextFrameId;
  },
  cancelAnimationFrame(id) {
    cleared.push(id);
  }
};

const fakeTarget = {
  added: [],
  removed: [],
  addEventListener(eventName, handler) {
    this.added.push([eventName, handler]);
  },
  removeEventListener(eventName, handler) {
    this.removed.push([eventName, handler]);
  }
};

const originalWindow = globalThis.window;
globalThis.window = fakeWindow;

try {
  const bag = createCleanup();
  const handler = () => {};

  bag.addEventListener(fakeTarget, 'resize', handler);
  bag.setInterval(() => {}, 1000);
  bag.setTimeout(() => {}, 500);
  bag.requestAnimationFrame(() => {});
  bag.add(() => events.push(['manual-cleanup']));
  bag.flush();

  if (fakeTarget.added.length !== 1 || fakeTarget.removed.length !== 1) {
    throw new Error('cleanup bag failed to remove event listener');
  }

  if (cleared.length !== 3 || cleared[0] !== 101 || cleared[1] !== 2 || cleared[2] !== 1) {
    throw new Error('cleanup bag failed to clear scheduled resources');
  }

  if (!events.find((item) => item[0] === 'manual-cleanup')) {
    throw new Error('cleanup bag failed to execute manual cleanup');
  }

  console.log('[contracts] cleanup bag validation passed');
} finally {
  globalThis.window = originalWindow;
}
