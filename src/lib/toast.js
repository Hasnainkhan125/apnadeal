const listeners = new Set();

export const toast = (message, options = {}) => {
  const payload = {
    id: Date.now() + Math.random(),
    message: String(message || ""),
    type: options.type || "success",
    duration: options.duration ?? 3200,
  };
  listeners.forEach((fn) => fn(payload));
};

export const subscribeToasts = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};