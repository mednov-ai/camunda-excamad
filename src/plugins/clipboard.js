function ensureState(el) {
  el.__clipboard = el.__clipboard || {};
  return el.__clipboard;
}

function bindCopy(el) {
  const state = ensureState(el);
  if (state.bound) return;
  state.bound = true;
  el.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(String(state.copy || ''));
      state.success?.();
    } catch (error) {
      state.error?.(error);
    }
  });
}

export default {
  install(app) {
    app.directive('clipboard', {
      mounted(el, binding) {
        const state = ensureState(el);
        if (binding.arg === 'copy') {
          state.copy = binding.value;
          bindCopy(el);
        }
        if (binding.arg === 'success') state.success = binding.value;
        if (binding.arg === 'error') state.error = binding.value;
      },
      updated(el, binding) {
        const state = ensureState(el);
        if (binding.arg === 'copy') state.copy = binding.value;
        if (binding.arg === 'success') state.success = binding.value;
        if (binding.arg === 'error') state.error = binding.value;
      }
    });
  }
};
