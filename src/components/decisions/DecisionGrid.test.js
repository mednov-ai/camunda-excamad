import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { parse } from "@vue/compiler-sfc";

function readDecisionGridDescriptor() {
  const filePath = fileURLToPath(new URL("./DecisionGrid.vue", import.meta.url));
  const source = readFileSync(filePath, "utf8");
  return parse(source).descriptor;
}

async function loadDecisionGridComponent() {
  const descriptor = readDecisionGridDescriptor();
  const script = descriptor.script.content
    .replace(/import\s+[^;]+;\n/g, "")
    .replace("export default", "const component =");
  const moduleSource = [
    "const api = {};",
    script,
    "export default component;"
  ].join("\n");

  return import(`data:text/javascript;base64,${Buffer.from(moduleSource).toString("base64")}`)
    .then(module => module.default);
}

test("initializes decision grid with explicit loading and empty states", async () => {
  const component = await loadDecisionGridComponent();
  const state = component.data();
  const template = readDecisionGridDescriptor().template.content;

  assert.deepEqual(state.decisions, []);
  assert.equal(state.loading, false);
  assert.equal(state.loadError, "");
  assert.match(template, /No decision definitions found/);
});
