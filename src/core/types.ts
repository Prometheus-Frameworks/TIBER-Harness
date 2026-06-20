/**
 * Core type contracts for TIBER-Harness.
 *
 * Design axiom (from issue #1): **Model output is advisory. Validators are
 * authoritative.** Every type here is shaped so that a provider can only ever
 * *propose* a result; the deterministic layers (`validateJson`,
 * `validateSchema`, skill `validate`, and `applyDeterministicOverrides`) decide
 * the binding outcome.
 */

/** A single completion request handed to a provider. */
export interface ProviderRequest {
  /** Rendered prompt text (skill prompt + serialized input). */
  prompt: string;
  /** The structured skill input, untouched, for providers that prefer it. */
  input: unknown;
  /** Skill name, for providers (e.g. MockProvider) that route by skill. */
  skill: string;
  /** Opaque per-fixture hint the MockProvider uses to return canned output. */
  fixtureId?: string;
}

/** A provider's raw, untrusted response. Always a string; never parsed here. */
export interface ProviderResponse {
  /** Raw model text exactly as returned. Treated as untrusted data. */
  raw: string;
}

/**
 * Provider-agnostic model interface. Local, remote, and mock providers all
 * implement this. Implementations MUST be side-effect free beyond the model
 * call itself, and MUST NOT make network calls when `requiresNetwork` is false.
 */
export interface ModelProvider {
  readonly name: string;
  /** True if this provider performs remote/network calls (gated out of CI). */
  readonly requiresNetwork: boolean;
  complete(request: ProviderRequest): Promise<ProviderResponse>;
}

/** A deterministic finding raised by a validator. Findings are auditable. */
export interface Finding {
  /** Stable machine code, e.g. `prompt_injection_detected`. */
  code: string;
  /** Human-readable explanation. Safe to render. */
  message: string;
  severity: 'info' | 'warning' | 'block';
}

/**
 * The deterministic verdict for a skill run. This — not the model — is the
 * source of truth. `promotionReady` is computed by validators, never copied
 * verbatim from model output.
 */
export interface SkillVerdict {
  /** The deterministic, authoritative promotion decision. */
  promotionReady: boolean;
  findings: Finding[];
  /** What the model *claimed* (advisory only), if it surfaced a value. */
  modelClaimedPromotionReady?: boolean | null;
}

/**
 * Per-skill deterministic validator. Receives the trusted input and the
 * parsed-and-schema-valid model output, and returns findings plus a baseline
 * promotion decision. Pure: no I/O, no randomness.
 */
export type SkillValidator = (
  input: unknown,
  output: unknown,
) => SkillVerdict;

/** A fixture's declared expectations, asserted by the eval runner. */
export interface FixtureExpectation {
  /** Whether the model's raw output is expected to be valid JSON. */
  jsonValid: boolean;
  /** Whether the parsed output is expected to satisfy the output schema. */
  schemaValid: boolean;
  /** The authoritative promotion decision expected after all validators. */
  promotionReady: boolean;
  /** Finding codes that MUST be present in the verdict (subset match). */
  findingCodes?: string[];
}

/** A single eval fixture for a skill. */
export interface SkillFixture {
  id: string;
  description: string;
  /** Structured input; validated against the skill input schema. */
  input: unknown;
  /**
   * The exact raw string the MockProvider returns for this fixture. May be
   * deliberately malformed (e.g. invalid JSON) to prove the harness fails
   * closed.
   */
  mockResponse: string;
  expect: FixtureExpectation;
}

/** A JSON Schema document (the subset supported by `validateSchema`). */
export interface JsonSchema {
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean | JsonSchema;
  items?: JsonSchema;
  enum?: unknown[];
  const?: unknown;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  minItems?: number;
  maxItems?: number;
  pattern?: string;
}

/** A fully-loaded skill definition. */
export interface SkillDefinition {
  name: string;
  /** Rendered prompt template text (from prompt.md). */
  prompt: string;
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
  fixtures: SkillFixture[];
  validate: SkillValidator;
}

/** Outcome of running one fixture through one provider. */
export interface RunResult {
  skill: string;
  fixtureId: string;
  provider: string;
  /** Stage at which the run resolved. */
  stage: 'json_invalid' | 'schema_invalid' | 'validated';
  jsonValid: boolean;
  schemaValid: boolean;
  verdict: SkillVerdict;
  /** Raw provider output, retained for the report (untrusted data). */
  rawOutput: string;
  /** Validation error messages from JSON/schema stages, if any. */
  errors: string[];
}
