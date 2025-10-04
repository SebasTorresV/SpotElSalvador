import asyncHooks from 'async_hooks';
import { logger } from '../utils/logger.js';

const store = new Map();

const asyncHook = asyncHooks.createHook({
  init(asyncId, type, triggerAsyncId) {
    if (store.has(triggerAsyncId)) {
      store.set(asyncId, store.get(triggerAsyncId));
    }
  },
  destroy(asyncId) {
    store.delete(asyncId);
  },
});

asyncHook.enable();

export function requestContext(req, res, next) {
  const asyncId = asyncHooks.executionAsyncId();
  store.set(asyncId, { requestId: req.id, user: req.user });
  res.on('finish', () => {
    logger.info({
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
    });
  });
  next();
}

export function getContext() {
  return store.get(asyncHooks.executionAsyncId());
}
