import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";

import { npmDistTagArguments } from "../script/npm-promotion.mjs";

const run = promisify(execFile);

test("npm probe cleanup refreshes metadata cached before the addition", async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), "npm-promotion-cache-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const tags = { latest: "0.2.2", next: "0.2.2" };
  const tag = "promotion-check-12345";
  const collection = "/-/package/@firstdraft.com%2fcli/dist-tags";
  const requests = [];
  const server = createServer(async (request, response) => {
    requests.push([request.method, request.url]);
    response.setHeader("Content-Type", "application/json");
    if (request.method === "GET" && request.url === collection) {
      response.setHeader("Cache-Control", "public, max-age=300");
      response.end(JSON.stringify(tags));
    } else if (request.method === "PUT" && request.url === `${collection}/${tag}`) {
      let body = "";
      for await (const chunk of request) body += chunk;
      tags[tag] = JSON.parse(body);
      response.end("{}");
    } else if (request.method === "DELETE" && request.url === `${collection}/${tag}`) {
      delete tags[tag];
      response.end("{}");
    } else {
      response.writeHead(404);
      response.end("{}");
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const registry = `http://127.0.0.1:${server.address().port}/`;
  const userconfig = path.join(directory, "user.npmrc");
  const globalconfig = path.join(directory, "global.npmrc");
  await Promise.all([writeFile(userconfig, ""), writeFile(globalconfig, "")]);
  const env = Object.fromEntries(Object.entries(process.env)
    .filter(([key]) => !/^(npm_config_|npm_token$|node_auth_token$)/i.test(key)));
  Object.assign(env, {
    NPM_CONFIG_USERCONFIG: userconfig,
    NPM_CONFIG_GLOBALCONFIG: globalconfig,
    NPM_CONFIG_CACHE: path.join(directory, "cache"),
    NPM_CONFIG_UPDATE_NOTIFIER: "false",
  });
  for (const operation of ["add", "rm"]) {
    const args = npmDistTagArguments(operation, "@firstdraft.com/cli", "0.2.2", tag)
      .map((argument) => argument === "--registry=https://registry.npmjs.org/"
        ? `--registry=${registry}` : argument);
    await run("npm", args, { cwd: directory, env });
  }
  assert.deepEqual(requests, [
    ["GET", collection], ["PUT", `${collection}/${tag}`],
    ["GET", collection], ["DELETE", `${collection}/${tag}`],
  ]);
  assert.deepEqual(tags, { latest: "0.2.2", next: "0.2.2" });
});
