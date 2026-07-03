<template>
  <div id="sendMessage">
    <h3>Send message</h3>
    <b-card id="historyDetails" bg-variant="light" text-variant="dark">
      <b-form inline>
        <b-form-select
          v-model="selectedMessage"
          :options="messageList"
          class="mb-2 mr-sm-2 mb-sm-0"
        />
        <b-button @click="sendMessage" variant="outline-danger">Send</b-button>
        <br>
      </b-form>
    </b-card>
  </div>
</template>

<script>
import { parseCamundaBpmnXml } from "@/bpmn/camundaModdle";

export default {
  name: "SendMessage",
  props: ["processInstanceId", "processDefinitionId"],
  data() {
    return {
      definitionInXml: "",
      selectedMessage: "",
      messageList: []
    };
  },
  computed: {
    profile() {
      return this.$store.getters.getProfile;
    },
    isAuthenticated() {
      return this.$store.getters.isAuthenticated;
    }
  },
  mounted() {
    setTimeout(() => {
      this.getMessageList();
    }, 300);
  },
  methods: {
    getMessageList() {
      this.$api()
        .get("/process-definition/" + this.processDefinitionId + "/xml")
        .then(response => {
          this.definitionInXml = response.data.bpmn20Xml;
          this.readModel();
        });
    },
    async readModel() {
      var vm = this;
      vm.activityList = [];
      const definitions = await parseCamundaBpmnXml(this.definitionInXml);
      this.moddle = definitions;
      definitions.rootElements.forEach(element => {
        if (element.$type == "bpmn:Process" && element.isExecutable == true) {
          element.flowElements.forEach(flowelement => {
            if (
              flowelement.$type &&
              flowelement.messageRef &&
              flowelement.messageRef.name
            ) {
              vm.messageList.push(flowelement.messageRef.name);
            }
          });
        }
      });
    },
    sendMessage() {
      var sendObj = {
        messageName: this.selectedMessage,
        processInstanceId: this.processInstanceId,
        resultEnabled: true
      };
      this.$api()
        .post("/message", sendObj)
        .then(response => {
          this.$notify({
            group: "foo",
            title: "Sended!",
            text: "Message" + this.selectedMessage + " sended" + response.data,
            type: "success"
          });
        })
        .catch(error => {
          this.$notify({
            group: "foo",
            title: "Not sended!",
            text: error,
            type: "error"
          });
        });
    }
  }
};
</script>

<style>
</style>
