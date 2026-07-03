import assert from "node:assert/strict";
import { test } from "node:test";

import { FindDashboardUrl } from "./dashboardUrl.js";

test("returns null when the active Camunda URL has no dashboard mapping", () => {
  assert.equal(FindDashboardUrl("http://localhost:8080/engine-rest/"), null);
});

test("matches dashboard mappings with normalized trailing slashes", () => {
  assert.equal(
    FindDashboardUrl("http://bpmn2.ru/bpmn2/rest"),
    "http://bpmn2.bpmn2.ru:8080/public/bpmn2/4462baf2-802c-46aa-b21e-a1d9c27ceba4"
  );
});
