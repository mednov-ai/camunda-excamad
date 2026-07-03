import { defineComponent, h } from 'vue';

export const GChart = defineComponent({
  name: 'GChart',
  props: {
    data: { type: Array, default: () => [] }
  },
  render() {
    return h('pre', { class: 'gchart-placeholder' }, JSON.stringify(this.data, null, 2));
  }
});

export default {
  install(app) {
    app.component('GChart', GChart);
  }
};
