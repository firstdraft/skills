import { isUtf8 } from "node:buffer";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const pagesDirectory = path.join(repository, "skills", "create-full-stack-app", "references", "plan");
export const examplesDirectory = path.join(repository, "evals", "plan-reference-pages");

const usage = `Usage: node script/check-plan-reference-pages.mjs --compiled <dir> [--update] [<page>...]

Checks the Plan reference pages against what the First Draft service reported for
their example Plans. <dir> holds the service's output for
evals/plan-reference-pages: <page>/examples/<name>.json for each example's result
and <page>/examples/<name>/ for the application it compiled.
evals/plan-reference-pages/README.md says how to produce it.

For each page, or only the named ones, it prints:
  - each quoted line of generated code that the example holding most of its
    block lacks and page-lines.txt does not list, and each page-lines.txt
    entry the page no longer quotes;
  - each example whose analysis status, diagnostics, gap records, Compile
    outcome, or README items differ from its observed/<name>.json;
  - each diagnostic or gap code an example reported that no page names.

It exits 1 when it printed a finding. --update rewrites observed/ from <dir>
and prints what changed; it never edits a page.
`;

// Which quoted lines a page claims the Compiler wrote. These rules were tuned on every reference page: a fenced
// block in a code language quotes generated code, and so does a json or jsonc block that opens with a // path
// comment, which a Plan fragment never does. A fence without a language counts as text.
const codeLanguages = new Set([
  "ruby", "erb", "yaml", "yml", "js", "javascript", "xml", "swift", "kotlin", "sh", "text", "css", "html",
]);
const closingLines = new Set(["end", "}", "{", "]", "[", ")", "<% end %>", "do", "});", "},", "],"]);
// A whole-line # comment that names a file or reads as the page's own prose ("# then ...", "# => ...").
const pageCommentPattern =
  /^#\s*(?:(?:app|spec|config|db|lib|test|bin|public|\.firstdraft|\.github|README|AGENTS|Gemfile|Dockerfile|Procfile)\b|=>|(?:and|then|or|with|from|in|the|a|an|for|after|before|when|where|not|only|each|every|same|other)\b)/;
// A line the page rewrapped or condensed matches without the whitespace outside its string literals, when it is
// long enough to be specific. Apart from runs of whitespace, a literal must match as written.
const squeezedMinimumLength = 12;
const looseWhitespace = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\s+/g;
// The comment a page may add after quoted code, and the characters that open a string literal, by fence language.
const trailingCommentMarkers = {
  ruby: [" # "], yaml: [" # "], yml: [" # "], sh: [" # "], erb: [" <%# "], text: [" # ", " // "],
  js: [" // "], javascript: [" // "], swift: [" // "], kotlin: [" // "], json: [" // "], jsonc: [" // "],
};
const stringQuotes = { js: "\"'`", javascript: "\"'`", swift: "\"", json: "\"", jsonc: "\"" };
const readmeSections = new Set(["Behavior to write", "What you supply", "Test coverage to complete"]);

export const normalize = (text) => text.trim().replace(/\s+/g, " ");
export const squeeze = (line) => line.replace(looseWhitespace, (whitespace, literal) => literal ?? "");

export function fencedBlocks(source) {
  const blocks = [];
  let block;
  source.split(/\r\n|\r|\n/).forEach((text, index) => {
    const line = index + 1;
    const opening = text.match(/^\s*```([\p{L}\p{N}_]*)\s*$/u);
    if (opening && !block) {
      block = { language: opening[1] || "text", line, lines: [] };
    } else if (block && /^\s*```\s*$/.test(text)) {
      blocks.push(block);
      block = undefined;
    } else if (block) {
      block.lines.push({ text, line });
    }
  });
  return blocks;
}

export function quotesGeneratedCode({ language, lines }) {
  if (codeLanguages.has(language)) return true;
  return (language === "json" || language === "jsonc") && lines.length > 0 && lines[0].text.trim().startsWith("//");
}

