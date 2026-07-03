import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

test("FAQ help tab points to a real markdown asset", () => {
  const helpSource = readFileSync(join(root, "src/components/help/Help.vue"), "utf8");
  assert.match(helpSource, /src="\/help\/FAQ\.md"/);

  const faqPath = join(root, "public/help/FAQ.md");
  assert.equal(existsSync(faqPath), true);

  const faqMarkdown = readFileSync(faqPath, "utf8");
  assert.match(faqMarkdown, /^#\s+FAQ/m);
  assert.doesNotMatch(faqMarkdown, /<!doctype html/i);
});

test("all markdown help tabs use absolute existing public assets", () => {
  const helpSource = readFileSync(join(root, "src/components/help/Help.vue"), "utf8");
  const sources = [...helpSource.matchAll(/<md-viewer\s+src="([^"]+)"/g)].map(match => match[1]);

  assert.ok(sources.length >= 8);

  sources.forEach(src => {
    assert.match(src, /^\/help\/.+\.md$/);
    assert.equal(existsSync(join(root, "public", src)), true, `${src} should exist in public/`);
  });
});

test("markdown viewer does not render Vite HTML fallback as help content", () => {
  const viewerSource = readFileSync(join(root, "src/components/help/md-viewer.vue"), "utf8");

  assert.match(viewerSource, /looksLikeHtmlFallback/);
  assert.match(viewerSource, /Help page not found/);
});

test("help tabs keep navigation and content columns from collapsing", () => {
  const helpSource = readFileSync(join(root, "src/components/help/Help.vue"), "utf8");

  assert.match(helpSource, /\.help-tabs-nav[\s\S]*flex:\s*0\s+0\s+220px/);
  assert.match(helpSource, /\.tab-content[\s\S]*flex:\s*1\s+1\s+auto/);
  assert.match(helpSource, /display:\s*block\s*!important/);
});
