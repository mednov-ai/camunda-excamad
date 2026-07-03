import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const read = path => readFileSync(join(root, path), "utf8");

test("operational console shell is wired through App.vue", () => {
  const app = read("src/App.vue");
  assert.match(app, /<app-shell\b/);
  assert.doesNotMatch(app, /<navbar\b/);
});

test("operational console design tokens are provided globally", () => {
  assert.equal(existsSync(join(root, "src/styles/operational-console.css")), true);
  const css = read("src/styles/operational-console.css");
  [
    "--oc-bg",
    "--oc-surface",
    "--oc-border",
    "--oc-text",
    "--oc-muted",
    "--oc-primary",
    "--oc-danger",
    "--oc-warning",
    "--oc-success"
  ].forEach(token => assert.match(css, new RegExp(token)));

  const main = read("src/main.js");
  assert.match(main, /styles\/operational-console\.css/);
});

test("app shell exposes sidebar navigation and utility bar", () => {
  assert.equal(existsSync(join(root, "src/components/layout/AppShell.vue")), true);
  const shell = read("src/components/layout/AppShell.vue");
  [
    "Processes",
    "Decisions",
    "Incidents",
    "Live",
    "Task list",
    "Misc",
    "Settings",
    "Help"
  ].forEach(label => assert.match(shell, new RegExp(label)));
  assert.match(shell, /class="oc-sidebar/);
  assert.match(shell, /class="oc-topbar/);
  assert.match(shell, /connection-chip/);
});

test("home page uses operational overview instead of placeholder cards", () => {
  const home = read("src/views/Home.vue");
  assert.match(home, /operational-overview/);
  assert.doesNotMatch(home, /placekitten/i);
  assert.doesNotMatch(home, /b-card-group\s+columns/);
});

test("core workflow screens use operational layout primitives", () => {
  [
    "src/components/BaseUrl.vue",
    "src/components/Incident.vue",
    "src/components/decisions/DecisionGrid.vue",
    "src/components/Migration.vue",
    "src/components/misc/Report.vue",
    "src/views/TaskListView.vue",
    "src/views/DetailProcessView.vue"
  ].forEach(path => {
    const source = read(path);
    assert.match(source, /oc-page|oc-panel|oc-toolbar|oc-table-wrap/, path);
  });
});
