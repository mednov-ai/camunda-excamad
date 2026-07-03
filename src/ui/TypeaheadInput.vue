<template>
  <input
    class="form-control"
    :placeholder="placeholder"
    :value="modelValue || value"
    :list="listId"
    @input="onInput"
    @change="onHit($event.target.value)"
    @keyup.enter="onHit($event.target.value)"
  >
  <datalist :id="listId">
    <option v-for="item in data" :key="itemLabel(item)" :value="itemLabel(item)"></option>
  </datalist>
</template>

<script>
let typeaheadId = 0;

export default {
  name: 'TypeaheadInput',
  props: {
    modelValue: { type: String, default: '' },
    value: { type: String, default: '' },
    data: { type: Array, default: () => [] },
    placeholder: { type: String, default: '' },
    serializer: {
      type: Function,
      default: item => String(item ?? '')
    }
  },
  emits: ['update:modelValue', 'input', 'hit'],
  data() {
    typeaheadId += 1;
    return {
      generatedListId: `typeahead-${typeaheadId}`
    };
  },
  computed: {
    listId() {
      return this.generatedListId;
    }
  },
  methods: {
    onInput(event) {
      this.$emit('update:modelValue', event.target.value);
      this.$emit('input', event.target.value);
    },
    onHit(value) {
      const item = this.findItemByLabel(value);
      this.$emit('hit', item || value);
    },
    itemLabel(item) {
      return this.serializer(item);
    },
    findItemByLabel(label) {
      return this.data.find(item => this.itemLabel(item) === label);
    }
  }
};
</script>
