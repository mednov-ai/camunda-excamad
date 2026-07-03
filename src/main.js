import { createApp, h } from 'vue';
import App from './App.vue';
import router from './router/router';
import store from './store/store';
import api from '@/api/api';
import history from '@/components/History.vue';
import noConnect from '@/components/noConnect.vue';
import BaseUrl from '@/components/BaseUrl.vue';
import Diagram from '@/components/Diagram.vue';
import ActivityList from '@/components/ActivityList.vue';
import Login from '@/components/Login.vue';
import VariableModify from '@/components/VariableModify.vue';
import OldActivity from '@/components/OldActivity.vue';
import DetailDiagram from '@/components/detail-process-instance/DetailDiagram.vue';
import DeployHelp from '@/components/bpmasservice/DeployHelp.vue';
import EmbeddedDiagram from '@/components/EmbeddedDiagram.vue';
import FormEditor from '@/components/bpmasservice/FormEditor.vue';
import Deploy from '@/components/bpmasservice/Deploy.vue';
import VariableList from '@/components/VariablesList.vue';
import JiraStat from '@/components/jira-integration/JiraStat.vue';
import DetailProcessStat from '@/components/detail-process-instance/DetailProcessStat.vue';
import ExternalTask from '@/components/detail-process-instance/ExternalTask.vue';
import NewDiagram from '@/components/bpmasservice/NewDiagram.vue';
import PrepareCurrentStateAndDiagram from '@/components/detail-process-instance/PrepareCurrentStateAndDiagram.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import VueJsonPretty from 'vue-json-pretty';
import DetailIncident from '@/components/detail-process-instance/DetailIncident.vue';
import Notifications from '@/plugins/notifications';
import AuditReader from '@/components/detail-process-instance/AuditReader.vue';
import DecisionGrid from '@/components/decisions/DecisionGrid.vue';
import Tasklist from '@/components/tasklist/TaskList.vue';
import DefinitionMetadata from '@/components/detail-process-definition/DefinitionMetadata.vue';
import DefinitionIncidents from '@/components/detail-process-definition/DefinitionIncidents.vue';
import GeneratedForm from '@/forms/generatedForm';
import StartDefinition from '@/components/detail-process-definition/StartDefinition.vue';
import TaskDetails from '@/components/tasklist/TaskDetails.vue';
import Clipboard from '@/plugins/clipboard';
import DefinitionHistoryInstances from '@/components/detail-process-definition/DefinitionHistoryInstances.vue';
import DefinitionDiagram from '@/components/detail-process-definition/DefinitionDiagram.vue';
import DefinitionRunTimeInstances from '@/components/detail-process-definition/DefinitionRunTimeInstances.vue';
import IncidentsHistory from '@/components/detail-process-instance/IncidentsHistory.vue';
import DetailJobs from '@/components/detail-process-instance/DetailJobs.vue';
import ComplexMigration from '@/components/migration/ComplexMigration.vue';
import BatchModification from '@/components/modification/BatchModification.vue';
import VariableSingleEdit from '@/components/VariableSingleEdit.vue';
import VariableSingleAdd from '@/components/VariableSingleAdd.vue';
import VariableSingleDelete from '@/components/VariableSingleDelete.vue';
import BatchTable from '@/components/batch/BatchTable.vue';
import Systems from '@/components/systems/Systems.vue';
import TaskQuery from '@/components/tasklist/TaskQuery.vue';
import Search from '@/components/smart-search/Search.vue';
import DefinitionDetailView from '@/views/DefinitionDetailView.vue';
import DeployTableBPMAS from '@/components/bpmasservice/DeployTable.vue';
import { GChart } from '@/ui/googleChart';
import CommitFile from '@/components/bitbucket-integration/CommitFile.vue';
import networkDiagram from '@/components/detail-process-instance/NetworkDiagram.vue';
import fieldTCEDataPicker from '@/components/tasklist/customFields/fieldTCEDataPicker.vue';
import fieldTCEJson from '@/components/tasklist/customFields/fieldTCEJson.vue';
import fieldTCETable from '@/components/tasklist/customFields/fieldTCETable.vue';
import WhatIsThis from '@/components/bpmasservice/WhatIsThis.vue';
import DecisionDetails from '@/components/decisions/DecisionDetails.vue';
import DecisionDiagram from '@/components/decisions/DecisionDiagram.vue';
import DecisionItem from '@/components/decisions/DecisionItem.vue';
import FriendlyIframe from '@/ui/FriendlyIframe.vue';
import SuggestPlugin from '@/plugins/suggestPlugin';
import HistoryDetails from '@/components/detail-process-instance/HistoryDetails.vue';
import { ClientTable } from '@/ui/clientTable';
import MoveToken from '@/components/detail-process-instance/MoveToken.vue';
import { AtomSpinner } from 'epic-spinners';
import SendMessage from '@/components/detail-process-instance/SendMessage.vue';
import DeployTable from '@/components/misc/DeployTable.vue';
import Report from '@/components/misc/Report.vue';
import SelectedTask from '@/components/tasklist/SelectedTask.vue';
import StartDefinitions from '@/components/StartDefinitions.vue';
import TheFooter from '@/components/footer/TheFooter.vue';
import Help from '@/components/help/Help.vue';
import Groups from '@/components/groups/Groups.vue';
import Users from '@/components/groups/Users.vue';
import JsonEditor from '@/ui/JsonEditor.vue';
import ScrollTo from '@/plugins/scrollTo';
import Shortkey from '@/plugins/shortkey';
import fullscreen from '@/plugins/fullscreen';
import * as BootstrapVueNext from 'bootstrap-vue-next';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css';
import 'dmn-js/dist/assets/diagram-js.css';
import 'dmn-js/dist/assets/dmn-js-drd.css';
import 'dmn-js/dist/assets/dmn-js-decision-table.css';
import 'dmn-js/dist/assets/dmn-js-decision-table-controls.css';
import 'dmn-js/dist/assets/dmn-js-literal-expression.css';
import 'dmn-js/dist/assets/dmn-js-boxed-expression.css';
import 'dmn-js/dist/assets/dmn-js-boxed-expression-controls.css';
import 'dmn-js/dist/assets/dmn-js-shared.css';
import 'dmn-js/dist/assets/dmn-font/css/dmn.css';
import 'dmn-js/dist/assets/dmn-font/css/dmn-codes.css';
import 'dmn-js/dist/assets/dmn-font/css/dmn-embedded.css';
import 'vis-network/styles/vis-network.css';

