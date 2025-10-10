import '@babel/polyfill';
import { createApp, configureCompat } from 'vue';
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
import Notifications from 'vue-notification';
import AuditReader from '@/components/detail-process-instance/AuditReader.vue';
import DecisionGrid from '@/components/decisions/DecisionGrid.vue';
import Tasklist from '@/components/tasklist/TaskList.vue';
import DefinitionMetadata from '@/components/detail-process-definition/DefinitionMetadata.vue';
import DefinitionIncidents from '@/components/detail-process-definition/DefinitionIncidents.vue';
import VueFormGenerator from 'vue-form-generator';
import StartDefinition from '@/components/detail-process-definition/StartDefinition.vue';
import TaskDetails from '@/components/tasklist/TaskDetails.vue';
import VueClipboard from 'vue-clipboard2';
import DefinitionHistoryInstances from '@/components/detail-process-definition/DefinitionHistoryInstances.vue';
import DefinitionDiagram from '@/components/detail-process-definition/DefinitionDiagram.vue';
import DefinitionRunTimeInstances from '@/components/detail-process-definition/DefinitionRunTimeInstances.vue';
import IncidentsHistory from '@/components/detail-process-instance/IncidentsHistory.vue';
import DetailJobs from '@/components/detail-process-instance/DetailJobs.vue';
import ComplexMigration from '@/components/migration/ComplexMigration.vue';
import BatchModification from '@/components/modification/BatchModification.vue';
import VariableSingleEidt from '@/components/VariableSingleEdit.vue';
import VariableSingleAdd from '@/components/VariableSingleAdd.vue';
import VariableSingleDelete from '@/components/VariableSingleDelete.vue';
import BatchTable from '@/components/batch/BatchTable.vue';
import Systems from '@/components/systems/Systems.vue';
import TaskQuery from '@/components/tasklist/TaskQuery.vue';
import Search from '@/components/smart-search/Search.vue';
import DefinitionDetailView from '@/views/DefinitionDetailView.vue';
import DeployTableBPMAS from '@/components/bpmasservice/DeployTable.vue';
import VueGoogleCharts from 'vue-google-charts';
import CommitFile from '@/components/bitbucket-integration/CommitFile.vue';
import vue2vis from 'vue2vis';
import networkDigaram from '@/components/detail-process-instance/NetworkDiagram.vue';
import fieldTCEDataPicker from '@/components/tasklist/customFields/fieldTCEDataPicker.vue';
import fieldTCEJson from '@/components/tasklist/customFields/fieldTCEJson.vue';
import fieldTCETable from '@/components/tasklist/customFields/fieldTCETable.vue';
import WhatIsThis from '@/components/bpmasservice/WhatIsThis.vue';
import DecisionDetails from '@/components/decisions/DecisionDetails.vue';
import DecisionDiagram from '@/components/decisions/DecisionDiagram.vue';
import DecisionItem from '@/components/decisions/DecisionItem.vue';
import VueFriendlyIframe from 'vue-friendly-iframe';
import vSuggest from 'v-suggest';
import HistoryDetails from '@/components/detail-process-instance/HistoryDetails.vue';
import { ClientTable } from 'vue-tables-2';
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
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import JsonEditor from 'vue-json-edit';
import VueScrollTo from 'vue-scrollto';
import VueShortKey from 'vue-shortkey';
import VueSmartRoute from 'vue-smart-route';
import fullscreen from 'vue-fullscreen';

configureCompat({
  MODE: 2
});

const app = createApp(App);

const components = {
  'start-definition': StartDefinition,
  'task-details': TaskDetails,
  'definition-history-instances': DefinitionHistoryInstances,
  'definition-diagram': DefinitionDiagram,
  'definition-runtime-instances': DefinitionRunTimeInstances,
  'incidents-history': IncidentsHistory,
  'detail-jobs': DetailJobs,
  'complex-migration': ComplexMigration,
  'batch-modification': BatchModification,
  'variable-single-edit': VariableSingleEidt,
  'variable-single-add': VariableSingleAdd,
  'variable-single-delete': VariableSingleDelete,
  'batch-table': BatchTable,
  systems: Systems,
  'task-query': TaskQuery,
  search: Search,
  'definition-detail': DefinitionDetailView,
  'deploy-table-bpmas': DeployTableBPMAS,
  'commit-file': CommitFile,
  'network-diagram': networkDigaram,
  'fieldTCEDataPicker': fieldTCEDataPicker,
  'fieldTCEJson': fieldTCEJson,
  'fieldTCETable': fieldTCETable,
  'what-is-this': WhatIsThis,
  'decision-details': DecisionDetails,
  'decision-diagram': DecisionDiagram,
  'decision-item': DecisionItem,
  'vue-friendly-iframe': VueFriendlyIframe,
  'history-details': HistoryDetails,
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
  'history': history,
  'noConnect': noConnect,
  'base-url': BaseUrl,
  Diagram,
  'acitivity-list': ActivityList,
  login: Login,
  'variables-modify': VariableModify,
  oldactivity: OldActivity,
  detaildiagram: DetailDiagram,
  embeddeddiagram: EmbeddedDiagram,
  'form-editor': FormEditor,
  deploy: Deploy,
  'variable-list': VariableList,
  'jira-stat': JiraStat,
  tasklist: Tasklist,
  'definition-metadata': DefinitionMetadata,
  'definition-incidents': DefinitionIncidents,
  'detailprocessstat': DetailProcessStat,
  'external-task': ExternalTask,
  'new-diagram': NewDiagram,
  'currentstate': PrepareCurrentStateAndDiagram,
  'deploy-help': DeployHelp,
  'font-awesome-icon': FontAwesomeIcon,
  VueJsonPretty,
  'detail-incident': DetailIncident,
  'audit-reader': AuditReader,
  'decision-grid': DecisionGrid
};

Object.entries(components).forEach(([name, component]) => {
  app.component(name, component);
});

app.use(router);
app.use(store);
app.use(BootstrapVue);
app.use(JsonEditor);
app.use(vSuggest);
app.component('vue2vis', vue2vis);
app.use(VueGoogleCharts);
app.use(VueSmartRoute);
app.use(fullscreen);

const moment = require('moment');
moment().locale('ru');

app.use(VueScrollTo);
app.use(VueShortKey);
app.use(VueFormGenerator);
app.use(Notifications);
app.use(VueClipboard);
app.use(ClientTable);

app.config.globalProperties.$api = api;
app.config.globalProperties.$momenttrue = moment;

const vm = app.mount('#app');

globalThis.vm = vm;

export function apii() {
  return api;
}
