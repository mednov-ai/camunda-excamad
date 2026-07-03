<template>
  <div class="operational-overview">
    <header class="oc-page-header">
      <div>
        <h1 class="oc-page-title">Operational overview</h1>
        <p class="oc-page-subtitle">Monitor Camunda 7 runtime, definitions, incidents, tasks, and decisions from one browser console.</p>
      </div>
      <router-link to="/settings" class="btn btn-outline-primary">Manage connections</router-link>
    </header>

    <section class="oc-stat-grid">
      <div class="oc-stat-card">
        <span class="oc-stat-label">Camunda REST</span>
        <strong class="oc-stat-value">{{ serverStatus ? "Connected" : "Unavailable" }}</strong>
        <span class="oc-stat-caption">{{ activeConnectionLabel }}</span>
      </div>
      <div class="oc-stat-card">
        <span class="oc-stat-label">Environment</span>
        <strong class="oc-stat-value">{{ activeEnvironment }}</strong>
        <span class="oc-stat-caption">Detected from the active connection profile.</span>
      </div>
      <div class="oc-stat-card">
        <span class="oc-stat-label">Profiles</span>
        <strong class="oc-stat-value">{{ profiles.length }}</strong>
        <span class="oc-stat-caption">Saved Camunda REST endpoints in this browser.</span>
      </div>
      <div class="oc-stat-card">
        <span class="oc-stat-label">Auth</span>
        <strong class="oc-stat-value">{{ authLabel }}</strong>
        <span class="oc-stat-caption">Session-first REST authentication state.</span>
      </div>
    </section>

    <noConnect v-if="serverStatus !== true"></noConnect>

    <section class="oc-panel">
      <div class="oc-panel-header">
        <div>
          <h2 class="oc-panel-title">Core workflows</h2>
          <p class="oc-panel-subtitle">Fast entry points for daily process operations.</p>
        </div>
      </div>

      <div class="oc-workflow-grid">
        <router-link
          v-for="workflow in workflows"
          :key="workflow.to"
          :to="workflow.to"
          class="oc-workflow-card"
        >
          <span class="oc-card-kicker">{{ workflow.group }}</span>
          <h3 class="oc-card-title">{{ workflow.title }}</h3>
          <p class="oc-card-text">{{ workflow.description }}</p>
          <span class="oc-card-action">{{ workflow.action }}</span>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "HomeView",
  data() {
    return {
      workflows: [
        {
          group: "Processes",
          title: "Definitions and migration",
          description: "Inspect deployed process versions, runtime counts, incidents, and migration details.",
          action: "Open processes",
          to: "/migration"
        },
        {
          group: "Operations",
          title: "Incidents",
          description: "Review failed activities, retry jobs, and navigate to affected process instances.",
          action: "Open incidents",
          to: "/incident"
        },
        {
          group: "History",
          title: "Instance search",
          description: "Search runtime and history by business key, instance id, definition, and variables.",
          action: "Search instances",
          to: "/history"
        },
        {
          group: "Live",
          title: "Event stream",
          description: "Watch runtime activity and jump into process detail pages from recent events.",
          action: "Open stream",
          to: "/stream"
        },
        {
          group: "Tasks",
          title: "Task list",
          description: "Find active tasks, open generated forms, and complete work items.",
          action: "Open tasks",
          to: "/tasklist"
        },
        {
          group: "Decisions",
          title: "Decision definitions",
          description: "Review DMN definitions, decision statistics, and diagram editing workflows.",
          action: "Open decisions",
          to: "/decisiondefinitions"
        }
      ]
    };
  },
  computed: {
    serverStatus() {
      return this.$store.state.serverStatus;
    },
    profiles() {
      return this.$store.state.connectionProfiles;
    },
    activeProfile() {
      return this.profiles.find(profile => profile.id === this.$store.state.activeConnectionId);
    },
    activeConnectionLabel() {
      return this.activeProfile?.name || this.$store.state.baseurl || "No active connection";
    },
    activeEnvironment() {
      return this.activeProfile?.environment || this.$store.state.envortment || "Unknown";
    },
    authLabel() {
      return this.$store.state.restAuthType || "None";
    }
  }
};
</script>