import moment from 'moment';
moment().locale('ru');

const app = createApp(App);

app.use(router);
app.use(store);
app.use(BootstrapVueNext.createBootstrap());
app.use(SuggestPlugin);
app.use(ScrollTo);
app.use(Shortkey);
app.use(GeneratedForm);
app.use(Notifications);
app.use(Clipboard);
app.use(ClientTable);
app.use(fullscreen);

Object.entries(BootstrapVueNext.Components).forEach(([name, component]) => {
  app.component(name, component);
});

Object.entries(BootstrapVueNext.Directives).forEach(([name, directive]) => {
  const directiveName = name
    .replace(/^vB/, 'b-')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
  app.directive(directiveName, directive);
});

app.component('b-btn', BootstrapVueNext.BButton);
app.component('b-input-group-append', {
  name: 'BInputGroupAppendCompat',
  render() {
    return h('span', { class: 'input-group-text' }, this.$slots.default?.());
  }
});
app.component('b-input-group-prepend', {
  name: 'BInputGroupPrependCompat',
  render() {
    return h('span', { class: 'input-group-text' }, this.$slots.default?.());
  }
});
app.component('b-pagination-nav', {
  name: 'BPaginationNavCompat',
  props: {
    modelValue: { type: Number, default: 1 },
    numberOfPages: { type: [Number, String], default: 1 },
    align: { type: String, default: undefined },
    size: { type: String, default: undefined }
  },
  emits: ['update:modelValue'],
  render() {
    return h(BootstrapVueNext.BPagination, {
      modelValue: this.modelValue,
      totalRows: Number(this.numberOfPages) || 1,
      perPage: 1,
      align: this.align,
      size: this.size,
      'onUpdate:modelValue': value => this.$emit('update:modelValue', value)
    });
  }
});
app.component('notifications', {
  name: 'NotificationsCompat',
  render() {
    return null;
  }
});

const components = {
  'start-definition': StartDefinition,
  'definition-history-instances': DefinitionHistoryInstances,
  'incidents-history': IncidentsHistory,
  'detail-jobs': DetailJobs,
  'complex-migration': ComplexMigration,
  'batch-modification': BatchModification,
  'variable-single-edit': VariableSingleEdit,
  'variable-single-add': VariableSingleAdd,
  'variable-single-delete': VariableSingleDelete,
  'batch-table': BatchTable,
  systems: Systems,
  'task-query': TaskQuery,
  search: Search,
  'definition-detail': DefinitionDetailView,
  'move-token': MoveToken,
  'atom-spinner': AtomSpinner,
  'send-message': SendMessage,
  'deploy-table': DeployTable,
  report: Report,
  selectedTask: SelectedTask,
  'start-definitions': StartDefinitions,
  'the-footer': TheFooter,
  help: Help,
  groups: Groups,
  users: Users,
  fieldTCEDataPicker,
  fieldTCEJson,
  fieldTCETable,
  'definition-diagram': DefinitionDiagram,
  'deploy-table-bpmas': DeployTableBPMAS,
  'history-details': HistoryDetails,
  'decision-details': DecisionDetails,
  'definition-runtime-instances': DefinitionRunTimeInstances,
  'decision-diagram': DecisionDiagram,
  'decision-item': DecisionItem,
  'commit-file': CommitFile,
  'audit-reader': AuditReader,
  'friendly-iframe': FriendlyIframe,
  'decision-grid': DecisionGrid,
  'what-is-this': WhatIsThis,
  'definition-metadata': DefinitionMetadata,
  'definition-incidents': DefinitionIncidents,
  'new-diagram': NewDiagram,
  'deploy-help': DeployHelp,
  deploy: Deploy,
  login: Login,
  'jira-stat': JiraStat,
  tasklist: Tasklist,
  'task-details': TaskDetails,
  'base-url': BaseUrl,
  'variable-list': VariableList,
  history,
  detaildiagram: DetailDiagram,
  embeddeddiagram: EmbeddedDiagram,
  'network-diagram': networkDiagram,
  detailprocessstat: DetailProcessStat,
  'external-task': ExternalTask,
  noConnect,
  currentstate: PrepareCurrentStateAndDiagram,
  Diagram,
  'form-editor': FormEditor,
  oldactivity: OldActivity,
  'detail-incident': DetailIncident,
  'acitivity-list': ActivityList,
  'variables-modify': VariableModify,
  'font-awesome-icon': FontAwesomeIcon,
  VueJsonPretty,
  JsonEditor,
  GChart
};

Object.entries(components).forEach(([name, component]) => {
  app.component(name, component);
});

app.config.globalProperties.$api = api;
app.config.globalProperties.$momenttrue = moment;

const vm = app.mount('#app');
globalThis.vm = vm;

export function apii() {
  return api;
}
