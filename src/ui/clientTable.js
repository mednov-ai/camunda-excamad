import { defineComponent, h } from 'vue';

const ClientTableComponent = defineComponent({
  name: 'VClientTable',
  props: {
    data: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    options: { type: Object, default: () => ({}) }
  },
  render() {
    return h('table', { class: this.options.skin || 'table table-bordered table-hover table-sm' }, [
      h('thead', [
        h('tr', this.columns.map(column => h('th', column)))
      ]),
      h(
        'tbody',
        this.data.map(row =>
          h('tr', this.columns.map(column => h('td', row?.[column] == null ? '' : String(row[column]))))
        )
      )
    ]);
  }
});

export const ClientTable = {
  install(app) {
    app.component('v-client-table', ClientTableComponent);
  }
};
