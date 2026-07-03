import { defineComponent, h } from 'vue';

export const Timeline = defineComponent({
  name: 'Timeline',
  render() {
    return h('div', { class: 'timeline' }, this.$slots.default?.());
  }
});

export const TimelineItem = defineComponent({
  name: 'TimelineItem',
  render() {
    return h('div', { class: 'timeline-item' }, this.$slots.default?.());
  }
});
