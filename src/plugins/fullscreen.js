import { defineComponent, h } from 'vue';

const Fullscreen = defineComponent({
  name: 'Fullscreen',
  emits: ['change'],
  methods: {
    async toggle() {
      const element = this.$el;
      if (!document.fullscreenElement && element?.requestFullscreen) {
        await element.requestFullscreen();
        this.$emit('change', true);
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
        this.$emit('change', false);
      }
    }
  },
  render() {
    return h('div', { class: 'fullscreen-wrapper' }, this.$slots.default?.());
  }
});

export default {
  install(app) {
    app.component('fullscreen', Fullscreen);
  }
};
