/* eslint-disable no-unused-vars */
import { createRouter, createWebHashHistory } from 'vue-router';
import MigrationView from '@/views/MigrationView.vue';
import IncidentView from '@/views/IncidentView.vue';
import HistoryView from '@/views/HistoryView.vue';
import StreamView from '@/views/StreamView.vue';
import DetailProcessView from '@/views/DetailProcessView.vue';
import DetailDiagramView from '@/views/DetailDiagramView.vue';
import EmbeddedDiagramView from '@/views/EmbeddedDiagramView.vue';
import OldActivityView from '@/views/OldActivityView.vue';
import TaskListView from '@/views/TaskListView.vue';
import NewDiagramView from '@/views/NewDiagramView.vue';
import Baseurl from '@/components/BaseUrl.vue';
import DicisionDiagram from '@/components/decisions/DecisionDiagram.vue';
import LoginView from '@/views/LoginView.vue';
import DefinitionDetailView from '@/views/DefinitionDetailView.vue';
import DeployView from '@/views/DeployView.vue';
import DeployTableBPMaSView from '@/views/DeployTableBPMaSView.vue';
import DeployHelpView from '@/views/DeployHelpView.vue';
import WhatIsThisView from '@/views/WhatIsThisView.vue';
import DecisionDefinitionsView from '@/views/DecisionDefinitionsView.vue';
import Home from '@/views/Home.vue';
import store from '@/store/store';
import DeployTableView from '@/views/DeployTableView.vue';
import HelpView from '@/views/HelpView.vue';
import ReportView from '@/views/ReportView.vue';
import SelectedTaskView from '@/views/SelectedTaskView.vue';
import BatchView from '@/views/BatchView.vue';
import StartDefinitionView from '@/views/StartDefinitionView.vue';
import ComplexMigrationView from '@/views/ComplexMigrationView.vue';
import GroupsView from '@/views/GroupsView.vue';
import UsersView from '@/views/UsersView.vue';
import SystemsView from '@/views/SystemsView.vue';
import VariableBatchModifyView from '@/views/VariableBatchModifyView.vue';
import BatchModificationView from '@/views/BatchModificationView.vue';

const ifNotAuthenticated = (to, from, next) => {
  if (!store.getters.isAuthenticated) {
    next();
    return;
  }
  next('/');
};

function hasQueryParams(route) {
  return Boolean(route.query.baseurl);
}

function firstQueryValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/tasklist', name: 'tasklist', component: TaskListView },
    { path: '/variablebatch', name: 'variablebatch', component: VariableBatchModifyView },
    { path: '/modificationbatch', name: 'modificationbatch', component: BatchModificationView },
    { path: '/migration', name: 'migration', component: MigrationView },
    { path: '/decisiondefinitions', name: 'decisiondefinitions', component: DecisionDefinitionsView },
    { path: '/login', name: 'login', component: LoginView, beforeEnter: ifNotAuthenticated },
    { path: '/settings', name: 'settings', component: Baseurl },
    { path: '/bpmasservice/newdiagram/:diagramKey', name: 'newdiagram', props: true, component: NewDiagramView },
    { path: '/bpmasservice/wtf', name: 'whatisthis', component: WhatIsThisView },
    { path: '/bpmasservice/deploy/', name: 'newdiagram-deploy', component: DeployView },
    { path: '/bpmasservice/deployhelp/:diagramId', name: 'deployhelp', props: true, component: DeployHelpView },
    { path: '/bpmasservice/deploytable/', name: 'deploytable-bpmas', component: DeployTableBPMaSView },
    { path: '/history', name: 'history', component: HistoryView },
    { path: '/', name: 'home', component: Home },
    { path: '/incident', name: 'incident', component: IncidentView },
    { path: '/stream', name: 'stream', component: StreamView },
    { path: '/help', name: 'help', component: HelpView },
    { path: '/oldactivity', name: 'oldactivity', component: OldActivityView },
    { path: '/embedded', name: 'embedded', component: EmbeddedDiagramView },
    { path: '/batch', name: 'batch', component: BatchView },
    { path: '/ComplexMigration', name: 'ComplexMigration', component: ComplexMigrationView },
    { path: '/processdetail/:processInstanceId', name: 'processdetail', props: true, component: DetailProcessView },
    { path: '/decisiondiagram/:decisionId', name: 'decisiondiagram', props: true, component: DicisionDiagram },
    { path: '/diagram/:diagramKey', name: 'diagram', props: true, component: DetailDiagramView },
    { path: '/definition/:definitionId', name: 'definition', props: true, component: DefinitionDetailView },
    { path: '/task/:taskId', name: 'task', props: true, component: SelectedTaskView },
    { path: '/deploytable/', name: 'deploytable', component: DeployTableView },
    { path: '/report/', name: 'report', component: ReportView },
    { path: '/startdefinition/', name: 'startdefinition', component: StartDefinitionView },
    { path: '/systems/', name: 'systems', component: SystemsView },
    { path: '/groups', name: 'groups', component: GroupsView },
    { path: '/users', name: 'users', component: UsersView }
  ]
});

router.beforeEach((to, from, next) => {
  if (!hasQueryParams(to) && hasQueryParams(from)) {
    next({
      path: to.path,
      query: {
        ...to.query,
        baseurl: firstQueryValue(from.query.baseurl)
      },
      params: to.params
    });
  } else {
    next();
  }
});

export default router;
