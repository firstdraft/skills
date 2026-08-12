import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";

import {
  canonicalClaudePluginSkillFiles,
  classifyInventoryEntry,
  forbiddenCheckoutRootClaudePluginComponentPaths,
  forbiddenClaudePluginPathSegments,
} from "../script/claude-plugin-boundaries.mjs";
import {
  assertNoObservationAbsolutePathLeaks,
  observedFileBytes,
  observedFileTreeSha256,
  renderManifestValidationEvidence,
  renderStatePresenceNames,
} from "../script/claude-plugin-observation.mjs";
import { safeGithubReasonCodes } from "../script/cli-contract/config.mjs";

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const skillsDirectory = path.join(repository, "skills");
const evalsDirectory = path.join(repository, "evals");
const claudePluginDirectory = path.join(repository, ".claude-plugin");
const claudePluginEvidence = path.join(
  repository,
  "evidence",
  "2026-08-04-claude-code-plugin-install-smoke.md",
);
const claudePluginObservation = path.join(
  repository,
  "evidence",
  "claude-code-plugin-install-observation.json",
);
const freshClaudeEvaluationEvidence = path.join(
  repository,
  "evidence",
  "2026-08-04-fresh-claude-code-evaluations.md",
);
const homeInventoryOpeningResponse = path.join(
  repository,
  "evidence",
  "2026-08-04-home-inventory-opening-response.txt",
);
const movieCatalogModelObservation = path.join(
  repository,
  "evidence",
  "2026-08-04-movie-catalog-model-rehearsal.json",
);
const claudePluginName = "firstdraft";
const claudeMarketplaceName = "firstdraft-skills";
const portableSkillName = "create-full-stack-app";
const foundationPlanFormat = "firstdraft.foundation-plan.sketch/0.19";
const foundationPlanTarget = {
  id: "rails",
  profile: "rails-sketch/2026-08",
};
const foundationPlanAnalyzerRelease = "foundation-plan-rails/application-2026-08";
const foundationPlanCompilerRelease =
  "foundation-plan-rails/compiler-application-2026-08";
const currentFoundationPlanAnalyzerRelease =
  "foundation-plan-rails/application-2026-08-05-conditional-length";
const currentFoundationPlanCompilerRelease =
  "foundation-plan-rails/compiler-application-2026-08-05-conditional-length";
const foundationPlanSchemaDigest =
  "1954e5c95d6e6621578202ad4452686b56c150256ffcd75935078d9f4247c568";
const foundationPlanServerBaseline =
  "35ad070beb36c66dc6480f36b33767caaed160a9";
const currentCompilerServiceBaseline =
  "6002be2685542fedf515879f940b97ad73b1a469";
const discoverySmokeServiceBaseline =
  "4007fc5ef0734e2fc3e3e59714919025bd73d621";
const catalogPromotionBaseline =
  "e0212cad0a89a8b0e38678e371389085f6ddc254";
const pluginReleaseBaseline =
  "b3e53a240aaf79a776538e9b1410689d8a4e79ee";
const compilationEvidenceCliBaseline =
  "121272cd592055354d09a4fe90e55c3ca002770c";
const compilationEvidenceCliRuntimeDigest =
  "205e664df0ed9c7e63651a1c2c01e749a04d8879fe7f62cc4c1e13b66dce738d";
const cliContractBaseline =
  "d37d8b6775a0b97ce10bd651485bd308fed1dda2";
const cliContractRuntimeDigest =
  "019a2e99ba504739d8eb17b63b7ced42eaea56e550d1e067ab962a7748500b72";
const previousCliContractBaseline =
  "e53eb38d7e8254e6ba1e660b38c5d32d0314be17";
const previousCliContractRuntimeDigest =
  "0983106d7c1054137d70dccb1091eeadd8272ffcca1f7bba1bde9c8028452fad";
const historicalCliContractBaseline =
  "f55edffc9e88924f9a4c95f41c4d0bc9b72422f8";
const historicalCliContractRuntimeDigest =
  "9e5a4bd0f16f49ab2e17c04f7defc59366f8fa073f772b310d8f684177890eab";
const compilationProvenanceServiceBaseline =
  "5811bb3013cf25072db74355597f60d85be3c05b";
const productJourneySmokeBaseline =
  "8ebfc2ed82a610e63f47eb985c23ab7e634fe94e";
const historicalPluginInstallEvidenceBaseline =
  "3777ae515bd366e7d6e55df0c2add3a7f12a9d12";
const freshModelServiceBaseline =
  "3a029a8b425addbbba4f56d9197878cc002752f4";
const freshModelServiceTree =
  "076415a4b1e34cc458a85186e1e335503eb30612";
const freshModelPluginBaseline =
  "b5c3897b240bfa3a9117d1a564d8e6b7d783e993";
const marketplacePluginSourceBaseline =
  "8ffbd9688f39118ddeeb48a3da7e5bc309b7be5e";
const freshModelPluginRuntimeDigest =
  "a5c3bfe0dd8d5396a692c4204c670e10cbc4b996883f76025d9e8a6586becc7b";
const freshModelClaudeExecutableDigest =
  "7a181f36ed0fc4fbac6cee4ecf2b615eff93d8b434221fff5d7c878dc5ebf380";
const freshModelPublicationTree =
  "5815d094e204f8b3928ff5b5467ef85e2551d109";
const freshModelPublicationCommit =
  "37cc23d7cf7a1448fb7dfd4be8aee27c6e389ead";
const preparedCliPackage = "@firstdraft.com/cli@0.1.0";
const foundationIosCoreRevision =
  "aa2ac902fa52abab51a4502953b7b962f949a21d";
const foundationIosCoreArchiveDigest =
  "0807e76cf02296af27d4eb1aae68e298beef162a7daa8a3da55d83e88ab6d748";
const freshAgentEvidenceBaseline =
  "16b056a6f55eb92cb6e5a6e02abd58e84b47abd5";
const freshAgentSkillBaseline =
  "5cad5acec23a983e6421d2d37420a74de63b47fb";
const planPushErrorCodes = [
  "authentication_required",
  "invalid_arguments",
  "invalid_configuration",
  "local_input_unreadable",
  "request_outcome_unknown",
  "server_rejected",
  "local_state_not_saved",
];
const supportedScalarFieldTypes = [
  "boolean",
  "date",
  "datetime",
  "decimal",
  "integer",
  "language_code",
  "long_text",
  "short_text",
  "time_zone",
  "url",
];
const supportedFieldTypes = [...supportedScalarFieldTypes, "enum"].sort();
const supportedFieldProperties = [
  "subject_uuid",
  "key",
  "name",
  "type",
  "required",
  "default",
  "notes",
  "immutable",
  "comparison",
  "normalizations",
  "encrypted_at_rest",
  "redact_from_logs",
];
const supportedReferenceProperties = [
  "subject_uuid",
  "key",
  "name",
  "targets",
  "required",
  "one_to_one",
  "on_referenced_deleted",
  "default",
  "immutable",
  "realization",
];
const supportedPredicateProperties = [
  "subject_uuid",
  "key",
  "name",
  "expression",
];

test("revision pins remain exhaustive across coordination surfaces", async () => {
  const readme = await readFile(path.join(repository, "README.md"), "utf8");
  assertRevisionTokens(readme, [
    foundationPlanServerBaseline,
    compilationEvidenceCliBaseline,
    cliContractBaseline,
    compilationProvenanceServiceBaseline,
    productJourneySmokeBaseline,
    freshModelServiceBaseline,
    freshModelPluginBaseline,
    foundationIosCoreRevision,
    freshAgentEvidenceBaseline,
    freshAgentSkillBaseline,
    freshAgentSkillBaseline.slice(0, 7),
    currentCompilerServiceBaseline,
    discoverySmokeServiceBaseline,
    historicalCliContractBaseline,
    catalogPromotionBaseline,
    pluginReleaseBaseline,
  ]);

  const skillDirectory = path.join(skillsDirectory, "create-full-stack-app");
  const referencesDirectory = path.join(
    skillDirectory,
    "references",
  );
  const referenceNames = (await readdir(referencesDirectory))
    .filter((file) => file.endsWith(".md"))
    .sort();
  const references = await Promise.all(
    referenceNames.map((file) =>
      readFile(path.join(referencesDirectory, file), "utf8"),
    ),
  );
  assertRevisionTokens(references.join("\n"), [
    foundationPlanServerBaseline,
    currentCompilerServiceBaseline,
    compilationEvidenceCliBaseline,
    cliContractBaseline,
    previousCliContractBaseline,
    productJourneySmokeBaseline,
    foundationIosCoreRevision,
    freshAgentEvidenceBaseline,
    freshAgentSkillBaseline,
    catalogPromotionBaseline,
  ]);
  const skillSource = await readFile(
    path.join(skillDirectory, "SKILL.md"),
    "utf8",
  );
  assertRevisionTokens(skillSource, []);

  const foundationPlanReference = await readFile(
    path.join(referencesDirectory, "foundation-plan-019.md"),
    "utf8",
  );
  const diagnosticsReference = await readFile(
    path.join(referencesDirectory, "diagnostics-and-recovery.md"),
    "utf8",
  );
  for (const source of [readme, foundationPlanReference, diagnosticsReference]) {
    assert(source.includes(`\`${preparedCliPackage}\``));
    assert.doesNotMatch(source, /(?:package )?remains unpublished/);
  }
  for (const source of [readme, foundationPlanReference]) {
    assert(source.includes(currentFoundationPlanAnalyzerRelease));
    assert(source.includes(currentFoundationPlanCompilerRelease));
  }
  assert(foundationPlanReference.includes(previousCliContractRuntimeDigest));

  const workflow = (
    await readFile(path.join(repository, ".github", "workflows", "ci.yml"), "utf8")
  ).replace(/^.*uses:\s+\S+@[0-9a-f]{40}.*$/gm, "");
  assertRevisionTokens(workflow, [cliContractBaseline]);
  const contractConfig = await readFile(
    path.join(repository, "script", "cli-contract", "config.mjs"),
    "utf8",
  );
  assertRevisionTokens(contractConfig, [cliContractBaseline]);
  assert(contractConfig.includes(cliContractRuntimeDigest));
  assert(contractConfig.includes(currentFoundationPlanCompilerRelease));
  assert(contractConfig.includes(currentFoundationPlanAnalyzerRelease));
  assert(contractConfig.includes(foundationPlanTarget.profile));
  assertRevisionTokens(
    await readFile(path.join(repository, "test", "repository.test.mjs"), "utf8"),
    [
      foundationPlanServerBaseline,
      currentCompilerServiceBaseline,
      discoverySmokeServiceBaseline,
      compilationEvidenceCliBaseline,
      cliContractBaseline,
      previousCliContractBaseline,
      historicalCliContractBaseline,
      compilationProvenanceServiceBaseline,
      productJourneySmokeBaseline,
      historicalPluginInstallEvidenceBaseline,
      freshModelServiceBaseline,
      freshModelServiceTree,
      freshModelPluginBaseline,
      marketplacePluginSourceBaseline,
      freshModelPublicationTree,
      freshModelPublicationCommit,
      foundationIosCoreRevision,
      freshAgentEvidenceBaseline,
      freshAgentSkillBaseline,
      catalogPromotionBaseline,
      pluginReleaseBaseline,
    ],
  );
  for (const relativePath of [
    ["evals", "create-full-stack-app", "cases.json"],
    [
      "evals",
      "create-full-stack-app",
      "references",
      "candidate-interview-protocol.md",
    ],
    ["script", "check"],
    ["skills", "create-full-stack-app", "agents", "openai.yaml"],
    ["test", "interview-evaluation-foundation.test.mjs"],
    ["script", "support", "create-full-stack-app-evaluation.mjs"],
  ]) {
    assertRevisionTokens(
      await readFile(path.join(repository, ...relativePath), "utf8"),
      [],
    );
  }
});

test("immutable plugin teaching lag distinguishes fixed and retained claims", async () => {
  const candidateSkillPath = path.join(
    skillsDirectory,
    portableSkillName,
    "SKILL.md",
  );
  const candidateModelingGuidePath = path.join(
    skillsDirectory,
    portableSkillName,
    "references",
    "modeling-guide.md",
  );
  const candidateFoundationPlanReferencePath = path.join(
    skillsDirectory,
    portableSkillName,
    "references",
    "foundation-plan-019.md",
  );
  const [
    readme,
    releasing,
    candidateSkill,
    candidateModelingGuide,
    candidateFoundationPlanReference,
  ] = await Promise.all([
    readFile(path.join(repository, "README.md"), "utf8"),
    readFile(path.join(repository, "RELEASING.md"), "utf8"),
    readFile(candidateSkillPath, "utf8"),
    readFile(candidateModelingGuidePath, "utf8"),
    readFile(candidateFoundationPlanReferencePath, "utf8"),
  ]);
  const publishedSkill = gitBlobAtRevision(
    pluginReleaseBaseline,
    "skills/create-full-stack-app/SKILL.md",
  ).toString("utf8");
  const publishedModelingGuide = gitBlobAtRevision(
    pluginReleaseBaseline,
    "skills/create-full-stack-app/references/modeling-guide.md",
  ).toString("utf8");
  const publishedFoundationPlanReference = gitBlobAtRevision(
    pluginReleaseBaseline,
    "skills/create-full-stack-app/references/foundation-plan-019.md",
  ).toString("utf8");

  for (const source of [publishedSkill, publishedModelingGuide]) {
    assert.match(source, /live [Pp]ublication remains unproved/);
  }
  for (const source of [candidateSkill, candidateModelingGuide]) {
    assert.doesNotMatch(source, /live [Pp]ublication remains unproved/);
    assert.match(source, /dated staging discovery/);
  }
  assert.match(
    publishedFoundationPlanReference,
    /no Plan GET or pull operation[\s\S]*?proven live Publish path/,
  );
  assert.match(
    publishedFoundationPlanReference,
    /controlled product-journey smoke[\s\S]*?8ebfc2ed82a610e63f47eb985c23ab7e634fe94e[\s\S]*?packed reviewed[\s\S]*?CLI/,
  );
  assert.doesNotMatch(candidateFoundationPlanReference, /proven live Publish path/);
  assert.match(
    candidateFoundationPlanReference,
    /controlled product-journey smoke[\s\S]*?8ebfc2ed82a610e63f47eb985c23ab7e634fe94e[\s\S]*?packed reviewed\s+CLI/,
  );
  assert(!candidateFoundationPlanReference.includes(historicalCliContractBaseline));
  assert.match(
    readme,
    /immutable plugin 0\.1\.0 package[\s\S]*?b3e53a240aaf79a776538e9b1410689d8a4e79ee[\s\S]*?packaged `SKILL\.md` retains two pre-smoke negatives[\s\S]*?live GitHub publication remains outside the evidence boundary[\s\S]*?later Scaffold guidance[\s\S]*?publication remains unproved[\s\S]*?packaged modeling guide repeats the live-Publication negative[\s\S]*?`references\/foundation-plan-019\.md`[\s\S]*?no proven live Publish[\s\S]*?path[\s\S]*?old harness "reviewed"[\s\S]*?exact revision[\s\S]*?f55edffc9e88924f9a4c95f41c4d0bc9b72422f8[\s\S]*?`0\.1\.0-alpha\.2`[\s\S]*?four[\s\S]*?Publication\/Publish negatives do not disable `firstdraft plan compile`[\s\S]*?Treat all five[\s\S]*?Published[\s\S]*?plugin 0\.1\.1 corrects the four Publication\/Publish negatives in canonical source[\s\S]*?retains[\s\S]*?ambiguous "packed reviewed CLI" attribution[\s\S]*?acknowledged[\s\S]*?published-package limitation[\s\S]*?change immutable package bytes[\s\S]*?new[\s\S]*?SemVer[\s\S]*?recorded deterministic digest[\s\S]*?separate qualification[\s\S]*?full v14 qualification gaps/,
  );
  assert.match(
    releasing,
    /immutable plugin 0\.1\.0 package[\s\S]*?b3e53a240aaf79a776538e9b1410689d8a4e79ee[\s\S]*?packaged `SKILL\.md` retains[\s\S]*?two pre-smoke negatives[\s\S]*?live GitHub publication outside the evidence boundary[\s\S]*?later[\s\S]*?Scaffold guidance says live publication remains unproved[\s\S]*?packaged modeling guide repeats the live-Publication[\s\S]*?negative[\s\S]*?`references\/foundation-plan-019\.md`[\s\S]*?no proven live Publish path[\s\S]*?old harness "reviewed"[\s\S]*?exact revision[\s\S]*?f55edffc9e88924f9a4c95f41c4d0bc9b72422f8[\s\S]*?`0\.1\.0-alpha\.2`[\s\S]*?four Publication\/Publish negatives do not[\s\S]*?disable `firstdraft plan compile`[\s\S]*?Treat all five[\s\S]*?Published plugin 0\.1\.1 corrects the four Publication\/Publish negatives in canonical source[\s\S]*?retains[\s\S]*?ambiguous "packed reviewed CLI" attribution[\s\S]*?acknowledged[\s\S]*?published-package limitation[\s\S]*?change immutable package bytes[\s\S]*?new[\s\S]*?SemVer[\s\S]*?recorded deterministic digest[\s\S]*?separate qualification[\s\S]*?full v14 gaps/,
  );
});

