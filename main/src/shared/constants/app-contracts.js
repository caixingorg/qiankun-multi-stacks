// app-contracts.js defines the structural contracts between main and subapps.
// Event name constants live in communication/events.js — do not duplicate them here.
import { HostEvents, SubappEvents } from '../../communication/events.js';

export const MAIN_TO_SUBAPP_CONTEXT_KEYS = [
  'userContext',
  'envContext',
  'permissionContext',
  'navigation',
  'sharedKernel',
  'dependencyPolicy',
  'contractVersion',
];

export const MENU_CONTRACT = {
  owner: 'main',
  rule: 'main owns first-level navigation',
};

export const ROUTE_CONTRACT = {
  owner: 'main+subapp',
  rule: 'main owns activation route, subapps own internal routes',
};

export const PERMISSION_CONTRACT = {
  owner: 'main',
  rule: 'main owns global permission context, subapps can refine page-level access',
};

export const CONTEXT_CONTRACT = {
  requiredKeys: MAIN_TO_SUBAPP_CONTEXT_KEYS,
};

export const ERROR_CONTRACT = {
  subappRuntimeError: SubappEvents.runtimeError,
  mainRuntimeEvents: Object.values(HostEvents),
};

export const CONTRACT_VERSION = 'v1';
