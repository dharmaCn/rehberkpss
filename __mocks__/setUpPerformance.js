'use strict';
const nativePerfNow = global.nativePerformanceNow;
const now = typeof nativePerfNow === 'function'
  ? () => nativePerfNow()
  : Date.now.bind(Date);

if (!global.nativeQPLTimestamp) {
  global.nativeQPLTimestamp = now;
}

// Save native queueMicrotask BEFORE setUpTimers polyfillGlobal replaces it.
// NativeMicrotasks mock reads this to restore the real implementation.
global.__savedQueueMicrotask =
  typeof global.queueMicrotask === 'function'
    ? global.queueMicrotask
    : function (cb) { Promise.resolve().then(cb); };

global.performance = {
  now,
  timeOrigin: Date.now(),
  mark: () => {},
  measure: () => {},
  clearMarks: () => {},
  clearMeasures: () => {},
  getEntries: () => [],
  getEntriesByName: () => [],
  getEntriesByType: () => [],
  eventCounts: new Map(),
};
