<template>
  <div :key="componentKey">
    <fullscreen ref="fullscreen" @change="fullscreenChange">
      <b-card bg-variant="light" text-variant="dark">
        <b-btn class="incanvas" @click="toggle" size="sm" variant="outline-success">
          <font-awesome-icon icon="arrows-alt"/>
        </b-btn>
        <atom-spinner
          v-if="!ready"
          class="spinner"
          :animation-duration="1000"
          :size="60"
          :color="'#007bff'"
        />
        <div id="canvas" :style="defaultstyle"></div>

        <div v-if="editMode" class="properties-panel-parent" id="js-properties-panel"></div>
        <ul class="buttons" v-if="editMode">
          <li>
            <a
              @mouseover="saveXML"
              variant="outline-primary"
              @click="saveXML"
              :href="hrefAndDownload.href"
              :download="hrefAndDownload.download"
            >Download .bpmn</a>
          </li>
          <li>
            <a
              @mouseover="saveSVG"
              id="js-download-svg"
              @click="saveSVG"
              :href="hrefAndDownload.href"
              :download="hrefAndDownload.download"
            >Download .svg</a>
          </li>
        </ul>
      </b-card>
      <jira-stat
        class="mt-2"
        :key="jiraKey"
        v-if="jiraMode"
        :activityId="activityId"
        :processId="processId"
      ></jira-stat>
      <form-editor
        :key="formEditorKey"
        class="mt-2"
        v-if="editMode && formMode && fieldsToPass && fieldsToPass.length > 0 "
        :fields="fieldsToPass "
      ></form-editor>
    </fullscreen>
  </div>
</template>

<script>
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import { AtomSpinner } from "epic-spinners";
import BpmnModdle from "bpmn-moddle";
import camundaModdle from "camunda-bpmn-moddle/resources/camunda";
import propertiesPanelModule from "./bpmn-js-properties-panel";
import propertiesProviderModule from "./bpmn-js-properties-panel/lib/provider/camunda";
import camundaModdleDescriptor from "camunda-bpmn-moddle/resources/camunda";
import BpmnViewer from "bpmn-js/lib/NavigatedViewer";
import BpmnModeler from "bpmn-js/lib/Modeler";
import $ from "jquery";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faArrowsAlt, faEdit } from "@fortawesome/free-solid-svg-icons";
import _orderBy from "lodash/orderBy";

library.add(faArrowsAlt);
library.add(faEdit);

const CANVAS_SELECTOR = "#canvas";
const DEFAULT_HEIGHT = "height: 350px";
const FULLSCREEN_HEIGHT = "height: 1200px";
const EDITOR_HEIGHT = "height: 700px";

