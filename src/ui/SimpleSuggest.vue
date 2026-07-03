<template>
  <div class="simple-suggest designed">
    <div class="suggest-input-row">
      <input
        ref="input"
        type="search"
        :class="inputClass"
        :placeholder="placeholder"
        :value="query"
        @focus="open = suggestions.length > 0"
        @input="onInput"
        @keydown.enter.prevent="selectFirst"
        @keydown.esc="open = false"
      >
      <span v-if="loading" class="suggest-loading" aria-hidden="true"></span>
    </div>
    <ul v-if="open && suggestions.length > 0" class="suggestions">
      <li
        v-for="suggestion in suggestions"
        :key="suggestion"
        class="suggest-item"
        @mousedown.prevent="choose(suggestion)"
      >
        {{ suggestion }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'SimpleSuggest',
  props: {
    modelValue: { type: String, default: '' },
    value: { type: String, default: '' },
    list: { type: [Array, Function], default: () => [] },
    filterByQuery: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
    inputClass: { type: String, default: '' },
    loading: { type: Boolean, default: false }
  },
  emits: ['update:modelValue', 'input', 'select'],
  data() {
    return {
      query: this.modelValue || this.value || '',
      suggestions: [],
      open: false,
      requestId: 0
    };
  },
  watch: {
    modelValue(value) {
      this.query = value || '';
    },
    value(value) {
      if (!this.modelValue) {
        this.query = value || '';
      }
    }
  },
  methods: {
    focus() {
      this.$refs.input?.focus();
    },
    onInput(event) {
      this.query = event.target.value;
      this.$emit('update:modelValue', this.query);
      this.$emit('input', this.query);
      this.refreshSuggestions();
    },
    async refreshSuggestions() {
      const currentRequest = ++this.requestId;
      if (!this.query) {
        this.suggestions = [];
        this.open = false;
        return;
      }

      const result = typeof this.list === 'function' ? await this.list(this.query) : this.list;
      if (currentRequest !== this.requestId) {
        return;
      }

      const suggestions = Array.isArray(result) ? result.map(String) : [];
      this.suggestions = this.filterByQuery
        ? suggestions.filter(item => item.toLowerCase().includes(this.query.toLowerCase()))
        : suggestions;
      this.open = this.suggestions.length > 0;
    },
    choose(suggestion) {
      this.query = suggestion;
      this.$emit('update:modelValue', suggestion);
      this.$emit('input', suggestion);
      this.$emit('select', suggestion);
      this.open = false;
    },
    selectFirst() {
      if (this.suggestions.length > 0) {
        this.choose(this.suggestions[0]);
      }
    }
  }
};
</script>

<style scoped>
.simple-suggest {
  position: relative;
}

.suggest-input-row {
  position: relative;
}

input {
  width: 100%;
  min-height: 38px;
  padding: 0.375rem 2rem 0.375rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.suggestions {
  position: absolute;
  z-index: 1055;
  width: 100%;
  max-height: 320px;
  padding: 0;
  margin: 0.25rem 0 0;
  overflow: auto;
  list-style: none;
  background: #fff;
  border: 1px solid #ced4da;
  border-radius: 4px;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.suggest-item {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}

.suggest-item:hover,
.suggest-item:focus {
  background: #f8f9fa;
}

.suggest-loading {
  position: absolute;
  top: 50%;
  right: 0.75rem;
  width: 1rem;
  height: 1rem;
  margin-top: -0.5rem;
  border: 2px solid #cfe2ff;
  border-top-color: #0d6efd;
  border-radius: 50%;
  animation: suggest-spin 0.8s linear infinite;
}

@keyframes suggest-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
