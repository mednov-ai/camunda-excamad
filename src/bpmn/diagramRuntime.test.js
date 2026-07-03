import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createDiagramModeler,
  createDiagramViewer,
  destroyDiagram,
  importDiagramXml,
  saveDiagramSvg,
  saveDiagramXml
} from "./diagramRuntime.js";

class FakeViewer {
  constructor(options) {
    this.options = options;
    this.destroyed = false;
    this.importedXml = "";
    this.savedXmlOptions = null;
    this.savedSvgOptions = null;
  }

  async importXML(xml) {
    this.importedXml = xml;
    return { warnings: ["warning"] };
  }

  async saveXML(options) {
    this.savedXmlOptions = options;
    return { xml: "<bpmn:definitions />" };
  }

  async saveSVG(options) {
    this.savedSvgOptions = options;
    return { svg: "<svg />" };
  }

  destroy() {
    this.destroyed = true;
  }
}

test("creates a BPMN viewer without properties panel configuration", () => {
  const container = { id: "canvas" };
  const viewer = createDiagramViewer(container, { ViewerClass: FakeViewer });

  assert.equal(viewer.options.container, container);
  assert.equal(viewer.options.propertiesPanel, undefined);
  assert.equal(viewer.options.additionalModules, undefined);
});

test("creates a BPMN modeler with Camunda Platform modules and moddle extension", () => {
  const container = { id: "canvas" };
  const propertiesParent = { id: "properties" };
  const modules = {
    propertiesPanel: { name: "propertiesPanel" },
    bpmnPropertiesProvider: { name: "bpmnPropertiesProvider" },
    camundaPlatformPropertiesProvider: { name: "camundaPlatformPropertiesProvider" },
    camundaPlatformBehaviors: { name: "camundaPlatformBehaviors" }
  };
  const camundaModdle = { name: "camundaModdle" };

  const modeler = createDiagramModeler(container, propertiesParent, {
    ModelerClass: FakeViewer,
    modules,
    camundaModdle
  });

  assert.equal(modeler.options.container, container);
  assert.deepEqual(modeler.options.propertiesPanel, { parent: propertiesParent });
  assert.deepEqual(modeler.options.additionalModules, [
    modules.propertiesPanel,
    modules.bpmnPropertiesProvider,
    modules.camundaPlatformPropertiesProvider,
    modules.camundaPlatformBehaviors
  ]);
  assert.deepEqual(modeler.options.moddleExtensions, { camunda: camundaModdle });
});

test("uses promise based import and save APIs", async () => {
  const viewer = new FakeViewer({});

  const importResult = await importDiagramXml(viewer, "<xml />");
  const xml = await saveDiagramXml(viewer);
  const svg = await saveDiagramSvg(viewer);

  assert.deepEqual(importResult, { warnings: ["warning"] });
  assert.equal(viewer.importedXml, "<xml />");
  assert.deepEqual(viewer.savedXmlOptions, { format: true });
  assert.deepEqual(viewer.savedSvgOptions, { format: true });
  assert.equal(xml, "<bpmn:definitions />");
  assert.equal(svg, "<svg />");
});

test("destroyDiagram tears down an existing viewer and ignores empty values", () => {
  const viewer = new FakeViewer({});

  destroyDiagram(viewer);
  destroyDiagram(null);

  assert.equal(viewer.destroyed, true);
});
