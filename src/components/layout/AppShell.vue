<template>
  <div class="oc-shell" :class="{ 'is-sidebar-open': sidebarOpen }">
    <div class="oc-mobile-backdrop" @click="closeSidebar"></div>

    <aside class="oc-sidebar" aria-label="Primary navigation">
      <router-link class="oc-sidebar-brand" to="/" @click="closeSidebar">
        <span class="oc-brand-mark">EX</span>
        <span>Excamad</span>
      </router-link>

      <nav class="oc-sidebar-nav">
        <section v-for="group in navGroups" :key="group.label" class="oc-nav-group">
          <div class="oc-nav-group-title">{{ group.label }}</div>
          <router-link
            v-for="item in group.items"
            :key="item.to"
            class="oc-nav-link"
            :class="{ 'is-active': isActive(item) }"
            :to="item.to"
            @click="closeSidebar"
          >
            <span class="oc-nav-icon">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </router-link>
        </section>
      </nav>

      <div class="oc-sidebar-footer">
        <div class="d-flex align-items-center gap-2">
          <span class="oc-status-dot" :class="{ 'is-online': serverStatus }"></span>
          <strong>{{ serverStatusText }}</strong>
        </div>
        <div class="oc-truncate mt-1" :title="connectionUrlText">{{ connectionUrlText }}</div>
      </div>
    </aside>

    <div class="oc-main">
      <header class="oc-topbar">
        <button type="button" class="oc-mobile-menu-button" aria-label="Open navigation" @click="openSidebar">
          <span>Menu</span>
        </button>

        <div class="oc-topbar-search">
          <search @setUrlFromSearch="setUrlFromEmit"></search>
        </div>

        <div class="oc-topbar-actions">
          <b-dropdown variant="link" toggle-class="connection-toggle p-0" menu-class="connection-dropdown-menu">
            <template #button-content>
              <span class="connection-chip" :title="connectionToggleTitle">
                <span class="connection-status-dot" :class="{ 'is-online': serverStatus, 'is-offline': !serverStatus }"></span>
                <span class="connection-chip-main">{{ connectionDisplayName }}</span>
                <b-badge pill :variant="environmentVariant(activeEnvironment)">{{ activeEnvironment }}</b-badge>
              </span>
            </template>

            <b-dropdown-header>Connection</b-dropdown-header>
            <b-dropdown-text class="connection-menu-summary">
              <strong>{{ serverStatusText }}</strong>
              <span>{{ connectionUrlText }}</span>
              <span v-if="connectionAuthText">{{ connectionAuthText }}</span>
            </b-dropdown-text>
            <b-dropdown-divider></b-dropdown-divider>
            <b-dropdown-item to="/settings">Manage connections</b-dropdown-item>
            <b-dropdown-divider v-if="profiles.length"></b-dropdown-divider>
            <b-dropdown-item-button
              v-for="profile in profiles"
              :key="profile.id"
              @click="activateConnection(profile.id)"
            >
              <span class="connection-profile-row">
                <span class="connection-profile-main">
                  <span class="connection-active-mark" aria-hidden="true">{{ profile.id === activeConnectionId ? '>' : '' }}</span>
                  {{ profile.name }}
                </span>
                <b-badge pill :variant="environmentVariant(profile.environment)">{{ profile.environment }}</b-badge>
              </span>
            </b-dropdown-item-button>
            <b-dropdown-divider></b-dropdown-divider>
            <b-dropdown-item-button @click="clear">Clear saved data</b-dropdown-item-button>
          </b-dropdown>

          <button v-if="!isAuthenticated" v-b-modal.modal1 type="button" class="oc-icon-button">Login</button>
          <button v-else type="button" class="oc-icon-button" @click="logout">{{ profile.userName || 'Logout' }}</button>

          <router-link class="oc-icon-button" to="/help" title="Help">?</router-link>
        </div>

        <login></login>
      </header>

      <main class="oc-content">
        <div class="oc-content-inner">
          <slot></slot>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import {
  AUTH_CAMUNDA_REQUEST,
  AUTH_LOGOUT,
  AUTH_REQUEST
} from "@/store/actions/auth";
import {
  PRODSUBSTRING,
  TESTSUBSTRING
} from "@/config/settings";
import { normalizeConnectionUrl } from "@/connections/connectionStorage";

