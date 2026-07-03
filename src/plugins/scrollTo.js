function scrollToTarget(target) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  element?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
}

export default {
  install(app) {
    app.config.globalProperties.$scrollTo = scrollToTarget;
    app.directive('scroll-to', {
      mounted(el, binding) {
        el.addEventListener('click', event => {
          event.preventDefault();
          scrollToTarget(binding.value);
        });
      }
    });
  }
};
