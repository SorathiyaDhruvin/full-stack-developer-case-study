export const toast = {
  success: (message) => window.__addToast?.(message, "success"),
  error: (message) => window.__addToast?.(message, "error"),
  info: (message) => window.__addToast?.(message, "info"),
  warning: (message) => window.__addToast?.(message, "warning"),
};
