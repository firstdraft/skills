import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import Ajv2020 from "ajv/dist/2020.js";

import { canonicalPluginSkillNames } from "../script/claude-plugin-boundaries.mjs";

const schema = JSON.parse(await readFile(
  new URL("../skills/create-full-stack-app/references/foundation-plan-0.19.schema.json", import.meta.url),
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
