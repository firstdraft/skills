import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";

test("the public workshop Plan conforms to the packaged authoring contract", async () => {
  const readJson = async (relativePath) => JSON.parse(await readFile(new URL(relativePath, import.meta.url), "utf8"));
  const schema = await readJson("../skills/create-full-stack-app/references/foundation-plan-0.22.schema.json");
  const plan = await readJson("../docs/examples/reading-list.foundation-plan.json");
  const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false });
  const validate = ajv.compile(schema);
  assert.equal(validate(plan), true, ajv.errorsText(validate.errors));
});
