// Shared primitives used by the rest of the runtime files.
const STORAGE_KEY = 'iron-realms-save-v1';

function cloneState(value) {
  return JSON.parse(JSON.stringify(value));
}
