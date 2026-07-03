export function createDiagramViewer(container, dependencies) {
  const { ViewerClass } = dependencies;

  return new ViewerClass({
    container
  });
}

export function createDiagramModeler(container, propertiesParent, dependencies) {
  const { ModelerClass, camundaModdle, modules } = dependencies;

  return new ModelerClass({
    container,
    propertiesPanel: {
      parent: propertiesParent
    },
    additionalModules: [
      modules.propertiesPanel,
      modules.bpmnPropertiesProvider,
      modules.camundaPlatformPropertiesProvider,
      modules.camundaPlatformBehaviors
    ],
    moddleExtensions: {
      camunda: camundaModdle
    }
  });
}

export async function importDiagramXml(viewer, xml) {
  return viewer.importXML(xml);
}

export async function saveDiagramXml(viewer) {
  const { xml } = await viewer.saveXML({ format: true });
  return xml;
}

export async function saveDiagramSvg(viewer) {
  const { svg } = await viewer.saveSVG({ format: true });
  return svg;
}

export function destroyDiagram(viewer) {
  if (viewer && typeof viewer.destroy === "function") {
    viewer.destroy();
  }
}