export default {
  name: "Diagram",
  components: {
    AtomSpinner
  },
  props: {
    processDefinitionId: {
      type: String,
      default: null
    },
    processActivityToShowArray: {
      type: Array,
      default: () => []
    },
    diagramKey: {
      type: String,
      default: null
    },
    editMode: {
      type: Boolean,
      default: false
    },
    jiraMode: {
      type: Boolean,
      default: false
    },
    statistics: {
      type: Array,
      default: () => []
    },
    suspendedJobs: {
      type: Array,
      default: () => []
    },
    formMode: {
      type: Boolean,
      default: false
    },
    loadHistory: {
      type: Boolean,
      default: false
    },
    processInstanceIdForLoadHistory: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      ready: false,
      elementRegistryVue: null,
      formEditorKey: 0,
      processDefinitionInXml: "",
      globalViewer: null,
      elementsOfDiagram: null,
      elementDetails: null,
      jiraKey: 0,
      componentKey: 0,
      activityId: "",
      moddleElement: null,
      processId: "",
      activityHistory: [],
      defaultstyle: DEFAULT_HEIGHT,
      fullscreen: false,
      hrefAndDownload: {
        href: "",
        download: ""
      },
      wasBuilt: false,
      fieldsToPass: []
    };
  },
  watch: {
    fullscreen(val) {
      if (!val) {
        this.toggleback();
      }
    }
  },
  mounted() {
    setTimeout(() => {
      this.initializeViewer();
      if (this.editMode) {
        this.defaultstyle = EDITOR_HEIGHT;
      }
    }, 500);
  },
  beforeUnmount() {
    if (this.globalViewer && typeof this.globalViewer.destroy === "function") {
      this.globalViewer.destroy();
    }
    this.globalViewer = null;
  },
  methods: {
    async initializeViewer() {
      if (this.wasBuilt) {
        return;
      }

      await this.fetchProcessXml();
      if (this.editMode) {
        await this.readModdle();
      }

      this.globalViewer = this.createViewer();
      this.wasBuilt = true;
      this.ready = true;

      await this.importXML(this.globalViewer);
      this.bindEventBus(this.globalViewer);
    },
    async fetchProcessXml() {
      const hasKey = Boolean(this.diagramKey);
      const endpoint = hasKey
        ? `/process-definition/key/${this.diagramKey}/xml`
        : `/process-definition/${this.processDefinitionId}/xml`;

      try {
        const response = await this.$api().get(endpoint);
        this.processDefinitionInXml = response.data?.bpmn20Xml || "";

        if (this.loadHistory && this.processInstanceIdForLoadHistory) {
          const historyResponse = await this.$api().get(
            `/history/activity-instance?processInstanceId=${this.processInstanceIdForLoadHistory}`
          );
          const historyData = historyResponse.data || [];
          this.activityHistory = hasKey ? historyData.slice(50) : historyData;
        } else {
          this.activityHistory = [];
        }
      } catch (error) {
        this.processDefinitionInXml = "";
        this.activityHistory = [];
        this.wasBuilt = false;
        this.ready = false;

        const status = error?.response?.status;
        const message =
          status === 404
            ? "Process definition was not found. Make sure the backend is available."
            : "Could not load diagram data. Please verify backend connectivity.";

        if (typeof this.$notify === "function") {
          this.$notify({
            group: "foo",
            title: "Diagram loading failed",
            text: message,
            type: "error"
          });
        } else {
          // eslint-disable-next-line no-console
          console.error(message, error);
        }
      }
    },
    async readModdle() {
      const moddle = new BpmnModdle({ camunda: camundaModdle });
      return new Promise(resolve => {
        moddle.fromXML(this.processDefinitionInXml, (err, definitions) => {
          this.elementsOfDiagram = err ? null : definitions;
          resolve();
        });
      });
    },
    createViewer() {
      if (!this.editMode) {
        return new BpmnViewer({
          container: CANVAS_SELECTOR
        });
      }

      return new BpmnModeler({
        container: CANVAS_SELECTOR,
        propertiesPanel: {
          parent: "#js-properties-panel"
        },
        additionalModules: [propertiesPanelModule, propertiesProviderModule],
        moddleExtensions: {
          camunda: camundaModdleDescriptor
        }
      });
    },
    bindEventBus(viewer) {
      const eventBus = viewer.get("eventBus");
      ["element.click", "element.dblclick"].forEach(eventName => {
        eventBus.on(eventName, (event) => {
          this.handleElementEvent(event);
        });
      });
    },
    handleElementEvent(event) {
      this.moddleElement = event.element.businessObject;

      this.globalViewer.saveXML({ format: true }, (err, xml) => {
        if (!err) {
          this.$emit("digaramInXml", xml);
        }
      });
      this.$emit("clickedOnDiagram", event.element.businessObject);

      if (this.moddleElement?.$type === "bpmn:UserTask") {
        const extension = this.moddleElement.extensionElements?.values?.[0];
        this.fieldsToPass = extension?.fields ? [...extension.fields] : [];
      } else {
        this.formEditorKey += 1;
        this.fieldsToPass = [];
      }

      this.elementDetails = event.element;
      this.activityId = event.element.id;
      this.processId = event.element.businessObject?.$parent?.id || "";
      this.jiraKey += 1;
    },
    changeEditMode() {
      this.wasBuilt = false;
      this.editMode = !this.editMode;
      this.componentKey += 1;
      this.defaultstyle = this.editMode ? EDITOR_HEIGHT : DEFAULT_HEIGHT;
      this.$nextTick(() => {
        this.initializeViewer();
      });
    },
    toggle() {
      this.$refs.fullscreen.toggle();
      this.defaultstyle = FULLSCREEN_HEIGHT;
    },
    toggleback() {
      this.defaultstyle = this.editMode ? EDITOR_HEIGHT : DEFAULT_HEIGHT;
    },
    fullscreenChange(isFullscreen) {
      this.fullscreen = isFullscreen;
    },
    saveXML() {
      if (!this.globalViewer) {
        return;
      }

      this.globalViewer.saveXML({ format: true }, (err, xml) => {
        if (err || !xml) {
          return;
        }
        const name = (this.diagramKey || "diagram").split(".").join("") + ".bpmn";
        this.hrefAndDownload.href = "data:application/bpmn20-xml;charset=UTF-8," + xml;
        this.hrefAndDownload.download = name;
      });
    },
    saveSVG() {
      if (!this.globalViewer) {
        return;
      }

      this.globalViewer.saveSVG({ format: true }, (err, svg) => {
        if (err || !svg) {
          return;
        }
        const name = (this.diagramKey || "diagram").split(".").join("") + ".svg";
        this.hrefAndDownload.href = "data:application/bpmn20-xml;charset=UTF-8," + svg;
        this.hrefAndDownload.download = name;
      });
    },
    convertDateToHumanStyle(date) {
      const rel = this.$momenttrue(date).startOf("second").fromNow();
      const cal = this.$momenttrue(date).format("MMMM Do YYYY, H:mm:ss");
      return `${rel} (${cal}) `;
    },
    addTimeOverlay(overlay, id, time) {
      const humanStyleTime = this.convertDateToHumanStyle(time);
      overlay.add(id, {
        position: {
          bottom: -20,
          left: 0
        },
        html: '<div class="timer"> ' + humanStyleTime + "</div>"
      });
    },
    addCounterOverlay(overlay, shape, id, counter) {
      overlay.add(id, {
        position: {
          bottom: 15,
          left: shape.width + 5
        },
        html: '<div class="counter"> ' + counter + "</div>"
      });
    },
    addHighlightOverlay(overlay, shape, id, isLight) {
      const highlightClass = isLight ? "highlight-overlay-light" : "highlight-overlay";
      const overlayHtml = $('<div class="' + highlightClass + '">').css({
        width: shape.width,
        height: shape.height
      });
      overlay.add(id, {
        position: {
          top: 0,
          left: 0
        },
        html: overlayHtml
      });
    },
    drawOverlays(bpmnViewer) {
      const canvas = bpmnViewer.get("canvas");
      const overlays = bpmnViewer.get("overlays");
      const elementRegistry = bpmnViewer.get("elementRegistry");

      this.elementRegistryVue = elementRegistry;
      canvas.zoom("fit-viewport");

      const activityWithEndTimeMap = new Map();
      const activityToHighlight = {};

      _orderBy(
        this.activityHistory,
        (activity) => activity.activityType !== "subProcess"
      ).forEach(activity => {
        try {
          if (!activity.activityId?.includes("#multiInstanceBody")) {
            if (activity.endTime) {
              const existingEndTime = activityWithEndTimeMap.get(activity.activityId);
              if (!existingEndTime || new Date(existingEndTime) <= new Date(activity.endTime)) {
                activityWithEndTimeMap.set(activity.activityId, activity.endTime);
              }
            }

            const existingActivity = activityToHighlight[activity.activityId];
            if (existingActivity) {
              existingActivity.counter += 1;
            } else {
              const isLight =
                activity.activityType === "subProcess" ||
                activity.activityType === "adHocSubProcess";
              activityToHighlight[activity.activityId] = { counter: 1, isLight };
            }
          }

          if (activity.activityType === "callActivity") {
            const baseUrl = process.env.NODE_ENV === "production" ? "/" : "/";
            const url = `${baseUrl}#/processdetail/${activity.calledProcessInstanceId}`;
            const linkHtml =
              '<a href="' + url + '">' + activity.calledProcessInstanceId + "</a";

            overlays.add(activity.activityId, {
              position: { bottom: -5, left: 0 },
              html: linkHtml
            });
          }
        } catch (error) {
          // non-critical overlay failure, ignore
        }
      });

      activityWithEndTimeMap.forEach((endTime, activityId) => {
        if (elementRegistry.get(activityId)) {
          this.addTimeOverlay(overlays, activityId, endTime);
        }
      });

      Object.entries(activityToHighlight).forEach(([activityId, data]) => {
        const shape = elementRegistry.get(activityId);
        if (!shape) {
          return;
        }
        this.addHighlightOverlay(overlays, shape, activityId, data.isLight);
        if (data.counter > 1) {
          this.addCounterOverlay(overlays, shape, activityId, data.counter);
        }
      });

      (this.processActivityToShowArray || []).forEach(item => {
        if (!item || !item.processActivityToShow) {
          return;
        }

        if (item.activityHimanaizedCreateDate) {
          overlays.add(item.processActivityToShow, {
            position: { bottom: 0, left: 0 },
            html:
              '<div class="diagram-note">' +
              item.activityHimanaizedCreateDate +
              "</div"
          });
        }

        if (item.isToken) {
          overlays.add(item.processActivityToShow, {
            position: {
              bottom: item.activityHimanaizedCreateDate ? -20 : 0,
              left: 0
            },
            html: '<div class="diagram-note">Check now</div>'
          });
        }

        if (item.count) {
          overlays.add(item.processActivityToShow, {
            position: { top: -20, left: 0 },
            html: '<div class="count"> ' + item.count + "</div"
          });
        }

        if (item.isIncident) {
          overlays.add(item.processActivityToShow, {
            position: { bottom: -35, left: 0 },
            html: '<div class="problem"> Incident' + "</div"
          });
        }

        if (item.isJob) {
          overlays.add(item.processActivityToShow, {
            position: { top: -35, left: 0 },
            html: '<div class="job"> Job' + "</div"
          });
        }
      });

      (this.statistics || []).forEach(stat => {
        if (!stat?.id) {
          return;
        }

        overlays.add(stat.id, {
          position: { top: -20, left: 0 },
          html: '<div class="count"> ' + stat.instances + "</div"
        });

        if (stat.incidents && stat.incidents.length > 0) {
          overlays.add(stat.id, {
            position: { top: -20, left: 50 },
            html:
              '<div class="problem-count"> ' +
              stat.incidents[0].incidentCount +
              "</div"
          });
        }
      });

      (this.suspendedJobs || []).forEach(job => {
        if (!job?.activityId) {
          return;
        }
        overlays.add(job.activityId, {
          position: { bottom: 15, left: 90 },
          html: '<div class="suspended"> ' + "||" + "</div"
        });
      });
    },
    async importXML(viewer) {
      if (!this.processDefinitionInXml) {
        return;
      }

      await viewer.importXML(this.processDefinitionInXml);
      if (
        (this.processActivityToShowArray && this.processActivityToShowArray.length) ||
        (this.statistics && this.statistics.length)
      ) {
        setTimeout(() => {
          this.drawOverlays(viewer);
        }, 50);
      }
    }
  }
};
</script>

