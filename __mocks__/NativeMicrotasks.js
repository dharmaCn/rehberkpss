'use strict';
// Return the native queueMicrotask saved before polyfillGlobal overwrote it.
const queueMicrotask =
  global.__savedQueueMicrotask ||
  function (cb) { Promise.resolve().then(cb); };
module.exports = {
  __esModule: true,
  default: { queueMicrotask },
};
