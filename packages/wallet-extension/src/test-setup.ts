const storageData = new Map<string, any>();

(globalThis as any).chrome = {
  runtime: {
    id: 'fistwallet-test-id',
    getManifest: () => ({ manifest_version: 3, version: '1.0.0' }),
    sendMessage: (_msg: any, cb?: (res: any) => void) => {
      if (cb) cb({ success: true });
      return Promise.resolve({ success: true });
    },
    onMessage: { addListener: () => {} },
  },
  storage: {
    local: {
      get: (keys: any, callback?: (items: any) => void) => {
        let res: Record<string, any> = {};
        if (!keys) {
          res = Object.fromEntries(storageData);
        } else if (typeof keys === 'string') {
          res = { [keys]: storageData.get(keys) };
        } else if (Array.isArray(keys)) {
          keys.forEach((k) => (res[k] = storageData.get(k)));
        } else if (typeof keys === 'object') {
          res = { ...keys };
          Object.keys(keys).forEach((k) => {
            if (storageData.has(k)) res[k] = storageData.get(k);
          });
        }
        if (callback) callback(res);
        return Promise.resolve(res);
      },
      set: (items: Record<string, any>, callback?: () => void) => {
        Object.entries(items).forEach(([k, v]) => storageData.set(k, v));
        if (callback) callback();
        return Promise.resolve();
      },
      remove: (keys: string | string[], callback?: () => void) => {
        const arr = Array.isArray(keys) ? keys : [keys];
        arr.forEach((k) => storageData.delete(k));
        if (callback) callback();
        return Promise.resolve();
      },
      clear: (callback?: () => void) => {
        storageData.clear();
        if (callback) callback();
        return Promise.resolve();
      },
    },
    session: {
      get: (_k: any, cb?: any) => {
        if (cb) cb({});
        return Promise.resolve({});
      },
      set: (_k: any, cb?: any) => {
        if (cb) cb();
        return Promise.resolve();
      },
      remove: (_k: any, cb?: any) => {
        if (cb) cb();
        return Promise.resolve();
      },
      clear: (cb?: any) => {
        if (cb) cb();
        return Promise.resolve();
      },
    },
  },
  action: {
    setBadgeText: (_o: any, cb?: any) => {
      if (cb) cb();
      return Promise.resolve();
    },
    setBadgeBackgroundColor: (_o: any, cb?: any) => {
      if (cb) cb();
      return Promise.resolve();
    },
  },
  sidePanel: {
    setOptions: (_o: any, cb?: any) => {
      if (cb) cb();
      return Promise.resolve();
    },
    open: (_o: any, cb?: any) => {
      if (cb) cb();
      return Promise.resolve();
    },
  },
};
