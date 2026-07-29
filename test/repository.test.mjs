import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const skillsDirectory = path.join(repository, "skills");
const evalsDirectory = path.join(repository, "evals");
const foundationPlanFormat = "firstdraft.foundation-plan.sketch/0.19";
const foundationPlanTarget = {
  id: "rails",
  profile: "rails-sketch/2026-07",
};
const foundationPlanSchemaDigest =
  "12f8f2c5b422a0dbd94d201cc00f22e8845de0eb906f2019217e47014efb6734";

test("installable Skills follow the portable repository profile", async () => {
  const entries = await readdir(skillsDirectory, { withFileTypes: true });
  const skillNames = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  assert.deepEqual(skillNames, ["firstdraft-author-plan"]);

  for (const skillName of skillNames) {
    await checkSkill(skillName);
  }
});

test("behavioral eval cases are well-formed and reference real fixtures", async () => {
  const skillName = "firstdraft-author-plan";
  const source = await readFile(
    path.join(evalsDirectory, skillName, "cases.json"),
    "utf8",
  );
  const document = JSON.parse(source);

  assert.equal(document.format, "firstdraft.skill-evals/1");
  assert(Array.isArray(document.cases));
  assert(document.cases.length > 0);

  const ids = new Set();
  const triggerValues = new Set();
  for (const evaluation of document.cases) {
    assert.match(evaluation.id, /^[a-z][a-z0-9-]*$/);
    assert(!ids.has(evaluation.id), `duplicate eval id: ${evaluation.id}`);
    ids.add(evaluation.id);

    assert.equal(typeof evaluation.should_trigger, "boolean");
    triggerValues.add(evaluation.should_trigger);
    assert.equal(typeof evaluation.prompt, "string");
    assert(evaluation.prompt.length > 0);
    assert(Array.isArray(evaluation.expectations));
    assert(evaluation.expectations.length > 0);
    assert(evaluation.expectations.every((item) => typeof item === "string"));

    for (const artifact of evaluation.artifacts ?? []) {
      const artifactPath = path.resolve(repository, artifact);
      assert(
        artifactPath.startsWith(`${evalsDirectory}${path.sep}`),
        `eval artifact escapes evals/: ${artifact}`,
      );
      assert((await stat(artifactPath)).isFile(), `missing eval artifact: ${artifact}`);
    }
  }

  assert.deepEqual(triggerValues, new Set([true, false]));
});

test("authored JSON examples parse and retain the pinned Plan contract", async () => {
  const files = [
    ...(await filesUnder(skillsDirectory)),
    ...(await filesUnder(evalsDirectory)),
    path.join(repository, "README.md"),
    path.join(repository, "SECURITY.md"),
    path.join(repository, "package.json"),
  ];

  for (const file of files.filter((item) => item.endsWith(".json"))) {
    checkFoundationPlanConstants(JSON.parse(await readFile(file, "utf8")));
  }

  for (const file of files.filter((item) => item.endsWith(".md"))) {
    const source = await readFile(file, "utf8");
    for (const match of source.matchAll(/```json\n([\s\S]*?)```/g)) {
      checkFoundationPlanConstants(JSON.parse(match[1]));
    }
  }

  const documentedPlans = await markdownJsonDocuments(
    path.join(
      skillsDirectory,
      "firstdraft-author-plan",
      "references",
      "examples.md",
    ),
  );
  const foundationPlanReference = await markdownJsonDocuments(
    path.join(
      skillsDirectory,
      "firstdraft-author-plan",
      "references",
      "foundation-plan-019.md",
    ),
  );
  const fixture = JSON.parse(
    await readFile(
      path.join(
        evalsDirectory,
        "firstdraft-author-plan",
        "fixtures",
        "empty.foundation-plan.json",
      ),
      "utf8",
    ),
  );
  assert.deepEqual(documentedPlans[0], fixture);
  assert.deepEqual(foundationPlanReference.at(-1), fixture.application);
});

test("complete examples validate against the bundled exact schema", async () => {
  const skillDirectory = path.join(skillsDirectory, "firstdraft-author-plan");
  const schemaSource = await readFile(
    path.join(skillDirectory, "references", "foundation-plan-0.19.schema.json"),
    "utf8",
  );
  assert.equal(
    createHash("sha256").update(schemaSource).digest("hex"),
    foundationPlanSchemaDigest,
  );
  assert(
    (
      await readFile(
        path.join(skillDirectory, "references", "foundation-plan-019.md"),
        "utf8",
      )
    ).includes(foundationPlanSchemaDigest),
  );

  const validate = new Ajv2020({
    allErrors: true,
    strict: true,
    strictRequired: false,
  }).compile(JSON.parse(schemaSource));
  const examples = await markdownJsonDocuments(
    path.join(skillDirectory, "references", "examples.md"),
  );

  for (const [index, example] of examples.entries()) {
    assert(validate(example), `example ${index + 1}: ${ajvErrors(validate.errors)}`);
  }
});

