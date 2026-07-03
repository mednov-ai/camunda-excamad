<template>
  <div class="connections-page oc-page">
    <div class="connections-header oc-page-header">
      <div>
        <h1 class="oc-page-title">Connections</h1>
        <p class="oc-page-subtitle">Camunda REST endpoints and browser-local auth settings.</p>
      </div>
      <b-button variant="outline-danger" size="sm" @click="clearSavedData">Clear saved data</b-button>
    </div>

    <b-alert
      class="mt-3"
      :show="Boolean(statusMessage)"
      :variant="statusVariant"
    >
      {{ statusMessage }}
    </b-alert>

    <b-row class="connections-grid">
      <b-col cols="12" lg="4">
        <div class="connection-panel oc-panel">
          <div class="connection-panel-header oc-panel-header">
            <div>
              <h2 class="oc-panel-title">Saved profiles</h2>
              <p class="oc-panel-subtitle">Switch between Camunda environments.</p>
            </div>
            <b-button variant="outline-primary" size="sm" @click="newProfile">New</b-button>
          </div>

          <b-list-group>
            <b-list-group-item
              v-for="profile in profiles"
              :key="profile.id"
              button
              :active="profile.id === activeConnectionId"
              @click="selectProfile(profile)"
            >
              <div class="connection-list-row">
                <div>
                  <strong>{{ profile.name }}</strong>
                  <div class="small">{{ compactUrl(profile.url) }}</div>
                </div>
                <b-badge :variant="environmentVariant(profile.environment)">
                  {{ profile.environment }}
                </b-badge>
              </div>
            </b-list-group-item>
          </b-list-group>
        </div>
      </b-col>

      <b-col cols="12" lg="8">
        <div class="connection-panel oc-panel">
          <div class="oc-panel-header">
            <div>
              <h2 class="oc-panel-title">{{ editingProfileId ? 'Edit profile' : 'New profile' }}</h2>
              <p class="oc-panel-subtitle">REST URL, counters, and session-first authentication.</p>
            </div>
          </div>

          <b-form-group label="Profile name" label-for="connection-name">
            <b-form-input
              id="connection-name"
              v-model="connectionName"
              placeholder="Local Camunda"
            />
          </b-form-group>

          <b-form-group label="Camunda REST URL" label-for="connection-url">
            <b-input-group>
              <b-form-input
                id="connection-url"
                v-model="privateurl"
                placeholder="http://localhost:8080/engine-rest/"
                @keyup.enter="saveConnection"
              />
              <b-button variant="outline-secondary" @click="testConnection">Test</b-button>
            </b-input-group>
            <small class="text-muted">Use the REST root, for example /engine-rest/ or /rest/.</small>
          </b-form-group>

          <b-form-checkbox v-model="metadataCountersEnabled" class="mb-3">
            Enable process definition counters loading
          </b-form-checkbox>

          <b-form-checkbox v-model="enableRestPassword" class="mb-2">
            Enable REST authentication
          </b-form-checkbox>

          <div v-if="enableRestPassword" class="auth-panel">
            <b-form-group label="Auth type" label-for="connection-auth-type">
              <b-form-select
                id="connection-auth-type"
                v-model="selectedRestType"
                :options="restAuthTypes"
              />
            </b-form-group>

            <template v-if="selectedRestType === 'Basic'">
              <b-form-group label="Username" label-for="connection-username">
                <b-form-input id="connection-username" v-model="restUsername" autocomplete="username" />
              </b-form-group>
              <b-form-group label="Password" label-for="connection-password">
                <b-form-input
                  id="connection-password"
                  v-model="restPassword"
                  type="password"
                  autocomplete="current-password"
                />
              </b-form-group>
            </template>

            <b-form-group v-if="selectedRestType === 'Bearer'" label="Bearer token" label-for="connection-token">
              <b-form-input id="connection-token" v-model="restBearerToken" type="password" />
            </b-form-group>

            <b-form-checkbox v-model="rememberAuth">
              Remember auth on this device
            </b-form-checkbox>
            <small class="text-muted">
              Without this, credentials are kept only in this browser session.
            </small>
          </div>

          <div class="connection-actions">
            <b-button variant="primary" @click="saveConnection">Save connection</b-button>
            <b-button variant="outline-success" :disabled="!editingProfileId" @click="useConnection">
              Use connection
            </b-button>
            <b-button variant="outline-danger" :disabled="!editingProfileId" @click="deleteConnection">
              Delete
            </b-button>
          </div>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import axios from "axios";
import {
  createConnectionProfile,
  normalizeConnectionUrl
} from "@/connections/connectionStorage";

