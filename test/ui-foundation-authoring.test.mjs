import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import Ajv2020 from "ajv/dist/2020.js";

import { canonicalPluginSkillNames } from "../script/claude-plugin-boundaries.mjs";

const schema = JSON.parse(await readFile(
  new URL("../skills/create-full-stack-app/references/foundation-plan-0.23.schema.json", import.meta.url),
  "utf8",
));
const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false });
ajv.addSchema(schema);
const validate = (name, value) => ajv.getSchema(`${schema.$id}#/$defs/${name}`)(value);

test("authoring release excludes the deferred UI Skill auditions", () => {
  assert.deepEqual(canonicalPluginSkillNames, ["create-full-stack-app"]);
});

test("ordinary form routes validate without return overrides", () => {
  const scaffold = {
    resource_routes: ["new", "create", "edit", "update", "destroy"],
    create: { authorization: "public", inputs: [{ field: "movie.title" }] },
    update: { authorization: "public", inputs: [{ field: "movie.title" }] },
    destroy: { authorization: "public" },
  };
  assert(validate("scaffold", scaffold));
  assert(validate("scaffoldProfile", { authorization: { policy: "user.read_self" } }));
  assert(validate("scaffoldCreateForm", {}));

  const explicit = structuredClone(scaffold);
  for (const action of ["create", "update", "destroy"]) {
    explicit[action].return_to = { kind: "resource", entity: "movie", route: "index" };
  }
  assert(validate("scaffold", explicit));
});

test("default returns retain route coupling and closed authored context", () => {
  assert(!validate("scaffold", {
    resource_routes: ["new"],
    create: { authorization: "public", inputs: [{ field: "movie.title" }] },
  }));
  assert(!validate("scaffoldDestroy", {}));
  assert(!validate("scaffoldCreateForm", { movie_id: "42" }));
  assert(!validate("scaffoldCreateForm", { return_to: "/movies/42" }));
});

test("associated creation needs a definition without standalone route exposure", async () => {
  const plan = JSON.parse(await readFile(
    new URL("../evals/create-full-stack-app/fixtures/redirect-movies.foundation-plan.json", import.meta.url),
    "utf8",
  ));
  const rating = plan.application.entities.find(({ key }) => key === "rating");
  rating.scaffold.resource_routes = rating.scaffold.resource_routes.filter(
    (route) => route !== "new" && route !== "create",
  );
  assert(ajv.getSchema(schema.$id)(plan));

  assert(validate("scaffold", { create: rating.scaffold.create }));
  assert(!validate("scaffold", { resource_routes: ["create"] }));
});

test("Entity validation errors belong to a Field or Reference", () => {
  const uniqueness = {
    subject_uuid: "01900000-0000-7000-8000-000000000001",
    key: "unique_title",
    kind: "uniqueness",
    targets: [{ field: "movie.title" }],
    nulls: "distinct",
    error_target: { field: "movie.title" },
  };
  assert(validate("entityValidation", uniqueness));
  assert(validate("entityValidation", {
    ...uniqueness,
    error_target: { reference: "movie.director" },
  }));
  assert(!validate("entityValidation", {
    ...uniqueness,
    error_target: { record: "self" },
  }));
});


test("Appearance offers only the authored theme choices", () => {
  assert(validate("appearance", { tint_color: "#4F46E5" }));
  for (const theme of ["light", "dark", "auto", "toggle"]) {
    assert(validate("appearance", { theme }));
  }
  for (const theme of ["system", "Light", "user", { default: "system" }]) {
    assert(!validate("appearance", { theme }));
  }
});

test("the bundled Plan contract replaces the previous input identity", () => {
  const validatePlan = ajv.getSchema(schema.$id);
  const plan = {
    format: "firstdraft.foundation-plan.sketch/0.23",
    target: { id: "rails", profile: "rails-sketch/2026-09-bookmark-assets" },
    application: { key: "theme_app", name: "Theme App", native: {}, delivery: {}, entities: [], appearance: { theme: "toggle" } },
  };
  assert(validatePlan(plan));
  assert(!validatePlan({ ...plan, format: "firstdraft.foundation-plan.sketch/0.22" }));
  assert(!validatePlan({ ...plan, target: { id: "rails", profile: "rails-sketch/2026-09" } }));
});

test("bookmark assets need no Plan choice and the replaced PWA key is rejected", () => {
  const base = {
    key: "movie_catalog",
    name: "Movie Catalog",
    native: {},
    delivery: {},
    entities: [],
  };
  for (const configuration of [{}, { appearance: { theme: "toggle" }, native: { ios: {}, android: {} } }]) {
    assert(validate("application", { ...base, ...configuration }));
  }
  for (const pwa of [true, false]) {
    assert(!validate("application", { ...base, pwa }));
  }
});


test("the toggle review fixture binds native residuals to the authored Plan", async () => {
  const fixture = (name) => new URL(`../evals/create-full-stack-app/fixtures/${name}`, import.meta.url);
  const source = await readFile(fixture("theme-toggle.foundation-plan.json"), "utf8");
  const plan = JSON.parse(source);
  const { analysis } = JSON.parse(await readFile(fixture("theme-toggle-analysis.json"), "utf8"));
  const digest = (value) => createHash("sha256").update(value).digest("hex");
  assert.equal(plan.application.appearance.theme, "toggle");
  assert.deepEqual(Object.keys(plan.application.native), ["ios", "android"]);
  assert.equal(analysis.head_source_sha256, digest(source));
  assert.equal(analysis.gap_set.source.sha256, digest(source));
  assert.equal(analysis.gap_set_sha256, digest(`${JSON.stringify(analysis.gap_set, null, 2)}\n`));
  const themeGaps = analysis.gap_set.gaps.filter(({ kind }) => kind === "appearance_theme");
  assert.equal(themeGaps.length, 1);
  assert.equal(themeGaps[0].pointer, "/application/appearance/theme");
  assert.equal(themeGaps[0].status, "partially_generated");
  assert.match(themeGaps[0].reason, /iOS and Android/);
  assert.match(themeGaps[0].consequence, /embedded Rails responses follow system appearance/);
});
