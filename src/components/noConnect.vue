<template>
  <div class="oc-empty-state no-connect-state">
    <template v-if="!baseurl">
      <h2 class="no-connect-title">No Camunda connection configured</h2>
      <p>Start by creating a Camunda REST endpoint profile.</p>
      <router-link class="btn btn-primary" to="/settings">Open connections</router-link>
    </template>
    <template v-else>
      <h2 class="no-connect-title">Cannot reach Camunda REST</h2>
      <p>Check CORS, the REST endpoint URL, server availability, and network access from this browser.</p>
      <router-link class="btn btn-outline-primary" to="/settings">Check connection</router-link>
    </template>
  </div>
</template>

<script>
import store from "@/store/store";
export default {
  name: "noConnect",
  computed: {
    baseurl() {
      return this.$store.state.baseurl;
    }
  }
};
</script>
<style>
.no-connect-state {
  display: grid;
  gap: 0.5rem;
}

.no-connect-title {
  margin: 0;
  color: var(--oc-text);
  font-size: 1rem;
  font-weight: 750;
}
</style>
