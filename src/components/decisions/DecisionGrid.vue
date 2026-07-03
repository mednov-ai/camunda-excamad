<template>
  <div class="decision-definitions-page oc-page">
    <header class="oc-page-header">
      <div>
        <h1 class="oc-page-title">Decision definitions</h1>
        <p class="oc-page-subtitle">DMN definitions, versions, DRD links, and history counts.</p>
      </div>
      <span class="oc-status-badge is-info">{{ decisions.length }} loaded</span>
    </header>

    <b-form inline class="oc-toolbar">
      <b-form-checkbox size="sm" id="checkbox1" v-model="latestVersion">Latest Version</b-form-checkbox>
      <b-button size="sm" @click="getDecisions" variant="outline-success" :disabled="loading">Search</b-button>
    </b-form>

    <b-alert v-if="loadError" show variant="danger">{{ loadError }}</b-alert>
    <div v-else-if="!loading && decisions.length === 0" class="oc-empty-state">
      No decision definitions found for the active connection.
    </div>

    <div v-if="loading || decisions.length > 0" class="oc-table-wrap">
      <table class="table table-striped table-sm">
        <thead>
          <tr>
            <th>Version</th>
            <th>Id</th>
            <th>Name</th>
            <th>DRD</th>
            <th>Done</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5">Loading decision definitions...</td>
          </tr>
          <tr :key="item.id" v-for="item in decisions.slice(0,200)">
            <td>{{item.version}}</td>
            <td>
              <router-link :to="{name:'decisiondiagram', params:{ decisionId: item.id}}">
                <b>{{item.id}}</b>
              </router-link>
            </td>
            <td>{{item.name}}</td>
            <td>{{item.decisionRequirementsDefinitionKey}}</td>
            <td>{{item.count ?? 0}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import * as api from "@/api/api";
export default {
  name: "DecisionGrid",

  data() {
    return {
      decisions: [],
      latestVersion: true,
      loading: false,
      loadError: ""
    };
  },
  created() {
    this.getDecisions();
  },
  mounted() {
    //   this.getDecisions();
  },
  methods: {
    async getDecisions() {
      this.loading = true;
      this.loadError = "";

      try {
        const decisions = await api.getEntity(
          "decision-definition",
          "",
          "sortBy=version&sortOrder=desc&latestVersion=" + this.latestVersion
        );

        this.decisions = await Promise.all(
          decisions.map(async decision => {
            try {
              const response = await api.getEntity(
                "history",
                "decision-instance/count",
                "decisionDefinitionId=" + encodeURIComponent(decision.id)
              );
              return {
                ...decision,
                count: response.count ?? 0
              };
            } catch {
              return {
                ...decision,
                count: 0
              };
            }
          })
        );
      } catch (error) {
        this.decisions = [];
        this.loadError = "Cannot load decision definitions for the active connection.";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style>
</style>