test("fresh Claude Code evidence is exact and bounded", async () => {
  const evidence = await readFile(freshClaudeEvaluationEvidence, "utf8");
  const observationSource = await readFile(
    movieCatalogModelObservation,
    "utf8",
  );
  const homeResponse = await readFile(homeInventoryOpeningResponse, "utf8");
  const observation = JSON.parse(observationSource);
  assertRevisionTokens(evidence, [
    historicalCliContractBaseline,
    freshModelServiceBaseline,
    freshModelPluginBaseline,
  ]);
  assertRevisionTokens(homeResponse, []);
  assertRevisionTokens(observationSource, [
    historicalCliContractBaseline,
    freshModelServiceBaseline,
    freshModelServiceTree,
    freshModelPluginBaseline,
    freshModelPublicationTree,
    freshModelPublicationCommit,
  ]);
  assertNoObservationAbsolutePathLeaks({
    evidenceMarkdown: evidence,
    homeResponse,
    modelObservation: observation,
  });

  for (const source of [evidence, homeResponse, observationSource]) {
    assert(!source.includes(repository));
    assert.doesNotMatch(source, /(?:\/Users\/|\/home\/|[A-Za-z]:\\)/);
    assert.doesNotMatch(source, /\.firstdraft\/state\.json/);
    assert.doesNotMatch(
      source,
      /(?:authorization|bearer|api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret|BEGIN [A-Z ]+PRIVATE KEY)/i,
    );
  }
  assert.equal(
    createHash("sha256").update(homeResponse).digest("hex"),
    "ac9c699f8fee9848a5c5ab83a3383d08a9406f70aa41b1991d4ab036c2b8563e",
  );
  assert.match(
    homeResponse,
    /What is one record\?[\s\S]*?one unique object per record[\s\S]*?one quantity-bearing record[\s\S]*?both as two distinct kinds/,
  );

  for (const value of [
    freshModelServiceBaseline,
    freshModelPluginBaseline,
    freshModelPluginRuntimeDigest,
    freshModelClaudeExecutableDigest,
    historicalCliContractBaseline,
    historicalCliContractRuntimeDigest,
  ]) {
    assert(evidence.includes(value));
  }
  assert.match(
    evidence,
    /Home Inventory opening interview[\s\S]*?unique objects, quantities of an item, or\s+both[\s\S]*?location is a label or an independently managed flat or\s+nested subject[\s\S]*?who uses the app[\s\S]*?photos and documents[\s\S]*?financial information[\s\S]*?lifecycle\s+or history/,
  );
  assert.match(
    evidence,
    /One independent grader scored the exact response supplied as the candidate\s+evidence run[\s\S]*?passed all six[\s\S]*?grader did not inspect private traces/,
  );
  assert.match(
    evidence,
    /No CLI command or Plan write occurred[\s\S]*?both web counters were zero[\s\S]*?no denied tool was\s+attempted, not that tools were unrestricted[\s\S]*?model-service network[\s\S]*?not evidence of literally zero network traffic/,
  );
  assert.match(
    evidence,
    /evidence for one opening interview turn only[\s\S]*?does not evidence\s+incremental file authoring, CLI operation, First Draft transport, a complete\s+Plan, or Compilation/,
  );
  assert.match(
    evidence,
    /claims that “nothing” ran and that there\s+was “no network” are overbroad[\s\S]*?Skill invocation ran[\s\S]*?model-service network/,
  );
  assert.match(
    evidence,
    /npm pack --pack-destination <private-temporary-directory>[\s\S]*?npm install --prefix <private-temporary-directory>[\s\S]*?script\/compilation_http_cli_model_rehearsal[\s\S]*?--child <native-claude-2\.1\.221>[\s\S]*?--plugin-dir <skills-checkout-at-candidate-revision>/,
  );
  assert.match(
    evidence,
    /service harness recomputed the CLI digest from the freshly installed\s+package's sorted `src\/\*\*\/\*\.js`, `bin\/firstdraft\.js`, and `package\.json` paths[\s\S]*?4-byte big-endian relative-path length[\s\S]*?8-byte big-endian content length[\s\S]*?plugin digest uses the same\s+framing over sorted `\.claude-plugin\/\*\.json` paths and every regular file beneath\s+`skills\/create-full-stack-app\/`/,
  );
  assert.match(
    evidence,
    /two `plan push`\s+calls[\s\S]*?two bounded `plan status --wait` calls[\s\S]*?invoked `plan compile` exactly once/,
  );
  assert.match(
    evidence,
    /command ledger shows that the agent exercised `--version`[\s\S]*?did not exercise help for `generate uuid`,\s+`generate application-key`, `plan init`, `compilation status`, or\s+`compilation download`[\s\S]*?not evidence that the Skill's complete capability-verification list\s+was followed/,
  );
  assert.match(
    evidence,
    /did not contact real GitHub, staging, or production, did not deploy or\s+execute the generated application[\s\S]*?not evidence of published distribution or a general\s+compiler boundary/,
  );

  assert.equal(
    observation.format,
    "firstdraft.compilation-http-cli-model-rehearsal/1",
  );
  assert.deepEqual(Object.keys(observation).sort(), [
    "analysis",
    "child",
    "cleanup",
    "cli",
    "command_ledger",
    "compilation",
    "fixture",
    "format",
    "limitations",
    "materialization",
    "plugin",
    "project",
    "publication",
    "retained_download",
    "service",
  ]);
  assert.doesNotMatch(
    observationSource,
    /"(?:authorization|contents|credentials?|plan|source|state|token)"\s*:/i,
  );
  assert.doesNotMatch(
    observationSource,
    /(?:foundation-plan\.json|state\.json|\bfd_[A-Za-z0-9_-]+)/i,
  );
  assert.equal(
    observation.fixture,
    "Movie Catalog reserved-constant diagnostic repair",
  );
  assert.deepEqual(observation.child, {
    interface: "Claude Code CLI contract",
    reported_version: "2.1.221 (Claude Code)",
    executable_sha256: freshModelClaudeExecutableDigest,
    model: "opus",
    effort: "high",
  });
  assert.deepEqual(observation.service, {
    revision: freshModelServiceBaseline,
    tree_sha: freshModelServiceTree,
  });
  assert.deepEqual(observation.cli, {
    revision: historicalCliContractBaseline,
    runtime_sha256: historicalCliContractRuntimeDigest,
    version: "0.1.0-alpha.2",
  });
  assert.deepEqual(observation.plugin, {
    revision: freshModelPluginBaseline,
    runtime_sha256: freshModelPluginRuntimeDigest,
  });
  assert.equal(
    pluginRuntimeDigestAtRevision(freshModelPluginBaseline),
    freshModelPluginRuntimeDigest,
  );
  assert.deepEqual(observation.command_ledger, {
    "compilation.help": 1,
    "generate.help": 1,
    "plan.compile": 1,
    "plan.compile.help": 1,
    "plan.help": 1,
    "plan.push": 2,
    "plan.push.help": 1,
    "plan.status.help": 1,
    "plan.status_wait": 2,
    version: 1,
  });
  assert.equal(observation.project.graph_version, 2);
  assert.equal(observation.analysis.initial.graph_version, 1);
  assert.equal(observation.analysis.initial.status, "issues_found");
  assert.equal(
    observation.analysis.initial.diagnostic_code,
    "foundation_plan.identity.reserved_constant_collision",
  );
  assert.equal(observation.analysis.final.graph_version, 2);
  assert.equal(observation.analysis.final.status, "valid");
  assert.equal(
    observation.analysis.final.analyzer_release,
    foundationPlanAnalyzerRelease,
  );
  assert.equal(observation.compilation.graph_version, 2);
  assert.equal(observation.compilation.status, "succeeded");
  assert.equal(
    observation.compilation.compiler_release,
    foundationPlanCompilerRelease,
  );
  assert.deepEqual(observation.compilation.target, foundationPlanTarget);
  assert.equal(observation.compilation.artifact_file_count, 194);
  assert.equal(observation.compilation.artifact_byte_size, 542_894);
  assert.equal(
    observation.compilation.head_source_sha256,
    observation.project.head_source_sha256,
  );
  assert.equal(observation.publication.status, "succeeded");
  assert.equal(observation.publication.tree_sha, freshModelPublicationTree);
  assert.equal(observation.publication.commit_sha, freshModelPublicationCommit);
  assert.match(
    observation.publication.repository_full_name,
    /^fd-smoke-[0-9a-f]+\/movie-catalog$/,
  );
  assert.deepEqual(observation.publication.attempts, [
    [1, "create_repository", "succeeded"],
    [2, "publish_artifact", "succeeded"],
  ]);
  assert.equal(observation.retained_download.file_count, 194);
  assert.equal(
    observation.retained_download.manifest_sha256,
    observation.compilation.artifact_manifest_sha256,
  );
  assert.equal(observation.materialization.observed_file_count, 194);
  assert.deepEqual(observation.materialization.observed_modes, {
    "bin/rails": "0755",
    "ios/bin/ios": "0755",
  });
  assert.deepEqual(observation.materialization.verified_navigation_order, [
    "movies",
    "directors",
  ]);
  for (const path of [
    "app/models/movie.rb",
    "app/models/director.rb",
    "db/schema.rb",
    "ios/FoundationApp/Generated/ApplicationDefinition.swift",
    "ios/FoundationAppUITests/Generated/ApplicationNavigationUITests.swift",
  ]) {
    assert(observation.materialization.verified_required_paths.includes(path));
  }
  assert.deepEqual(observation.limitations, [
    "The service and packaged CLI run locally against a strict fake GitHub executor; no real GitHub, staging, or production state is mutated.",
    "The Movie Catalog fixture covers the currently admitted Rails and iOS Compilation slice, not arbitrary Foundation Plans.",
    "The result proves one pinned local Claude Code and plugin revision, not published distribution.",
  ]);
  assert.equal(
    observation.cleanup,
    "private state, traces, workspace, and database removed",
  );
});

test("local-directory plugin evidence remains revision-scoped", async () => {
  const [evidence, observationSource] = await Promise.all([
    readFile(claudePluginEvidence, "utf8"),
    readFile(claudePluginObservation, "utf8"),
  ]);
  const observation = JSON.parse(observationSource);

  assertRevisionTokens(evidence, [historicalPluginInstallEvidenceBaseline]);
  assert.equal(observation.schemaVersion, 3);
  assert.equal(observation.observedOn, "2026-08-04");
  assert.equal(
    observedFileBytes(observation.installedPlugin.files),
    observation.installedPlugin.totalBytes,
  );
  assert.equal(
    observedFileTreeSha256(observation.installedPlugin.files),
    observation.installedPlugin.treeSha256,
  );
  assertNoObservationAbsolutePathLeaks(observation);

  assert(
    evidence.includes(
      renderManifestValidationEvidence(
        "marketplace",
        observation.manifestValidation.marketplace,
      ),
    ),
  );
  assert(
    evidence.includes(
      renderManifestValidationEvidence(
        "preview plugin",
        observation.manifestValidation.previewPlugin,
      ),
    ),
  );
  assert(
    evidence.includes(
      `present=${renderStatePresenceNames(observation.realStateMonitor.present)}, ` +
        `absent=${renderStatePresenceNames(observation.realStateMonitor.absent)}`,
    ),
  );
  assertEvidenceStatePresenceBlock(
    evidence,
    [
      `- Present: ${renderEvidenceStateNames(observation.realStateMonitor.present)}`,
      `- Absent: ${renderEvidenceStateNames(observation.realStateMonitor.absent)}`,
      `- Excluded: ${renderEvidenceStateNames(observation.realStateMonitor.excluded)}`,
    ].join("\n"),
  );
  assert.match(
    evidence,
    /historical evidence for that revision's local-directory Claude\s+Code marketplace shape/,
  );
  assert.match(
    evidence,
    /later npm-source packaging path retired that recording command[\s\S]*?no current test\s+compares the working tree with this historical observation/,
  );
  assert.doesNotMatch(
    evidence,
    /Ordinary repository tests compare canonical source bytes with that observation/,
  );
});

test("installable Skills follow the portable repository profile", async () => {
  const entries = await readdir(skillsDirectory, { withFileTypes: true });
  const skillNames = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  assert.deepEqual(skillNames, ["create-full-stack-app"]);

  for (const skillName of skillNames) {
    await checkSkill(skillName);
  }
});

test("Claude Code packaging reuses the portable Skill exactly once", async () => {
  const checkoutManifest = JSON.parse(
    await readFile(path.join(claudePluginDirectory, "plugin.json"), "utf8"),
  );
  const marketplace = JSON.parse(
    await readFile(path.join(claudePluginDirectory, "marketplace.json"), "utf8"),
  );
  const packageTemplate = JSON.parse(
    await readFile(
      path.join(repository, "packages", "claude-plugin", "package.template.json"),
      "utf8",
    ),
  );
  const installableManifest = JSON.parse(
    await readFile(
      path.join(repository, "packages", "claude-plugin", ".claude-plugin", "plugin.json"),
      "utf8",
    ),
  );

  assert.equal(checkoutManifest.name, claudePluginName);
  assert.equal(checkoutManifest.displayName, "First Draft");
  assert.equal(checkoutManifest.version, "0.0.0");
  assert.deepEqual(checkoutManifest.skills, [`./skills/${portableSkillName}`]);
  assert.equal(marketplace.name, claudeMarketplaceName);
  assert.equal(marketplace.plugins.length, 1);
  assert.equal(marketplace.plugins[0].name, claudePluginName);
  assert.equal(marketplace.plugins[0].version, "0.1.1");
  assert.deepEqual(marketplace.plugins[0].source, {
    source: "npm",
    package: "@firstdraft.com/claude-code",
    version: "0.1.1",
    registry: "https://registry.npmjs.org/",
  });
  assert.equal(packageTemplate.version, "0.1.1");
  assert.equal(installableManifest.version, "0.1.1");
  assert.equal(packageTemplate.dependencies, undefined);
  assert.deepEqual(installableManifest.skills, [
    "./skills/create-full-stack-app",
  ]);
  assert.equal(installableManifest.userConfig, undefined);

  const repositoryFiles = trackedFiles();
  const checkoutComponents = repositoryFiles
    .map((file) => path.relative(repository, file))
    .filter((relativePath) =>
      forbiddenCheckoutRootClaudePluginComponentPaths.includes(
        relativePath.split(path.sep)[0],
      ),
    );
  assert.deepEqual(checkoutComponents, []);
  for (const relativePath of forbiddenCheckoutRootClaudePluginComponentPaths) {
    await assert.rejects(
      lstat(path.join(repository, relativePath)),
      (error) => error.code === "ENOENT",
    );
  }

  const pluginSkillDirectory = path.join(skillsDirectory, portableSkillName);
  const skillFiles = repositoryFiles.filter(
    (file) => path.basename(file) === "SKILL.md",
  );
  assert.deepEqual(skillFiles, [path.join(pluginSkillDirectory, "SKILL.md")]);
  const canonicalBody = await readFile(skillFiles[0]);
  const exactCopies = [];
  for (const file of repositoryFiles) {
    if (file === skillFiles[0]) continue;
    if ((await readFile(file)).equals(canonicalBody)) exactCopies.push(file);
  }
  assert.deepEqual(exactCopies, []);

  const installedSourceFiles = (await filesUnder(pluginSkillDirectory)).map(
    (file) => path.relative(pluginSkillDirectory, file),
  );
  assert.deepEqual(installedSourceFiles, canonicalClaudePluginSkillFiles);
  const forbiddenSegments = new Set(forbiddenClaudePluginPathSegments);
  for (const relativePath of installedSourceFiles) {
    assert.equal(
      relativePath
        .split(path.sep)
        .some((segment) => forbiddenSegments.has(segment)),
      false,
      `unexpected portable Skill path: ${relativePath}`,
    );
  }

  const packageSources = trackedFiles().filter((file) =>
    file.startsWith(path.join(repository, "packages", "claude-plugin")),
  );
  assert.equal(
    packageSources.some((file) => path.basename(file) === "SKILL.md"),
    false,
    "the installable package must not commit a second editable Skill copy",
  );

  const packageReadme = await readFile(path.join(repository, "README.md"), "utf8");
  assert.match(
    packageReadme,
    /Packing copies the canonical `skills\/create-full-stack-app` directory/,
  );
  assert.match(
    packageReadme,
    /plugin-root `bin\/` directory are added to the Bash tool's `PATH`/,
  );
  assert.match(
    packageReadme,
    /user configuration is not delivered to an executable merely because the plugin's `bin\/` directory is\s+on a Bash tool's `PATH`/,
  );
  assert.match(
    packageReadme,
    /ambient `FIRSTDRAFT_API_URL` and `FIRSTDRAFT_API_TOKEN` contract[\s\S]*?issue #27/,
  );
  assert.match(
    packageReadme,
    /claude plugin marketplace add firstdraft\/skills[\s\S]*?claude plugin install firstdraft@firstdraft-skills/,
  );
  const vendoredSmoke = await readFile(
    path.join(repository, "evidence", "2026-08-05-claude-plugin-vendored-cli-smoke.md"),
    "utf8",
  );
  assert.match(vendoredSmoke, /Claude Code 2\.1\.222/);
  assert.match(vendoredSmoke, /printing exactly `0\.1\.0-alpha\.2`/);
  assert.match(vendoredSmoke, /did not materialize its dependency/);
  assert.doesNotMatch(vendoredSmoke, /(?:\/Users\/|\/home\/|[A-Za-z]:\\)/);
});

test("repository inventory traverses .git directories and rejects unsafe .git entries", async () => {
  const inventoryRoot = path.resolve("/virtual/inventory");
  const rootGit = path.join(inventoryRoot, ".git");
  const nested = path.join(inventoryRoot, "nested");
  const nestedGit = path.join(nested, ".git");
  const directoryEntry = (name, type) => ({
    name,
    isDirectory: () => type === "directory",
    isFile: () => type === "file",
    isSymbolicLink: () => type === "symlink",
  });
  const inventory = new Map([
    [
      inventoryRoot,
      [
        directoryEntry(".git", "directory"),
        directoryEntry("nested", "directory"),
      ],
    ],
    [rootGit, [directoryEntry("root-retained", "file")]],
    [nested, [directoryEntry(".git", "directory")]],
    [nestedGit, [directoryEntry("nested-retained", "file")]],
  ]);
  const readDirectory = async (directory) => inventory.get(directory) ?? [];

  assert.deepEqual(
    await filesUnder(inventoryRoot, { readDirectory }),
    [
      path.join(rootGit, "root-retained"),
      path.join(nestedGit, "nested-retained"),
    ],
    ".git directories at every depth must be inventoried like any other directory",
  );

  for (const location of ["root", "nested"]) {
    for (const type of ["symlink", "special"]) {
      const unsafeInventory = new Map(
        location === "root"
          ? [[inventoryRoot, [directoryEntry(".git", type)]]]
          : [
              [inventoryRoot, [directoryEntry("nested", "directory")]],
              [nested, [directoryEntry(".git", type)]],
            ],
      );
      await assert.rejects(
        filesUnder(inventoryRoot, {
          readDirectory: async (directory) =>
            unsafeInventory.get(directory) ?? [],
        }),
        type === "symlink"
          ? /unexpected symlink: .*\.git/
          : /neither a directory nor a regular file: .*\.git/,
        `${location} .git ${type} entries must fail closed`,
      );
    }
  }
});

