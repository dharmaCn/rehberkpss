'use strict';
function makeProxy() {
  const fn = function () {};
  return new Proxy(fn, {
    get(target, prop) {
      if (prop === '__esModule') return true;
      if (prop === 'then') return undefined;
      if (typeof prop === 'symbol') return undefined;
      return makeProxy();
    },
    apply() { return undefined; },
    construct() { return new Proxy({}, { get(t, p) { if (typeof p === 'symbol') return undefined; return makeProxy(); } }); },
  });
}
module.exports = makeProxy();
