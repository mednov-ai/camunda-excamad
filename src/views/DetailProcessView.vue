<template>
  <div class="process-detail-page">
    <div class="process-detail-layout">
      <aside class="process-detail-sidebar">
        <nav class="process-section-nav" aria-label="Process detail sections">
          <span class="section-nav-title">Sections</span>
          <button
            v-for="section in sectionLinks"
            :key="section.target"
            type="button"
            class="process-section-link"
            @click="scrollToSection(section.target)"
          >
            {{ section.label }}
          </button>
        </nav>
      </aside>

      <main class="process-detail-content">
        <b-card text-variant="dark" class="process-detail-card">
          <div class="process-detail-actions">
            <b-dropdown
              class="process-section-dropdown"
              text="Sections"
              variant="outline-secondary"
              size="sm"
            >
              <b-dropdown-item-button
                v-for="section in sectionLinks"
                :key="section.target"
                @click="scrollToSection(section.target)"
              >
                {{ section.label }}
              </b-dropdown-item-button>
            </b-dropdown>

            <b-btn
              v-clipboard:copy="message"
              v-clipboard:success="onCopy"
              v-clipboard:error="onError"
              size="sm"
              variant="outline-primary"
              class="copy-link-button"
            >
              <font-awesome-icon icon="share" />
              <span>Copy link</span>
            </b-btn>
          </div>

          <detail-incident :processInstanceId="processInstanceId" @retryExternalTask="retryExternalTask"></detail-incident>

          <section id="detailProcessStat" class="detail-anchor">
            <detailprocessstat :processInstanceId="processInstanceId"></detailprocessstat>
          </section>
          <section id="detailCurrentActivity" class="detail-anchor">
            <currentstate class="mt-5" :processInstanceId="processInstanceId"></currentstate>
          </section>
          <external-task class="mt-5"
                         :processInstanceId="processInstanceId"
                         :externalTaskJobs="externalTaskJobs"
                         @retryClicked="retryExternalTask"
          > </external-task>
          <section id="detailDecisions" class="detail-anchor">
            <decision-details class="mt-5" :processInstanceId="processInstanceId"></decision-details>
          </section>

          <section id="detailVariables" class="detail-anchor">
            <variable-list class="mt-5" :processInstanceId="processInstanceId"></variable-list>
          </section>
          <section id="detailVariablesHistory" class="detail-anchor">
            <history-details class="mt-5" :processInstanceId="processInstanceId"></history-details>
          </section>
          <section id="detailIncidentsHistory" class="detail-anchor">
            <incidents-history class="mt-5" :processInstanceId="processInstanceId"></incidents-history>
          </section>
          <section id="detailNetworkDiagram" class="detail-anchor">
            <network-diagram class="mt-5" :processInstanceId="processInstanceId"></network-diagram>
          </section>
          <section id="detailStream" class="detail-anchor">
            <stream class="mt-5" :processInstanceId="processInstanceId"></stream>
          </section>
        </b-card>
      </main>
    </div>
  </div>
</template>

<script>
import { library } from "@fortawesome/fontawesome-svg-core";
import { faShare } from "@fortawesome/free-solid-svg-icons";
import { SERVERVIRTALPATHPROD } from "@/config/settings";

library.add(faShare);
import Stream from "@/components/Stream.vue";
import ExternalTask from '../components/detail-process-instance/ExternalTask.vue';

export default {
  name: "DetailProcessView",
  props: ["processInstanceId"],
  components: {
    Stream,
    ExternalTask
  },
  mounted() {
    var hostname = window.location.hostname;
    var hash = SERVERVIRTALPATHPROD + "?#";
    var pathname = this.$route.path;
    var query = "?baseurl=" + this.$store.state.baseurl;
    this.message = "http://" + hostname + hash + pathname + query;
    this.loadExternalTaskJobs();
  },
  data() {
    return {
      message: "Copy These Text",
      copied: false,
      externalTaskJobs: [],
      sectionLinks: [
        { label: "Main", target: "#detailProcessStat" },
        { label: "Current activity", target: "#detailCurrentActivity" },
        { label: "Decisions", target: "#detailDecisions" },
        { label: "Variables", target: "#detailVariables" },
        { label: "Variable history", target: "#detailVariablesHistory" },
        { label: "Incidents", target: "#detailIncidentsHistory" },
        { label: "History duration", target: "#detailNetworkDiagram" },
        { label: "Event stream", target: "#detailStream" }
      ]
    };
  },
  methods: {
    scrollToSection(target) {
      this.$scrollTo(target);
    },
    onCopy: function() {
      //alert("You just copied: " + e.text);
      this.$notify({
        group: "foo",
        title: "Copied!",
        type: "success"
      });
    },
    retryExternalTask(processInstanceId) {
      const externalJob = this.externalTaskJobs.find(externalJob => externalJob.processInstanceId === processInstanceId);

      const notifyError = (error) => this.$notify({
        group: "foo",
        title: "Retries NOT setuped",
        text: error,
        type: "error"
      });

      if (externalJob) {
        const putObj = {
          retries: 1,
          processInstanceIds: [processInstanceId],
          externalTaskIds: [externalJob.id]
        }
        this.$api().put("/external-task/retries", putObj).then(response => {

          this.$notify({
            group: "foo",
            title: " Retries setuped",
            type: "success"
          });
        }).catch(error => notifyError(error))
      } else {
        notifyError('External task not found');
      }
    },
    loadExternalTaskJobs() {
      this.$api()
          .get("/external-task?processInstanceId=" + this.processInstanceId)
          .then(response => {
            this.externalTaskJobs = response.data;
          });
    },
    onError: function() {
      alert("sorry");
    }
  }
};
</script>

<style>
@import "https://cdnjs.cloudflare.com/ajax/libs/vis/4.20.1/vis.min.css";

.process-detail-page {
  width: 100%;
}

.process-detail-layout {
  display: grid;
  grid-template-columns: 13rem minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

.process-detail-sidebar {
  position: sticky;
  top: var(--app-sticky-offset, 5rem);
  align-self: start;
}

.process-section-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 0.375rem;
  background-color: #fff;
}

.section-nav-title {
  margin-bottom: 0.25rem;
  color: #6c757d;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.process-section-link {
  display: block;
  width: 100%;
  padding: 0.35rem 0.45rem;
  border: 0;
  border-radius: 0.25rem;
  background: transparent;
  color: #2f5ea8;
  font-size: 0.875rem;
  line-height: 1.25;
  text-align: left;
}

.process-section-link:hover,
.process-section-link:focus {
  background-color: #eef3fb;
  color: #193e73;
}

.process-detail-content {
  min-width: 0;
}

.process-detail-card {
  width: 100%;
}

.process-detail-card .card-body {
  overflow-x: auto;
}

.process-detail-actions {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.process-section-dropdown {
  display: none;
}

.copy-link-button {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.detail-anchor {
  scroll-margin-top: var(--app-scroll-offset, 6rem);
}

@media (max-width: 991.98px) {
  .process-detail-layout {
    display: block;
  }

  .process-detail-sidebar {
    display: none;
  }

  .process-section-dropdown {
    display: inline-block;
  }
}

@media (max-width: 575.98px) {
  .process-detail-actions {
    align-items: stretch;
  }

  .copy-link-button span {
    display: none;
  }
}
</style>
