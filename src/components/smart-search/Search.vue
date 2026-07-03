<template>
  <div>
    <SimpleSuggest
      v-model="chosen"
      :list="getList"
      :filter-by-query="true"
      :loading="ready === false"
      placeholder="Search anything"
      @select="onSelect"
    />
    <b-button
      v-show="false"
      v-shortkey="['alt','p']"
      @shortkey="showOnP = !showOnP"
      @click="showOnP = !showOnP"
    >Open Modal</b-button>

    <b-modal no-fade hide-header hide-footer centered @shown="focusMyElement" v-model="showOnP">
      <SimpleSuggest
        ref="suggest"
        @select="onSelect"
        v-model="chosen"
        :list="getList"
        :filter-by-query="true"
      >
        :loading="ready === false"
        placeholder="Search anything"
        input-class="specialWidth"
      </SimpleSuggest>
    </b-modal>
  </div>
</template>


<script>
import * as URLs from "@/config/camundasUrl";
import SimpleSuggest from "@/ui/SimpleSuggest.vue";

export default {
  components: {
    SimpleSuggest
  },
  data() {
    return {
      chosen: "",
      ready: null,
      showOnP: false
    };
  },
  methods: {
    focusMyElement(e) {
      this.chosen = "";
      this.$refs.suggest?.focus?.();
    },
    tryCheckBusinessKeyInRuntime(businessKey) {
      var vm = this;
      var arrayOfProcess = [];
      return new Promise(function(resolve, reject) {
        vm.$api()
          .get("/process-instance?businessKeyLike=" + businessKey)
          .then(response => {
            if (response.data && response.data.length > 0) {
              response.data.forEach(element => {
                arrayOfProcess.push(
                  "Runtime " + element.id + " (" + businessKey + ")"
                );
              });
            }
            resolve(arrayOfProcess);
          })
          .catch(error => {
            reject();
          });
      });
    },
    tryCheckBusinessKeyInHistory(businessKey) {
      var vm = this;
      var arrayOfProcess = [];
      return new Promise(function(resolve, reject) {
        vm.$api()
          .get(
            "/history/process-instance?processInstanceBusinessKeyLike=" +
              businessKey
          )
          .then(response => {
            if (response.data && response.data.length > 0) {
              response.data.forEach(element => {
                var elemToAdd =
                  "History " +
                  businessKey +
                  ", " +
                  vm.convertDateToHumanStyle(element.startTime) +
                  ", process " +
                  element.processDefinitionId +
                  " id #" +
                  element.id +
                  "#";
                arrayOfProcess.push(elemToAdd);
              });
            }
            resolve(arrayOfProcess);
          })
          .catch(error => {
            reject();
          });
      });
    },
    convertDateToHumanStyle: function(date) {
      var rel = this.$momenttrue(date)
        .startOf("second")
        .fromNow();

      var cal = this.$momenttrue(date).format("MMMM Do YYYY, H:mm:ss");

      var output = rel + " (" + cal + ") ";
      return output;
    },
    tryCheckInstanceInRuntime(instance) {
      var vm = this;
      var arrayOfProcess = [];
      return new Promise(function(resolve, reject) {
        vm.$api()
          .get("/process-instance?processInstanceIds=" + instance)
          .then(response => {
            if (response.data && response.data.length > 0) {
              response.data.forEach(element => {
                arrayOfProcess.push(
                  "Runtime " + element.id + " (" + element.definitionId + ")"
                );
              });
            }
            resolve(arrayOfProcess);
          })
          .catch(error => {
            reject();
          });
      });
    },
    tryCheckInstanceInHistory(instance) {
      var vm = this;
      var arrayOfProcess = [];
      return new Promise(function(resolve, reject) {
        vm.$api()
          .get("/history/process-instance?processInstanceIds=" + instance)
          .then(response => {
            if (response.data && response.data.length > 0) {
              response.data.forEach(element => {
                arrayOfProcess.push(
                  "History id #" +
                    element.id +
                    "# (" +
                    element.processDefinitionId +
                    ", started " +
                    vm.convertDateToHumanStyle(element.startTime) +
                    ")"
                );
              });
            }
            resolve(arrayOfProcess);
          })
          .catch(error => {
            reject();
          });
      });
    },
    tryCheckProcessDefinition(definition) {
      var vm = this;
      var arrayOfAnswers = [];
      return new Promise((resolve, reject) => {
        vm.$api()
          .get(
            "/process-definition?sortBy=version&sortOrder=desc&keyLike=" +
              definition
          )
          .then(response => {
            if (response.data && response.data.length > 0) {
              response.data.forEach(element => {
                arrayOfAnswers.push(
                  "ProcessDefinition " +
                    element.id +
                    " (" +
                    element.key +
                    ", " +
                    element.name +
                    ")"
                );
              });
            }
            resolve(arrayOfAnswers);
          })
          .catch(error => {
            reject();
          });
      });
    },
    tryCheckUrl(url) {
      var possibleUrl = URLs.generatePossibleUrl();
      var matchedUrl = [];
      possibleUrl.forEach(element => {
        if (element.includes(url)) {
          matchedUrl.push(element);
        }
      });
      return matchedUrl;
    },

    getList(inputValue) {
      this.ready = false;
      var vm = this;
      var array = [];
      return new Promise((resolve, reject) => {
        vm.tryCheckBusinessKeyInRuntime(inputValue)
          .then(response => {
            array.push.apply(array, vm.tryCheckUrl(inputValue));
            array.push.apply(array, response);
            vm.tryCheckBusinessKeyInHistory(inputValue)
              .then(responseHistory => {
                array.push.apply(array, responseHistory);
                vm.tryCheckInstanceInRuntime(inputValue).then(
                  responseInstanceRuntime => {
                    array.push.apply(array, responseInstanceRuntime);
                    vm.tryCheckInstanceInHistory(inputValue).then(
                      responseInstanceHistory => {
                        array.push.apply(array, responseInstanceHistory);

                        vm.tryCheckProcessDefinition(inputValue).then(
                          responseDefinition => {
                            array.push.apply(array, responseDefinition);
                            vm.ready = true;
                            resolve(array);
                          }
                        );
                      }
                    );
                  }
                );
              })
              .catch(() => {
                this.ready = true;
                resolve(vm.tryCheckUrl(inputValue));
              });
          })
          .catch(() => {
            this.ready = true;
            resolve(vm.tryCheckUrl(inputValue));
          });
      });
    },
    onSelect(suggest) {
      this.showOnP = false;
      if (suggest) {
        var firstSpace = suggest.indexOf(" ");
        var secondSpace = suggest.indexOf(" ", firstSpace + 1);
        var myString = suggest.substring(firstSpace + 1, secondSpace);
        if (suggest.includes("Runtime")) {
          this.$router.push({
            name: "processdetail",
            params: { processInstanceId: myString }
          });
        } else if (suggest.includes("id")) {
          var id = suggest.indexOf("#");

          var secondSpaceId = suggest.indexOf("#", id + 1);

          id = suggest.substring(id + 1, secondSpaceId);
          this.$router.push({
            name: "processdetail",
            params: { processInstanceId: id }
          });
        } else if (suggest.includes("ProcessDefinition")) {
          this.$router.push({
            name: "definition",
            params: { definitionId: myString }
          });
        } else if (suggest.includes("http")) {
          this.$emit("setUrlFromSearch", suggest);
        }
      }
    }
  }
};
</script>

<style>
.simple-suggest.designed,
.simple-suggest.designed * {
  width: 470px;
}
.simple-suggest.designed .suggestions .suggest-item,
.simple-suggest.designed .suggestions .misc-item {
  padding: 5px 10px;
  border-bottom: solid 1px #d4d4d4;
  font-size: 14px;
}
.specialWidth {
  width: 500px;
}
</style>