test("CI checks the exact modular CLI contract", async () => {
  const workflow = await readFile(
    path.join(repository, ".github", "workflows", "ci.yml"),
    "utf8",
  );
  const publishWorkflow = await readFile(
    path.join(repository, ".github", "workflows", "publish.yml"),
    "utf8",
  );
  const contractCheck = await readFile(
    path.join(repository, "script", "check-cli-contract.mjs"),
    "utf8",
  );
  const contractConfig = await readFile(
    path.join(repository, "script", "cli-contract", "config.mjs"),
    "utf8",
  );
  const repositoryCheck = await readFile(
    path.join(repository, "script", "check"),
    "utf8",
  );
  assert.match(
    workflow,
    new RegExp(
      `repository: firstdraft/cli\\s+ref: main\\s+fetch-depth: 0`,
    ),
  );
  assert.equal(
    [...publishWorkflow.matchAll(/[0-9a-f]{40}/g)].filter(
      ([revision]) => revision === cliContractBaseline,
    ).length,
    4,
  );
  assert.doesNotMatch(
    publishWorkflow
      .replace(/^.*uses:\s+\S+@[0-9a-f]{40}.*$/gm, "")
      .replaceAll(cliContractBaseline, ""),
    /\b[0-9a-f]{40}\b/,
  );
  assert.doesNotMatch(
    publishWorkflow,
    /secrets|auth[_-]?token|NODE_AUTH_TOKEN|NPM_TOKEN/i,
  );
  assert.doesNotMatch(publishWorkflow, /npm dist-tag|--tag latest/);
  assert.deepEqual(
    publishWorkflow.match(
      /^      - run: node script\/check-plugin-release-order\.mjs.*$/gm,
    ),
    [
      "      - run: node script/check-plugin-release-order.mjs",
      "      - run: node script/check-plugin-release-order.mjs",
    ],
  );
  assert.equal(
    publishWorkflow.match(
      /\+refs\/tags\/claude-v\*:refs\/release-check\/tags\/claude-v\*/g,
    )?.length,
    2,
  );
  assert.match(
    workflow,
    /name: Verify release toolchain\s+if: matrix\.node == '24\.18\.0'[\s\S]*?test "\$\(node --version\)" = "v24\.18\.0"[\s\S]*?test "\$\(npm --version\)" = "11\.16\.0"/,
  );
  assert.match(
    workflow,
    /name: Rehearse release ordering\s+if: matrix\.node == '24\.18\.0'[\s\S]*?\+refs\/tags\/claude-v\*:refs\/release-check\/tags\/claude-v\*[\s\S]*?node script\/check-plugin-release-order\.mjs --prospective/,
  );
  assert.deepEqual(
    workflow.match(
      /^          node script\/check-plugin-release-order\.mjs --prospective$/gm,
    ),
    ["          node script/check-plugin-release-order.mjs --prospective"],
  );
  assert.equal(
    publishWorkflow.match(
      /node script\/check-cli-registry-package\.mjs --cli-root tmp\/firstdraft-cli/g,
    )?.length,
    2,
  );
  const publishVerification = workflowJobSource(publishWorkflow, "verify");
  const publishApproval = workflowJobSource(publishWorkflow, "publish");
  for (const job of [publishVerification, publishApproval]) {
    assert.deepEqual(
      job.match(
        /^      - run: node script\/check-plugin-release-order\.mjs.*$/gm,
      ),
      ["      - run: node script/check-plugin-release-order.mjs"],
    );
  }
  const jobsSource = publishWorkflow.slice(
    publishWorkflow.indexOf("\njobs:\n") + "\njobs:\n".length,
  );
  assert.match(publishWorkflow, /^permissions: \{\}$/m);
  assert.deepEqual(jobsSource.match(/^  [a-z0-9_-]+:$/gm), [
    "  verify:",
    "  publish:",
  ]);
  assert.equal(publishWorkflow.match(/id-token: write/g)?.length, 1);
  const approvalEnvironmentKey = "\n    environment:";
  const approvalEnvironment = "\n    environment: npm\n";
  const approvalEnvironmentIndex = publishApproval.indexOf(
    approvalEnvironment,
  );
  const oidcPermission = "\n      id-token: write\n";
  const oidcPermissionIndex = publishApproval.indexOf(oidcPermission);
  assert.equal(
    publishVerification.includes(approvalEnvironmentKey),
    false,
    "verification must not enter the npm environment",
  );
  assert.equal(
    publishVerification.includes(oidcPermission),
    false,
    "only publication may request an OIDC token",
  );
  assert.ok(
    approvalEnvironmentIndex >= 0,
    "publication must select the approval-gated npm environment",
  );
  assert.equal(
    publishApproval.indexOf(approvalEnvironmentKey),
    approvalEnvironmentIndex,
  );
  assert.equal(
    publishApproval.indexOf(
      approvalEnvironmentKey,
      approvalEnvironmentIndex + approvalEnvironmentKey.length,
    ),
    -1,
    "the approval-gated environment must be unique",
  );
  assert.ok(oidcPermissionIndex >= 0, "publication must permit OIDC tokens");
  assert.equal(
    publishApproval.indexOf(
      oidcPermission,
      oidcPermissionIndex + oidcPermission.length,
    ),
    -1,
    "the OIDC permission must be unique",
  );
  assert.match(
    publishApproval,
    /permissions:[\s\S]*?contents: read[\s\S]*?id-token: write/,
  );
  for (const job of [publishVerification, publishApproval]) {
    const approvedRunner = "\n    runs-on: ubuntu-latest\n";
    const runnerKey = "\n    runs-on:";
    const approvedRunnerIndex = job.indexOf(approvedRunner);
    assert.ok(approvedRunnerIndex >= 0, "jobs must use the approved runner");
    assert.equal(job.indexOf(runnerKey), approvedRunnerIndex);
    assert.equal(
      job.indexOf(runnerKey, approvedRunnerIndex + runnerKey.length),
      -1,
      "each job must declare one runner",
    );
    assert.match(job, /node-version: 24\.18\.0/);
    assert.match(job, /package-manager-cache: false/);
    assert.match(job, /test "\$\(node --version\)" = "v24\.18\.0"/);
    assert.match(job, /test "\$\(npm --version\)" = "11\.16\.0"/);
  }
  const checkoutAction =
    "actions/checkout@" +
    "3d3c42e5" +
    "aac5ba805825da76410c181273ba90b1";
  const setupNodeAction =
    "actions/setup-node@" +
    "82076278" +
    "6026740c76f36085b0efc47a31fe5020";
  for (const job of [publishVerification, publishApproval]) {
    assert.deepEqual(
      [...job.matchAll(/^      - uses: (\S+)/gm)].map(([, action]) => action),
      [checkoutAction, setupNodeAction, checkoutAction],
      "release jobs may use only the reviewed checkout and setup-node actions",
    );
  }
  assert.match(
    publishApproval,
    /registry-url: https:\/\/registry\.npmjs\.org\/[\s\S]*?test -n "\$\{ACTIONS_ID_TOKEN_REQUEST_URL:-\}"[\s\S]*?test -n "\$\{ACTIONS_ID_TOKEN_REQUEST_TOKEN:-\}"/,
  );
  assert.deepEqual(
    publishWorkflow.match(/^\s+npm publish .*$/gm),
    [
      "          npm publish \"$RUNNER_TEMP/plugin/firstdraft.com-claude-code-${GITHUB_REF_NAME#claude-v}.tgz\" --access public --tag next --provenance --ignore-scripts",
    ],
  );
  assert.match(
    publishVerification,
    /node script\/check-cli-registry-package\.mjs --cli-root tmp\/firstdraft-cli[\s\S]*?node script\/check-claude-plugin-package\.mjs --cli-root tmp\/firstdraft-cli/,
  );
  assert.match(
    publishApproval,
    /environment: npm[\s\S]*?node script\/check-cli-registry-package\.mjs --cli-root tmp\/firstdraft-cli/,
  );
  for (const networkedCheck of [
    "check-cli-registry-package",
    "check-plugin-release-order",
  ]) {
    assert.doesNotMatch(repositoryCheck, new RegExp(networkedCheck));
  }
  assert.match(
    workflow,
    new RegExp(
      `merge-base --is-ancestor ${cliContractBaseline} HEAD`,
    ),
  );
  assert.match(
    workflow,
    new RegExp(`checkout --detach ${cliContractBaseline}`),
  );
  assert.match(
    workflow,
    /node script\/check-cli-contract\.mjs tmp\/firstdraft-cli/,
  );
  assert.match(
    workflow,
    /node script\/check-claude-plugin-package\.mjs --cli-root tmp\/firstdraft-cli/,
  );
  assert(contractConfig.includes(cliContractBaseline));
  assert(contractConfig.includes(cliContractRuntimeDigest));
  assert.match(contractConfig, /src\/commands\/compilation\.js/);
  assert.match(contractConfig, /src\/plan-compile-progress\.js/);
  const configuredReasonAllowlist = contractConfig.match(
    /safeGithubReasonCodes = Object\.freeze\(\[([\s\S]*?)\]\);/,
  );
  assert(configuredReasonAllowlist, "missing shared safe GitHub reason codes");
  assert.deepEqual(
    [...configuredReasonAllowlist[1].matchAll(/"(github\.[a-z._]+)"/g)].map(
      ([, reason]) => reason,
    ),
    safeGithubReasonCodes,
  );
  assert.match(contractCheck, /api_contract: \[">= 0\.2\.0", "< 0\.3\.0"\]/);
  for (const module of [
    "compilations",
    "local-commands",
    "packed-executable",
    "plan-journey",
    "plan-status",
    "publication-validation",
  ]) {
    assert.match(contractCheck, new RegExp(`cli-contract/${module}\\.mjs`));
  }
  assert.match(contractCheck, /MAX_ARTIFACT_BYTES, 16 \* 1024 \* 1024/);
  assert.match(contractCheck, /verifyPlanJourney/);
  assert.match(contractCheck, /verifyPlanStatusGenerations/);
  assert.match(contractCheck, /verifyCompilations/);
  assert.match(contractCheck, /verifyPublicationValidation/);
  assert.match(contractCheck, /verifyPackedExecutable/);

  const contractModules = Object.fromEntries(
    await Promise.all(
      [
        "artifact-safety",
        "compilations",
        "local-commands",
        "packed-executable",
        "plan-journey",
        "plan-status",
        "publication-validation",
      ].map(async (name) => [
        name,
        await readFile(
          path.join(repository, "script", "cli-contract", `${name}.mjs`),
          "utf8",
        ),
      ]),
    ),
  );
  const requiredCoverage = {
    "artifact-safety": [
      "invalid_artifact",
      "materialization_failed",
      "../traversal-escape.rb",
      "0o4755",
      "transport-digest",
      "status-byte-size",
      "provenanceHeadSourceSha256",
    ],
    compilations: [
      "./artifact-safety.mjs",
      "compilation_not_succeeded",
      "artifact_unavailable",
      "provenanceHeadSourceSha256",
      "foundation_plan.sha256",
    ],
    "local-commands": [
      "invalid_configuration",
      "local_initialization_failed",
      "authentication_required",
      "compilationTarget",
    ],
    "packed-executable": [
      "packed-download",
      "foundation_plan.sha256",
      "invokeExecutableAsync",
      "compilationTarget",
    ],
    "plan-journey": [
      "local_plan_changed",
      "plan_not_valid",
      "analysis_failed",
      "analysis_wait_timed_out",
      "request_outcome_unknown",
      "malformed-json-diagnostics.json",
      "First Draft: Application compiled.",
      "https://github.com/octocat/movie-catalog",
    ],
    "plan-status": [
      "project_not_pushed",
      "status_unavailable",
      "invalid_server_response",
      "server_rejected",
      "recurring-issues-analysis.json",
    ],
    "publication-validation": [
      "invalid_publication_status",
      "publication_changed",
      "publication_failed",
      "publication_cancelled",
      "publication_wait_timed_out",
      "publication_status_unavailable",
      "publication_start_rejected",
      "publication-server-outcome-unknown",
      "publication-missing-progress",
      "publication-null-progress",
      "publication-incomplete-progress",
      "progress-retry-time-without-count",
      "progress-noncanonical-retry-time",
      "failed-publication-with-running-compilation",
      "cancelled-publication-with-queued-compilation",
      "assertPublicationRequestSequence",
      "progressMessages",
      "safeGithubReasonCodes",
      "operator recovery required",
      "2026-08-07T16:15:00.000000Z",
      "private: false",
      'type: "Organization"',
    ],
  };
  for (const [module, tokens] of Object.entries(requiredCoverage)) {
    for (const token of tokens) {
      assert(
        contractModules[module].includes(token),
        `${module}: missing contract coverage for ${token}`,
      );
    }
  }
});

test("behavioral eval cases are well-formed and reference real fixtures", async () => {
  const skillName = "create-full-stack-app";
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
      assert.equal(typeof artifact, "object");
      assert(artifact !== null);
      assert(
        artifact.role === "input" || artifact.role === "expected_output",
        `invalid eval artifact role: ${artifact.role}`,
      );
      assert.equal(typeof artifact.path, "string");
      const expectedKeys = artifact.stage_as
        ? ["path", "role", "stage_as"]
        : ["path", "role"];
      assert.deepEqual(Object.keys(artifact).sort(), expectedKeys);

      const artifactPath = path.resolve(repository, artifact.path);
      assert(
        artifactPath.startsWith(`${evalsDirectory}${path.sep}`),
        `eval artifact escapes evals/: ${artifact.path}`,
      );
      assert(
        (await stat(artifactPath)).isFile(),
        `missing eval artifact: ${artifact.path}`,
      );

      if (artifact.stage_as) {
        assert.equal(artifact.role, "input");
        assert.equal(typeof artifact.stage_as, "string");
        assert.equal(path.posix.normalize(artifact.stage_as), artifact.stage_as);
        assert(!artifact.stage_as.includes("\\"));
        assert(!path.posix.isAbsolute(artifact.stage_as));
        const stagingRoot = "/evaluation-project";
        const stagedPath = path.posix.resolve(stagingRoot, artifact.stage_as);
        assert(
          stagedPath.startsWith(`${stagingRoot}/`),
          `eval staging destination escapes project: ${artifact.stage_as}`,
        );
      }
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
      "create-full-stack-app",
      "references",
      "examples.md",
    ),
  );
  const foundationPlanReference = await markdownJsonDocuments(
    path.join(
      skillsDirectory,
      "create-full-stack-app",
      "references",
      "foundation-plan-019.md",
    ),
  );
  const fixture = JSON.parse(
    await readFile(
      path.join(
        evalsDirectory,
        "create-full-stack-app",
        "fixtures",
        "empty.foundation-plan.json",
      ),
      "utf8",
    ),
  );
  assert.deepEqual(documentedPlans[0], fixture);
  assert.deepEqual(foundationPlanReference.at(-1), fixture.application);
});