export default {
  name: "AppShell",
  emits: ["refresh"],
  data() {
    return {
      sidebarOpen: false,
      status: "",
      statusDate: "",
      envortment: "",
      productionAlert: "",
      testAlert: "",
      substringForProduction: PRODSUBSTRING,
      substringForTest: TESTSUBSTRING,
      navGroups: [
        {
          label: "Processes",
          items: [
            { label: "Stats and migration", to: "/migration", icon: "PR" },
            { label: "History and search", to: "/history", icon: "HI" },
            { label: "Start processes", to: "/startdefinition", icon: "ST" },
            { label: "Migration", to: "/ComplexMigration", icon: "MI" },
            { label: "Variables edit", to: "/variablebatch", icon: "VA" },
            { label: "Modification", to: "/modificationbatch", icon: "MO" }
          ]
        },
        {
          label: "Decisions",
          items: [
            { label: "Stats and definitions", to: "/decisiondefinitions", icon: "DM" }
          ]
        },
        {
          label: "Operations",
          items: [
            { label: "Incidents", to: "/incident", icon: "IN" },
            { label: "Live", to: "/stream", icon: "LV" },
            { label: "Task list", to: "/tasklist", icon: "TA" }
          ]
        },
        {
          label: "Misc",
          items: [
            { label: "Deployments", to: "/deploytable", icon: "DE" },
            { label: "Batches", to: "/batch", icon: "BA" },
            { label: "Reports", to: "/report", icon: "RE" },
            { label: "Groups", to: "/groups", icon: "GR" },
            { label: "Users", to: "/users", icon: "US" }
          ]
        },
        {
          label: "Settings",
          items: [
            { label: "Connections", to: "/settings", icon: "CO" },
            { label: "Legacy systems", to: "/systems", icon: "SY" },
            { label: "Help", to: "/help", icon: "HE" }
          ]
        }
      ]
    };
  },
  computed: {
    baseurl() {
      return this.$store.state.baseurl;
    },
    profiles() {
      return this.$store.state.connectionProfiles;
    },
    activeConnectionId() {
      return this.$store.state.activeConnectionId;
    },
    activeProfile() {
      return this.profiles.find(profile => profile.id === this.activeConnectionId) || null;
    },
    authType() {
      return this.$store.state.restAuthType;
    },
    serverStatus() {
      return this.$store.state.serverStatus;
    },
    serverStatusText() {
      return this.serverStatus ? "Connected" : "Unavailable";
    },
    activeEnvironment() {
      return this.activeProfile?.environment || this.envortment || "Unknown";
    },
    connectionDisplayName() {
      if (this.activeProfile?.name) {
        return this.activeProfile.name;
      }
      if (this.baseurl) {
        return this.compactUrl(this.baseurl);
      }
      return "No connection";
    },
    connectionUrlText() {
      const url = this.activeProfile?.url || this.baseurl;
      return url ? this.compactUrl(url) : "No Camunda REST URL";
    },
    secureDate() {
      if (this.$store.state.secureDate) {
        return this.$momenttrue(this.$store.state.secureDate).fromNow();
      }
      return null;
    },
    connectionAuthText() {
      if (this.authType && this.secureDate) {
        return `${this.authType} ${this.secureDate}`;
      }
      return this.authType || "";
    },
    connectionToggleTitle() {
      return `${this.serverStatusText}: ${this.connectionUrlText}`;
    },
    isAuthenticated() {
      return this.$store.getters.isAuthenticated;
    },
    profile() {
      return this.$store.getters.getProfile;
    }
  },
  watch: {
    baseurl() {
      this.checkEnvortment();
      this.healthcheck();
    },
    "$route.fullPath"() {
      this.closeSidebar();
    }
  },
  mounted() {
    this.healthcheck();
    this.checkEnvortment();
    this.healthcheckInterval = setInterval(() => {
      this.healthcheck();
      this.checkEnvortment();
    }, 9000);
  },
  beforeUnmount() {
    clearInterval(this.healthcheckInterval);
  },
  methods: {
    openSidebar() {
      this.sidebarOpen = true;
    },
    closeSidebar() {
      this.sidebarOpen = false;
    },
    isActive(item) {
      return this.$route.path === item.to || this.$route.path.startsWith(`${item.to}/`);
    },
    compactUrl(url) {
      return normalizeConnectionUrl(url).replace(/^https?:\/\//, "").replace(/\/$/, "");
    },
    environmentVariant(environment) {
      if (environment === "Production" || environment === "PRODUCTION") {
        return "warning";
      }
      if (environment === "Test" || environment === "TEST") {
        return "info";
      }
      if (environment === "Local" || environment === "LOCAL") {
        return "success";
      }
      return "secondary";
    },
    healthcheck() {
      if (!this.baseurl) {
        this.$store.commit("changeServerStatus", false);
        return;
      }
      this.$api()
        .get("/engine")
        .then(() => {
          this.status = "UP";
          this.statusDate = Date();
          this.$store.commit("changeServerStatus", true);
        })
        .catch(() => {
          this.status = "DOWN";
          this.statusDate = Date();
          this.$store.commit("changeServerStatus", false);
        });
    },
    checkEnvortment() {
      if (!this.baseurl) {
        this.envortment = "Unknown";
        this.$store.commit("changeEnvortment", this.envortment);
        return;
      }
      this.testAlert = this.baseurl.indexOf(this.substringForTest);
      this.productionAlert = this.baseurl.indexOf(this.substringForProduction);
      if (this.testAlert > 0) {
        this.envortment = "Test";
      } else if (this.productionAlert > 0) {
        this.envortment = "Production";
      } else if (this.baseurl.includes("localhost") || this.baseurl.includes("127.0.0.1")) {
        this.envortment = "Local";
      } else {
        this.envortment = "Unknown";
      }
      this.$store.commit("changeEnvortment", this.envortment);
    },
    clear() {
      this.$store.commit("clearConnectionProfiles");
      this.$emit("refresh");
    },
    activateConnection(profileId) {
      this.$store.commit("activateConnection", profileId);
      this.checkEnvortment();
      this.healthcheck();
      this.$emit("refresh");
    },
    setUrlFromEmit(newUrl) {
      this.$store.commit("activateConnectionFromUrl", newUrl);
      this.checkEnvortment();
      this.healthcheck();
      this.$router.push({ name: "migration" });
      this.$emit("refresh");
      if (localStorage.usertoken != null) {
        const usertokenstring = atob(localStorage.usertoken).split(":");
        const userName = usertokenstring[0];
        const password = usertokenstring[1];
        this.$store.dispatch(AUTH_REQUEST, { userName, password }).then(() => {});
        this.$store.dispatch(AUTH_CAMUNDA_REQUEST, { userName, password }).then(() => {});
      }
    },
    logout() {
      this.$store.dispatch(AUTH_LOGOUT).then(() => {
        this.$router.push("/");
      });
    }
  }
};
</script>
