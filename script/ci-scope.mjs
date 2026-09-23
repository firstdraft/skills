import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const catalogPath = ".claude-plugin/marketplace.json";

export function isCatalogSelectionChange(paths, before, after) {
  if (paths.length !== 1 || paths[0] !== catalogPath) return false;
  const withoutSelection = (catalog) => {
    const copy = structuredClone(catalog);
    if (copy.plugins?.length !== 1 || copy.plugins[0].name !== "firstdraft") return null;
    delete copy.plugins[0].version;
    if (copy.plugins[0].source?.source !== "npm") return null;
    delete copy.plugins[0].source.version;
    return copy;
  };
  const beforeMetadata = withoutSelection(before);
  const afterMetadata = withoutSelection(after);
  return beforeMetadata !== null && afterMetadata !== null && isDeepStrictEqual(beforeMetadata, afterMetadata);
}

export function catalogOnlyChange(base, root = repository) {
  const git = (...args) => spawnSync("git", args, { cwd: root, encoding: "utf8" });
  if (!base || git("cat-file", "-e", `${base}^{commit}`).status !== 0) return false;
  const diff = git("diff", "--name-only", "--no-renames", "-z", base, "HEAD");
  if (diff.status !== 0) throw new Error(diff.stderr);
  const paths = diff.stdout.split("\0").filter(Boolean);
  if (paths.length !== 1 || paths[0] !== catalogPath) return false;
  const previous = git("show", `${base}:${catalogPath}`);
  if (previous.status !== 0) return false;
  return isCatalogSelectionChange(paths, JSON.parse(previous.stdout), JSON.parse(readFileSync(path.join(root, catalogPath), "utf8")));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.stdout.write(`catalog_only=${catalogOnlyChange(process.argv[2])}\n`);
}
