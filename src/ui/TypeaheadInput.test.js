import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { parse } from "@vue/compiler-sfc";

async function loadTypeaheadComponent() {
  const filePath = fileURLToPath(new URL("./TypeaheadInput.vue", import.meta.url));
  const source = readFileSync(filePath, "utf8");
  const { descriptor } = parse(source);
  const script = descriptor.script.content.replace("export default", "const component =");
  const moduleSource = `${script}\nexport default component;`;

  return import(`data:text/javascript;base64,${Buffer.from(moduleSource).toString("base64")}`)
    .then(module => module.default);
}

test("serializes object suggestions and resolves the selected item on hit", async () => {
  const component = await loadTypeaheadComponent();
  const definition = {
    key: "approval_process",
    name: "Approval Process v2"
  };
  const context = {
    data: [definition],
    serializer(item) {
      return `${item.key} (${item.name})`;
    },
    itemLabel: component.methods.itemLabel
  };

  assert.equal(component.methods.itemLabel.call(context, definition), "approval_process (Approval Process v2)");
  assert.equal(component.methods.findItemByLabel.call(context, "approval_process (Approval Process v2)"), definition);
});
