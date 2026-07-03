<template>
  <div class="taskListView1 oc-page">
    <header class="oc-page-header">
      <div>
        <h1 class="oc-page-title">Task list</h1>
        <p class="oc-page-subtitle">Candidate tasks, generated forms, and variable-based task queries.</p>
      </div>
      <span class="oc-status-badge" :class="isCamundaAuthenticated ? 'is-success' : ''">
        {{ isCamundaAuthenticated ? 'Camunda auth verified' : 'Session auth optional' }}
      </span>
    </header>

    <div class="task-workbench oc-panel">
      <b-tabs content-class="mt-3">
        <b-tab title="Task list" active>
          <b-row class="task-workbench-grid">
            <b-col cols="12" lg="4" xl="3">
              <tasklist :key="componentKeyTasklist"></tasklist>
            </b-col>
            <b-col cols="12" lg="8" xl="9">
              <task-details :key="componentKeyTaskDetails"></task-details>
            </b-col>
          </b-row>
        </b-tab>
        <b-tab title="Task query">
          <task-query></task-query>
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>

<script>
export default {
  name: "TaskListView",
  data() {
    return {
      componentKeyTasklist: 0,
      componentKeyTaskDetails: 1
    };
  },
  computed: {
    serverStatus: function () {
      return this.$store.state.serverStatus;
    },
    BaseUrl: function () {
      return this.$store.state.baseurl;
    },
    TaskId: function () {
      return this.$store.state.taskId;
    },
    isAuthenticated() {
      return this.$store.getters.isAuthenticated;
    },
    isCamundaAuthenticated() {
      return this.$store.getters.isCamundaAuthenticated;
    },
    authStatus() {
      return this.$store.getters.authStatus;
    },
    profile() {
      return this.$store.getters.getProfile;
    },
    camundaProfile() {
      return this.$store.getters.getCamundaProfile;
    },
  },
  watch: {
    BaseUrl: function () {
      this.$store.commit("changeTaskId", null);
      this.componentKeyTasklist += 1;
      this.componentKeyTaskDetails += 1;
    },
    TaskId: function () {
      this.componentKeyTaskDetails += 1;
    }
  }
};
</script>

<style>
.task-workbench-grid {
  row-gap: 1rem;
}
</style>
