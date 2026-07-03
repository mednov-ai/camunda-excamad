import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const readSource = (path) => fs.readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("process detail uses in-flow section navigation instead of a floating overlay", () => {
  const source = readSource("src/views/DetailProcessView.vue");

  assert.match(source, /class="process-detail-layout"/);
  assert.match(source, /class="process-section-nav"/);
  assert.match(source, /History duration/);
  assert.doesNotMatch(source, /History digaram/);
  assert.doesNotMatch(source, /\.fixed\s*\{[\s\S]*?position:\s*fixed/);

  const shareButtons = source.match(/v-clipboard:copy="message"/g) || [];
  assert.equal(shareButtons.length, 1);
});

test("global navigation is sticky in document flow and uses Bootstrap 5 layout utilities", () => {
  const navSource = readSource("src/components/NavBar.vue");
  const appSource = readSource("src/App.vue");

  assert.match(navSource, /position:\s*sticky/);
  assert.doesNotMatch(navSource, /position:\s*fixed/);
  assert.doesNotMatch(navSource, /class="[^"]*\bml-auto\b/);
  assert.doesNotMatch(appSource, /margin-top:\s*110px/);
});