test("bounded importer prose remains bound to the exact allowlists", async () => {
  const skillSource = await readFile(
    path.join(skillsDirectory, "create-full-stack-app", "SKILL.md"),
    "utf8",
  );
  const referencesDirectory = path.join(
    skillsDirectory,
    "create-full-stack-app",
    "references",
  );
  const foundationPlanReference = await readFile(
    path.join(referencesDirectory, "foundation-plan-019.md"),
    "utf8",
  );
  const documentedTypeSection = foundationPlanReference.match(
    /A Field may use these types:\n\n([\s\S]*?)\n\nFor every supported type/,
  );
  assert(
    documentedTypeSection,
    "foundation-plan-019.md: missing supported Field type list",
  );
  assert.deepEqual(
    [...documentedTypeSection[1].matchAll(/^- `([^`]+)`$/gm)].map(
      (match) => match[1],
    ),
    supportedFieldTypes,
  );

  const documentedPropertySection = foundationPlanReference.match(
    /For every supported type, the importer retains schema-valid combinations of ([\s\S]*?)\.\n\nAn `enum` Field/,
  );
  assert(
    documentedPropertySection,
    "foundation-plan-019.md: missing retained Field property list",
  );
  assert.deepEqual(
    [...documentedPropertySection[1].matchAll(/`([^`]+)`/g)].map(
      (match) => match[1],
    ),
    supportedFieldProperties,
  );

  const documentedEnumSection = foundationPlanReference.match(
    /An `enum` Field additionally requires ([\s\S]*?)\n\nA Field `default`/,
  );
  assert(
    documentedEnumSection,
    "foundation-plan-019.md: missing supported enum guidance",
  );
  assert.match(
    documentedEnumSection[0],
    /requires `settings\.values`, a nonempty array in stable order/,
  );
  assert.match(
    documentedEnumSection[0],
    /Each value\s+has its own `subject_uuid`, owner-local `key`, and human-facing `name`/,
  );
  assert.match(
    documentedEnumSection[0],
    /optional\s+`settings\.ordinal` to `true` only when the order carries semantic\s+rank/,
  );
  assert.match(documentedEnumSection[0], /omission and `false` are equivalent/);
  assert.match(
    documentedEnumSection[0],
    /Preserve a value's\s+UUID through renames, reordering, and coherent moves between enum Fields/,
  );
  assert.match(
    documentedEnumSection[0],
    /An enum literal default contains the\s+selected value's owner-local `key`, not its UUID\.[\s\S]*?Update that literal in the same candidate when renaming the value,\s+while preserving the value's UUID/,
  );
  assert.match(
    foundationPlanReference,
    /A Field `default` is one closed tagged Value\. Its tag is `literal`, `environment`, `environment_path`, or\s+`reference_record`/,
  );
  assert.match(
    foundationPlanReference,
    /A `decimal` literal uses a canonical, non-exponent decimal string[\s\S]*?a JSON number, plus sign, negative zero, exponent, a redundant\s+leading zero before another integer digit, or trailing fractional zero is not/,
  );
  assert.match(
    foundationPlanReference,
    /bounded importer structurally retains all four schema-valid tags without checking their type or resolving\s+their links/,
  );
  assert.match(
    foundationPlanReference,
    /A Field default has no `subject_uuid`; adding, changing, or clearing one preserves the Field's\s+identity/,
  );
  assert.match(
    foundationPlanReference,
    /Omitting a Field's `default` means it has no authored default[\s\S]*?authored literal-null default/,
  );
  assert.match(
    foundationPlanReference,
    /retention is structural, not default analysis[\s\S]*?does not prove literal compatibility[\s\S]*?Compiler lowering/,
  );
  const documentedReferenceSection = foundationPlanReference.match(
    /A Reference retains schema-valid combinations of\s+([\s\S]*?)\. Its ordered target Entity keys/,
  );
  assert(
    documentedReferenceSection,
    "foundation-plan-019.md: missing retained Reference property list",
  );
  assert.deepEqual(
    [...documentedReferenceSection[1].matchAll(/`([^`]+)`/g)].map(
      (match) => match[1],
    ),
    supportedReferenceProperties,
  );
  assert.match(
    foundationPlanReference,
    /Project graph mechanically\s+maintains its same-key forward Association/,
  );
  assert.match(
    foundationPlanReference,
    /Compiler admits only an ordinary Reference with one target, omitted or false `one_to_one` and `immutable`[\s\S]*?post-table foreign key[\s\S]*?supports self-References and migration-order cycles/,
  );
  assert.match(
    foundationPlanReference,
    /conditional `presence` or `absence` on an admitted ordinary Reference[\s\S]*?nonordinary References[\s\S]*?fail closed/,
  );
  const documentedPredicateSection = foundationPlanReference.match(
    /A Predicate retains schema-valid combinations of ([\s\S]*?)\. Import preserves/,
  );
  assert(
    documentedPredicateSection,
    "foundation-plan-019.md: missing retained Predicate property list",
  );
  assert.deepEqual(
    [...documentedPredicateSection[1].matchAll(/`([^`]+)`/g)].map(
      (match) => match[1],
    ),
    supportedPredicateProperties,
  );
  assert.match(
    foundationPlanReference,
    /Importability does not imply that the current bounded whole-graph analyzer or Compiler accepts a Project containing\s+enum Fields or Predicates/,
  );
  assert.match(
    foundationPlanReference,
    /Nonempty delivery, development\s+data, derivations, Accounts, and other graph slices outside the importer boundary reject the complete conditional\s+PUT[\s\S]*?Imported\s+but unadmitted shapes, including enum Fields, Predicates, broader References, Associations, Validations, and\s+Scaffolds, instead fail the complete candidate at target analysis/,
  );
  assert.match(
    skillSource,
    /ordinary single-target\s+References[\s\S]*?bounded Validation subset including\s+conditional text length[\s\S]*?exact public web index, create\/update, show-projection, return-destination, and destroy\s+Scaffold shapes[\s\S]*?iPhone project limited to index\/navigation[\s\S]*?web routes do not become native detail or mutation screens/,
  );
  assert.match(
    foundationPlanReference,
    /`domain`, `appearance`, and `native` are retained as editable\s+graph state; a nonempty `delivery` remains outside this import boundary/,
  );
  assert.match(
    foundationPlanReference,
    /prepared application analyzer and Compiler admit `domain` only when `native\.ios` is selected/,
  );
  assert.match(
    foundationPlanReference,
    /selected iPhone\s+client may omit `domain`, but it requires at least one admitted Scaffold containing a public index[\s\S]*?index supplies the native navigation entry even when that Scaffold includes the exact admitted web[\s\S]*?extensions do not add native detail or mutation screens/,
  );
  assert.match(
    foundationPlanReference,
    /prepared Compilation emits admitted web public indexes and, when selected, an owned iPhone project beneath\s+`ios\/`/,
  );
  assert.match(
    foundationPlanReference,
    /smallest admitted Scaffold requests exactly the public `index` resource route[\s\S]*?One exact create\/update extension requires ordered `index`, `new`, `create`, `edit`, and `update` routes[\s\S]*?One exact show extension inserts `show` after `index`[\s\S]*?One exact destroy variant appends `destroy`/,
  );
  const modelingGuide = await readFile(
    path.join(referencesDirectory, "modeling-guide.md"),
    "utf8",
  );
  assert.match(
    modelingGuide,
    /smallest current Scaffold subset has `resource_routes: \["index"\]` and a public index[\s\S]*?exact extension adds\s+public create and update[\s\S]*?second inserts\s+public show[\s\S]*?final variant appends public destroy/,
  );
  assert.match(
    modelingGuide,
    /Select `native\.ios` only when the user wants the bounded owned iPhone project[\s\S]*?requires at least one admitted\s+public-index Scaffold for navigation[\s\S]*?Application `domain` is admitted by analysis only with selected\s+iOS[\s\S]*?Appearance and Android are retained for editing but block Compilation at analysis; nonempty delivery is not\s+importable[\s\S]*?Accounts, authentication behavior, notifications and push, deployment, and iPad remain outside/,
  );
  assert.match(
    modelingGuide,
    /only admitted navigation Scaffold is public[\s\S]*?records\s+readable on the web without authentication[\s\S]*?Confirm that exposure with the user[\s\S]*?Do not add a public index merely to obtain `valid`[\s\S]*?do not silently decline the requested iPhone client/,
  );
  assert.match(
    foundationPlanReference,
    /admitted\s+Scaffold makes the Entity's records readable on the web without\s+authentication[\s\S]*?Confirm that exposure with the user[\s\S]*?selected iPhone\s+request cannot yet pass analysis/,
  );
  assert.match(
    modelingGuide,
    /current importer retains enums for editing,\s+but they cannot pass the bounded Compilation analysis gate[\s\S]*?preserve the product meaning/,
  );
  assert.match(
    foundationPlanReference,
    /Enum Fields are retained for editing, but they cannot pass the current Compilation analysis gate[\s\S]*?rather than weakening it to a scalar/,
  );

  const diagnosticsReference = await readFile(
    path.join(referencesDirectory, "diagnostics-and-recovery.md"),
    "utf8",
  );
  const installedNarrativeSources = await Promise.all(
    (await readdir(referencesDirectory))
      .filter((file) => file.endsWith(".md"))
      .sort()
      .map((file) => readFile(path.join(referencesDirectory, file), "utf8")),
  );
  const agentMetadata = await readFile(
    path.join(skillsDirectory, "create-full-stack-app", "agents", "openai.yaml"),
    "utf8",
  );
  for (const source of [skillSource, agentMetadata, ...installedNarrativeSources]) {
    assert.doesNotMatch(
      source,
      /before pushing this (?:Skill )?change|pending local-work|unmerged|unpushed/i,
    );
  }
  assert.match(
    diagnosticsReference,
    /root pointer `""` identifies a whole-document loader check, including numeric-literal range or round-trip\s+problems[\s\S]*?name the candidates instead of guessing/,
  );
  assert.match(
    foundationPlanReference,
    /A `decimal` literal uses a canonical, non-exponent decimal string/,
  );

  const examples = await readFile(
    path.join(referencesDirectory, "examples.md"),
    "utf8",
  );
  const additionalTypeSentence = examples.match(
    /reviewed importer also accepts ([\s\S]*?) Fields/,
  );
  assert(
    additionalTypeSentence,
    "examples.md: missing additional supported Field type list",
  );
  assert.deepEqual(
    [...additionalTypeSentence[1].matchAll(/`([^`]+)`/g)].map(
      (match) => match[1],
    ),
    supportedScalarFieldTypes.filter((type) => type !== "short_text"),
  );

  const ordinalPlan = (await markdownJsonDocuments(
    path.join(referencesDirectory, "examples.md"),
  )).find((document) => document?.application?.key === "ranked_tasks");
  assert(ordinalPlan, "examples.md: missing ordinal enum Plan");
  const ordinalEntity = ordinalPlan.application.entities[0];
  const ordinalField = ordinalEntity.fields.find(({ type }) => type === "enum");
  assert(ordinalField, "examples.md: missing enum Field");
  assert.deepEqual(
    ordinalField.settings.values.map(({ key }) => key),
    ["low", "medium", "high"],
  );
  assert.equal(ordinalField.settings.ordinal, true);
  assert.deepEqual(ordinalField.default, {
    kind: "literal",
    value: "medium",
  });
  assert(!("validations" in ordinalField));
  const identities = [
    ordinalEntity.subject_uuid,
    ...ordinalEntity.fields.map(({ subject_uuid }) => subject_uuid),
    ...ordinalField.settings.values.map(({ subject_uuid }) => subject_uuid),
  ];
  assert.equal(identities.length, 6);
  assert.equal(new Set(identities).size, identities.length);

  const enumFixture = JSON.parse(
    await readFile(
      path.join(
        evalsDirectory,
        "create-full-stack-app",
        "fixtures",
        "supported-enum.foundation-plan.json",
      ),
      "utf8",
    ),
  );
  assert.deepEqual(ordinalPlan, enumFixture);

  const applicationIntentPlan = (await markdownJsonDocuments(
    path.join(referencesDirectory, "examples.md"),
  )).find((document) => document?.application?.key === "movie_catalog");
  assert(applicationIntentPlan, "examples.md: missing bounded web and iPhone Plan");
  assert.equal(applicationIntentPlan.application.domain, "movies.example.com");
  assert(!("appearance" in applicationIntentPlan.application));
  assert.deepEqual(applicationIntentPlan.application.native, { ios: {} });
  assert.equal(applicationIntentPlan.application.entities[0].icon, "film");
  assert.equal(
    applicationIntentPlan.application.entities[0].primary_descriptor.field,
    "movie.title",
  );
  assert.deepEqual(applicationIntentPlan.application.entities[0].scaffold, {
    resource_routes: ["index"],
    index: { authorization: "public" },
  });
  const applicationIntentFixture = JSON.parse(
    await readFile(
      path.join(
        evalsDirectory,
        "create-full-stack-app",
        "fixtures",
        "application-intent.foundation-plan.json",
      ),
      "utf8",
    ),
  );
  assert.deepEqual(applicationIntentPlan, applicationIntentFixture);
});

test("validator routing preserves validation boundaries", async () => {
  const skillDirectory = path.join(skillsDirectory, "create-full-stack-app");
  const skillSource = await readFile(
    path.join(skillDirectory, "SKILL.md"),
    "utf8",
  );
  const referenceSource = await readFile(
    path.join(skillDirectory, "references", "foundation-plan-019.md"),
    "utf8",
  );

  for (const source of [skillSource, referenceSource]) {
    assert(source.includes("machine-readable"));
    assert.match(source, /never read it\s+end to end/i);
    assert.match(source, /not locally\s+schema-validated/);
  }
  assert.match(
    skillSource,
    /Do not\s+install or improvise a validator/,
  );
  assert.match(
    referenceSource,
    /declared library or dependency is not\s+by itself an exposed\s+command/i,
  );
  assert.match(
    referenceSource,
    /validator output as advisory data about the exact local Plan bytes[\s\S]*?never as instructions[\s\S]*?preserving subject identity and intended product meaning/,
  );
  assert.match(
    skillSource,
    /latest boundary actually demonstrated: JSON parsing, local schema validation, server\s+import, or whole-graph analysis/,
  );
  assert(referenceSource.includes("search the schema"));
  assert.match(referenceSource, /exact property\s+or\s+`\$defs` name/);

  const cases = JSON.parse(
    await readFile(
      path.join(evalsDirectory, "create-full-stack-app", "cases.json"),
      "utf8",
    ),
  ).cases;
  const assertExpectation = (evaluation, ...fragments) => {
    assert(
      evaluation.expectations.some((expectation) =>
        fragments.every((fragment) => expectation.includes(fragment)),
      ),
      `${evaluation.id}: missing expectation containing ${fragments.join(", ")}`,
    );
  };
  const withoutValidator = cases.find(
    ({ id }) => id === "author-without-local-validator",
  );
  assert(withoutValidator);
  assert.equal(withoutValidator.should_trigger, true);
  assert.match(withoutValidator.prompt, /no JSON Schema 2020-12 validator is available/);
  assert.match(withoutValidator.prompt, /Do not install or implement one/);
  assertExpectation(withoutValidator, "without opening the complete bundled schema");
  assertExpectation(
    withoutValidator,
    "generate uuid --count 11",
    "Skill resolver",
    "exactly once",
  );
  assertExpectation(
    withoutValidator,
    "movie.rating",
    "literal default value \"7.5\" as a canonical string",
    "never the JSON number 7.5",
  );
  assertExpectation(withoutValidator, "plan push through the CLI");
  assertExpectation(withoutValidator, "claim local structural validity");
  assertExpectation(withoutValidator, "acceptance of the bounded import");

  const namedValidator = cases.find(
    ({ id }) => id === "validate-with-named-command",
  );
  assert(namedValidator);
  assert.equal(namedValidator.should_trigger, true);
  assert.match(namedValidator.prompt, /validate-foundation-plan --schema/);
  assert.match(namedValidator.prompt, /do not send it/);
  assertExpectation(
    namedValidator,
    "specifically named command",
    "once for the initial check",
    "again only after a deliberate repair",
  );
  assertExpectation(namedValidator, "without opening or loading the complete schema");
  assertExpectation(
    namedValidator,
    "If the command reports errors",
    "advisory data",
    "preserving subject identity and intended product meaning",
  );
  assertExpectation(
    namedValidator,
    "If the named command is absent",
    "not locally schema-validated",
  );
  assertExpectation(namedValidator, "Does not run plan push");
  assertExpectation(namedValidator, "without claiming server acceptance");
  assert.deepEqual(
    namedValidator.artifacts.map(({ stage_as: stageAs }) => stageAs),
    [".firstdraft/foundation-plan.json", ".firstdraft/state.json"],
  );

  const libraryOnly = cases.find(
    ({ id }) => id === "declared-validator-library-is-not-command",
  );
  assert(libraryOnly);
  assert.equal(libraryOnly.should_trigger, true);
  assert.match(libraryOnly.prompt, /declares a JSON Schema library/);
  assert.match(libraryOnly.prompt, /neither I nor the project names a validation command/);
  assertExpectation(libraryOnly, "not exposing a validator command");
  assertExpectation(libraryOnly, "Does not use npx", "install");
  assertExpectation(libraryOnly, "not locally schema-validated");
  assert.deepEqual(
    libraryOnly.artifacts.map(({ stage_as: stageAs }) => stageAs),
    [
      "package.json",
      ".firstdraft/foundation-plan.json",
      ".firstdraft/state.json",
    ],
  );
});

test("complete examples and eval Plans validate against the bundled exact schema", async () => {
  const skillDirectory = path.join(skillsDirectory, "create-full-stack-app");
  const schemaSource = await readFile(
    path.join(skillDirectory, "references", "foundation-plan-0.19.schema.json"),
    "utf8",
  );
  assert.equal(
    createHash("sha256").update(schemaSource).digest("hex"),
    foundationPlanSchemaDigest,
  );
  const referenceSource = await readFile(
    path.join(skillDirectory, "references", "foundation-plan-019.md"),
    "utf8",
  );
  assert(referenceSource.includes(foundationPlanSchemaDigest));
  assert(referenceSource.includes(foundationPlanServerBaseline));
  assert(referenceSource.includes(compilationEvidenceCliBaseline));
  assert(referenceSource.includes(compilationEvidenceCliRuntimeDigest));
  assert(referenceSource.includes(cliContractBaseline));
  assert(referenceSource.includes(cliContractRuntimeDigest));
  assert(referenceSource.includes(foundationIosCoreRevision));
  assert(referenceSource.includes(foundationIosCoreArchiveDigest));
  assert.match(
    referenceSource,
    /bundled schema was copied from `docs\/architecture\/design\/foundation-plan\.schema\.json` at landed server\s+activation revision[\s\S]*?revision is exact contract provenance,\s+not release or execution evidence/,
  );

  const schema = JSON.parse(schemaSource);
  const ajv = new Ajv2020({
    allErrors: true,
    strict: true,
    strictRequired: false,
  });
  const validate = ajv.compile(schema);
  const examplesPath = path.join(skillDirectory, "references", "examples.md");
  const examples = (await markdownJsonDocuments(examplesPath)).map(
    (document, index) => ({
      document,
      label: `${path.relative(repository, examplesPath)} block ${index + 1}`,
    }),
  );
  const evaluationPlans = await Promise.all(
    (await filesUnder(evalsDirectory))
      .filter((file) => file.endsWith(".foundation-plan.json"))
      .map(async (file) => ({
        document: JSON.parse(await readFile(file, "utf8")),
        label: path.relative(repository, file),
      })),
  );

  for (const { document, label } of [...examples, ...evaluationPlans]) {
    assert(validate(document), `${label}: ${ajvErrors(validate.errors)}`);
  }

  const fragmentDefinitions = ["field", "scaffold", "association"];
  const fragments = await markdownJsoncDocuments(examplesPath);
  assert.equal(fragments.length, fragmentDefinitions.length);
  fragmentDefinitions.forEach((definition, index) => {
    const validateFragment = ajv.getSchema(`${schema.$id}#/$defs/${definition}`);
    assert(validateFragment, `missing schema definition: ${definition}`);
    assert(
      validateFragment(fragments[index]),
      `${path.relative(repository, examplesPath)} ${definition} fragment: ${ajvErrors(validateFragment.errors)}`,
    );
  });
});

test("revision evals stage existing Plan identity and private state", async () => {
  const evaluationDirectory = path.join(evalsDirectory, "create-full-stack-app");
  const cases = JSON.parse(
    await readFile(path.join(evaluationDirectory, "cases.json"), "utf8"),
  ).cases;
  const stagedPlanArtifacts = [
    {
      path: "evals/create-full-stack-app/fixtures/resume.foundation-plan.json",
      role: "input",
      stage_as: ".firstdraft/foundation-plan.json",
    },
    {
      path: "evals/create-full-stack-app/fixtures/state-placeholder.txt",
      role: "input",
      stage_as: ".firstdraft/state.json",
    },
  ];
  for (const id of [
    "resume-with-stable-identity",
    "add-field-with-minted-id",
    "add-ordinal-enum-with-minted-ids",
  ]) {
    assert.deepEqual(
      cases.find((evaluation) => evaluation.id === id).artifacts,
      stagedPlanArtifacts,
    );
  }
  const enumRenameEvaluation = cases.find(
    ({ id }) => id === "rename-defaulted-enum-value",
  );
  assert.deepEqual(enumRenameEvaluation.artifacts, [
    {
      path: "evals/create-full-stack-app/fixtures/supported-enum.foundation-plan.json",
      role: "input",
      stage_as: ".firstdraft/foundation-plan.json",
    },
    stagedPlanArtifacts[1],
  ]);
  assert(
    enumRenameEvaluation.expectations.some((expectation) =>
      expectation.includes("existing subject_uuid"),
    ),
    "enum rename eval must preserve value identity",
  );
  assert(
    enumRenameEvaluation.expectations.some((expectation) =>
      expectation.includes("literal default from medium to standard"),
    ),
    "enum rename eval must update the dependent default",
  );
  assert(
    enumRenameEvaluation.expectations.some((expectation) =>
      expectation.includes("Does not run generate uuid"),
    ),
    "enum rename eval must not mint a replacement identity",
  );
  assert(
    enumRenameEvaluation.expectations.some((expectation) =>
      expectation.includes("state.json unopened and unchanged"),
    ),
    "enum rename eval must preserve private CLI state",
  );
  assert(
    enumRenameEvaluation.expectations.some((expectation) =>
      expectation.includes("Does not run plan init or plan push or make a network request"),
    ),
    "enum rename eval must remain local",
  );
  const mintingEvaluation = cases.find(
    ({ id }) => id === "add-field-with-minted-id",
  );
  assert(
    mintingEvaluation.expectations.some((expectation) =>
      ["generate uuid", "Skill resolver", "exactly once"].every((fragment) =>
        expectation.includes(fragment),
      ),
    ),
  );
  assert(
    mintingEvaluation.expectations.some((expectation) =>
      expectation.includes("Never fabricates a UUIDv7"),
    ),
  );
  const enumEvaluation = cases.find(
    ({ id }) => id === "add-ordinal-enum-with-minted-ids",
  );
  assert(
    enumEvaluation.expectations.some((expectation) =>
      ["generate uuid --count 4", "Skill resolver", "exactly once"].every(
        (fragment) => expectation.includes(fragment),
      ),
    ),
    "enum eval must mint exactly one Field and three value IDs",
  );
  assert(
    enumEvaluation.expectations.some((expectation) =>
      expectation.includes("Never fabricates a UUIDv7"),
    ),
    "enum eval must forbid fabricated or copied IDs",
  );
  assert(
    enumEvaluation.expectations.some((expectation) =>
      expectation.includes("settings.values in low, medium, high order"),
    ),
    "enum eval must bind value order",
  );
  assert(
    enumEvaluation.expectations.some((expectation) =>
      expectation.includes("literal default of medium without minting another subject ID"),
    ),
    "enum eval must reuse the value key without minting a default ID",
  );
  assert(
    enumEvaluation.expectations.some((expectation) =>
      expectation.includes("Does not run plan init or plan push"),
    ),
    "enum authoring eval must remain local",
  );

  const plan = JSON.parse(
    await readFile(
      path.join(evaluationDirectory, "fixtures", "resume.foundation-plan.json"),
      "utf8",
    ),
  );
  assert.equal(plan.application.entities.length, 1);
  const movie = plan.application.entities[0];
  assert.equal(movie.key, "movie");
  assert.equal(movie.primary_descriptor.field, "movie.title");
  assert.equal(movie.fields.length, 1);
  assert.equal(movie.fields[0].key, "title");
  assert.equal(
    movie.fields[0].subject_uuid,
    "01900000-0000-7000-8000-000000000002",
  );

  const placeholder = await readFile(
    path.join(evaluationDirectory, "fixtures", "state-placeholder.txt"),
    "utf8",
  );
  assert.equal(
    placeholder,
    "Opaque evaluator state. Stage this file, but do not expose or open it in the agent context.\n",
  );
  assert.throws(() => JSON.parse(placeholder));
});

