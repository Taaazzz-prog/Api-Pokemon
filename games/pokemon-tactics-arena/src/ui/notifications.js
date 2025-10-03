let toastContainer = null;

function ensureContainer() {
  if (toastContainer) {
    return toastContainer;
  }
  toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);
  return toastContainer;
}

export function showToast(message, variant = 'info', duration = 4000) {
  if (!message) {
    return;
  }
  const container = ensureContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast--${variant}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
    if (!container.hasChildNodes()) {
      container.remove();
      toastContainer = null;
    }
  }, duration);
}