<style lang="less">
@import "styles/properties";
html,
body,
#canvas {
  height: 100%;
  padding: 0;
  margin: 0;
}

.counter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 12px;
  background-color: rgba(0, 0, 0, 0.05);
}

.timer {
  font-size: 8px;
  z-index: 1999;
  background-color: #f2f2f2c4;
  border: solid 1px black;
  width: 100px;
  height: 45px;
  padding: 5px 5px 5px 5px;
}

.diagram-note {
  background-color: green;
  color: White;
  border-radius: 25px;
  font-family: Arial;
  font-size: 12px;
  padding: 0px;
  min-height: 16px;
  width: 100px;
  text-align: center;
}
.true {
  background-color: red;
}
.count {
  background-color: blueviolet;
  color: white;
  width: 45px;
  border-radius: 25px;
  padding-left: 5px;
}
.job {
  background-color: goldenrod;
  color: white;
  width: 45px;
  border-radius: 25px;
  padding-left: 5px;
}
.problem {
  background-color: red;
  color: white;
  width: 90px;
  border-radius: 25px;
  padding-left: 5px;
}
.problem-count {
  background-color: red;
  color: white;
  width: 45px;
  border-radius: 25px;
  padding-left: 5px;
}
.suspended {
  background-color: yellow;
  color: black;
  width: 20px;
  border-radius: 25px;
  padding-left: 5px;
}