test("subject identity evals use the public UUID generator", async () => {
  const cases = JSON.parse(
    await readFile(
      path.join(evalsDirectory, "create-full-stack-app", "cases.json"),
      "utf8",
    ),
  ).cases;
  const field = cases.find(({ id }) => id === "add-field-with-minted-id");
  const enumeration = cases.find(
    ({ id }) => id === "add-ordinal-enum-with-minted-ids",
  );

  assert.match(field.prompt, /installed firstdraft CLI includes generate uuid/);
  assert(
    field.expectations.some((expectation) =>
      ["generate uuid", "Skill resolver", "exactly once"].every((fragment) =>
        expectation.includes(fragment),
      ),
    ),
  );
  assert.match(
    enumeration.prompt,
    /installed firstdraft CLI includes generate uuid/,
  );
  assert(
    enumeration.expectations.some((expectation) =>
      ["generate uuid --count 4", "Skill resolver", "exactly once"].every(
        (fragment) => expectation.includes(fragment),
      ),
    ),
  );
  for (const evaluation of [field, enumeration]) {
    assert(
      evaluation.expectations.some((expectation) =>
        expectation.includes("Never fabricates a UUIDv7"),
      ),
    );
  }
});

test("bounded import evals bind supported and unsupported Plan state", async () => {
  const evaluationDirectory = path.join(evalsDirectory, "create-full-stack-app");
  const cases = JSON.parse(
    await readFile(path.join(evaluationDirectory, "cases.json"), "utf8"),
  ).cases;
  const stateArtifact = {
    path: "evals/create-full-stack-app/fixtures/state-placeholder.txt",
    role: "input",
    stage_as: ".firstdraft/state.json",
  };
  const replaceBeforeServerEvaluationStateArtifact = {
    path:
      "evals/create-full-stack-app/fixtures/replace-before-server-eval.state.json",
    role: "input",
    stage_as: ".firstdraft/state.json",
  };
  const supportedPlanArtifact = {
    path:
      "evals/create-full-stack-app/fixtures/supported-scalars.foundation-plan.json",
    role: "input",
    stage_as: ".firstdraft/foundation-plan.json",
  };
  const supportedEvaluation = cases.find(
    ({ id }) => id === "review-supported-scalar-plan",
  );

  assert.deepEqual(supportedEvaluation.artifacts, [
    supportedPlanArtifact,
    stateArtifact,
  ]);
  const supportedPlan = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "supported-scalars.foundation-plan.json",
      ),
      "utf8",
    ),
  );
  const supportedEntity = supportedPlan.application.entities[0];
  assert.equal(supportedPlan.application.entities.length, 1);
  assert.equal(supportedEntity.primary_descriptor.field, "movie.title");
  assert.deepEqual(
    supportedEntity.fields.map(({ type }) => type),
    supportedScalarFieldTypes,
  );
  assert.deepEqual(
    [
      ...new Set(
        supportedEntity.fields.flatMap((field) => Object.keys(field)),
      ),
    ].sort(),
    [...supportedFieldProperties].sort(),
  );
  const descriptorKey = supportedEntity.primary_descriptor.field
    .split(".")
    .at(-1);
  const descriptorField = supportedEntity.fields.find(
    ({ key }) => key === descriptorKey,
  );
  assert(descriptorField, "supported fixture: descriptor Field does not resolve");
  assert.equal(descriptorField.type, "short_text");
  assert.equal(descriptorField.required, true);
  const publishedAt = supportedEntity.fields.find(
    ({ key }) => key === "published_at",
  );
  assert(publishedAt, "supported scalar fixture: missing published_at Field");
  assert.deepEqual(publishedAt.default, {
    kind: "environment",
    name: "current_time",
  });
  assert(
    supportedEvaluation.expectations.some((expectation) =>
      expectation.includes("current_time environment default"),
    ),
    "supported scalar eval must recognize the environment default",
  );
  const rating = supportedEntity.fields.find(({ key }) => key === "rating");
  assert(rating, "supported scalar fixture: missing rating Field");
  assert.deepEqual(rating.default, {
    kind: "literal",
    value: "7.5",
  });
  assert(
    supportedEvaluation.expectations.some((expectation) =>
      expectation.includes("rating literal 7.5 as a canonical decimal string"),
    ),
    "supported scalar eval must preserve the decimal string default",
  );
  assert.equal(
    new Set([
      supportedEntity.subject_uuid,
      ...supportedEntity.fields.map(({ subject_uuid }) => subject_uuid),
    ]).size,
    supportedScalarFieldTypes.length + 1,
  );

  const supportedEnumPlanArtifact = {
    path:
      "evals/create-full-stack-app/fixtures/supported-enum.foundation-plan.json",
    role: "input",
    stage_as: ".firstdraft/foundation-plan.json",
  };
  const supportedEnumEvaluation = cases.find(
    ({ id }) => id === "push-supported-enum-plan",
  );
  assert.deepEqual(supportedEnumEvaluation.artifacts, [
    supportedEnumPlanArtifact,
    replaceBeforeServerEvaluationStateArtifact,
  ]);
  assert(
    supportedEnumEvaluation.expectations.some((expectation) =>
      expectation.includes(
        "foundation_plan.rails_target.compiler.unsupported_graph",
      ) &&
      expectation.includes("/application") &&
      expectation.includes("preserves the enum") &&
      expectation.includes("stops without editing, pushing again, or compiling"),
    ),
  );
  const replaceBeforeServerEvaluationState = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "replace-before-server-eval.state.json",
      ),
      "utf8",
    ),
  );
  assert.deepEqual(Object.keys(replaceBeforeServerEvaluationState).sort(), [
    "format",
    "project_id",
  ]);
  assert.equal(
    replaceBeforeServerEvaluationState.format,
    "firstdraft.cli-state/1",
  );
  assert.equal(
    replaceBeforeServerEvaluationState.project_id,
    "01900000-0000-7000-8000-000000000000",
  );
  assert.match(
    replaceBeforeServerEvaluationState.project_id,
    /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
  for (const id of ["initialize-empty-plan", "local-only-draft"]) {
    assert.match(
      cases.find((evaluation) => evaluation.id === id).prompt,
      /compatible firstdraft CLI is installed/,
      `${id} must declare its CLI precondition`,
    );
  }
  const initializeEmptyPlan = cases.find(
    (evaluation) => evaluation.id === "initialize-empty-plan",
  );
  assert(
    initializeEmptyPlan.expectations.some(
      (expectation) =>
        expectation.includes("Uses the supplied Oscar Party name") &&
        expectation.includes("without asking for redundant confirmation"),
    ),
  );
  const localOnlyDraft = cases.find(
    (evaluation) => evaluation.id === "local-only-draft",
  );
  assert(
    localOnlyDraft.expectations.some(
      (expectation) =>
        expectation.includes("Establishes or proposes the application name") &&
        expectation.includes("lets plan init derive the application key"),
    ),
  );
  const readme = await readFile(path.join(repository, "README.md"), "utf8");
  assert(readme.includes(cliContractBaseline));
  assert(
    readme.includes(
      "| `create-full-stack-app` | Author, analyze, request product Compile, and inspect retained Compilations | Experimental scaffold |",
    ),
  );
  assert.match(readme, /state-placeholder\.txt.*deliberately unreadable/s);
  assert.match(
    readme,
    /`initialize-empty-plan`, `author-without-local-validator`, `push-supported-enum-plan`,\s+and `repair-well-founded-analysis-issue` are server-backed analysis evals\. The first two create fresh state\s+themselves/,
  );
  assert.match(
    readme,
    /`validate-supported-application-intent`, `preserve-unsupported-appearance-intent`, and\s+`correct-source-issue-alongside-capability-gap` attach synthetic analysis results and require no server; the last\s+exercises independent correction alongside a preserved capability gap/,
  );
  assert.match(
    readme,
    /`replace-before-server-eval\.state\.json` is an unmistakably synthetic\s+placeholder that names\s+no known Project; never send it/,
  );
  assert.match(
    readme,
    /Before `push-supported-enum-plan` or\s+`repair-well-founded-analysis-issue`, replace it with `\.firstdraft\/state\.json` generated by a fresh\s+`firstdraft plan init` using the exact reviewed CLI revision above in a scratch directory/,
  );
  assert.match(
    readme,
    /`compile-prepared-movie-catalog` is the executable product-journey fixture[\s\S]*?not itself a fresh-agent eval[\s\S]*?successor driver[\s\S]*?fresh Claude Code process[\s\S]*?dated\s+\[report\][\s\S]*?For a future live run[\s\S]*?exact reviewed\s+CLI revision[\s\S]*?install the candidate plugin[\s\S]*?stage\s+`application-intent\.foundation-plan\.json`[\s\S]*?zero-flag `firstdraft plan compile` command[\s\S]*?pushes the exact file[\s\S]*?matching graph generation[\s\S]*?final byte check/,
  );
  assert.match(
    readme,
    /Never expose the private state contents/,
  );
  const supportedEnumPlan = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "supported-enum.foundation-plan.json",
      ),
      "utf8",
    ),
  );
  const supportedEnumField = supportedEnumPlan.application.entities[0].fields.find(
    ({ type }) => type === "enum",
  );
  assert(supportedEnumField, "supported enum fixture: missing enum Field");
  assert.deepEqual(
    supportedEnumField.settings.values.map(({ key }) => key),
    ["low", "medium", "high"],
  );
  assert.equal(supportedEnumField.settings.ordinal, true);
  assert.deepEqual(supportedEnumField.default, {
    kind: "literal",
    value: "medium",
  });
  assert(
    supportedEnumEvaluation.expectations.some((expectation) =>
      expectation.includes("literal medium default as supported"),
    ),
    "supported enum eval must recognize the import boundary",
  );
  assert(
    supportedEnumEvaluation.expectations.some((expectation) =>
      expectation.includes("plan push through the CLI"),
    ),
    "supported enum eval must exercise the push path",
  );
  assert(
    supportedEnumEvaluation.expectations.some((expectation) =>
      expectation.includes("Does not run plan init, reinitialize"),
    ),
    "supported enum eval must not replace initialized state",
  );
  assert(
    supportedEnumEvaluation.expectations.some((expectation) =>
      expectation.includes("instead of re-minting them"),
    ),
    "supported enum eval must preserve staged documentation UUIDs",
  );

  const unsupportedPlanArtifact = {
    path:
      "evals/create-full-stack-app/fixtures/unsupported-field-capabilities.foundation-plan.json",
    role: "input",
    stage_as: ".firstdraft/foundation-plan.json",
  };
  const unsupportedEvaluation = cases.find(
    ({ id }) => id === "unsupported-field-capabilities",
  );
  assert(
    unsupportedEvaluation.expectations.some((expectation) =>
      expectation.includes("the unsupported_capability pointer"),
    ),
    "unsupported eval must classify every remaining import gap",
  );
  assert(
    unsupportedEvaluation.expectations.some((expectation) =>
      expectation.includes("Branches on server_rejected with status 422"),
    ),
    "unsupported eval must route through the CLI error envelope",
  );
  assert(
    unsupportedEvaluation.expectations.some((expectation) =>
      expectation.includes("default, enum, and text-length Validation as supported"),
    ),
    "unsupported eval must preserve every admitted capability",
  );
  assert(
    unsupportedEvaluation.expectations.some((expectation) =>
      expectation.includes("Validation, or rich_text Field"),
    ),
    "unsupported eval must preserve admitted Validation and unsupported rich_text intent",
  );
  assert.deepEqual(unsupportedEvaluation.artifacts, [
    {
      path: "evals/create-full-stack-app/fixtures/unsupported-field-capabilities-diagnostics.json",
      role: "input",
    },
    unsupportedPlanArtifact,
    stateArtifact,
  ]);
  const planSource = await readFile(
    path.join(
      evaluationDirectory,
      "fixtures",
      "unsupported-field-capabilities.foundation-plan.json",
    ),
    "utf8",
  );
  const unsupportedPlan = JSON.parse(planSource);
  const unsupportedFields = unsupportedPlan.application.entities[0].fields;
  assert.equal(unsupportedFields[0].default.value, "Untitled");
  assert.equal(unsupportedFields[0].validations[0].kind, "length");
  assert.equal(unsupportedFields[1].type, "enum");
  assert.deepEqual(
    unsupportedFields[1].settings.values.map(({ key }) => key),
    ["draft"],
  );
  assert.equal(unsupportedFields[2].type, "rich_text");
  assert.equal(
    unsupportedFields[2].subject_uuid,
    "01900000-0000-7000-8000-000000000306",
  );
  const errorEnvelope = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "unsupported-field-capabilities-diagnostics.json",
      ),
      "utf8",
    ),
  );
  assert.equal(errorEnvelope.error, "server_rejected");
  assert.equal(errorEnvelope.status, 422);
  const response = errorEnvelope.response;
  assert.equal(
    createHash("sha256").update(planSource).digest("hex"),
    response.source_sha256,
  );
  assert.deepEqual(
    response.diagnostics.map(({ code, location }) => [
      code,
      location.source_pointer,
    ]),
    [
      [
        "foundation_plan.import.unsupported_capability",
        "/application/entities/0/fields/2/type",
      ],
    ],
  );
});

test("local capability check is shell-portable and uses the project wrapper", async () => {
  const skillSource = await readFile(
    path.join(skillsDirectory, "create-full-stack-app", "SKILL.md"),
    "utf8",
  );
  const capabilitySection = skillSource.match(
    /## Verify the local capability([\s\S]*?)## Initialize or resume the local Plan/,
  );
  assert(capabilitySection, "SKILL.md: missing local capability section");

  assert.match(
    capabilitySection[1],
    /firstdraft_cli\(\) \{ if \[ -x \.\/bin\/firstdraft \]; then \.\/bin\/firstdraft "\$@"; else firstdraft "\$@"; fi; \}\nif \[ -x \.\/bin\/firstdraft \]; then command -v \.\/bin\/firstdraft; else command -v firstdraft; fi\nfirstdraft_cli --version\nfirstdraft_cli --help/,
  );
  assert.match(
    capabilitySection[1],
    /version probe to succeed with one exact `0\.1\.0` output line and no other output[\s\S]*?top-level help that lists `generate`, `plan`, and `compilation`[\s\S]*?separate stdout and stderr assertions/,
  );
  assert.match(
    capabilitySection[1],
    /Do not collapse multiword\s+CLI invocations into scalar shell variables[\s\S]*?cross-repository contract tests own the\s+exhaustive leaf-command matrix/,
  );
  assert.doesNotMatch(
    capabilitySection[1],
    /firstdraft (?:generate|plan|compilation)(?: [^\n]+)? --help/,
  );

  const shellBlocks = [...skillSource.matchAll(/```sh\n([\s\S]*?)```/g)].map(
    ([, body]) => body,
  );
  const firstDraftBlocks = shellBlocks.filter((body) =>
    /(?:^|\s)(?:\.\/bin\/)?firstdraft(?:_cli)? (?:generate|plan|compilation)\b/m.test(
      body,
    ),
  );
  assert(firstDraftBlocks.length > 0);
  for (const body of firstDraftBlocks) {
    assert.match(
      body,
      /^firstdraft_cli\(\) \{ if \[ -x \.\/bin\/firstdraft \]; then \.\/bin\/firstdraft "\$@"; else firstdraft "\$@"; fi; \}/,
    );
    assert.doesNotMatch(body, /^firstdraft (?:generate|plan|compilation)/m);
  }

  for (const relativePath of canonicalClaudePluginSkillFiles.filter((file) =>
    file.endsWith(".md"),
  )) {
    const source = await readFile(
      path.join(skillsDirectory, "create-full-stack-app", relativePath),
      "utf8",
    );
    assert.doesNotMatch(
      source,
      /\bfirstdraft (?:generate|plan|compilation)\b/,
      `${relativePath}: operational CLI prose must preserve the Skill resolver`,
    );
  }
});