// A line too generic or too partial to check: blank, elided, a comment the page wrote, or a lone closing token.
export function skipsLine(text) {
  const line = text.trim();
  if (!line) return true;
  const elided = line.replaceAll("...BigDecimal", "").replaceAll("(...", "").replaceAll("...)", "");
  if (line.includes("…") || elided.includes("...")) return true;
  if (line.startsWith("<%#") || line.startsWith("//") || line.startsWith("<!--")) return true;
  if (line.startsWith("#") && (pageCommentPattern.test(line) || line.includes("shortened"))) return true;
  return closingLines.has(line);
}

// The line as the page wrote it, then without each trailing comment the page may have added, longest first. A
// comment starts at its language's marker outside every string literal; inside the comment, quotes mean nothing.
export function lineCandidates(text, language = "text") {
  const markers = trailingCommentMarkers[language] ?? [];
  const quotes = stringQuotes[language] ?? "\"'";
  const cuts = [];
  let quote;
  for (let index = 0; index < text.length; index += 1) {
    if (quote) {
      if (text[index] === "\\") index += 1;
      else if (text[index] === quote) quote = undefined;
    } else if (cuts.length === 0 && quotes.includes(text[index])) {
      quote = text[index];
    } else if (index > 0 && markers.some((marker) => text.startsWith(marker, index))) {
      cuts.push(index);
    }
  }
  const found = [normalize(text)];
  for (const cut of cuts.reverse()) {
    const head = normalize(text.slice(0, cut));
    if (head && !found.includes(head)) found.push(head);
  }
  return found;
}

export function loadApplication(directory) {
  const lines = [];
  const visit = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true }).sort(byName)) {
      const item = path.join(current, entry.name);
      if (entry.isDirectory()) {
        visit(item);
      } else if (entry.isFile()) {
        const bytes = readFileSync(item);
        if (!isUtf8(bytes)) continue;
        const fileLines = bytes.toString("utf8").split(/\r\n|\r|\n/);
        if (fileLines.at(-1) === "") fileLines.pop();
        for (const line of fileLines) lines.push(normalize(line));
      }
    }
  };
  visit(directory);
  return { text: lines.join("\n"), squeezed: lines.map(squeeze).join("") };
}

export function holdsLine(application, candidates) {
  if (candidates.some((candidate) => application.text.includes(candidate))) return true;
  return candidates.some(
    (candidate) =>
      [...candidate].length >= squeezedMinimumLength && application.squeezed.includes(squeeze(candidate)),
  );
}

// (a) Every checked line of a block must appear in the one compiled example that holds most of the block, or be
// listed in page-lines.txt as the page's own.
export function quotedLineFindings({ slug, source, applications, pageLines }) {
  const findings = [];
  const checkedLines = new Set();
  const names = [...applications.keys()].sort();
  for (const block of fencedBlocks(source)) {
    if (!quotesGeneratedCode(block)) continue;
    const lines = block.lines.filter(({ text }) => !skipsLine(text));
    if (lines.length === 0) continue;

    for (const { text } of lines) checkedLines.add(text.trim());
    const holders = lines.map(({ text }) => {
      const candidates = lineCandidates(text, block.language);
      return new Set(names.filter((name) => holdsLine(applications.get(name), candidates)));
    });
    let best;
    let bestScore = 0;
    for (const name of names) {
      const score = holders.filter((held) => held.has(name)).length;
      if (best === undefined || score > bestScore) [best, bestScore] = [name, score];
    }
    if (bestScore === lines.length) continue;

    lines.forEach(({ text, line }, index) => {
      const held = holders[index];
      if (best !== undefined && held.has(best)) return;
      if (pageLines.has(text.trim())) return;

      const where = `${slug}.md:${line} (block at line ${block.line})`;
      const others = [...held].sort();
      if (bestScore === 0) {
        findings.push(`${where}: no compiled example holds any line of this block: ${text.trim()}`);
      } else if (others.length === 0) {
        findings.push(`${where}: ${best} holds most of the block, and no example holds this line: ${text.trim()}`);
      } else {
        findings.push(
          `${where}: ${best} holds most of the block but not this line, which only ${others.join(", ")} ` +
            `${others.length === 1 ? "holds" : "hold"}: ${text.trim()}`,
        );
      }
    });
  }
  for (const [entry, line] of pageLines) {
    if (!checkedLines.has(entry)) {
      findings.push(`${slug}/page-lines.txt:${line}: ${slug}.md no longer quotes this line in generated code: ${entry}`);
    }
  }
  return findings;
}

