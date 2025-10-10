<template>
  <div ref="container" class="vis-network"></div>
</template>

<script>
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import 'vis-network/styles/vis-network.css';

export default defineComponent({
  name: 'VisNetwork',
  props: {
    nodes: {
      type: Array,
      default: () => []
    },
    edges: {
      type: Array,
      default: () => []
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props, { expose }) {
    const container = ref(null);
    const nodesData = new DataSet();
    const edgesData = new DataSet();
    let network = null;

    const applyData = (dataset, items = []) => {
      dataset.clear();
      if (items.length) {
        dataset.add(items);
      }
    };

    const syncNodes = value => applyData(nodesData, value || []);
    const syncEdges = value => applyData(edgesData, value || []);

    onMounted(() => {
      network = new Network(
        container.value,
        {
          nodes: nodesData,
          edges: edgesData
        },
        props.options || {}
      );
    });

    onBeforeUnmount(() => {
      if (network) {
        network.destroy();
        network = null;
      }
    });

    watch(
      () => props.nodes,
      value => {
        syncNodes(value);
      },
      { deep: true, immediate: true }
    );

    watch(
      () => props.edges,
      value => {
        syncEdges(value);
      },
      { deep: true, immediate: true }
    );

    watch(
      () => props.options,
      value => {
        if (network) {
          network.setOptions(value || {});
        }
      },
      { deep: true }
    );

    expose({
      getNetwork: () => network
    });

    return {
      container
    };
  }
});
</script>

<style scoped>
.vis-network {
  width: 100%;
  height: 100%;
}
</style>