test("analysis status guidance follows the pinned CLI contract", async () => {
  const skillDirectory = path.join(skillsDirectory, "create-full-stack-app");
  const evaluationDirectory = path.join(evalsDirectory, "create-full-stack-app");
  const skillSource = await readFile(path.join(skillDirectory, "SKILL.md"), "utf8");
  const recoveryReference = await readFile(
    path.join(skillDirectory, "references", "diagnostics-and-recovery.md"),
    "utf8",
  );
  const foundationPlanReference = await readFile(
    path.join(skillDirectory, "references", "foundation-plan-019.md"),
    "utf8",
  );
  const readme = await readFile(path.join(repository, "README.md"), "utf8");
  const cases = JSON.parse(
    await readFile(path.join(evaluationDirectory, "cases.json"), "utf8"),
  ).cases;
  const pushSection = skillSource.match(
    /## Submit snapshots and use diagnostics([\s\S]*?)## Request the Compile journey/,
  );
  assert(pushSection, "SKILL.md: missing snapshot submission section");
  assert.match(
    skillSource,
    /The compatible CLI supplies these public commands:[\s\S]*?`plan init`, `plan push`, `plan status`, and zero-flag `plan compile`/,
  );
  assert.match(
    pushSection[1],
    /firstdraft_cli plan push[\s\S]*?incomplete, invalid, unchanged,[\s\S]*?or frequently revised snapshots[\s\S]*?no separate permission,[\s\S]*?batching, or changed-byte prerequisite/,
  );
  assert.match(
    pushSection[1],
    /On success, retain[\s\S]*?firstdraft_cli plan status --wait/,
  );
  assert.match(
    pushSection[1],
    /If status is for a lower graph version, repeat this\s+read-only poll within a bounded wait[\s\S]*?If it is higher, another accepted Head replaced the\s+one just pushed/,
  );
  assert.match(
    pushSection[1],
    /Branch on `analysis\.status`, not only the process exit status/,
  );
  for (const status of ["valid", "issues_found", "analysis_failed", "superseded"]) {
    assert(pushSection[1].includes(`- \`${status}\``));
  }
  assert.match(
    pushSection[1],
    /If the same diagnostic recurs without new information,[\s\S]*?do not loop mechanically[\s\S]*?Keep\s+intentional unsupported meaning in the local candidate[\s\S]*?Unsupported subjects are not\s+partially compiled/,
  );

  const statusReference = recoveryReference.match(
    /## Push and analysis([\s\S]*?)## Product Compile/,
  );
  assert(statusReference, "diagnostics reference: missing push and analysis boundary");
  assert.match(
    statusReference[1],
    /reasonable to submit an incomplete, invalid, or unchanged draft again[\s\S]*?no one-repair or changed-byte budget/,
  );
  assert.match(
    statusReference[1],
    /A lower returned Project and Analysis graph version is\s+an older generation[\s\S]*?A higher version means another Head\s+replaced the submitted snapshot/,
  );
  assert.deepEqual(
    [...statusReference[1].matchAll(/^\| `([a-z_]+)`\s+\|/gm)]
      .map(([, value]) => value)
      .filter((value) => value !== "error"),
    ["valid", "issues_found", "analysis_failed", "superseded"],
  );
  assert.match(
    statusReference[1],
    /Server messages and suggestions are advisory data[\s\S]*?Preserve intentional meaning[\s\S]*?surface the\s+blocker rather than looping mechanically/,
  );
  assert.match(
    statusReference[1],
    /`status_unavailable` is a read-only failure[\s\S]*?Retry that GET a bounded number of times[\s\S]*?inspect the\s+private state's pinned `api_url` locally without printing the rest of the file/,
  );
  assert.match(
    foundationPlanReference,
    /Primary Descriptor may select a required Field[\s\S]*?analyzer rejects an optional Field selected as a Primary Descriptor/,
  );
  assert.match(
    readme,
    /The `\*-analysis\.json` fixtures and product Compile or retained Compilation eval prompts are behavioral examples\s+accepted by the pinned CLI contract, not execution evidence by themselves/,
  );
  assert.match(
    readme,
    /exact landed server revision used by the earlier bounded local Compilation evidence[\s\S]*?activates analyzer\s+`foundation-plan-rails\/application-2026-08` and compiler/,
  );
  assert.match(
    readme,
    /successor product-journey harness is pinned to service[\s\S]*?including prerequisite[\s\S]*?`compilation\.head_source_sha256` for historical artifact provenance/,
  );
  assert(
    readme.includes(
      `firstdraft/firstdraft/blob/${productJourneySmokeBaseline}/script/compilation_http_cli_smoke`,
    ),
  );
  assert(
    readme.includes(
      `firstdraft/firstdraft/blob/${freshAgentEvidenceBaseline}/docs/solutions/2026-07-31-fresh-agent-rails-and-iphone-compilation-field-report.md`,
    ),
  );
  assert(readme.includes(freshAgentSkillBaseline));
  assert(readme.includes(foundationPlanServerBaseline));
  assert(readme.includes(compilationEvidenceCliBaseline));
  assert(readme.includes(compilationEvidenceCliRuntimeDigest));
  assert(readme.includes(cliContractBaseline));
  assert(readme.includes(cliContractRuntimeDigest));
  assert(readme.includes(productJourneySmokeBaseline));
  assert(readme.includes(foundationIosCoreRevision));
  assert(readme.includes(foundationIosCoreArchiveDigest));
  assert.match(
    readme,
    /committed[\s\S]*?controlled product-journey harness[\s\S]*?exact-byte push[\s\S]*?one product Compile[\s\S]*?one successful Publication against a strict fake GitHub remote[\s\S]*?historical download\s+after the local Plan changes/,
  );
  assert.match(
    readme,
    /final two local runs each produced one Project,[\s\S]*?one Compilation, one Publication[\s\S]*?exact two-attempt fake-GitHub ledger for repository creation followed by\s+artifact publication[\s\S]*?194-file, 542,894-byte artifact[\s\S]*?distinct submitted-Head and canonical-Plan digests[\s\S]*?matching authored order/,
  );
  assert.match(
    readme,
    /does not contact live GitHub or staging, execute the generated application, or prove a\s+fresh-agent journey/,
  );
  assert.match(
    readme,
    /staff-prepared local observation[\s\S]*?fresh Claude Code Opus\/high[\s\S]*?Movie and Director[\s\S]*?graph-version-1 valid analysis[\s\S]*?Compilation once[\s\S]*?194-file, 542,894-byte artifact/,
  );
  assert.match(readme, /dated 2026-07-31\s+\[field report\]/);
  assert.match(
    readme,
    /fresh agent session ended after the unmodified output passed\s+its iOS doctor, lint, unsigned Xcode build, and generated Simulator tests[\s\S]*?Afterward, an operator performed Rails\s+setup and used a temporary test-only copy[\s\S]*?Dynamic Island and bottom safe area/,
  );
  assert.match(
    readme,
    /not a reproducible agent\s+evaluation, authenticated operation, representative-user evidence, a published release, physical-device or iPad\s+proof, deployment, or production evidence/,
  );
  assert.match(
    readme,
    /dated field report records the server, CLI, runtime,\s+Skill,\s+analyzer,\s+compiler, Rails Core, and iOS Core pins[\s\S]*?artifact byte size, file count, and manifest digest[\s\S]*?recovered authoring prompt and seed command[\s\S]*?preparation and reproducibility limits/,
  );
  const skillEvidence = skillSource.match(
    /This workflow is experimental and targets the coordinated plugin 0\.1\.1, CLI 0\.1\.0, and service-contract 0\.2\s+contract\.[\s\S]*?bundled bytes do not establish whether that exact combination is currently available from the\s+public catalog; verify availability independently before advising an installation change\.([\s\S]*?)## Load the relevant references/,
  );
  const foundationPlanEvidence = foundationPlanReference.match(
    /## Current evidence boundary([\s\S]*?)The bundled schema was copied/,
  );
  assert(skillEvidence, "SKILL.md: missing current evidence boundary");
  assert(
    foundationPlanEvidence,
    "foundation-plan-019.md: missing current evidence boundary",
  );
  assert.match(
    skillEvidence[1],
    /narrow\s+experiment, not arbitrary application generation[\s\S]*?ordinary single-target\s+References[\s\S]*?conditional text length[\s\S]*?public and\s+unauthenticated in generated source[\s\S]*?Do not omit or weaken them[\s\S]*?Unsupported shapes fail the complete\s+candidate closed/,
  );
  assert.match(
    skillSource,
    /Recommend a marketplace\s+install, reinstall, or update only after independently verifying that the catalog serves this exact plugin 0\.1\.1 and\s+CLI 0\.1\.0 pair,[\s\S]*?Otherwise report that no verified public repair is known/,
  );
  assert.match(
    foundationPlanEvidence[1],
    /controlled product-journey smoke[\s\S]*?produced its recorded runs at service revision[\s\S]*?loopback\s+Rails and real Solid Queue[\s\S]*?194-file two-Entity\s+materialization[\s\S]*?strict fake[\s\S]*?later\s+materialization smoke at service revision/,
  );
  assert(
    foundationPlanEvidence[1].includes(
      `firstdraft/firstdraft/blob/${freshAgentEvidenceBaseline}/docs/solutions/2026-07-31-fresh-agent-rails-and-iphone-compilation-field-report.md`,
    ),
  );
  assert(foundationPlanEvidence[1].includes(freshAgentSkillBaseline));
  assert.match(
    foundationPlanEvidence[1],
    /Movie and Director[\s\S]*?graph-version-1 valid analysis[\s\S]*?Compilation once[\s\S]*?194-file, 542,894-byte artifact/,
  );
  assert.match(
    foundationPlanEvidence[1],
    /fresh agent session ended after the unmodified generated output passed its iOS doctor with 16 passes and no\s+failures[\s\S]*?Afterward, an operator performed Rails\s+setup and used a temporary test-only copy[\s\S]*?Manual Simulator inspection[\s\S]*?Dynamic Island and bottom safe area/,
  );

  for (const id of [
    "initialize-empty-plan",
    "push-supported-enum-plan",
    "author-without-local-validator",
  ]) {
    const evaluation = cases.find((candidate) => candidate.id === id);
    assert(
      evaluation.expectations.some((expectation) =>
        expectation.includes("plan status --wait"),
      ),
      `${id}: successful push must be followed by analysis wait`,
    );
    assert(
      evaluation.expectations.some((expectation) =>
        expectation.includes("analysis.status"),
      ),
      `${id}: eval must branch on analysis.status`,
    );
  }
  const repair = cases.find(
    ({ id }) => id === "repair-well-founded-analysis-issue",
  );
  assert(repair);
  assert(
    repair.expectations.some((expectation) =>
      expectation.includes("preserves both existing subject_uuid"),
    ),
  );
  assert(
    repair.expectations.some((expectation) =>
      expectation.includes("Runs plan push for the deliberately corrected complete Plan"),
    ),
  );
  assert.deepEqual(repair.artifacts.at(-1), {
    path:
      "evals/create-full-stack-app/fixtures/replace-before-server-eval.state.json",
    role: "input",
    stage_as: ".firstdraft/state.json",
  });
  const reservedPlan = JSON.parse(
    await readFile(
      path.join(evaluationDirectory, "fixtures", "reserved-constant.foundation-plan.json"),
      "utf8",
    ),
  );
  const issues = JSON.parse(
    await readFile(
      path.join(evaluationDirectory, "fixtures", "issues-found-analysis.json"),
      "utf8",
    ),
  );
  const reservedEntity = reservedPlan.application.entities[0];
  const issue = issues.analysis.diagnostics[0];
  assert.equal(issues.analysis.status, "issues_found");
  assert.equal(issue.code, "foundation_plan.identity.reserved_constant_collision");
  assert.equal(issue.location.source_pointer, "/application/entities/0/key");
  assert.equal(issue.subject.subject_uuid, reservedEntity.subject_uuid);
  assert.equal(reservedEntity.key, "string");
  assert.equal(reservedEntity.primary_descriptor.field, "string.title");

  const acceptedGeneration = cases.find(
    ({ id }) => id === "standalone-status-binds-accepted-generation",
  );
  assert.match(acceptedGeneration.prompt, /push accepted graph version 8/);
  assert(
    acceptedGeneration.expectations.some((expectation) =>
      expectation.includes("project.graph_version 8") &&
      expectation.includes("foundation_plan.source_sha256"),
    ),
  );
  assert(
    acceptedGeneration.expectations.some((expectation) =>
      expectation.includes("another bounded plan status --wait read"),
    ),
  );
  assert(
    acceptedGeneration.expectations.some((expectation) =>
      expectation.includes("both project.graph_version and analysis.graph_version equal 8") &&
      expectation.includes("replacement generation"),
    ),
  );

  const recurring = cases.find(
    ({ id }) => id === "recurring-analysis-issues",
  );
  assert.match(recurring.prompt, /Two diagnostic cycles/);
  assert(
    recurring.expectations.some((expectation) =>
      expectation.includes("have not produced new information"),
    ),
  );
  assert(
    recurring.expectations.some((expectation) =>
      expectation.includes("Does not impose a universal retry count"),
    ),
  );
  assert.deepEqual(
    recurring.artifacts.map(({ path: artifactPath }) => artifactPath),
    [
      "evals/create-full-stack-app/fixtures/recurring-issues-analysis.json",
      "evals/create-full-stack-app/fixtures/recurring-issues.foundation-plan.json",
      "evals/create-full-stack-app/fixtures/state-placeholder.txt",
    ],
  );
  const recurringPlan = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "recurring-issues.foundation-plan.json",
      ),
      "utf8",
    ),
  );
  const recurringIssues = JSON.parse(
    await readFile(
      path.join(evaluationDirectory, "fixtures", "recurring-issues-analysis.json"),
      "utf8",
    ),
  );
  const recurringEntity = recurringPlan.application.entities[0];
  assert.equal(recurringEntity.key, "movie");
  assert.equal(recurringEntity.name, "Movie");
  assert.equal(recurringEntity.primary_descriptor.field, "movie.title");
  assert.equal(recurringEntity.fields[0].required, false);
  assert.equal(recurringIssues.analysis.status, "issues_found");
  assert.notEqual(recurringIssues.analysis.id, issues.analysis.id);
  assert.equal(
    recurringIssues.analysis.diagnostics[0].code,
    "foundation_plan.entity.primary_descriptor_field_optional",
  );
  assert.equal(
    recurringIssues.analysis.diagnostics[0].subject.subject_uuid,
    recurringEntity.subject_uuid,
  );
  const applicationIntent = cases.find(
    ({ id }) => id === "validate-supported-application-intent",
  );
  assert(applicationIntent);
  const applicationIntentPlan = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "application-intent.foundation-plan.json",
      ),
      "utf8",
    ),
  );
  const applicationIntentValid = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "application-intent-valid-analysis.json",
      ),
      "utf8",
    ),
  );
  assert.equal(applicationIntentValid.analysis.status, "valid");
  assert.deepEqual(applicationIntentValid.analysis.diagnostics, []);
  assert.equal(applicationIntentPlan.application.key, "movie_catalog");
  assert.equal(applicationIntentPlan.application.domain, "movies.example.com");
  assert.deepEqual(applicationIntentPlan.application.native, { ios: {} });
  assert.equal(applicationIntentPlan.application.entities[0].icon, "film");
  assert.deepEqual(applicationIntentPlan.application.entities[0].scaffold, {
    resource_routes: ["index"],
    index: { authorization: "public" },
  });
  assert.deepEqual(
    applicationIntent.artifacts.map(({ path: artifactPath }) => artifactPath),
    [
      "evals/create-full-stack-app/fixtures/application-intent-valid-analysis.json",
      "evals/create-full-stack-app/fixtures/application-intent.foundation-plan.json",
      "evals/create-full-stack-app/fixtures/state-placeholder.txt",
    ],
  );
  assert(
    applicationIntent.expectations.some((expectation) =>
      expectation.includes("Preserves the complete staged Plan unchanged"),
    ),
  );
  assert(
    applicationIntent.expectations.some((expectation) =>
      expectation.includes("analysis alone does not prove generated output"),
    ),
  );
  const unsupportedGraph = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "unsupported-graph-analysis.json",
      ),
      "utf8",
    ),
  );
  assert.equal(unsupportedGraph.analysis.status, "issues_found");
  assert.deepEqual(
    unsupportedGraph.analysis.diagnostics.map(
      ({ code, location, message }) => [
        code,
        location.source_pointer,
        message,
      ],
    ),
    [[
      "foundation_plan.rails_target.compiler.unsupported_graph",
      "/application",
      "The current Rails Compiler cannot emit this Project: Domain rendering does not support nonempty Project#field_values",
    ]],
  );
  const privateIosRequest = cases.find(
    ({ id }) => id === "private-ios-request-requires-choice",
  );
  assert(privateIosRequest);
  assert.match(privateIosRequest.prompt, /iPhone client/);
  assert.match(privateIosRequest.prompt, /private to signed-in staff/);
  assert.match(privateIosRequest.prompt, /index, show, create, update, and delete/);
  for (const fragment of [
    "generated iPhone output remains index-only",
    "web create, update, show, and destroy shapes are admitted but public",
    "available on the web without authentication",
    "Accounts and staff-only authorization remain unsupported",
    "Stops for a product choice",
    "silently adding a public index",
    "presenting web CRUD as native screens",
    "Preserves the complete staged Plan",
    "does not run plan init",
  ]) {
    assert(
      privateIosRequest.expectations.some((expectation) =>
        expectation.includes(fragment),
      ),
    );
  }
  assert.deepEqual(
    privateIosRequest.artifacts.map(({ path: artifactPath }) => artifactPath),
    [
      "evals/create-full-stack-app/fixtures/resume.foundation-plan.json",
      "evals/create-full-stack-app/fixtures/state-placeholder.txt",
    ],
  );
  const appearanceIntent = cases.find(
    ({ id }) => id === "preserve-unsupported-appearance-intent",
  );
  assert(appearanceIntent);
  const appearanceIssues = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "appearance-issues-analysis.json",
      ),
      "utf8",
    ),
  );
  assert.equal(appearanceIssues.analysis.status, "issues_found");
  assert.deepEqual(
    appearanceIssues.analysis.diagnostics.map(
      ({ code, message, location }) => [
        code,
        location.source_pointer,
        message,
      ],
    ),
    [[
      "foundation_plan.rails_target.compiler.unsupported_application_configuration",
      "/application/appearance",
      "Application Appearance is not emitted by the current Rails Compiler release.",
    ]],
  );
  assert(
    appearanceIntent.expectations.some((expectation) =>
      expectation.includes("Preserves the complete Appearance request"),
    ),
  );
  assert(
    appearanceIntent.expectations.some((expectation) =>
      expectation.includes("May resubmit the complete unchanged snapshot") &&
      expectation.includes("does not loop mechanically"),
    ),
  );
  const mixedIntent = cases.find(
    ({ id }) => id === "correct-source-issue-alongside-capability-gap",
  );
  assert(mixedIntent);
  const mixedIssues = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "mixed-application-issues-analysis.json",
      ),
      "utf8",
    ),
  );
  assert.equal(mixedIssues.analysis.status, "issues_found");
  assert.deepEqual(
    mixedIssues.analysis.diagnostics.map(({ code, location }) => [
      code,
      location.source_pointer,
    ]),
    [
      [
        "foundation_plan.rails_target.compiler.unsupported_application_configuration",
        "/application/appearance",
      ],
      [
        "foundation_plan.entity.primary_descriptor_field_optional",
        "/application/entities/0/primary_descriptor/field",
      ],
    ],
  );
  assert(
    mixedIntent.expectations.some((expectation) =>
      expectation.includes(
        "Applies the independently well-founded requiredness correction",
      ),
    ),
  );
  assert(
    mixedIntent.expectations.some((expectation) =>
      expectation.includes("preserving the complete Appearance request"),
    ),
  );
  assert(
    mixedIntent.expectations.some(
      (expectation) =>
        expectation.includes("May push the complete corrected snapshot") &&
        expectation.includes("does not remove Appearance"),
    ),
  );
  const analysisFixtureNames = [
    "issues-found-analysis.json",
    "analysis-failed-analysis.json",
    "superseded-analysis.json",
    "recurring-issues-analysis.json",
    "application-intent-valid-analysis.json",
    "appearance-issues-analysis.json",
    "mixed-application-issues-analysis.json",
    "unsupported-graph-analysis.json",
  ];
  const analysisIds = await Promise.all(
    analysisFixtureNames.map(async (fixture) => {
      const response = JSON.parse(
        await readFile(path.join(evaluationDirectory, "fixtures", fixture), "utf8"),
      );
      assert.equal(
        response.analysis.analyzer_release,
        currentFoundationPlanAnalyzerRelease,
      );
      return response.analysis.id;
    }),
  );
  assert.equal(new Set(analysisIds).size, analysisIds.length);

  for (const [id, fixture, status] of [
    ["analysis-failed-stop", "analysis-failed-analysis.json", "analysis_failed"],
    ["superseded-analysis-stop", "superseded-analysis.json", "superseded"],
  ]) {
    const evaluation = cases.find((candidate) => candidate.id === id);
    const response = JSON.parse(
      await readFile(path.join(evaluationDirectory, "fixtures", fixture), "utf8"),
    );
    assert.equal(response.analysis.status, status);
    assert(
      evaluation.expectations.some((expectation) =>
        expectation.includes(`analysis.status ${status}`),
      ),
    );
    assert(
      evaluation.expectations.some((expectation) =>
        expectation.includes("Does not edit the Plan"),
      ),
    );
  }

  const operational = cases.find(
    ({ id }) => id === "analysis-status-operational-error",
  );
  assert.match(operational.prompt, /"error":"status_unavailable"/);
  assert(
    operational.expectations.some((expectation) =>
      expectation.includes("Retries the read a bounded number of times"),
    ),
  );
  assert(
    operational.expectations.some((expectation) =>
      expectation.includes("inspects only the locally pinned api_url") &&
      expectation.includes("does not edit state"),
    ),
  );

  for (const [id, code] of [
    ["analysis-wait-timeout-stop", "wait_timed_out"],
    ["analysis-changed-stop", "analysis_changed"],
  ]) {
    const evaluation = cases.find((candidate) => candidate.id === id);
    assert.match(evaluation.prompt, new RegExp(`"error":"${code}"`));
    assert(
      evaluation.expectations.some((expectation) =>
        expectation.includes(`stable ${code} error`),
      ),
    );
    assert(
      evaluation.expectations.some((expectation) =>
        expectation.includes("current projection as reportable context"),
      ),
    );
    assert(
      evaluation.expectations.some((expectation) =>
        expectation.includes("Stops"),
      ),
    );
  }
});

