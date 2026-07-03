import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { test } from "node:test";

const root = new URL("../..", import.meta.url).pathname;

const legacyVue2Packages = [
  "vue-form-generator",
  "vue-json-editor",
  "vue-json-edit",
  "vue-friendly-iframe",
  "vue-google-charts",
  "vue-bootstrap-typeahead",
  "vue-cute-timeline",
  "vue-datepicker-local",
  "vue-moment",
  "vue2vis",
  "vue-fullscreen",
  "vue-clipboard2",
  "vue-notification",
  "vue-scrollto",
  "vue-shortkey",
  "vue-smart-route",
  "vue-simple-suggest",
  "v-suggest",
  "vue-tables-2"
];

function walk(dir) {
  return readdirSync(dir).flatMap(entry => {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      if (["node_modules", "dist", "graphify-out"].includes(entry)) return [];
      return walk(path);
    }
    return path;
  });
}

test("source code does not reference removed Vue 2 UI or form package names", () => {
  const files = [
    join(root, "vite.config.js"),
    ...walk(join(root, "src"))
  ].filter(file => {
    if (file.endsWith(".test.js")) return false;
    return /\.(js|vue)$/.test(file);
  });

  const matches = [];
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    for (const packageName of legacyVue2Packages) {
      if (source.includes(packageName)) {
        matches.push(`${relative(root, file)} -> ${packageName}`);
      }
    }
  }

  assert.deepEqual(matches, []);
});

test("source code does not import the removed compat directory", () => {
  const files = walk(join(root, "src")).filter(file => {
    if (file.endsWith(".test.js")) return false;
    return /\.(js|vue)$/.test(file);
  });

  const matches = [];
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    if (source.includes("@/compat") || source.includes("src/compat")) {
      matches.push(relative(root, file));
    }
  }

  assert.deepEqual(matches, []);
});

test("legacy compat directory has been removed after migration", () => {
  assert.throws(() => statSync(join(root, "src/compat")), /ENOENT/);
});
