import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { canonicalPluginSkillNames } from "../script/claude-plugin-boundaries.mjs";

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const evaluationRoot = path.join(repository, "evals", "ui-continuation");

test("offline UI cases supply bounded inputs and distinguish all Skill routes", async () => {
  const corpus = JSON.parse(await readFile(path.join(evaluationRoot, "cases.json"), "utf8"));
  assert.equal(corpus.format, "firstdraft.ui-skill-evals/1");
  assert(Array.isArray(corpus.cases));
  assert.equal(corpus.cases.length, 9);
  const ids = new Set();
  const routes = new Set();
  const usedArtifacts = new Set();
  for (const entry of corpus.cases) {
    assert.deepEqual(Object.keys(entry).sort(), ["artifacts", "expectations", "expected_skills", "id", "mode", "prompt"]);
    assert.match(entry.id, /^[a-z][a-z0-9-]+$/);
    assert(!ids.has(entry.id), "duplicate case: " + entry.id);
    ids.add(entry.id);
    assert.equal(entry.mode, "offline-source");
    assert.equal(typeof entry.prompt, "string");
    assert(entry.prompt.trim().length > 0);
    assert(entry.expectations.length > 0);
    assert(entry.expectations.every((value) => typeof value === "string" && value.trim().length > 0));
    assert(Array.isArray(entry.expected_skills));
    assert.equal(new Set(entry.expected_skills).size, entry.expected_skills.length);
    for (const name of entry.expected_skills) assert(canonicalPluginSkillNames.includes(name));
    routes.add(entry.expected_skills.join(","));
    for (const artifact of entry.artifacts) {
      assert.deepEqual(Object.keys(artifact).sort(), ["path", "role"]);
      assert.equal(artifact.role, "input");
      const artifactPath = path.resolve(repository, artifact.path);
      assert(artifactPath.startsWith(evaluationRoot + path.sep), "fixture escapes corpus");
      assert((await stat(artifactPath)).isFile());
      assert((await readFile(artifactPath, "utf8")).endsWith("\n"));
      usedArtifacts.add(path.relative(path.join(evaluationRoot, "fixtures"), artifactPath));
    }
  }
  assert.deepEqual(routes, new Set(["extend-app-ui", "review-ui-consistency", "create-full-stack-app", ""]));
  assert.deepEqual([...usedArtifacts].sort(), (await readdir(path.join(evaluationRoot, "fixtures"))).sort());
});
