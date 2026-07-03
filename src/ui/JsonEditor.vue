<template>
  <textarea class="form-control json-editor" :value="text" rows="12" @input="update"></textarea>
</template>

<script>
export default {
  name: 'JsonEditor',
  props: {
    modelValue: {
      type: [Object, Array, String, Number, Boolean, null],
      default: null
    },
    value: {
      type: [Object, Array, String, Number, Boolean, null],
      default: null
    }
  },
  emits: ['update:modelValue', 'input'],
  computed: {
    currentValue() {
      return this.modelValue !== null ? this.modelValue : this.value;
    },
    text() {
      return typeof this.currentValue === 'string'
        ? this.currentValue
        : JSON.stringify(this.currentValue, null, 2);
    }
  },
  methods: {
    update(event) {
      let next = event.target.value;
      try {
        next = JSON.parse(next);
      } catch (error) {
        // Keep raw text while the user is editing invalid JSON.
      }
      this.$emit('update:modelValue', next);
      this.$emit('input', next);
    }
  }
};
</script>

<style scoped>
.json-editor {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}
</style>
