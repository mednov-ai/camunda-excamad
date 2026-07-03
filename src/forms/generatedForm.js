import { defineComponent, h } from 'vue';

function readInputType(field) {
  if (field.inputType) return field.inputType;
  if (field.type === 'checkbox' || field.type === 'switch') return 'checkbox';
  if (field.type === 'select') return 'select';
  if (field.type === 'textArea') return 'textarea';
  return 'text';
}

const GeneratedForm = defineComponent({
  name: 'GeneratedForm',
  props: {
    schema: { type: Object, default: () => ({ fields: [] }) },
    model: { type: Object, default: () => ({}) },
    options: { type: Object, default: () => ({}) }
  },
  methods: {
    updateField(field, event) {
      const inputType = readInputType(field);
      this.model[field.model] = inputType === 'checkbox' ? event.target.checked : event.target.value;
    },
    renderField(field) {
      if (field.type === 'submit') {
        return h('div', { class: 'field-wrap buttons' }, [
          h(
            'button',
            {
              type: 'button',
              class: 'btn btn-primary',
              disabled: field.disabled,
              onClick: field.onSubmit
            },
            field.buttonText || 'Submit'
          )
        ]);
      }

      const inputType = readInputType(field);
      const value = this.model[field.model];
      const common = {
        id: field.model,
        class: 'form-control',
        disabled: field.disabled || field.readonly,
        placeholder: field.placeholder,
        value,
        onInput: event => this.updateField(field, event),
        onChange: event => this.updateField(field, event)
      };

      let control;
      if (inputType === 'select') {
        control = h(
          'select',
          common,
          (field.values || []).map(item => h('option', { value: item.value }, item.name || item.value))
        );
      } else if (inputType === 'textarea') {
        control = h('textarea', { ...common, rows: field.rows || 3 });
      } else if (inputType === 'checkbox') {
        control = h('input', {
          ...common,
          class: 'form-check-input',
          type: 'checkbox',
          checked: Boolean(value)
        });
      } else {
        control = h('input', { ...common, type: inputType });
      }

      return h('div', { class: 'form-group field-wrap' }, [
        h('label', { for: field.model }, field.label || field.model),
        control
      ]);
    }
  },
  render() {
    return h('div', { class: 'generated-form' }, (this.schema.fields || []).map(this.renderField));
  }
});

export const validators = {};

export const abstractField = {
  props: {
    model: { type: Object, default: () => ({}) },
    schema: { type: Object, default: () => ({}) },
    disabled: { type: Boolean, default: false }
  },
  computed: {
    value: {
      get() {
        return this.model?.[this.schema?.model];
      },
      set(value) {
        if (this.model && this.schema?.model) {
          this.model[this.schema.model] = value;
        }
      }
    }
  }
};

export default {
  install(app) {
    app.component('generated-form', GeneratedForm);
  }
};
