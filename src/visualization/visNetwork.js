import { defineComponent, h } from 'vue';
import { Network as VisNetwork } from 'vis-network/standalone';

export const Network = defineComponent({
  name: 'Network',
  props: {
    nodes: { type: Array, default: () => [] },
    edges: { type: Array, default: () => [] },
    options: { type: Object, default: () => ({}) }
  },
  mounted() {
    this.renderNetwork();
  },
  updated() {
    this.renderNetwork();
  },
  methods: {
    renderNetwork() {
      if (!this.$refs.container) return;
      this.instance?.destroy?.();
      this.instance = new VisNetwork(
        this.$refs.container,
        { nodes: this.nodes, edges: this.edges },
        this.options
      );
    }
  },
  beforeUnmount() {
    this.instance?.destroy?.();
  },
  render() {
    return h('div', {
      ref: 'container',
      class: 'vis-network',
      style: { minHeight: this.options.height || '400px', width: '100%' }
    });
  }
});

export const Timeline = defineComponent({
  name: 'Timeline',
  render() {
    return h('div', { class: 'vis-timeline-placeholder' }, this.$slots.default?.());
  }
});

export const Graph2d = defineComponent({
  name: 'Graph2d',
  render() {
    return h('div', { class: 'vis-graph2d-placeholder' }, this.$slots.default?.());
  }
});

export default {
  Network,
  Timeline,
  Graph2d
};