test("the independently installed Skill retains the repository license", async () => {
  const repositoryLicense = await readFile(path.join(repository, "LICENSE"), "utf8");
  const skillLicense = await readFile(
    path.join(skillsDirectory, "firstdraft-author-plan", "LICENSE.txt"),
    "utf8",
  );
  assert.equal(skillLicense, repositoryLicense);
});

async function checkSkill(skillName) {
  const skillDirectory = path.join(skillsDirectory, skillName);
  const skillFile = path.join(skillDirectory, "SKILL.md");
  const source = await readFile(skillFile, "utf8");
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---\n/);

  assert(frontmatter, `${skillName}: missing frontmatter`);
  const metadata = parseRestrictedFrontmatter(frontmatter[1]);
  assert.deepEqual(Object.keys(metadata).sort(), ["description", "name"]);
  assert.equal(metadata.name, skillName);
  assert.match(metadata.name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert(metadata.name.length <= 64);
  assert(metadata.description.length > 0);
  assert(metadata.description.length <= 1024);
  assert(source.split("\n").length - 1 < 500);
  assert(!source.includes("TODO"));

  const files = await filesUnder(skillDirectory);
  assert(!files.some((file) => file.includes(`${path.sep}scripts${path.sep}`)));

  for (const file of files) {
    const details = await stat(file);
    assert.equal(details.mode & 0o111, 0, `${file}: executable file in installed Skill`);

    const contents = await readFile(file, "utf8");
    assert(contents.endsWith("\n"), `${file}: missing final newline`);
    if (!file.endsWith(".md")) continue;

    for (const match of contents.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const target = match[1];
      if (/^(?:https?:|#)/.test(target)) continue;

      const targetPath = path.resolve(path.dirname(file), target.split("#", 1)[0]);
      assert(
        targetPath.startsWith(`${skillDirectory}${path.sep}`),
        `${file}: link escapes installed Skill: ${target}`,
      );
      assert((await stat(targetPath)).isFile(), `${file}: broken link: ${target}`);
    }
  }

  const interfaceSource = await readFile(
    path.join(skillDirectory, "agents", "openai.yaml"),
    "utf8",
  );
  const shortDescription = quotedYamlValue(interfaceSource, "short_description");
  const defaultPrompt = quotedYamlValue(interfaceSource, "default_prompt");
  assert(shortDescription.length >= 25 && shortDescription.length <= 64);
  assert(defaultPrompt.includes(`$${skillName}`));
}

function parseRestrictedFrontmatter(source) {
  const entries = source.split("\n").map((line) => {
    const separator = line.indexOf(":");
    assert(separator > 0, `invalid frontmatter line: ${line}`);
    return [line.slice(0, separator), line.slice(separator + 1).trim()];
  });
  assert.equal(new Set(entries.map(([key]) => key)).size, entries.length);
  return Object.fromEntries(entries);
}

function quotedYamlValue(source, key) {
  const match = source.match(new RegExp(`^\\s*${key}: "([^"]+)"$`, "m"));
  assert(match, `agents/openai.yaml: missing ${key}`);
  return match[1];
}

function checkFoundationPlanConstants(document) {
  if (
    !document ||
    typeof document !== "object" ||
    typeof document.format !== "string" ||
    !document.format.startsWith("firstdraft.foundation-plan.")
  ) {
    return;
  }

  assert.equal(document.format, foundationPlanFormat);
  assert.deepEqual(document.target, foundationPlanTarget);
}

function ajvErrors(errors) {
  return (errors ?? [])
    .map(({ instancePath, message }) => `${instancePath || "/"} ${message}`)
    .join("; ");
}

async function markdownJsonDocuments(file) {
  const source = await readFile(file, "utf8");
  return [...source.matchAll(/```json\n([\s\S]*?)```/g)].map((match) =>
    JSON.parse(match[1]),
  );
}

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === ".git") continue;
    const item = path.join(directory, entry.name);
    assert(!entry.isSymbolicLink(), `${item}: symlinks are not allowed`);
    if (entry.isDirectory()) files.push(...(await filesUnder(item)));
    else if (entry.isFile()) files.push(item);
  }

  return files;
}