export default {
  name: "BaseURL",
  data() {
    return {
      editingProfileId: null,
      connectionName: "",
      privateurl: "",
      enableRestPassword: false,
      restUsername: "",
      restPassword: "",
      restAuthTypes: ["Basic", "Bearer"],
      selectedRestType: "Basic",
      restBearerToken: "",
      rememberAuth: false,
      statusMessage: "",
      statusVariant: "info",
      metadataCountersEnabled: this.$store.state.metadataCountersEnabled
    };
  },
  computed: {
    profiles() {
      return this.$store.state.connectionProfiles;
    },
    activeConnectionId() {
      return this.$store.state.activeConnectionId;
    },
    activeProfile() {
      return this.profiles.find(profile => profile.id === this.activeConnectionId) || null;
    }
  },
  watch: {
    activeConnectionId() {
      this.loadProfile(this.activeProfile);
    }
  },
  mounted() {
    this.loadProfile(this.activeProfile);
    if (this.activeProfile) {
      this.testConnection();
    }
  },
  methods: {
    compactUrl(url) {
      return normalizeConnectionUrl(url).replace(/^https?:\/\//, "").replace(/\/$/, "");
    },
    environmentVariant(environment) {
      if (environment === "Production") {
        return "warning";
      }
      if (environment === "Test") {
        return "info";
      }
      if (environment === "Local") {
        return "success";
      }
      return "secondary";
    },
    newProfile() {
      this.editingProfileId = null;
      this.connectionName = "";
      this.privateurl = "";
      this.enableRestPassword = false;
      this.restUsername = "";
      this.restPassword = "";
      this.selectedRestType = "Basic";
      this.restBearerToken = "";
      this.rememberAuth = false;
      this.statusMessage = "";
    },
    selectProfile(profile) {
      this.loadProfile(profile);
    },
    loadProfile(profile) {
      if (!profile) {
        this.newProfile();
        return;
      }
      this.editingProfileId = profile.id;
      this.connectionName = profile.name;
      this.privateurl = profile.url;
      this.enableRestPassword = Boolean(profile.auth.enabled);
      this.restUsername = profile.auth.username || "";
      this.restPassword = profile.auth.password || "";
      this.selectedRestType = profile.auth.type || "Basic";
      this.restBearerToken = profile.auth.token || "";
      this.rememberAuth = Boolean(profile.auth.remember);
    },
    buildProfileFromForm() {
      return createConnectionProfile(this.privateurl, {
        id: this.editingProfileId || undefined,
        name: this.connectionName || undefined,
        auth: {
          enabled: this.enableRestPassword,
          type: this.selectedRestType,
          username: this.restUsername,
          password: this.restPassword,
          token: this.restBearerToken,
          remember: this.rememberAuth
        }
      });
    },
    saveConnection() {
      const normalizedUrl = normalizeConnectionUrl(this.privateurl);
      if (!normalizedUrl) {
        this.showStatus("Enter a Camunda REST URL first.", "warning");
        return;
      }

      this.privateurl = normalizedUrl;
      const profile = this.buildProfileFromForm();
      this.$store.commit("saveConnectionProfile", profile);
      localStorage.setItem("metadataCountersEnabled", this.metadataCountersEnabled);
      this.$store.commit("metadataCountersEnabled", this.metadataCountersEnabled);
      this.loadProfile(this.activeProfile);
      this.showStatus("Connection saved.", "success");
      this.testConnection();
    },
    useConnection() {
      if (!this.editingProfileId) {
        return;
      }
      this.$store.commit("activateConnection", this.editingProfileId);
      this.showStatus("Connection selected.", "success");
      this.testConnection();
    },
    deleteConnection() {
      if (!this.editingProfileId) {
        return;
      }
      this.$store.commit("deleteConnectionProfile", this.editingProfileId);
      this.loadProfile(this.activeProfile);
      this.showStatus("Connection deleted.", "warning");
    },
    clearSavedData() {
      this.$store.commit("clearConnectionProfiles");
      localStorage.removeItem("metadataCountersEnabled");
      this.newProfile();
      this.showStatus("Saved connection data cleared.", "warning");
    },
    async testConnection() {
      const normalizedUrl = normalizeConnectionUrl(this.privateurl);
      if (!normalizedUrl) {
        this.showStatus("Enter a Camunda REST URL first.", "warning");
        return;
      }

      try {
        await axios.get(`${normalizedUrl}engine`, {
          timeout: 5000,
          headers: this.authHeaders()
        });
        this.$store.commit("changeServerStatus", true);
        this.showStatus("Connected to Camunda REST.", "success");
      } catch (error) {
        this.$store.commit("changeServerStatus", false);
        this.showStatus(this.describeConnectionError(error), "danger");
      }
    },
    authHeaders() {
      if (!this.enableRestPassword) {
        return {};
      }
      if (this.selectedRestType === "Bearer") {
        return {
          Authorization: `Bearer ${this.restBearerToken}`
        };
      }
      return {
        Authorization: `Basic ${btoa(`${this.restUsername}:${this.restPassword}`)}`
      };
    },
    describeConnectionError(error) {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        return "Authentication failed. Check the saved Basic/Bearer credentials.";
      }
      if (status === 404) {
        return "Camunda REST was not found at this URL. Check /engine-rest/ or /rest/.";
      }
      if (error.response) {
        return `Camunda REST returned HTTP ${status}.`;
      }
      return "Browser cannot reach this endpoint. Check URL, server availability, and CORS for this frontend origin.";
    },
    showStatus(message, variant) {
      this.statusMessage = message;
      this.statusVariant = variant;
      this.$store.commit("setConnectionStatusMessage", message);
    }
  }
};
</script>

<style>
.connections-header,
.connection-panel-header,
.connection-list-row,
.connection-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.connections-grid {
  row-gap: 1rem;
}

.connection-panel {
  height: 100%;
}

.auth-panel {
  border-left: 3px solid var(--oc-primary);
  padding-left: 14px;
  margin-bottom: 16px;
}

.connection-actions {
  justify-content: flex-start;
  margin-top: 18px;
}
</style>
