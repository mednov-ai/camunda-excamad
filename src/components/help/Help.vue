<template>
  <section class="oc-page help-page">
    <header class="oc-page-header">
      <div>
        <p class="oc-page-kicker">Help</p>
        <h1>FAQ and Manual</h1>
        <p class="oc-page-subtitle">
          Operational notes for Camunda REST connections, process monitoring, incidents, task list, and diagrams.
        </p>
      </div>
    </header>

    <b-card class="oc-panel help-panel" no-body>
      <b-tabs pills card vertical nav-wrapper-class="help-tabs-nav" content-class="help-tabs-content">
        <b-tab title="1. FAQ" active>
          <md-viewer src="/help/FAQ.md"></md-viewer>
        </b-tab>
        <b-tab title="2. Processes">
          <md-viewer src="/help/Processes.md"></md-viewer>
        </b-tab>
        <b-tab title="3. Decisions">
          <md-viewer src="/help/Decisions.md"></md-viewer>
        </b-tab>
        <b-tab title="4. Incidents">
          <md-viewer src="/help/Incidents.md"></md-viewer>
        </b-tab>
        <b-tab title="5. Live">
          <md-viewer src="/help/Live.md"></md-viewer>
        </b-tab>
        <b-tab title="6. Task list">
          <md-viewer src="/help/Tasklist.md"></md-viewer>
        </b-tab>
        <b-tab title="7. Process instance">
          <md-viewer src="/help/ProcessInstance.md"></md-viewer>
        </b-tab>

        <b-tab title="8. Process definition">
          <md-viewer src="/help/ProcessDefinition.md"></md-viewer>
        </b-tab>
        <b-tab title="9. Others">
          <div class="oc-empty-state">
            Additional notes are not available yet.
          </div>
        </b-tab>
      </b-tabs>
    </b-card>
  </section>
</template>

<script>
import mdViewer from '@/components/help/md-viewer.vue'
export default {
  name: "Help",
  components: {
    mdViewer,
  }
}
</script>

<style lang="scss">
.help-page {
  max-width: 1180px;
}

.help-panel {
  overflow: hidden;

  .tabs {
    width: 100%;
    min-width: 0;
  }

  .help-tabs-nav {
    flex: 0 0 220px;
    width: 220px;
    min-width: 220px;
  }

  .card-header,
  .card-body {
    background: transparent;
  }

  .card-body {
    padding: 0;
  }

  .nav-pills {
    gap: 0.25rem;
    padding: 0.75rem;
  }

  .nav-link {
    border-radius: var(--oc-radius-sm);
    color: var(--oc-text-muted);
    font-size: 0.875rem;
    line-height: 1.25;
    text-align: left;
  }

  .nav-link.active {
    background: var(--oc-primary-soft);
    color: var(--oc-primary-strong);
    font-weight: 600;
  }

  .tab-content {
    flex: 1 1 auto;
    width: calc(100% - 220px);
    min-width: 0;
    border-left: 1px solid var(--oc-border);
  }
}

@media (max-width: 767.98px) {
  .help-panel {
    .tabs {
      display: block !important;
    }

    .help-tabs-nav {
      flex: 0 0 auto;
      width: 100%;
      min-width: 0;
    }

    .nav-pills {
      display: flex;
      flex-direction: row !important;
      flex-wrap: nowrap;
      overflow-x: auto;
      border-bottom: 1px solid var(--oc-border);
    }

    .nav-link {
      white-space: nowrap;
    }

    .tab-content {
      width: 100%;
      border-left: 0;
    }
  }
}
</style>
