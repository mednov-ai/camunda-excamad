<template>
  <input
    class="form-control"
    type="datetime-local"
    :placeholder="placeholder"
    :disabled="disabled"
    :value="normalizedValue"
    @input="update"
  >
</template>

<script>
export default {
  name: 'VueDatepickerLocal',
  props: {
    modelValue: { type: [String, Date], default: '' },
    value: { type: [String, Date], default: '' },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false }
  },
  emits: ['update:modelValue', 'input'],
  computed: {
    normalizedValue() {
      const current = this.modelValue || this.value || '';
      if (current instanceof Date) return current.toISOString().slice(0, 16);
      return String(current).slice(0, 16);
    }
  },
  methods: {
    update(event) {
      this.$emit('update:modelValue', event.target.value);
      this.$emit('input', event.target.value);
    }
  }
};
</script>
