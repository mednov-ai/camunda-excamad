<template>
  <iframe class="friendly-iframe" :src="src" frameborder="0"></iframe>
</template>

<script>
export default {
  name: 'VueFriendlyIframe',
  props: {
    src: {
      type: String,
      default: ''
    }
  }
};
</script>
