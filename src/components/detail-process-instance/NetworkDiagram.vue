<template>
  <fullscreen ref="fullscreen" @change="fullscreenChange">
    <b-card id="networkdiagram" bg-variant="light" text-variant="dark">
      <h2>History duration diagram</h2>

      <b-btn class="incanvas" @click="toggle" size="sm" variant="outline-success">
        <font-awesome-icon icon="arrows-alt"/>
      </b-btn>

      <b-btn class="ml-3" size="sm" @click="setVertical">strict</b-btn>

      <network
        class="network"
        ref="network"
        :nodes="network.nodes"
        :edges="network.edges"
        :options="network.options"
      ></network>
    </b-card>
  </fullscreen>
</template>

<script>
import {Network } from "@/visualization/visNetwork";
import fullscreen from "@/plugins/fullscreen";

export default {
  data() {
    return {
      fullscreen: false,
      networkEvents: "",
      network: {
        nodes: [],
        edges: [],
        options: {
          autoResize: true,
          // edges: {
          //   smooth: {
          //     type: "discrete",

          //     roundness: 1
          //   }
          // },1
          physics: {
            hierarchicalRepulsion: {
              centralGravity: 0,
              springLength: 180,
              springConstant: 0,
              nodeDistance: 160,
              damping: 0.12
            },
            minVelocity: 0.75,
            solver: "hierarchicalRepulsion",
            timestep: 0.49
          },
          height: "100%",
          layout: {
            hierarchical: true
          }
        }
      },
      activities: [],
      historyDetails: []
    };
  },
  props: ["processInstanceId"],
  components: {
    Network
  },
  mounted() {
    this.loadHistoryDurationDiagram();
  },
  watch: {
    fullscreen: function (val) {
      if (val == false) {
        this.toggleback();
      }
    },
    processInstanceId() {
      this.loadHistoryDurationDiagram();
    }
  },
  methods: {
    fullscreenChange(fullscreen) {
      this.fullscreen = fullscreen;
    },
    setVertical() {
      this.network = {
        ...this.network,
        options: {
          ...this.network.options,
          layout: {
            ...this.network.options.layout,
            hierarchical: !this.network.options.layout.hierarchical
          }
        }
      };
      this.$nextTick(() => this.fitNetwork());
    },
    toggle() {
      this.$refs["fullscreen"].toggle(); // recommended
      // this.defaultstyle = "height: 1200px";
    },
    toggleback() {
      this.$refs["fullscreen"].toggle(); // recommended
      // this.defaultstyle = "height: 600px";
    },
    returnShape: function (item) {
      if (!item) {
        return "triangle";
      }
      if (item.indexOf("Event") !== -1 || item.indexOf("event") !== -1) {
        return "dot";
      }
      if (item.indexOf("Task") !== -1 || item.indexOf("task") !== -1) {
        return "box";
      }
      if (item.indexOf("Gateway") !== -1 || item.indexOf("gateway") !== -1) {
        return "diamond";
      }
      if (item.indexOf("Boundary") !== -1 || item.indexOf("boundary") !== -1) {
        return "ellipse";
      } else return "triangle";
    },
    returnColor: function (item) {
      if (!item) {
        return undefined;
      }
      if (item.indexOf("Event") !== -1 || item.indexOf("event") !== -1) {
        return "#83d0f2";
      }
      if (item.indexOf("Task") !== -1 || item.indexOf("task") !== -1) {
        return "#06d00a";
      }
      if (item.indexOf("Gateway") !== -1 || item.indexOf("gateway") !== -1) {
        return "#7ba4fb";
      }
      if (item.indexOf("Boundary") !== -1 || item.indexOf("boundary") !== -1) {
        return "#dddddd";
      }
    },

    returnLabel: function (item) {
      const name = item.id || item.activityId || "";
      const duration = this.formatDuration(item.durationInMillis);
      return duration ? name + "\n" + duration : name;
    },
    formatDuration(durationInMillis) {
      const duration = Number(durationInMillis);

      if (!Number.isFinite(duration) || duration < 0) {
        return "";
      }
      if (duration < 1000) {
        return Math.round(duration) + " ms";
      }
      if (duration < 60000) {
        return Math.round((duration / 1000) * 100) / 100 + " sec";
      }

      return Math.round((duration / 60000) * 100) / 100 + " min";
    },
    convertDateToHumanStyle: function (date) {
      if (!date) {
        return "";
      }
      var cal = this.$momenttrue(date).format("DD.MM.YYYY, H:mm:ss");

      return cal;
    },

    getIdByInstance(item) { },
    async loadHistoryDurationDiagram() {
      const activitiesUrl =
        "/history/activity-instance?&&sortBy=startTime&&sortOrder=asc&&processInstanceId=" +
        this.processInstanceId;
      const detailsUrl =
        "/history/detail?historicVariableUpdates=true&sortBy=time&sortOrder=desc&processInstanceId=" +
        this.processInstanceId;

      try {
        const [activitiesResponse, detailsResponse] = await Promise.all([
          this.$api().get(activitiesUrl),
          this.$api().get(detailsUrl)
        ]);

        this.activities = activitiesResponse.data || [];
        this.historyDetails = (detailsResponse.data || []).slice(-100);
        this.updateNetworkData();
      } catch (error) {
        console.error("Failed to load history duration diagram", error);
        this.activities = [];
        this.historyDetails = [];
        this.network = {
          ...this.network,
          nodes: [],
          edges: []
        };
      }
    },
    updateNetworkData() {
      const nodes = [];
      const edges = [];
      const activityNodeByInstanceId = new Map();

      for (var i = 0; i < this.activities.length; i++) {
        var currenti = i + 1;
        var nexti = i + 2;
        var activity = this.activities[i];

        nodes.push({
          id: currenti,
          shape: this.returnShape(activity.activityType),
          color: this.returnColor(activity.activityType),
          margin: 5,
          label: this.returnLabel(activity)
        });

        if (activity.id) {
          activityNodeByInstanceId.set(activity.id, currenti);
        }

        if (nexti <= this.activities.length) {
          edges.push({
            id: currenti,
            from: currenti,
            label: this.convertDateToHumanStyle(activity.endTime),
            length: 135,
            to: nexti,
            arrows: "to"
          });
        }
      }

      for (var detailIndex = 0; detailIndex < this.historyDetails.length; detailIndex++) {
        var currentDetail = detailIndex + 1;
        var detailNodeId = currentDetail + this.activities.length;
        var detail = this.historyDetails[detailIndex];
        var activityNodeId = activityNodeByInstanceId.get(detail.activityInstanceId);

        nodes.push({
          id: detailNodeId,
          font: { multi: "md", size: 11, align: "left" },
          shape: "box",
          color: "#007bff80",
          heightConstraint: { minimum: 30 },
          shapeProperties: { borderDashes: [5, 5] },
          margin: 5,
          size: 40,
          label: this.prepareHistoryDetailsLabel(detail)
        });

        if (activityNodeId) {
          edges.push({
            id: detailNodeId,
            from: activityNodeId,
            length: 300,
            dashes: true,
            color: { color: "grey", opacity: 0.3 },
            arrows: "to",
            to: detailNodeId
          });
        }
      }

      this.network = {
        ...this.network,
        nodes,
        edges
      };
      this.$nextTick(() => this.fitNetwork());
    },
    getHistoryDetails() {
      return this.loadHistoryDurationDiagram();
    },

    prepareHistoryDetailsLabel(item) {
      var time = "*" + this.convertDateToHumanStyle(item.time) + "*";
      var variableName = "*" + (item.variableName || item.fieldId || "n/a") + "*";
      var rawValue = item.value ?? item.textValue ?? item.longValue ?? item.doubleValue ?? "";
      var value = "*" + rawValue + "*";

      if (rawValue instanceof Object == true) {
        value =
          "`\n" +
          JSON.stringify(rawValue)
            .replace(/,/g, ",\n\n")
            .replace(/}/g, "}\n") +
          "`";
      }
      var revision = Number(item.revision || 0);

      var label =
        "Update time: " +
        time +
        "\n" +
        "variable: " +
        variableName +
        "\n" +
        "New value: " +
        value +
        "\n";

      if (revision > 0) {
        label = label + "Revision:" + revision + "\n";
      }

      return label;
    },
    addNodesFromArray() {
      return this.loadHistoryDurationDiagram();
    },
    fitNetwork() {
      this.$refs.network?.instance?.fit?.({ animation: false });
    }
  }
};
</script>

<style>
.events {
  text-align: left;
  height: 70px;
}
.network {
  height: 72vh;
  min-height: 520px;
  max-height: 760px;
}
</style>
