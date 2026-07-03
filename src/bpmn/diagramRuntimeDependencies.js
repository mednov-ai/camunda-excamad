import BpmnViewer from "bpmn-js/lib/NavigatedViewer";
import BpmnModeler from "bpmn-js/lib/Modeler";
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule
} from "bpmn-js-properties-panel";
import CamundaPlatformBehaviors from "camunda-bpmn-js-behaviors/lib/camunda-platform";
import camundaModdle from "camunda-bpmn-moddle/resources/camunda.json";

export const bpmnRuntimeDependencies = {
  ViewerClass: BpmnViewer,
  ModelerClass: BpmnModeler,
  camundaModdle,
  modules: {
    propertiesPanel: BpmnPropertiesPanelModule,
    bpmnPropertiesProvider: BpmnPropertiesProviderModule,
    camundaPlatformPropertiesProvider: CamundaPlatformPropertiesProviderModule,
    camundaPlatformBehaviors: CamundaPlatformBehaviors
  }
};
