import { BpmnModdle } from "bpmn-moddle";
import camundaModdle from "camunda-bpmn-moddle/resources/camunda.json";

export function createCamundaBpmnModdle() {
  return new BpmnModdle({ camunda: camundaModdle });
}

export async function parseCamundaBpmnXml(xml) {
  const { rootElement } = await createCamundaBpmnModdle().fromXML(xml);
  return rootElement;
}
