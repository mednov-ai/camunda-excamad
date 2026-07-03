import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { parse } from "@vue/compiler-sfc";

async function loadNetworkDiagramComponent() {
  const filePath = fileURLToPath(new URL("./NetworkDiagram.vue", import.meta.url));
  const source = readFileSync(filePath, "utf8");
  const { descriptor } = parse(source);
  const script = descriptor.script.content
    .replace(/import\s+[^;]+;\n/g, "")
    .replace("export default", "const component =");
  const moduleSource = [
    "const Network = {};",
    "const fullscreen = {};",
    script,
    "export default component;"
  ].join("\n");

  return import(`data:text/javascript;base64,${Buffer.from(moduleSource).toString("base64")}`)
    .then(module => module.default);
}

test("history duration labels include the activity id and sub-second duration", async () => {
  const component = await loadNetworkDiagramComponent();

  const label = component.methods.returnLabel({
    id: "UserTask_review_v2",
    durationInMillis: 19
  });

  assert.equal(label, "UserTask_review_v2\n19 ms");
});