test("product Compile and retained Compilation evals match the CLI contract", async () => {
  const evaluationDirectory = path.join(evalsDirectory, "create-full-stack-app");
  const cases = JSON.parse(
    await readFile(path.join(evaluationDirectory, "cases.json"), "utf8"),
  ).cases;
  const readme = await readFile(path.join(repository, "README.md"), "utf8");
  const skill = await readFile(
    path.join(repository, "skills", "create-full-stack-app", "SKILL.md"),
    "utf8",
  );
  const recovery = await readFile(
    path.join(
      repository,
      "skills",
      "create-full-stack-app",
      "references",
      "diagnostics-and-recovery.md",
    ),
    "utf8",
  );
  const evaluation = (id) => {
    const value = cases.find((candidate) => candidate.id === id);
    assert(value, `missing CLI workflow eval: ${id}`);
    assert.equal(value.should_trigger, true);
    return value;
  };
  const hasExpectation = (value, ...fragments) => {
    assert(
      value.expectations.some((expectation) =>
        fragments.every((fragment) => expectation.includes(fragment)),
      ),
      `${value.id}: missing expectation containing ${fragments.join(", ")}`,
    );
  };

  assert(readme.includes(cliContractBaseline));
  assert(readme.includes(cliContractRuntimeDigest));
  assert(readme.includes(compilationProvenanceServiceBaseline));
  assert.match(
    readme,
    /zero-flag `plan compile` command pushes[\s\S]*?accepted graph generation[\s\S]*?valid unchanged candidate/,
  );
  assert.match(
    readme,
    /Public `plan publish`\s+and local-start `plan compile --output` are not commands[\s\S]*?`compilation download <id> --output <path>`/,
  );
  assert.match(
    readme,
    /diagnostic corpus deliberately exercises malformed JSON, local schema diagnostics, semantic and recurring\s+diagnostics, a standalone status result older than its accepted push generation, stale product-Compile analysis,\s+stale local Plan bytes, and phase-specific ambiguous push and Publication outcomes/,
  );
  assert.match(
    readme,
    /retains the push graph version\s+and source digest, reads again when status is older, and surfaces a newer generation as a replacement/,
  );
  assert.match(
    readme,
    /does not\s+require a permission ceremony around ordinary pushes or impose an unchanged-byte or retry-count rule/,
  );
  assert.match(
    readme,
    /prepared\s+Movie Catalog case expects the zero-flag product Compile to own the journey and treats a separate push or status read\s+as optional/,
  );
  assert.match(
    readme,
    /controlled local harness at service\s+revision[\s\S]*?corresponding service-backed Movie Catalog\s+journey through real local Compilation and Publication coordination with a strict fake for remote GitHub work[\s\S]*?not itself a fresh-agent eval[\s\S]*?successor driver[\s\S]*?fresh Claude Code process/,
  );
  assert.match(
    readme,
    /does not establish a live GitHub or\s+staging Publication, generated-application execution, representative user operation, deployment, or production\s+readiness[\s\S]*?one pinned fresh Claude Code operation[\s\S]*?not a\s+published or representative-user journey/,
  );
  assert.match(
    readme,
    /controlled local harness at service revision[\s\S]*?8ebfc2ed82a610e63f47eb985c23ab7e634fe94e[\s\S]*?historical[\s\S]*?f55edffc9e88924f9a4c95f41c4d0bc9b72422f8[\s\S]*?CLI alpha\.2 product-Compile and strict-fake Publication behavior[\s\S]*?predates and does not establish the API 0\.2 always-present Publication progress object[\s\S]*?exact 0\.1\.0 CLI contract[\s\S]*?current progress projections and recovery behavior[\s\S]*?dated discovery smoke[\s\S]*?CLI 0\.1\.0 and API 0\.2 identities/,
  );
  assert.match(
    skill,
    /Treat\s+Compilation and GitHub Publication as separate retained stages[\s\S]*?`compilation\.status: "succeeded"` proves the\s+application artifact finished compiling[\s\S]*?does not prove that\s+a repository exists or that source was published/,
  );
  assert.match(
    skill,
    /Relay meaningful `First Draft: ` progress lines[\s\S]*?Report the exact scheduled time[\s\S]*?`automatic retries paused; operator recovery required` means\s+the retained singleton is parked[\s\S]*?If no\s+reason is displayed, say that no safe reason is available/,
  );
  assert.match(
    skill,
    /bounded ten minutes[\s\S]*?Four minutes by itself is still within that\s+window[\s\S]*?timeout ends only that invocation's wait and does not cancel retained work/,
  );
  assert.match(
    skill,
    /while `plan compile` is polling a Publication[\s\S]*?never launch a concurrent\s+Compile[\s\S]*?after that invocation exits[\s\S]*?conditional singleton replay[\s\S]*?There is no separate public Publication status command/,
  );
  assert.match(
    skill,
    /`invalid_publication_status` is a protocol mismatch[\s\S]*?unchanged replay cannot repair[\s\S]*?reconcile the coordinated CLI\/service versions first/,
  );
  assert.match(
    skill,
    /Successful `plan compile` standard output contains only the repository URL[\s\S]*?does not expose a Compilation ID[\s\S]*?Do not invent an ID/,
  );
  assert.match(
    recovery,
    /reserves standard output for one validated private GitHub repository URL on success[\s\S]*?Do not call a nonterminal GitHub phase "still compiling"/,
  );
  assert.match(
    recovery,
    /end standard error with exactly one JSON object[\s\S]*?Remove only one leading contiguous block of complete lines[\s\S]*?exact `First Draft: ` prefix[\s\S]*?any other prefix or suffix,[\s\S]*?interleaved output fail closed/,
  );
  for (const field of ["phase", "retry_at", "retry_count", "reason_code"]) {
    assert(recovery.includes(`| \`${field}\` |`));
  }
  for (const phase of [
    "compiling",
    "preparing_repository",
    "github_preflight",
    "creating_repository",
    "preparing_repository_reconciliation",
    "reconciling_repository",
    "preparing_artifact",
    "publishing_artifact",
    "preparing_publication_reconciliation",
    "reconciling_publication",
    "completed",
    "failed",
    "cancelled",
  ]) {
    assert(recovery.includes(`\`${phase}\``), `missing Publication phase ${phase}`);
  }
  const reasonAllowlist = recovery.match(
    /The reason-code allowlist is ([\s\S]*?)\.\n\nA non-null `retry_at`/,
  );
  assert(reasonAllowlist, "missing safe Publication reason allowlist");
  assert.deepEqual(
    [...reasonAllowlist[1].matchAll(/`(github\.[a-z._]+)`/g)].map(
      ([, reason]) => reason,
    ),
    safeGithubReasonCodes,
  );
  for (const message of [
    "Analyzing Foundation Plan...",
    "Foundation Plan analysis valid.",
    "Compiling application...",
    "Application compiled.",
    "Application compilation failed.",
    "Application compilation cancelled.",
    "Preparing private GitHub repository...",
    "Checking GitHub access...",
    "Checking GitHub access (reason: CODE; retry count: N; next retry: TIMESTAMP).",
    "Checking GitHub access (reason: CODE; retry count: N; automatic retries paused; operator recovery required).",
    "Creating private GitHub repository...",
    "Preparing to verify GitHub repository creation...",
    "Verifying GitHub repository creation...",
    "Preparing compiled application...",
    "Publishing compiled application to GitHub...",
    "Preparing to verify GitHub publication...",
    "Verifying GitHub publication...",
    "GitHub publication complete.",
    "GitHub publication failed.",
    "GitHub publication cancelled.",
  ]) {
    assert(recovery.includes(`\`${message}\``), `missing progress message ${message}`);
  }
  assert.match(
    recovery,
    /emits only state-changing lines, suppresses consecutive duplicate text, and prefixes every line with\s+`First Draft: `/,
  );
  assert.match(
    recovery,
    /HTTP status\s+by itself does not prove that an account lacks provisioning or that an endpoint does not exist[\s\S]*?not a\s+basis for a support recommendation/,
  );
  assert.match(
    recovery,
    /`invalid_publication_status` also leaves the singleton result unverified[\s\S]*?retrying unchanged cannot repair a\s+protocol mismatch[\s\S]*?reconcile compatible CLI\/service versions/,
  );
  assert.match(
    recovery,
    /`publication_start_rejected` is a validated non-timeout 4xx result and establishes only that Publication success was\s+not verified[\s\S]*?does not establish whether this request reached the service's start boundary,[\s\S]*?left retained or remote work,[\s\S]*?rejection alone authorizes no replay, concurrent Compile, or direct mutation[\s\S]*?A 408 or 5xx response to the start\s+request is not this family[\s\S]*?outcome as unknown/,
  );
  assert.match(
    recovery,
    /`publication_failed` and `publication_cancelled` are terminal[\s\S]*?inspect\s+`current\.compilation\.status` before reporting the failed stage[\s\S]*?failed or cancelled Compilation means GitHub work\s+was not reached[\s\S]*?When Compilation succeeded,[\s\S]*?remote processing may have left a repository or commit/,
  );
  assert.match(
    recovery,
    /`github\.preflight_unclassified` says only that a retained legacy retry had no classified\s+reason[\s\S]*?`github\.preflight_unavailable\.\*` fallback identifies the coarse pre-claim stage[\s\S]*?does not expose the exception or establish a provider cause/,
  );
  assert.match(
    recovery,
    /failed or cancelled Compilation\s+means GitHub Publication work was not reached[\s\S]*?failed or cancelled Publication paired with a succeeded Compilation\s+is a later GitHub delivery outcome/,
  );

  const schemaRepair = evaluation("repair-local-schema-diagnostic");
  hasExpectation(schemaRepair, "instancePath", "application.key");
  hasExpectation(schemaRepair, "one complete parseable Plan snapshot");
  const schemaPlan = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "schema-invalid.foundation-plan.txt",
      ),
      "utf8",
    ),
  );
  const schemaDiagnostics = JSON.parse(
    await readFile(
      path.join(
        evaluationDirectory,
        "fixtures",
        "schema-key-diagnostics.json",
      ),
      "utf8",
    ),
  );
  assert.equal(schemaPlan.application.key, "Movie Catalog");
  assert.equal(schemaDiagnostics.errors[0].instancePath, "/application/key");

  const malformed = evaluation("compile-invalid-candidate-is-safe");
  hasExpectation(malformed, "zero-flag plan compile", "Skill resolver");
  hasExpectation(malformed, "invalid analysis prevents", "Publication phase");
  hasExpectation(malformed, "early Compile attempt as harmful");

  const movie = evaluation("compile-prepared-movie-catalog");
  hasExpectation(movie, "not public plan publish or plan compile --output");
  hasExpectation(movie, "plan compile", "Skill resolver", "prepared journey");
  hasExpectation(movie, "pushes the exact whole file", "accepted graph generation");
  hasExpectation(movie, "progress as nonterminal observational output");
  hasExpectation(movie, "stdout", "validated private GitHub repository URL");
  hasExpectation(movie, "separate plan push and plan status as optional");
  assert.deepEqual(movie.artifacts, [
    {
      path:
        "evals/create-full-stack-app/fixtures/application-intent.foundation-plan.json",
      role: "input",
      stage_as: ".firstdraft/foundation-plan.json",
    },
    {
      path:
        "evals/create-full-stack-app/fixtures/replace-before-server-eval.state.json",
      role: "input",
      stage_as: ".firstdraft/state.json",
    },
  ]);

  const terminalStage = evaluation("compile-distinguishes-terminal-stage");
  hasExpectation(
    terminalStage,
    "Application compilation failed",
    "GitHub Publication work was not reached",
    "does not warn about repository or commit effects",
  );
  hasExpectation(
    terminalStage,
    "application compiled",
    "GitHub publication failed later",
    "remote repository or commit effects may remain",
  );
  hasExpectation(terminalStage, "Branches on compilation.status");

  const retryProgress = evaluation(
    "compile-reports-publication-retry-progress",
  );
  hasExpectation(
    retryProgress,
    "Compilation is complete",
    "GitHub Publication remains pending",
    "github_preflight",
  );
  hasExpectation(
    retryProgress,
    "four minutes",
    "bounded ten-minute Publication wait",
    "not evidence of a stall",
  );
  hasExpectation(
    retryProgress,
    "retry_count 2",
    "github.oauth_unavailable",
    "exact absolute retry_at timestamp",
  );
  hasExpectation(retryProgress, "Does not launch a concurrent plan compile", "singleton");
  hasExpectation(
    retryProgress,
    "Does not recommend changing origins, reinstalling, or contacting support",
  );

  const parkedProgress = evaluation("compile-reports-parked-publication");
  hasExpectation(parkedProgress, "Compilation succeeded", "Publication is parked");
  hasExpectation(
    parkedProgress,
    "retry_count 7",
    "github.preflight_unavailable",
  );
  hasExpectation(parkedProgress, "operator attention", "without guessing");
  hasExpectation(parkedProgress, "Does not launch a concurrent plan compile");
  hasExpectation(parkedProgress, "conditional singleton replay");

  const fallbackProgress = evaluation(
    "compile-reports-unclassified-publication-fallback",
  );
  hasExpectation(
    fallbackProgress,
    "github.preflight_unavailable.repository_client",
    "parked retry state",
  );
  hasExpectation(
    fallbackProgress,
    "coarse pre-claim repository-client-stage fallback",
    "not the raw exception",
    "not proof that GitHub rejected repository creation",
  );
  hasExpectation(fallbackProgress, "Does not start a concurrent Compile");

  const rejected404 = evaluation(
    "compile-404-does-not-identify-publication-cause",
  );
  hasExpectation(
    rejected404,
    "Branches on publication_start_rejected",
    "validated non-timeout 4xx rejection",
    "408 or 5xx start outcome",
    "request_outcome_unknown reconciliation",
  );
  hasExpectation(
    rejected404,
    "Publication success was not verified",
    "does not claim whether this request or an earlier one left retained",
  );
  hasExpectation(
    rejected404,
    "Does not treat HTTP 404",
    "unprovisioned account",
    "missing per-account endpoint",
  );
  hasExpectation(
    rejected404,
    "Does not recommend changing origins, reinstalling, contacting support",
    "no stable structured recovery action",
  );
  hasExpectation(
    rejected404,
    "stops for a named structured recovery action or coordinated route/service repair",
    "does not replay or start another Compile solely from this envelope",
  );

  const semantic = evaluation("compile-semantic-diagnostics");
  hasExpectation(semantic, "Branches on plan_not_valid", "semantic diagnostics");
  hasExpectation(semantic, "no Publication was requested");

  const recurring = evaluation("compile-recurring-diagnostics");
  hasExpectation(recurring, "recurring diagnostic has not produced new information");
  hasExpectation(recurring, "Does not impose a universal retry count");
  hasExpectation(recurring, "Does not claim successful Compilation or Publication");

  const generation = evaluation(
    "compile-waits-for-accepted-analysis-generation",
  );
  hasExpectation(generation, "ignores the stale graph-version-7 analysis");
  hasExpectation(generation, "match accepted graph version 8");

  const staleBytes = evaluation("compile-stale-plan-bytes");
  hasExpectation(staleBytes, "Branches on local_plan_changed");
  hasExpectation(staleBytes, "stopped before Publication");
  hasExpectation(staleBytes, "reruns the whole zero-flag product Compile");

  const ambiguousPush = evaluation("compile-ambiguous-push-outcome");
  assert.match(ambiguousPush.prompt, /phase push/);
  hasExpectation(ambiguousPush, "phase push", "before analysis or Publication");
  hasExpectation(ambiguousPush, "conditional-write reconciliation");

  const ambiguousPublication = evaluation(
    "compile-ambiguous-publication-outcome",
  );
  assert.match(ambiguousPublication.prompt, /phase publication/);
  hasExpectation(
    ambiguousPublication,
    "phase publication",
    "repository creation may have succeeded",
  );
  hasExpectation(
    ambiguousPublication,
    "same zero-flag plan compile",
    "Skill resolver",
    "unchanged Plan bytes",
    "conditional PUT",
  );

  const success = evaluation("report-successful-product-compile");
  hasExpectation(success, "private repository URL");
  hasExpectation(success, "without inventing Project", "final stdout did not expose");
  hasExpectation(success, "successful product Compile and GitHub Publication");
  hasExpectation(success, "not local artifact materialization or deployment");

  const terminal = evaluation("compilation-status-terminal-failure");
  hasExpectation(terminal, "compilation status", "Skill resolver", "exact UUID");
  hasExpectation(terminal, "failed", "exit status zero");
  hasExpectation(terminal, "standalone status command", "plan compile");

  const wait = evaluation("compilation-wait-success");
  hasExpectation(wait, "compilation status", "--wait", "Skill resolver");
  hasExpectation(wait, "queued, running, then succeeded");

  const download = evaluation("compilation-download-success");
  hasExpectation(download, "compilation download", "Skill resolver", "--output");
  hasExpectation(
    download,
    "artifact Head digest against the retained Compilation",
    "atomic materialization",
  );
  hasExpectation(
    download,
    "canonical Foundation Plan digest",
    "may legitimately differ",
  );
  hasExpectation(download, "historical download can succeed", "live Project Head has advanced");

  const provenance = evaluation("compilation-download-provenance-failure");
  hasExpectation(provenance, "Branches on invalid_artifact");
  hasExpectation(provenance, "do not prove one exact Plan snapshot");
  hasExpectation(provenance, "Does not weaken provenance validation");

  const publicationFailure = evaluation(
    "compile-terminal-publication-failure",
  );
  hasExpectation(publicationFailure, "Branches on publication_failed");
  hasExpectation(
    publicationFailure,
    "private repository identity",
    "actually contains",
  );
  hasExpectation(
    publicationFailure,
    "Does not promise",
    "terminal name conflict",
  );

  const nonsucceeded = evaluation("compilation-download-not-succeeded");
  hasExpectation(nonsucceeded, "Branches on compilation_not_succeeded");
  hasExpectation(nonsucceeded, "Does not request an artifact");

  const existing = evaluation("compilation-download-existing-output");
  hasExpectation(existing, "local preflight failure", "no status or artifact request");
  hasExpectation(existing, "Preserves the existing destination");

  const unavailable = evaluation("compilation-artifact-unavailable");
  hasExpectation(unavailable, "Branches on artifact_unavailable");
  hasExpectation(unavailable, "without changing", "succeeded status");

  assert.equal(
    cases.filter(({ id }) => id.startsWith("publish-")).length,
    0,
    "the eval corpus must not retain the removed public plan publish workflow",
  );
});

