// Event bus is the minimal runtime communication channel between main and
// subapps. It stays tiny on purpose and only allows contract-declared events.
// HostEvents / SubappEvents in ./events.js are the single source of event names.
import { HostEvents, SubappEvents } from './events.js';

const allowedEvents = new Set([
  ...Object.values(HostEvents),
  ...Object.values(SubappEvents),
]);

export function createEventBus() {
  const listeners = new Map();

  return {
    on(eventName, handler) {
      const set = listeners.get(eventName) || new Set();
      set.add(handler);
      listeners.set(eventName, set);
      return () => {
        set.delete(handler);
      };
    },
    emit(eventName, payload) {
      // Keep the bus lightweight, but still surface contract drift early.
      if (!allowedEvents.has(eventName)) {
        console.warn('[event-bus] unknown event:', eventName, payload);
      }
      const set = listeners.get(eventName);
      if (!set) {
        return;
      }
      set.forEach((handler) => handler(payload));
    },
    clear() {
      listeners.clear();
    },
  };
}