// The items that the generated README's three sections list as left out. An entry names one item in bold, or
// several when gap records share its text, and may name another in its prose. Each item keeps its entry's section
// and group heading, its bold title, and the file it names.
export function readmeItems(source) {
  const items = [];
  let section;
  let group = null;
  let fence;
  for (const text of source.split(/\r\n|\r|\n/)) {
    const fenceMarker = text.match(/^\s*(`{3,}|~{3,})/)?.[1];
    if (fence) {
      if (fenceMarker?.[0] === fence[0] && fenceMarker.length >= fence.length) fence = undefined;
      continue;
    }
    if (fenceMarker) {
      fence = fenceMarker;
      continue;
    }
    const heading = text.match(/^(#{1,6})\s+(.*?)\s*$/);
    if (heading) {
      if (heading[1].length <= 2) {
        section = readmeSections.has(heading[2]) ? heading[2] : undefined;
        group = null;
      } else if (heading[1].length === 3) {
        group = heading[2];
      }
      continue;
    }
    if (!section || !text.startsWith("- **")) continue;
    for (const { title, file } of entryItems(text.slice(2))) items.push({ section, group, title, file });
  }
  return items;
}

// Each bold title in an entry, with the first code span in parentheses that follows it before the next title or
// the end of its sentence, such as (`app/models/task.rb`).
function entryItems(text) {
  const items = [];
  let open;
  for (let index = 0; index < text.length; ) {
    if (text.startsWith("**", index)) {
      const end = text.indexOf("**", index + 2);
      if (end === -1) break;
      open = { title: text.slice(index + 2, end), file: null };
      items.push(open);
      index = end + 2;
    } else if (text[index] === "`") {
      const end = text.indexOf("`", index + 1);
      if (end === -1) break;
      if (open && text[index - 1] === "(" && text[end + 1] === ")") {
        open.file = text.slice(index + 1, end);
        open = undefined;
      }
      index = end + 1;
    } else {
      if (/^[:.] /.test(text.slice(index, index + 2))) open = undefined;
      index += 1;
    }
  }
  return items;
}

// (b) What the pages state in prose: the analysis status, diagnostics, gap records, Compile outcome, and README
// items. Release identities are recorded but not compared, since every release changes them.
export function resultDifferences(observed, current) {
  const differences = [];
  if (observed.status !== current.status) {
    differences.push(`analysis status was ${observed.status}, now ${current.status}`);
  }
  const compiled = (record) => record.compile === "succeeded";
  if (compiled(observed) !== compiled(current)) {
    differences.push(compiled(current) ? "Compile now succeeds" : "Compile no longer succeeds");
  }
  differences.push(
    ...listDifferences({
      noun: ["diagnostic", "diagnostics"],
      observed: observed.diagnostics,
      current: current.diagnostics,
      fields: ["stage", "code", "severity", "pointer"],
      pairedBy: ["stage", "code", "pointer"],
      describe: ({ stage, code, severity, pointer }) => `${code}, ${stage} ${severity} at ${pointer}`,
    }),
    ...listDifferences({
      noun: ["gap record", "gap records"],
      observed: observed.gaps,
      current: current.gaps,
      fields: ["code", "pointer", "reason", "consequence"],
      pairedBy: ["code", "pointer"],
      describe: ({ code, pointer }) => `${code} at ${pointer}`,
    }),
    ...listDifferences({
      noun: ["README item", "README items"],
      observed: observed.readme,
      current: current.readme,
      fields: ["section", "group", "title", "file"],
      pairedBy: ["title"],
      describe: ({ section, group, title, file }) =>
        `${[section, group].filter(Boolean).join(" > ")}: ${title}${file ? ` in ${file}` : ""}`,
    }),
  );
  return differences;
}

// One summary of a list's differences: records that kept their pairing fields but changed another compared field,
// then the records removed, then those added.
function listDifferences({ noun, observed, current, fields, pairedBy, describe }) {
  const key = (item, names) => JSON.stringify(names.map((name) => item[name] ?? null));
  const unmatched = new Map();
  for (const item of current) {
    const itemKey = key(item, fields);
    unmatched.set(itemKey, [...(unmatched.get(itemKey) ?? []), item]);
  }
  let removed = [];
  for (const item of observed) {
    const matches = unmatched.get(key(item, fields));
    if (matches?.length) matches.shift();
    else removed.push(item);
  }
  let added = [...unmatched.values()].flat();

  const changed = [];
  for (const before of [...removed]) {
    const after = added.find((item) => key(item, pairedBy) === key(before, pairedBy));
    if (!after) continue;
    const changes = fields
      .filter((name) => (before[name] ?? null) !== (after[name] ?? null))
      .map((name) =>
        ["reason", "consequence"].includes(name) ? name : `${name} from ${before[name]} to ${after[name]}`,
      );
    changed.push(`${describe(before)}: ${changes.join(", ")}`);
    removed = removed.filter((item) => item !== before);
    added = added.filter((item) => item !== after);
  }

  const counted = (items) => `${items.length} ${items.length === 1 ? noun[0] : noun[1]}`;
  const listed = (items) => [...new Set(items)].join("; ");
  const parts = [];
  if (changed.length) parts.push(`${counted(changed)} changed (${listed(changed)})`);
  if (removed.length) parts.push(`${counted(removed)} removed (${listed(removed.map(describe))})`);
  if (added.length) {
    parts.push(`${parts.length ? added.length : counted(added)} added (${listed(added.map(describe))})`);
  }
  return parts.length ? [parts.join(", ")] : [];
}

export function checkPlanReferencePages({
  compiledDirectory,
  slugs = [],
  update = false,
  pages = pagesDirectory,
  examples = examplesDirectory,
}) {
  const findings = [];
  const notes = [];
  const pageSources = new Map(
    readdirSync(pages)
      .filter((file) => file.endsWith(".md"))
      .sort()
      .map((file) => [path.basename(file, ".md"), readFileSync(path.join(pages, file), "utf8")]),
  );
  const exampleSlugs = readdirSync(examples, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const unknown = slugs.filter((slug) => !pageSources.has(slug));
  if (unknown.length) throw new Error(`No reference page is named ${unknown.join(", ")}.`);

  if (slugs.length === 0) {
    for (const slug of exampleSlugs.filter((name) => !pageSources.has(name))) {
      findings.push(`${slug}/: no reference page ${slug}.md has these examples`);
    }
  }
  const codes = new Map();
  let exampleCount = 0;
  for (const slug of slugs.length ? slugs : [...pageSources.keys()]) {
    const pageDirectory = path.join(examples, slug);
    const names = jsonNames(path.join(pageDirectory, "examples"));
    if (names.length === 0) {
      findings.push(`${slug}.md: evals/plan-reference-pages/${slug}/examples/ has no example Plans`);
      continue;
    }
    exampleCount += names.length;

    const applications = new Map();
    const currentRecords = new Map();
    for (const name of names) {
      const id = `${slug}/${name}`;
      const resultPath = path.join(compiledDirectory, slug, "examples", `${name}.json`);
      if (!existsSync(resultPath)) {
        findings.push(`${id}: ${compiledDirectory} has no result for this example; compile the examples again`);
        continue;
      }
      const applicationDirectory = path.join(compiledDirectory, slug, "examples", name);
      const readmePath = path.join(applicationDirectory, "README.md");
      if (existsSync(applicationDirectory)) applications.set(name, loadApplication(applicationDirectory));
      const record = {
        ...JSON.parse(readFileSync(resultPath, "utf8")),
        readme: existsSync(readmePath) ? readmeItems(readFileSync(readmePath, "utf8")) : [],
      };
      currentRecords.set(name, record);
      for (const { code } of [...record.diagnostics, ...record.gaps]) {
        if (!codes.has(code)) codes.set(code, []);
        codes.get(code).push(id);
      }
    }

    findings.push(
      ...quotedLineFindings({
        slug,
        source: pageSources.get(slug),
        applications,
        pageLines: readPageLines(path.join(pageDirectory, "page-lines.txt")),
      }),
    );

    const observedDirectory = path.join(pageDirectory, "observed");
    for (const name of jsonNames(observedDirectory).filter((observed) => !names.includes(observed))) {
      if (update) {
        rmSync(path.join(observedDirectory, `${name}.json`));
        notes.push(`${slug}/observed/${name}.json: deleted, since no example has this name`);
      } else {
        findings.push(`${slug}/observed/${name}.json: no example has this name; run with --update to delete it`);
      }
    }
    for (const [name, current] of currentRecords) {
      const id = `${slug}/${name}`;
      const observedPath = path.join(observedDirectory, `${name}.json`);
      const recorded = `${JSON.stringify(current, null, 2)}\n`;
      if (!existsSync(observedPath)) {
        if (update) {
          mkdirSync(observedDirectory, { recursive: true });
          writeFileSync(observedPath, recorded);
          notes.push(`${id}: recorded`);
        } else {
          findings.push(`${id}: no observed/${name}.json; run with --update to record one`);
        }
        continue;
      }
      const observedSource = readFileSync(observedPath, "utf8");
      const differences = resultDifferences(JSON.parse(observedSource), current);
      if (update) {
        if (observedSource !== recorded) writeFileSync(observedPath, recorded);
        if (differences.length) notes.push(`${id}: updated: ${differences.join("; ")}: reread ${slug}.md`);
      } else if (differences.length) {
        findings.push(`${id}: ${differences.join("; ")}: reread ${slug}.md`);
      }
    }
  }

  // (c) A code counts as named when a page has it whole, not as part of a longer code.
  const allPages = [...pageSources.values()].join("\n");
  for (const [code, ids] of [...codes].sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))) {
    if (new RegExp(String.raw`(?<![\w.])${code.replaceAll(".", "\\.")}(?!\w|\.\w)`).test(allPages)) continue;
    const others = ids.length > 1 ? ` and ${ids.length - 1} other ${ids.length === 2 ? "example" : "examples"}` : "";
    findings.push(`${code}: no reference page names this code; ${ids[0]}${others} reported it`);
  }
  return { findings, notes, pageCount: slugs.length || pageSources.size, exampleCount };
}