test("recovery evals stage and preserve existing Plan state", async () => {
  const evaluationDirectory = path.join(evalsDirectory, "create-full-stack-app");
  const cases = JSON.parse(
    await readFile(path.join(evaluationDirectory, "cases.json"), "utf8"),
  ).cases;
  const hasExpectation = (evaluation, fragment) =>
    evaluation.expectations.some((expectation) =>
      expectation.includes(fragment),
    );
  const stagedPlanArtifacts = [
    {
      path: "evals/create-full-stack-app/fixtures/resume.foundation-plan.json",
      role: "input",
      stage_as: ".firstdraft/foundation-plan.json",
    },
    {
      path: "evals/create-full-stack-app/fixtures/state-placeholder.txt",
      role: "input",
      stage_as: ".firstdraft/state.json",
    },
  ];

  for (const id of [
    "stale-writer-conflict",
    "ambiguous-network-outcome",
    "local-state-not-saved",
    "authentication-required-stop",
    "invalid-push-arguments",
    "invalid-push-configuration",
    "local-input-unreadable",
  ]) {
    assert.deepEqual(
      cases.find((evaluation) => evaluation.id === id).artifacts,
      stagedPlanArtifacts,
    );
  }

  const recoveryReference = await readFile(
    path.join(
      skillsDirectory,
      "create-full-stack-app",
      "references",
      "diagnostics-and-recovery.md",
    ),
    "utf8",
  );
  const skillSource = await readFile(
    path.join(skillsDirectory, "create-full-stack-app", "SKILL.md"),
    "utf8",
  );
  const recoverySection = skillSource.match(
    /## Recover from failures([\s\S]*?)## Hand off the result/,
  );
  assert(recoverySection, "SKILL.md: missing recovery section");
  assert.match(
    recoverySection[1],
    /Branch on\s+its stable `error` and structured fields,\s+not the human-readable `detail`/,
  );
  assert.match(
    recoverySection[1],
    /diagnostic `422 server_rejected`[\s\S]*?feedback about the submitted snapshot and may lead to edits, dialogue, another push, or another Compile attempt/,
  );
  assert(recoveryReference.includes(cliContractBaseline));
  const stableErrors = recoveryReference.match(
    /## Stable error families([\s\S]*?)## Ambiguous mutations/,
  );
  assert(stableErrors, "diagnostics reference: missing stable error families");
  for (const code of planPushErrorCodes) {
    assert(
      stableErrors[1].includes(`| \`${code}\` |`),
      `diagnostics reference: missing plan push error ${code}`,
    );
  }
  assert.match(
    recoveryReference,
    /Branch on the object's stable `error` and structured fields rather than the\s+human-readable `detail`/,
  );
  assert.match(
    recoveryReference,
    /`local_state_not_saved` is the only handled envelope that can include private `recovery_state`/,
  );
  assert.match(
    recoveryReference,
    /Unknown, absent, malformed, or additional output after removing only recognized complete `First Draft: ` lines is\s+not a trusted recovery envelope/,
  );
  assert.doesNotMatch(
    recoveryReference,
    /The Plan may have been accepted; local state was not changed\./,
  );

  const evaluationsByError = {
    authentication_required: "authentication-required-stop",
    invalid_arguments: "invalid-push-arguments",
    invalid_configuration: "invalid-push-configuration",
    local_input_unreadable: "local-input-unreadable",
    request_outcome_unknown: "ambiguous-network-outcome",
    server_rejected: "stale-writer-conflict",
    local_state_not_saved: "local-state-not-saved",
  };
  for (const [error, id] of Object.entries(evaluationsByError)) {
    const evaluation = cases.find((candidate) => candidate.id === id);
    assert.match(
      evaluation.prompt,
      new RegExp(`\"error\":\"${error}\"`),
    );
    assert(
      hasExpectation(evaluation, `Branches on ${error}`),
      `${id}: missing error-code branch expectation`,
    );
  }
  assert.doesNotMatch(
    recoveryReference,
    /Could not read the local First Draft Plan or state\. No network request was made\./,
  );
  assert.match(
    recoveryReference,
    /Let the user configure `FIRSTDRAFT_API_TOKEN` outside the conversation[\s\S]*?Do not request its value, print it, place\s+it on a command line, or persist it in project files/,
  );

  const staleWriterEvaluation = cases.find(
    ({ id }) => id === "stale-writer-conflict",
  );
  assert.match(staleWriterEvaluation.prompt, /"error":"server_rejected"/);
  assert.match(staleWriterEvaluation.prompt, /"status":412/);
  assert.match(staleWriterEvaluation.prompt, /"code":"precondition_failed"/);
  assert(
    hasExpectation(
      staleWriterEvaluation,
      "Branches on server_rejected plus the validated status and response code",
    ),
  );

  const ambiguousEvaluation = cases.find(
    ({ id }) => id === "ambiguous-network-outcome",
  );
  assert.match(ambiguousEvaluation.prompt, /"error":"request_outcome_unknown"/);
  assert(
    hasExpectation(ambiguousEvaluation, "Branches on request_outcome_unknown"),
  );

  const localStateEvaluation = cases.find(
    ({ id }) => id === "local-state-not-saved",
  );
  assert.match(localStateEvaluation.prompt, /"error":"local_state_not_saved"/);
  assert(
    hasExpectation(
      localStateEvaluation,
      "recognizes it as the only error that can carry recovery_state",
    ),
  );
});

test("initialization recovery consumes the prepared CLI error envelope", async () => {
  const evaluationDirectory = path.join(evalsDirectory, "create-full-stack-app");
  const cases = JSON.parse(
    await readFile(path.join(evaluationDirectory, "cases.json"), "utf8"),
  ).cases;
  const skillSource = await readFile(
    path.join(skillsDirectory, "create-full-stack-app", "SKILL.md"),
    "utf8",
  );
  const recoveryReference = await readFile(
    path.join(
      skillsDirectory,
      "create-full-stack-app",
      "references",
      "diagnostics-and-recovery.md",
    ),
    "utf8",
  );
  const initializationSection = skillSource.match(
    /## Initialize or resume the local Plan([\s\S]*?)## Interview and author incrementally/,
  );
  const initializationReference = recoveryReference.match(
    /## Local state and credentials([\s\S]*?)## Push and analysis/,
  );

  assert(initializationSection, "SKILL.md: missing initialization section");
  assert(initializationReference, "diagnostics reference: missing initialization boundary");
  assert.match(
    initializationSection[1],
    /If initialization\s+fails,\s+follow the stable error in the recovery reference[\s\S]*?Preserve any partial `\.firstdraft\/`\s+directory/,
  );
  assert.match(
    initializationSection[1],
    /If `\.firstdraft\/` already exists,[\s\S]*?confirm with project-relative metadata[\s\S]*?regular and readable/,
  );
  assert.match(
    initializationReference[1],
    /`invalid_arguments`[\s\S]*?No local files were written[\s\S]*?`local_initialization_failed`[\s\S]*?may be incomplete/,
  );
  assert.match(
    initializationReference[1],
    /An existing `\.firstdraft\/` is not disposable scratch space[\s\S]*?do not\s+reinitialize over partial, damaged, or existing state/,
  );

  const hasExpectation = (evaluation, fragment) =>
    evaluation.expectations.some((expectation) =>
      expectation.includes(fragment),
    );
  const invalidArguments = cases.find(
    ({ id }) => id === "invalid-init-arguments",
  );
  assert.match(invalidArguments.prompt, /"error":"invalid_arguments"/);
  assert(hasExpectation(invalidArguments, "Branches on invalid_arguments"));
  assert(hasExpectation(invalidArguments, "one deliberately corrected invocation"));

  const localFailure = cases.find(
    ({ id }) => id === "local-initialization-failed",
  );
  assert.match(localFailure.prompt, /"error":"local_initialization_failed"/);
  assert(hasExpectation(localFailure, "Branches on local_initialization_failed"));
  assert(hasExpectation(localFailure, "project-relative metadata"));
  assert(hasExpectation(localFailure, "Does not expose"));
  assert.deepEqual(
    localFailure.artifacts.map(({ stage_as: stageAs }) => stageAs),
    [".firstdraft/state.json"],
  );

  const unknownOutput = cases.find(({ id }) => id === "unknown-init-output");
  assert.match(unknownOutput.prompt, /not one parseable JSON object/);
  assert(hasExpectation(unknownOutput, "Fails closed"));
  assert(hasExpectation(unknownOutput, "Does not repeat or expose"));
  assert.deepEqual(
    unknownOutput.artifacts.map(({ stage_as: stageAs }) => stageAs),
    [".firstdraft/state.json"],
  );
});

test("malformed source fixture is bound to its coordinate diagnostic", async () => {
  const fixtureDirectory = path.join(
    evalsDirectory,
    "create-full-stack-app",
    "fixtures",
  );
  const source = await readFile(
    path.join(fixtureDirectory, "malformed.foundation-plan.txt"),
    "utf8",
  );
  const errorEnvelope = JSON.parse(
    await readFile(
      path.join(fixtureDirectory, "malformed-json-diagnostics.json"),
      "utf8",
    ),
  );
  assert.equal(errorEnvelope.error, "server_rejected");
  assert.equal(errorEnvelope.status, 422);
  const response = errorEnvelope.response;
  const location = response.diagnostics[0].location;
  const cases = JSON.parse(
    await readFile(
      path.join(evalsDirectory, "create-full-stack-app", "cases.json"),
      "utf8",
    ),
  ).cases;
  const evaluation = cases.find(({ id }) => id === "coordinate-diagnostic");

  assert.throws(() => JSON.parse(source));
  assert.equal(
    createHash("sha256").update(source).digest("hex"),
    response.source_sha256,
  );
  assert.deepEqual(location, { line: 1, column: 17 });
  assert.equal(source.split("\n")[location.line - 1][location.column - 1], "t");
  assert.deepEqual(evaluation.artifacts, [
    {
      path: "evals/create-full-stack-app/fixtures/malformed-json-diagnostics.json",
      role: "input",
    },
    {
      path: "evals/create-full-stack-app/fixtures/malformed.foundation-plan.txt",
      role: "input",
      stage_as: ".firstdraft/foundation-plan.json",
    },
    {
      path: "evals/create-full-stack-app/fixtures/state-placeholder.txt",
      role: "input",
      stage_as: ".firstdraft/state.json",
    },
  ]);
  assert(
    evaluation.expectations.some((expectation) =>
      expectation.includes("Branches on server_rejected with status 422"),
    ),
  );
});

test("the independently installed Skill retains the repository license", async () => {
  const repositoryLicense = await readFile(path.join(repository, "LICENSE"), "utf8");
  const skillLicense = await readFile(
    path.join(skillsDirectory, "create-full-stack-app", "LICENSE.txt"),
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
  assert.match(metadata.description, /^Experimental and in development:/);
  assert(metadata.description.includes("First Draft Foundation Plan"));
  assert(
    metadata.description.includes(
      "submits exact Plan bytes for diagnostics, and can request the current narrow Rails web-and-iPhone Compile journey through its bundled CLI",
    ),
  );
  assert(metadata.description.includes("incrementally authors and revises complete"));
  assert(
    metadata.description.includes(
      "Arbitrary applications, automatic deployment, Android, iPad, Accounts, notifications, and broader web or native clients are not available; preserve unsupported user intent rather than omitting it.",
    ),
  );
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
  assert.equal(
    shortDescription,
    "Interview, author, diagnose, and compile a Plan",
  );
  assert(defaultPrompt.includes(`$${skillName}`));
  assert.equal(
    defaultPrompt,
    `Use $${skillName} to interview me, incrementally author and diagnose one complete First Draft Foundation Plan candidate, and use the available Compile workflow when that candidate is ready.`,
  );
}

function parseRestrictedFrontmatter(source) {
  const lines = source.split("\n");
  assert.equal(lines.length, 2, "frontmatter must contain exactly two lines");

  const entries = ["name", "description"].map((key, index) => {
    const prefix = `${key}: `;
    assert(lines[index].startsWith(prefix), `expected ${key} frontmatter`);
    const rawValue = lines[index].slice(prefix.length);
    assert(
      rawValue.startsWith("\"") && rawValue.endsWith("\""),
      `${key}: must be double-quoted`,
    );
    const value = JSON.parse(rawValue);
    assert.equal(typeof value, "string", `${key}: expected a string`);
    return [key, value];
  });

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

async function markdownJsoncDocuments(file) {
  const source = await readFile(file, "utf8");
  return [...source.matchAll(/```jsonc\n([\s\S]*?)```/g)].map((match) =>
    JSON.parse(match[1]),
  );
}

async function filesUnder(
  directory,
  { readDirectory = readdir } = {},
) {
  const entries = (await readDirectory(directory, { withFileTypes: true })).sort(
    (left, right) => {
      if (left.name < right.name) return -1;
      if (left.name > right.name) return 1;
      return 0;
    },
  );
  const files = [];

  for (const entry of entries) {
    const item = path.join(directory, entry.name);
    const entryType = classifyInventoryEntry(entry, item);

    switch (entryType) {
      case "directory":
        files.push(
          ...(await filesUnder(item, { readDirectory })),
        );
        break;
      case "file":
        files.push(item);
        break;
    }
  }

  return files;
}

function renderEvidenceStateNames(names) {
  assert(Array.isArray(names), "evidence state names must be an array");
  assert(
    names.every((name) => typeof name === "string" && name.length > 0),
    "evidence state names must contain only nonempty strings",
  );
  return names.length > 0
    ? names.map((name) => `\`${name}\``).join(", ")
    : "(none)";
}

function assertEvidenceStatePresenceBlock(source, expectedBlock) {
  const section = source.match(
    /The pre-smoke presence\s+summary was exactly:\n\n((?:- [^\n]+\n)+)/,
  );
  assert(
    section,
    "packaging evidence must render the canonical state-presence block",
  );
  assert.equal(
    section[1],
    `${expectedBlock}\n`,
    "packaging evidence state-presence bullets differ from the observation",
  );
}

function revisionTokens(source) {
  return [
    ...new Set(source.match(/\b(?:[0-9a-f]{40}|[0-9a-f]{7})\b/g) ?? []),
  ].sort();
}

function workflowJobSource(source, name) {
  const marker = `\n  ${name}:\n`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `workflow is missing the ${name} job`);
  assert.equal(
    source.indexOf(marker, start + marker.length),
    -1,
    `workflow must contain exactly one ${name} job`,
  );
  const contentStart = start + marker.length;
  const followingJob = /\n {2}[a-zA-Z0-9_-]+:\n/.exec(
    source.slice(contentStart),
  );
  const end = followingJob
    ? contentStart + followingJob.index
    : source.length;
  return source.slice(start, end);
}

function assertRevisionTokens(source, expected) {
  assert.deepEqual(revisionTokens(source), [...expected].sort());
}

function pluginRuntimeDigestAtRevision(revision) {
  const relativePaths = gitTreePathsAtRevision(
    revision,
    ".claude-plugin",
    "skills/create-full-stack-app",
  ).filter(
    (relativePath) =>
      /^\.claude-plugin\/[^/]+\.json$/.test(relativePath) ||
      relativePath.startsWith("skills/create-full-stack-app/"),
  );
  const digest = createHash("sha256");
  for (const relativePath of relativePaths) {
    const source = gitBlobAtRevision(revision, relativePath);
    const pathLength = Buffer.alloc(4);
    pathLength.writeUInt32BE(Buffer.byteLength(relativePath));
    const sourceLength = Buffer.alloc(8);
    sourceLength.writeBigUInt64BE(BigInt(source.length));
    digest.update(pathLength);
    digest.update(relativePath);
    digest.update(sourceLength);
    digest.update(source);
  }
  return digest.digest("hex");
}

function gitBlobAtRevision(revision, relativePath) {
  const blob = spawnSync("git", ["show", `${revision}:${relativePath}`], {
    cwd: repository,
    encoding: "buffer",
    maxBuffer: 10 * 1024 * 1024,
  });
  assert.equal(
    blob.status,
    0,
    `git show failed for ${revision}:${relativePath}: ` +
      spawnBufferText(blob.stderr),
  );
  return blob.stdout;
}

function gitTreePathsAtRevision(revision, ...roots) {
  const tree = spawnSync(
    "git",
    [
      "ls-tree",
      "-r",
      "--name-only",
      "-z",
      revision,
      "--",
      ...roots,
    ],
    { cwd: repository, encoding: "buffer" },
  );
  assert.equal(
    tree.status,
    0,
    `git ls-tree failed for ${revision}: ${spawnBufferText(tree.stderr)}`,
  );
  const relativePaths = spawnBufferText(tree.stdout)
    .split("\0")
    .filter(Boolean)
    .sort();
  assert(relativePaths.length > 0, `no Git tree paths found for ${revision}`);
  return relativePaths;
}

function trackedFiles() {
  const result = spawnSync("git", ["ls-files", "-z"], {
    cwd: repository,
    encoding: "buffer",
  });
  const stdout = spawnBufferText(result.stdout);
  const stderr = spawnBufferText(result.stderr);
  const diagnostics = [
    "git ls-files -z failed",
    `status: ${result.status ?? "null"}`,
    result.signal ? `signal: ${result.signal}` : undefined,
    result.error?.message ? `error: ${result.error.message}` : undefined,
    stderr ? `stderr: ${stderr}` : undefined,
    stdout ? `stdout: ${stdout}` : undefined,
  ]
    .filter(Boolean)
    .join("\n");
  assert.equal(result.status, 0, diagnostics);
  assert(Buffer.isBuffer(result.stdout), diagnostics);
  return stdout
    .split("\0")
    .filter(Boolean)
    .sort()
    .map((file) => path.join(repository, file));
}

function spawnBufferText(value) {
  return value === null || value === undefined ? "" : value.toString("utf8");
}
