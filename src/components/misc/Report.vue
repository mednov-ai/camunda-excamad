<template>
  <div id="Report" class="report-page oc-page">
    <header class="oc-page-header">
      <div>
        <h1 class="oc-page-title">Report dashboard</h1>
        <p class="oc-page-subtitle">{{ connectionLabel }}</p>
      </div>
      <span class="oc-status-badge" :class="dashboardUrl ? 'is-success' : ''">
        {{ dashboardUrl ? 'Configured' : 'Not configured' }}
      </span>
    </header>

    <b-card class="report-panel oc-panel" bg-variant="light" text-variant="dark">
      <div class="oc-panel-header">
        <div>
          <h2 class="oc-panel-title">Dashboard source</h2>
          <p class="oc-panel-subtitle">Open or embed the report configured for this connection.</p>
        </div>
      </div>

      <b-alert v-if="!dashboardUrl" show variant="info" class="mt-3 mb-0">
        No dashboard is configured for {{ currentURL || 'the active connection' }}.
      </b-alert>

      <template v-else>
        <div class="report-actions">
          <b-button
            :href="dashboardUrl"
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            variant="primary"
          >
            <font-awesome-icon icon="external-link-alt" />
            <span>Open</span>
          </b-button>

          <b-button size="sm" variant="outline-secondary" @click="toggleEmbed">
            <font-awesome-icon :icon="embedDashboard ? 'eye-slash' : 'eye'" />
            <span>{{ embedDashboard ? 'Hide embed' : 'Embed' }}</span>
          </b-button>
        </div>

        <iframe
          v-if="embedDashboard"
          class="report-frame"
          :src="dashboardUrl"
          title="Report dashboard"
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts"
        ></iframe>
      </template>
    </b-card>
  </div>
</template>

<script>
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faExternalLinkAlt,
  faEye,
  faEyeSlash
} from "@fortawesome/free-solid-svg-icons";
import { FindDashboardUrl } from "@/config/dashboardUrl";
import { normalizeConnectionUrl } from "@/connections/connectionStorage";

library.add(faExternalLinkAlt, faEye, faEyeSlash);

export default {
  name: "Report",
  data() {
    return {
      dashboardUrl: null,
      embedDashboard: false
    };
  },
  computed: {
    currentURL() {
      return normalizeConnectionUrl(this.$store.state.baseurl);
    },
    activeProfile() {
      return this.$store.state.connectionProfiles.find(
        profile => profile.id === this.$store.state.activeConnectionId
      );
    },
    connectionLabel() {
      return this.activeProfile?.name || this.currentURL || "No active connection";
    }
  },
  watch: {
    currentURL() {
      this.syncDashboardUrl();
    }
  },
  mounted() {
    this.syncDashboardUrl();
  },
  methods: {
    syncDashboardUrl() {
      this.dashboardUrl = FindDashboardUrl(this.currentURL);
      this.embedDashboard = false;
    },
    toggleEmbed() {
      this.embedDashboard = !this.embedDashboard;
    }
  }
};
</script>

<style>
.report-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.report-actions .btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.report-frame {
  width: 100%;
  height: 72vh;
  min-height: 560px;
  margin-top: 16px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}
</style>