function readPageLines(file) {
  const entries = new Map();
  if (!existsSync(file)) return entries;
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((text, index) => {
      if (text.trim()) entries.set(text.trim(), index + 1);
    });
  return entries;
}

function jsonNames(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory)
    .filter((file) => file.endsWith(".json"))
    .map((file) => path.basename(file, ".json"))
    .sort();
}

function byName(left, right) {
  if (left.name < right.name) return -1;
  if (left.name > right.name) return 1;
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { compiled: { type: "string" }, update: { type: "boolean" }, help: { type: "boolean", short: "h" } },
  });
  if (values.help) {
    process.stdout.write(usage);
  } else if (!values.compiled) {
    process.stderr.write(usage);
    process.exitCode = 2;
  } else {
    const { findings, notes, pageCount, exampleCount } = checkPlanReferencePages({
      compiledDirectory: path.resolve(values.compiled),
      slugs: positionals,
      update: values.update,
    });
    for (const line of [...notes, ...findings]) process.stdout.write(`${line}\n`);
    const summary = `Checked ${pageCount} ${pageCount === 1 ? "page" : "pages"} and ${exampleCount} examples`;
    process.stdout.write(
      findings.length
        ? `${summary}: ${findings.length} ${findings.length === 1 ? "finding" : "findings"}.\n`
        : `${summary}: no findings.\n`,
    );
    if (findings.length) process.exitCode = 1;
  }
}
