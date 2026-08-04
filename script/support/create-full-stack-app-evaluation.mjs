import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const supportDirectory = path.dirname(fileURLToPath(import.meta.url));
const repository = path.resolve(supportDirectory, "..", "..");

export const evaluationDirectory = path.join(
  repository,
  "evals",
  "create-full-stack-app",
);
export const candidateInterviewProtocolPath = path.join(
  evaluationDirectory,
  "references",
  "candidate-interview-protocol.md",
);
export const movieCatalogFixturePath = path.join(
  evaluationDirectory,
  "fixtures",
  "application-intent.foundation-plan.json",
);

export const loadEvaluationDocument = async () =>
  JSON.parse(await readFile(path.join(evaluationDirectory, "cases.json"), "utf8"));

export const loadEvaluationCases = async () =>
  (await loadEvaluationDocument()).cases;

export const evaluationCaseById = (cases, id) => {
  const evaluation = cases.find((candidate) => candidate.id === id);
  if (!evaluation) {
    throw new Error(`missing evaluation case: ${id}`);
  }

  return evaluation;
};

export const expectationIncludes = (evaluation, ...fragments) =>
  evaluation.expectations.some((expectation) =>
    fragments.every((fragment) => expectation.includes(fragment)),
  );

export const stagedInputs = (evaluation) =>
  (evaluation.artifacts ?? []).filter(
    ({ role, stage_as: stageAs }) => role === "input" && stageAs,
  );

export const readEvaluationJson = async (file) =>
  JSON.parse(await readFile(file, "utf8"));