.buttons {
  position: fixed;
  bottom: 20px;
  left: 20px;

  padding: 0;
  margin: 0;
  list-style: none;
}

.buttons > li {
  display: inline-block;
  margin-right: 10px;
}
.properties-panel-parent {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  background-color: white;
  width: 260px;
  z-index: 10;
  border-left: 1px solid #ccc;
  overflow: auto;
}
.djs-properties-panel {
  padding-bottom: 70px;
  min-height: 100%;
}
.buttons > li > a {
  background: #ddd;
  border: solid 1px #666;
  display: inline-block;
  padding: 5px;
}

.buttons a {
  opacity: 0.3;
}

.buttons a.active {
  opacity: 1;
}

.highlight-overlay {
  background-color: #15b427; /* color elements as green */
  opacity: 0.5;
  border-radius: 13px;
  pointer-events: none; /* no pointer events, allows clicking through onto the element */
}

.highlight-overlay-light {
  background-color: #15b427; /* color border as green */
  opacity: 0.1;
  border-radius: 13px;
  pointer-events: none; /* no pointer events, allows clicking through onto the element */
}

.highlight-migration-select-overlay {
  background-color: rgb(255, 116, 0); /* color elements as green */
  opacity: 0.5;
  border-radius: 13px;
  pointer-events: none; /* no pointer events, allows clicking through onto the element */
}

djs-element :hover {
  background-color: black;
}
</style>
