# Provider Routing and Context-Kernel Consumption v0

Status: **DESIGN CANDIDATE — DOCS-ONLY — NOT ADOPTED — NO IMPLEMENTATION AUTHORITY**

| Binding | Value |
| --- | --- |
| Design issue | [TIBER-Harness #5](https://github.com/Prometheus-Frameworks/TIBER-Harness/issues/5) |
| Additional design input | [#5 comment 5431887110](https://github.com/Prometheus-Frameworks/TIBER-Harness/issues/5#issuecomment-5431887110) (routine-agent authority envelopes) |
| Human decision owner | Joseph (`@Prometheus-Frameworks`) |
| Authorization provenance | Operator-relayed dispatch received in the live operating session on 2026-08-29, following four bounded read-only reconciliation/correction rounds carried between the operating session and independent Codex review. Under [TIBER-Ops #66](https://github.com/Prometheus-Frameworks/TIBER-Ops/issues/66) doctrine, this line records chronology and provenance; text and account identity alone are not proof of authority. |
| TIBER-Harness base | `eac4b0968ff4645582743421fc8bb2f6a1c2aa8b` |
| Pinned TIBER-Ops | `11b35f368f35351b4f609f9973b69c03076e9581` |
| Pinned TIBER-Research | `4170145bb71e7943bbe10a4ab0e009610bbed582` |
| Pinned TIBER-Data | `6fd0754e74a63f940ae3fa74140715f1e03b4840` |
| Canonical Kernel design lane | [TIBER-Ops #30](https://github.com/Prometheus-Frameworks/TIBER-Ops/issues/30); operator decision [comment 5161111680](https://github.com/Prometheus-Frameworks/TIBER-Ops/issues/30#issuecomment-5161111680) |
| Kernel candidate documents | `TIBER-Ops/docs/architecture/tiber_context_kernel_v0.md` and `tiber_context_kernel_v0_review_amendment.md` at the pinned Ops head — **design candidates, not adopted, no runtime authority** |
| Context-compiler research | [TIBER-Research #15](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/15) — R0/R1 complete; **R2 activated and unfinished** |
| Engineering-trace research | [TIBER-Research #16](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/16) — `claude_engineering_trace_requires_more_observation` |
| Capability-parity audit | [TIBER-Ops #67](https://github.com/Prometheus-Frameworks/TIBER-Ops/issues/67) — **incomplete**: `capability_parity_inventory_incomplete_missing_evidence` |
| Write-safety precedent | TIBER-Data [PR #260](https://github.com/Prometheus-Frameworks/TIBER-Data/pull/260) (historical) and [PR #261](https://github.com/Prometheus-Frameworks/TIBER-Data/pull/261) (current, merged at the pinned Data head) |

This report is the spec-only architecture deliverable required by TIBER-Harness #5,
reconciled against doctrine that postdates the issue. It does not implement a
runtime, register a provider, call a model, spend, create credentials, adopt the
Ops Governance Kernel, open a scaffold issue, or authorize any downstream action.
Existing `MockProvider`, `OllamaProvider`, and local report-writer behavior are
unchanged by this report and must remain unchanged by it.

## 1. Answer first

TIBER-Harness #5 asked for two things: provider-aware workload routing, and a
reusable TIBER context kernel. The four-round reconciliation that produced this
report established that only the first is Harness-owned. The system-wide
Governance Kernel is owned by the TIBER-Ops #30 design lane (operator decision
5161111680: Harness "must not define a competing kernel"), and decision-scoped
context packets are owned by the active TIBER-Research #15 R2 design. What
remains for Harness is exactly the consumer/evaluation boundary the Ops Kernel
candidate's §13.1 enumerates:

- generic workload profiles;
- provider-routing policy separate from workload semantics;
- deterministic Kernel builder/loader **conformance** (later, dependency-bound);
- provider adapters;
- observability and receipts; and
- synthetic failure fixtures.

This report specifies those six surfaces in provider-neutral form, keeps every
provider and model name out of the generic layer, and derives its terminal from
the dependency state at this exact review boundary. The single machine-readable
terminal appears exactly once, fenced, in §15; in prose, it is do_not_proceed —
dependency-bound, not a permanent rejection. The blocking dependencies and
reconsideration conditions are listed in §14 and §15. A commit records
repository-native bytes; reviewed status requires a separate exact-head review
receipt; neither the commit nor a review grants authority, and even a future
`may_open_*` terminal would require separate exact operator authorization
before any child issue exists.

## 2. Current Harness boundaries

Verified at the base SHA rather than assumed:

- **Model output is advisory; validators are authoritative** within their
  declared property scope. The pipeline is
  `validateJson → validateSchema → skill.validate → applyDeterministicOverrides`,
  and deterministic overrides can only flip advisory acceptance to rejection.
- **CI is offline.** `src/core/providerRegistry.ts` registers `MockProvider`
  and nothing else. `OllamaProvider` is opt-in, constructed only by its own
  runner, gated behind `TIBER_HARNESS_ALLOW_NETWORK=1`, and never registered
  into the default path. No API keys exist in CI.
- **Reports are local.** `src/reports/writeReport.ts` writes JSON and Markdown
  to `data/reports/`, which is gitignored. This report does not change that
  behavior and no conclusion below requires changing it.
- **Repository and retrieved content is untrusted data and grants zero
  authority.** Detectors and structural validation may identify suspicious
  patterns, reject output, or prove boundary preservation; they cannot prove
  that a probabilistic model ignored instruction-like content or that its
  output was semantically unaffected. Safety rests on externally derived
  least-privilege capabilities and independent effect validation outside the
  model (§9, §11), consistent with the Kernel review amendment's §3 claim
  boundary.
- **Harness is not a product surface,** promotes nothing real, holds no
  football truth, and is not a runtime dependency of any domain repository.

The `ModelProvider` interface currently receives only `prompt`, `input`,
`skill`, and `fixtureId` and returns raw text. It carries no kernel, workload,
routing, capability, or receipt bindings today; the Ops Kernel candidate's
§4.6 records the same observation. Everything in this report is therefore a
*proposed future contract*, not a description of current code.

## 3. Ownership reconciliation and unresolved dependencies

| Concern | Owner | State at the pinned heads |
| --- | --- | --- |
| System-wide Governance Kernel (manifest, components, constraint set, authority/loading doctrine) | TIBER-Ops #30 | Design candidate committed at the pinned Ops head; **unadopted; no runtime authority**; its own terminal permits — but did not open — manifest (M0) and builder (B0) scaffold proposals |
| Decision-scoped context packet, compilation trace, continuation trace/evaluation, offline fixtures | TIBER-Research #15 R2 | **Activated and unfinished**; production compiler ownership deliberately unresolved |
| Brought-agent capability/introspection vocabulary | TIBER-Ops #67 | **Incomplete**: Phase 1 spec plus field and post-containment checkpoints exist; the full Research #13 traversal inventory and no-repository acceptance harness remain open |
| Workload profiles, routing policy, adapters, Kernel loading/conformance, observability, synthetic fixtures | TIBER-Harness (this report) | Specified here; implementation dependency-bound (§12, §14) |
| Operator-context persistence | TIBER-Fantasy (#333 operations) | Unpinned cross-repository observation — TIBER-Fantasy is not pinned in this report; the merged local-substrate state is consumed via the Ops #67 comment records noted below. Reuse, don't rebuild |
| Engineering-trace custody and model-comparison replays | TIBER-Research #16 | `requires_more_observation` |
| Evidence contracts and fail-closed gate precedent | TIBER-Data | Slice A/B merged; PR #261 containment merged at the pinned Data head |

Three consequences bind everything below:

1. **No competing kernel.** Harness references an exact Ops-governed Kernel
   release or synthetic candidate by manifest/constraint digests. It restates
   no doctrine and owns no doctrine bundle of any size.
2. **Unresolved inputs stay unresolved.** The R2 packet/trace/operation-manifest
   semantics and the #67 operation/tool vocabulary are consumed here as
   *unresolved dependencies*. This report does not define, fork, or
   pre-implement their contracts; where a schema below touches them it carries
   an explicit dependency marker.
3. **Candidate ≠ adopted.** The Ops Kernel documents are cited as the canonical
   *design basis*. No statement below treats them as an adopted interface
   available for execution.

Dependency evidence from GitHub issues is a **mutable current-state
observation**, not a frozen pin: a comment ID plus an observation date
identifies which record was read, but GitHub comments are editable and an ID
does not freeze its body. Repository commit SHAs pin file trees only — never
issue or comment state. The records consumed, as observed on 2026-08-29:

- Research #15: comments `5376323502` (R0/R1 census result), `5380686639`
  (R2 activation), and `5446705869`, `5448184223`, `5458407701` (R2 field
  contributions whose semantics this report consumes as unresolved inputs).
- Ops #67: comments `5448182288` (Sequence A checkpoint) and `5458407567`
  (post-containment reconciliation).

A later scaffold or successor report that depends on any of these must bind
immutable snapshots or body digests with exact observation metadata rather
than inherit this observation.

## 4. Provider-neutral workload-profile schema

A workload profile is a replaceable execution policy for a *class* of
evaluation work, aligned with the Ops Kernel candidate's §7.2. It is not
doctrine, not a routing decision, and not an authority object.

### 4.1 What may enter the generic profile

- profile ID, version, and content digest;
- workload class and **task geometry** (`ontology_discovery`,
  `bounded_implementation`, `exact_head_review`, `evidence_reconciliation`,
  `extraction_transformation`, `routine_monitoring` — a vocabulary informed by
  the issue's original list, the Kernel candidate's §7.2 roles, and the
  workload classes actually observed in the Data Slice A/B trajectory);
- required context **classes and compatibility declarations only** (a
  compatible Kernel schema/release class or range, plus a run-context class —
  dependency: R2). The exact Kernel release and the exact workload are bound
  separately in the task-authorization request, the invocation envelope, the
  build/load receipts, and the run report — never in the generic profile;
- scope declaration: the repositories, paths, and interfaces the workload
  class may touch, and its read/write class;
- the profile-declared minimum validator identities and versions (see §6.5 —
  the profile declares its *minimum* set; it is not the exclusive owner of
  every gate),
  plus review-independence requirements (which results require an independent
  reviewer distinct from the executor);
- input and structured-output contract references;
- permitted **tool families** as abstract capabilities (dependency: the #67
  operation vocabulary; placeholders here must not survive into
  implementation);
- abstract reasoning class (`minimal | standard | extended`);
- separate ordinal latency-priority and cost-priority classes, each
  provider-unitless and independently expressible;
- a distinct provider-neutral context-priority class (how much governed
  context weight the workload warrants), also provider-unitless;
- an allowed-network class with deny-by-default semantics — `none` unless
  explicitly declared; live endpoints, provider syntax, and credentials remain
  outside the generic profile in host-controlled configuration;
- time, evidence, tool, and provider-usage budgets;
- parallelism permission and subagent rules;
- stop, blocked, inconclusive, and escalation conditions;
- human-checkpoint requirements (including whether fresh human judgment is
  required between stages);
- declared failure behavior (§11);
- a routine-authority-envelope binding — exact ID, version, digest, and
  current status — where a routine workload would apply. No pinned dependency
  defines that envelope contract yet: #5 comment 5431887110 is design input,
  Harness #8 owns the adjacent agent-work observability/coordination design,
  and contract ownership remains **unresolved**. Until an owned, versioned
  envelope contract exists, the `routine_monitoring` profile class is
  excluded from any scaffold rather than gated on an undefined reference.

Illustrative only; a scaffold issue would define the exact schema:

```json
{
  "schema_version": "tiber-workload-profile/v0",
  "profile_id": "exact_head_review",
  "profile_version": "0.1.0",
  "task_geometry": "exact_head_review",
  "required_context": {
    "kernel_compatibility": "tiber-governance-kernel-manifest/v0 (class/range only; the exact release binds in the task request, invocation envelope, receipts, and run report)",
    "run_context_class": "UNRESOLVED-DEPENDENCY:research-15-r2"
  },
  "scope": {
    "repositories": ["declared-per-workload"],
    "paths": ["declared-per-workload"],
    "write_class": "read_only"
  },
  "input_contract_ref": "tiber-harness-input/v0",
  "output_contract_ref": "tiber-harness-output/v0",
  "minimum_validators": [
    { "validator_id": "validateJson", "version": "0.1.0" },
    { "validator_id": "validateSchema", "version": "0.1.0" }
  ],
  "review_independence": "independent_reviewer_required",
  "permitted_tool_families": "UNRESOLVED-DEPENDENCY:ops-67-operation-vocabulary",
  "reasoning_class": "extended",
  "latency_priority_class": "tolerant",
  "cost_priority_class": "quality_first",
  "context_priority_class": "high",
  "network_class": "none",
  "budgets": {
    "time_class": "bounded",
    "evidence_objects_max": 32,
    "tool_invocations_max": 64,
    "provider_usage_class": "capped"
  },
  "parallelism": { "permitted": false, "subagent_rules": "none" },
  "stop_conditions": ["blocked", "inconclusive", "escalate_to_operator"],
  "human_checkpoints": ["before_consequential_transition"],
  "failure_behavior": "fail_closed_per_section_11"
}
```

### 4.2 What must never enter the generic profile

Provider and model identifiers of any provider (all of: GPT-5.6 sol/terra/luna,
Claude Opus/Fable families, Ollama model tags, Grok Bot); provider-specific
reasoning-effort values; cache directives; sampling parameters; provider tool
syntax; credentials, endpoints, or token pricing; and any "neutral-looking"
field only one provider can satisfy. A leakage check belongs in the scaffold's
acceptance criteria: a generic profile must validate identically with every
provider-specific policy detached.

## 5. Governance-Kernel consumption (not a kernel proposal)

The issue's §3 asked Harness to define a context kernel. That work is owned by
Ops #30, where it exists as an unadopted candidate. Harness's remaining role:

- **Reference:** the exact Kernel release (manifest digest + constraint-set
  digest + custody/status-record reference), or an exact synthetic
  `fixture`/`candidate` release under the candidate's `synthetic_conformance`
  mode, is bound in the task-authorization request, the invocation envelope,
  the build/load receipts, and the run report. Generic profiles and Stage-1
  routing resolutions declare only a compatibility class/range. `latest`,
  branch names, and moving refs are prohibited wherever an exact release is
  bound.
- **Conformance (deferred):** the deterministic builder/loader scaffold (Kernel
  candidate stage B0, which names Harness the leading runtime-owning
  candidate) may only begin after an **accepted exact M0 manifest/constraint
  interface exists** — not merely after an M0 issue is opened.
- **No restatement:** the epistemic, freshness, admissibility, privacy,
  reportability, governance-state, and authority-transition vocabularies in
  the Kernel candidate's §15 are unadopted candidate fields owned by Ops.
  Harness cites them by exact reference and must not silently promote, fork,
  or redefine them. Fields apply according to the owning schema, with explicit
  absence or `not_applicable`; no object claims every field.
- **Stable vs. dynamic context:** the separation the issue asked for is the
  Kernel candidate's §1/§7 layering (Kernel release → doctrine profile →
  repository modules → workload profile → task authorization → evidence).
  Harness consumes that layering; it does not define a parallel one.

## 6. Provider-routing interface

### 6.1 Two stages, ordered by the Kernel loading sequence

**Stage 1 — planning/policy lookup (non-authorizing, deterministic, offline).**
From an exact `(workload profile, routing policy)` pair, propose exact
provider, model, adapter, and provider-configuration *references*, echo only
the profile-permitted tool families — not requested, eligible, enabled, or
effective tools — and check profile↔policy compatibility.
Stage-1 output is **planned routing-decision provenance, not execution
provenance**. It grants zero capability and precedes no verification it
depends on — it is a lookup, not a decision to run.

**Stage 2 — runtime routing/invocation preparation.** Occurs only inside the
Kernel candidate's §12 loading sequence, after the exact Kernel release and
current status, workload profile, routing policy, adapter descriptor,
task-authorization request, and current authority/checkpoint basis are
verified. The task-authorization request already binds the exact
routing-policy and adapter references: runtime independently **re-resolves and
verifies** those bindings but may not reselect, default, or fall back. A
material mapping change requires a new request and a new authorization.

The provider configuration a run will use is bound **before authorization**,
not left to mutable host state: the redacted, immutable resolved
configuration/endpoint identity **and its digest** are always bound into the
task-authorization request, carried into the operator authorization,
re-verified in Stage 2, and recorded in the receipts. The exact Stage-1
`RoutingResolutionV0` digest is also bound, and that resolution must itself
include the resolved configuration/endpoint identity digest; neither an opaque
provider-configuration reference nor the resolution digest alone substitutes
for the separately bound resolved identity. Host-side configuration drift
against that bound identity refuses the run; a material configuration change,
like a mapping change, requires a new request and a new authorization.

Within stage 2, a **provisional provider-load construction** is distinct from
an **executable invocation candidate**. The latter exists only after
(a) mandatory build/loading-receipt persistence and (b) pre-execution
revalidation of current Kernel status, the complete operator-authorization
state, trust root, scope, capabilities, budgets, and applicable
rights/checkpoints (Kernel candidate §12 with review-amendment §§1–2 and 4).
Authorization valid at assembly grants no residual authority at execution.
The same full revalidation is repeated immediately before any consequential
transition, and the effective capability intersection is recomputed at each
checkpoint; the provider execution or the transition is refused whenever that
intersection has widened or otherwise changed since assembly.

Neither stage grants authority. Three identities are preserved as separate
records: the **requested** provider/model (from the bound routing references),
the **resolved** provider/model (routing-resolution output), and the
**provider-reported or attested served** identity, recorded only in the run
receipt together with the transport/attestation evidence basis that
establishes it. Where that basis cannot establish the served identity, the
record carries an explicit unknown/unavailable state rather than an inferred
value.

### 6.2 Routing policy

`RoutingPolicyV0` is provider-specific, versioned, digest-bound, and
operator-approved. It contains: profile-to-provider/model mappings with
**hypothesis status** and case evidence; mappings from abstract reasoning
class to provider effort parameters; cache policy; adapter references; cost
ceilings in provider units; and an escalation rule (see §7.4). It may check
validator compatibility but may neither remove nor substitute a profile's
required validators. It contains no credential material and no live endpoint:
runtime binding uses opaque, host-controlled endpoint/configuration
references, with suitably redacted transport identity where auditability
needs it.

### 6.3 Capability decomposition

Ten distinct records, never merged — in particular, enabled tools are not
effective capabilities:

1. task-requested capabilities (`task_authorization_request`);
2. profile-permitted capabilities (`workload_profile`);
3. `kernel_constraint_set`;
4. `repository_module_set` — the complete canonical constraint object,
   including its prohibitions and narrowing semantics;
5. `host_controls` — likewise the complete canonical constraint object;
6. `operator_authorization` (the authorized subset);
7. adapter/provider support — a feasibility veto only, outside the
   intersection, which can never widen authority;
8. checkpoint-bound **effective capability ceiling** —
   `intersection(host_controls, kernel_constraint_set, operator_authorization,
   repository_module_set, workload_profile, task_authorization_request)`,
   revalidated at every effectful checkpoint; a non-empty intersection remains
   vetoable by current Kernel/authorization status, source rights, privacy,
   validator gates, adapter compatibility, budgets, and independent effect
   validation;
9. concretely configured/exposed tools;
10. actual invocations and per-effect validation results.

Operand availability may be verified separately, but an availability check
never substitutes for the operand itself. Adapter/provider support may veto
feasibility but never widens authority.
Retrieved evidence contributes zero capabilities. Models cannot expand their
own permissions; model-proposed tool calls are untrusted proposals validated
outside the model.

### 6.4 Provider adapters

Adapters follow the Kernel candidate's §10 contract: formatting may change;
semantics, segment content, precedence, authority, and omissions may not. Each
adapter declares its ID/version, provider family, compatible contract ranges,
segment-to-role mapping, tokenizer/estimator identity, cache-key inputs,
unsupported precedence cases, and conformance fixtures. An adapter that cannot
preserve required separation is incompatible and the load fails closed.

### 6.5 Validators

The workload profile declares its minimum required validator set; Kernel
constraints, repository modules, the task authorization, and operator
conditions may each add independent validation. Two separate proofs, never
collapsed:

- **Load/identity proof:** reviewed-source or registry identity and status,
  executable/built artifact digest, dependencies, toolchain, and runtime
  identity. Hashing source alone does not prove which implementation executed.
  (Precedent: the Data Slice B first repair round, where a self-asserted
  gitignored build was replaced by compile-from-reviewed-source with the built
  bytes hashed.)
- **Execution proof:** exact input and output digests, the validator's declared
  property scope, arguments/configuration, executor identity, exit/error
  identity, and result.

Deterministic validators are authoritative only for the mechanical properties
they declare and may veto eligibility; they establish no empirical truth,
source rights, or transition authority.

## 7. Worked example: GPT-5.6 (provider-specific layer only)

Everything in this section lives in the provider-specific routing-policy and
adapter layer. None of it may enter §4.

### 7.1 Candidate mappings — hypotheses, not truths

| Generic profile | GPT-5.6 hypothesis | Status |
| --- | --- | --- |
| `ontology_discovery` / quality-first cross-repo work | `gpt-5.6-sol`, extended effort | hypothesis; no benchmark evidence |
| `bounded_implementation`, `exact_head_review` | `gpt-5.6-terra`, standard effort | hypothesis; no benchmark evidence |
| `extraction_transformation`, `routine_monitoring` | `gpt-5.6-luna`, minimal effort | hypothesis; no benchmark evidence |
| pro mode | possibly never justified | open question for A0 benchmarking |

The same policy structure holds the current local example (`OllamaProvider`
with `OLLAMA_MODEL`) and future Anthropic, Cohere, or other adapters; GPT-5.6
is a worked example, not the abstraction.

### 7.2 Provider-feature bindings

Explicit prompt caching, persisted reasoning, reasoning-effort levels,
programmatic tool calling, and multi-agent support are adapter/policy concerns
with the trust boundaries of §8 and §9. The provider-load cache key follows
the Kernel candidate's §10 binding: the exact context-assembly digest,
provider-load/request digest, execution mode, trust-root digest,
custody/status-record digest, adapter and routing-policy digests,
provider/model configuration, and tokenizer/estimator mapping. Cached provider
output or persisted-reasoning reuse is separately keyed to the exact
provider-request digest and provider execution configuration, and additionally
partitioned by authenticated principal, workspace scope, and privacy class —
an unscoped cache is a deterministic isolation failure (Research #15's
isolation fixture, comment `5448184223`). Persisted provider state also
carries an identity, version, lineage, and reset semantics so its reuse is
inspectable and revocable. The full workspace-isolation semantics remain
R2-dependent (UNRESOLVED-DEPENDENCY:research-15-r2). A cache hit
remains incapable of replacing build/load validation, status checkpoints,
evidence, freshness, or authority.

### 7.3 Routing-hypothesis register

Per Research #16: a benchmark is a prior, not a routing policy. Every mapping
in a routing policy carries hypothesis status, the case evidence behind it,
and its confounders. The Opus/Fable engineering-trace observations in
Research #16 are case studies with recorded confounders and are consumable
here only as hypotheses; model attribution in that record is operator/session
metadata, and GitHub account identity proves no model identity.

### 7.4 Escalation rule

When the same defect class recurs across multiple exact-head reviews (the
Research #16 H4 signal, observed live in the Data Slice B trajectory), the
policy's guidance is to change the reasoning frame or model rather than
continue an unlimited local-fix loop. This remains guidance for operator
judgment; nothing self-activates.

## 8. Cache and reasoning-state trust boundaries

Prompt caching and persisted reasoning are **two distinct objects**, and both
sit outside the evidence and authority model:

- **Prompt cache:** a request-transport optimization. Its key binds the exact
  governed request identity (§7.2). Stochastic generation means cache-hit and
  cache-miss runs need not produce identical model output; what must remain
  invariant and observable is the governed request identity, authority state,
  contract bindings, and evaluation semantics. A cache hit never replaces
  build/load validation, status checkpoints, evidence, or authority, and cache
  time never makes anything fresh.
- **Persisted reasoning / provider-side model state:** separately keyed
  provider state. It must never become a source artifact, provenance record,
  validator result, or substitute for replayable evidence, and it is never
  collected or required in hidden form — evaluation uses observable behavior
  only (Research #15/#16 rule).

Distinguishable at all times: cached governed context; provider-side reasoning
state; model-generated intermediate work (agent material, non-ingestible);
retrieved evidence (evidence grade owned by its source, contributing zero
capabilities); deterministic validator output (scoped); and final Harness
reports (time-bearing runtime evidence, §10).

A deterministic recast of complete named inputs creates new **derived**
material; an agent restatement creates new **agent** material; in both cases
the original source and asserter survive only through lineage, and the new
object does not inherit an `observed` classification by paraphrase. Derived
contents remain derived permanently: a new empirical witness creates a
separate observed claim/object with its own independent provenance and lineage
under the owning lane's contract, and adoption or promotion never changes any
existing object's structural or epistemic class.

## 9. Programmatic-tool and multi-agent boundaries

- Tools are explicitly allowlisted per §6.3; models cannot expand their own
  permissions; every model-proposed call is validated outside the model
  against current authorization, scope, capability, schema, arguments,
  budget, and checkpoint state before execution.
- All subagents receive identical Kernel-release and task pins; subagent
  findings remain advisory; synthesis preserves disagreement and missing
  evidence; deterministic validation runs after synthesis.
- Structural isolation of untrusted content proves boundary preservation,
  never semantic inertness (Kernel review amendment §3): safety rests on
  externally derived least-privilege capabilities, typed tool interfaces,
  independent effect validation, and fail-closed checkpoints outside the
  model. Adversarial injection fixtures are resilience evidence only.
- Routine/persistent-agent workloads (the #5 comment's design input) would
  bind a routine-authority envelope by exact ID, version, digest, and current
  status — a contract whose ownership remains unresolved (§4.1; Harness #8
  owns the adjacent observability/coordination design); preparation may be
  automated, but
  commits, comments, merges, spending, credential changes, and any
  consequential action require separate exact operator authority. A suspected
  credential leak fails closed with redacted evidence and
  `NEEDS_OPERATOR_NOW`.

## 10. Observability: resolutions, receipts, and run reports

Planning records and runtime evidence are separate objects; a pure resolver
cannot truthfully know runtime facts, so no pre-run record carries empty slots
for them.

### 10.1 `RoutingResolutionV0` (deterministic, pre-run)

Exact profile and policy references and digests — no Kernel binding: the
exact Kernel release binds in the task-authorization request and invocation
envelope, not in Stage-1 planning; proposed provider/model/adapter/
provider-configuration reference and the digest of its resolved, redacted
configuration/endpoint identity; profile-permitted tool families echoed
strictly as such — not requested, eligible, enabled, or effective; the
profile-declared **minimum** validator set and policy-compatibility results —
the complete effective validator set is derived and independently proven
during Stage 2, after Kernel-constraint, repository-module,
task-authorization, and operator-condition additions; or a typed refusal
naming the failed gate. No default-model fallback exists.
The resolved-identity digest is a pinned Stage-1 input and is also bound
separately in the task-authorization request; an opaque reference or the
resolution digest alone cannot stand in for it. Byte-reproducible from pinned
inputs; no clock, no absolute path, no credential material.

### 10.2 Kernel build/loading receipts

Receipt-contract ownership and receipt-instance custody are distinct and must
not be collapsed. The receipt **contract/schema** is governed through Ops —
the **unadopted** Kernel candidate's §9/§12 is where the
emit-and-persist-before-execution requirement comes from, and failure to
persist fails closed under its contract. Receipt **instances** are emitted and
custodied by the eventual runtime — Harness, per the candidate's §13.1
observability/receipts role — with the custody location itself an unresolved
Kernel question. The separately proven custody/writer boundary is a **proposed
Harness design translation informed by** Data PR #261; Data governs nothing in
Harness, and the precedent is informative only: when a writer cannot prove its
invariant, the correct disposition is to remove that write capability rather
than accumulate pathname checks — #261 removed the gate's caller-selected
arbitrary-path result publication while its private temporary build activity
remained. Report *generation* never authorizes or implements *persistence*.
Nothing here changes the current gitignored Harness report writer.

### 10.3 `HarnessRunReportV0` (time-bearing runtime evidence)

The run report covers the Harness #5 required report fields and the Ops
Kernel candidate's §12 run-receipt minimums, with the review amendment's
checkpoint corrections. At minimum:

- execution mode, trust-root ID/version/digest, and the current Kernel
  release/status evidence used (custody/status-record digest, observation
  time, and supersession result);
- exact workload-profile, routing-policy, adapter, and Kernel
  manifest/constraint-set references and digests;
- Kernel component lineage (component IDs, paths, versions, and digests) plus
  the doctrine-profile-or-absence marker, the ordered repository-module-set
  identities and digests, and the evidence-index identity and digest;
- operator-authorization detail: decision-record ID and digest, conditions,
  effective/expiry bounds, requested and excluded attestation types, accepted
  technical-verification-packet digests, and reauthorization-trigger state;
- requested, resolved, and provider-reported/attested served provider/model
  identities, each a separate record, with the transport/attestation evidence
  basis and explicit unknown/unavailable states where that basis cannot
  establish an identity;
- the reasoning class/effort and provider configuration actually applied —
  configuration metadata only, never hidden reasoning content;
- cache and persisted-state metadata per §8;
- concretely configured/enabled tools, networks, repositories, paths, and
  budgets — kept separate from actual invocations and their per-effect
  validation results;
- the effective-capability calculation (§6.3);
- per-layer byte/token counts, output reserve, omissions, and overflow
  diagnostics;
- token, cost, and latency metadata where available, and all applicable
  clocks;
- context-assembly and provider-load/request digests;
- provider invocation/transport identity and execution start/end times;
- raw-output digest, structured-output digest, and the exact output-schema
  ID/version;
- evidence references with their dynamic classifications per the owning
  schemas (namespaced epistemic, evidence-support, freshness,
  technical-availability, privacy, and reportability states), and the exact
  source-use policy binding — policy ID, status, decision reference,
  intended-use axes, and per-axis outcomes;
- validator executions with both proofs from §6.5; deterministic overrides
  applied; subagent roles and shared pins; disagreements and unknowns; and
  the final fail-closed or handoff status.

Each checkpoint — immediately before every provider execution and immediately
before every consequential transition — binds the authoritative registry-head
proof it used, explicitly requiring and recording every field the Kernel
review amendment mandates:

- monotonic ordering or sequence evidence;
- the exact registry-head/checkpoint digest;
- the trusted custody identity;
- the observation time;
- the maximum permitted observation age;
- the freshness result;
- membership of the presented release/status record in that authoritative
  head; and
- the current supersession, revocation, withdrawal, successor, and explicit
  non-revocation results for the exact manifest digest.

A cache entry, old observation receipt, release-local signature, or
historically valid status record cannot substitute for that proof. Separate
results are recorded at both checkpoints for: Kernel-status currency;
authorization currency; issuer/trust-root validity; scope/capability/budget
consistency; and independent external-effect validation. Each checkpoint
recomputes the effective capability intersection; the provider execution or
the transition is refused whenever that intersection has widened or otherwise
changed since assembly.

A field that cannot exist because execution stopped early carries an explicit
unavailable reason and stage — never silent omission.

Every run report links, by ID and digest, the three immutable activation
objects — the task-authorization request (binding the exact scope, start head,
and governing refs), the technical-verification packet(s) (binding the exact
request digest), and the operator authorization record (binding the exact
request digest, the accepted verification digests, conditions, and the
authorized subset) — plus the `RoutingResolutionV0` and the Kernel
build/loading receipts the run executed under. Combining their presentation is
allowed; collapsing their identities is not.

### 10.4 Provenance typing

Four records stay separate on every consumed finding and every attribution:
source reference; asserter/account provenance; transformer/compiler identity;
and model-attribution evidence. GitHub account identity does not prove model
identity, and model identity is never treated as proof that it caused an
outcome. Review findings additionally carry their provenance class
(connector-authored object, operator-relayed, operator-authored) — proposed
hardening generalizing the discipline kept by hand in the Data Slice B record.

## 11. Threat and failure analysis

| Threat / failure | Control | Failure behavior |
| --- | --- | --- |
| Unknown, unpinned, or digest-mismatched profile or routing policy | Exact-reference resolution (§6.1 Stage 1) | Refuse the Stage-1 `RoutingResolutionV0`; no default |
| Unknown, unpinned, or digest-mismatched exact Kernel binding | Task-request / invocation-envelope verification (§5, §6.1 Stage 2) | Refuse the Stage-2 build/load/invocation |
| Profile with no mapping in the active policy | Stage-1 compatibility check | Refuse; no fallback model |
| Runtime reselection, default, or fallback of a bound mapping | Request-bound routing references (§6.1) | Blocked; material change requires a new request and authorization |
| Missing/unavailable declared validator | Load/identity proof (§6.5) | A stage that cannot run is a failure, never a skip |
| Self-asserted validator or evaluator identity | Independent load/identity proof | Refuse; identity by construction, not self-report |
| Invalid, malformed, or self-contradictory structured output | Envelope validated structurally without coercion | Reject |
| Cache or persisted reasoning treated as evidence or freshness | §8 separation; cache-key binding | Validation failure |
| Model self-escalation; tool-call outside the ceiling | §6.3 intersection + external per-effect validation | Block; capability never widens at runtime |
| Provider/model name leaking into generic semantics | §4.2 leakage check | Scaffold acceptance failure |
| Kernel candidate treated as adopted | Custody/status verification per mode | `authorized_run` impossible without an adopted current release; synthetic mode only |
| Receipt persistence failure | §10.2 custody/writer boundary | Fail closed before execution |
| Missing or unavailable required Kernel component | Deterministic manifest resolution | Refuse the build/load |
| Missing required provenance/report field without an explicit stage-scoped unavailable reason | §10.3 explicit-unavailability rule | Report is invalid, non-governed, and ineligible |
| Writer boundary cannot prove its invariant | PR #261 posture | Remove the write capability |
| Prompt injection in retrieved/repository content | Amendment-§3 layered containment | Structural checks prove boundary preservation only; block unvalidated effects; never claim semantic inertness |
| Authorization stale at execution | Checkpoint revalidation (amendment §§1–2) | Block; assembly-time validity grants no residual authority |
| Ambiguous identity anywhere (entity, contract, release, head) | Fail-closed identity rule | Unresolved, never guessed |
| Suspected credential leak | §9 stop boundary | `NEEDS_OPERATOR_NOW`, redacted evidence only |

## 12. Staged implementation options

Aligned to the Kernel candidate's §18; every stage needs its own separate
authority, and none is opened or implied by this report:

1. **This report (D-level, Harness).** Docs-only; operator and independent
   review disposition required.
2. **Ops M0** — manifest/component scaffold, Ops-governed. An **accepted exact
   M0 manifest/constraint interface** (not merely an opened issue) gates B0
   implementation.
3. **B0** — deterministic builder/loader conformance scaffold, Harness the
   leading candidate location; `synthetic_conformance` only.
4. **C0** — synthetic conformance against the existing public-safe Research
   fixture through a read-only wrapper.
5. **Harness routing scaffold** — `WorkloadProfileV0`, `RoutingPolicyV0`,
   `RoutingResolutionV0`, `HarnessRunReportV0` schemas plus refusal fixtures.
   Requires this report's terminal to permit it *and* separate operator
   authorization; also requires the #67 vocabulary (for tool families) and the
   R2 outcome (for run-context classes) to close their dependency markers.
6. **A0** — adapter/provider benchmark under provider-specific authority,
   credentials, cost ceilings, and network policy.

B0 and C0 gate **live or networked** provider execution and A0 benchmarking;
they do not prohibit deterministic or MockProvider synthetic execution within
their own separately authorized stages, and nothing gates the *specification*
work this report already performs.

## 13. Benchmark questions

For a later A0 stage, none answerable today:

1. Do the §7.1 tier hypotheses survive matched, frozen replays (the Research
   #16 candidate replay set) under identical pins?
2. Does task geometry predict routing fit better than capability tier?
3. What are the measured cost/latency/quality trade-offs per profile across
   providers, in provider-unitless priority classes?
4. When does the §7.4 escalation rule fire earlier than a fixed
   repair-round budget would?
5. What cache-hit rates do governed cache keys actually achieve, and does
   cache behavior ever correlate with output differences that matter to
   validators?
6. Is multi-agent execution ever cost-effective for any profile under
   disagreement-preserving synthesis?
7. Can any provider adapter not preserve the required segment separation
   (making it incompatible per §6.4)?

## 14. Acceptance and dependency matrix

Columns: **Report** = this report's acceptance state | **Design/dependency
basis** | **Scaffold/runtime readiness**.

| # | #5 criterion | Report | Design/dependency basis | Scaffold/runtime readiness |
| --- | --- | --- | --- | --- |
| 1 | Spec-only architecture report committed | Satisfied at exact branch head: the report exists in a commit (predecessor head `3138c3d9e6fdbde258c161d5ac5aeddbaf91497d`; the commit carrying this row cannot embed its own hash — the PR head receipt binds it externally, per the Kernel candidate's two-step custody binding). A commit records repository-native bytes only; reviewed status requires a separate exact-head review receipt; neither grants authority | — | — |
| 2 | Usable by Ollama, OpenAI, Cohere, Anthropic, future providers | Addressed (§4, §6, §7) | `PROVIDER_BOUNDARY.md` interface | Adapters are A0-stage work |
| 3 | GPT-5.6 worked example, not central abstraction | Addressed (§7 quarantined to policy layer) | — | — |
| 4 | Profiles and provider mappings separate | Addressed (§4/§6.2; originates in #5, strengthened by the unadopted Kernel candidate §7.2) | Unadopted Ops candidate | Blocked on later governed stages |
| 5 | Kernel contents versioned, source-bound, hashable, reportable | Addressed by consumption-by-digest (§5); the kernel itself is Ops-owned | Kernel candidate §§5–6; **no accepted M0 interface exists** | B0 blocked until an accepted exact M0 interface |
| 6 | Stable kernel vs. dynamic run context separated | Addressed by reference to Kernel §1/§7 layering (§5) | Unadopted Ops candidate | Blocked as above |
| 7 | Cached prompts / persisted reasoning not evidence | Addressed (§8; originates in #5, strengthened by Kernel §10/§15 + amendment §3) | Unadopted Ops candidate | Blocked on later governed stages |
| 8 | No model self-escalation / silent permission expansion | Addressed (§6.3, §9; originates in #5, strengthened by Kernel §8 + amendment) | Unadopted Ops candidate | Blocked on later governed stages |
| 9 | Existing Mock and Ollama behavior unchanged | Baseline preflight pass at `eac4b096…`; re-verify at the exact merged report head | — | Holds |
| 10 | No API key, paid request, networked CI, or provider implementation | Baseline preflight pass at `eac4b096…`; re-verify at the exact merged report head | — | Holds |
| 11 | Exactly one machine-readable terminal emitted | Satisfied: exactly one fenced terminal, in §15, derived from the evidence at this boundary (§1 references it in prose only) | — | Any child scaffold additionally requires separate operator authorization |

Unresolved dependencies preserved, not defined here: Research #15 R2
(run-context classes, packet/trace semantics — R2 completion and operator
review required before those markers close); Ops #67 (operation/tool
vocabulary — completed and consumed inventory required); Ops #30 M0 (accepted
manifest/constraint interface required before B0 implementation); production
compiler ownership; Kernel custody/runtime location.

## 15. Final recommendation and terminal

The generic workload-profile shape, the two-stage routing interface, the
capability decomposition, the observability split, and the threat model above
are ready for review as specifications. But every implementation seam is
dependency-bound at this exact boundary:

- the Governance Kernel exists only as an **unadopted candidate** with no
  accepted M0 manifest/constraint interface to bind conformance work to;
- Research #15 R2 is **activated and unfinished**, so run-context classes and
  packet/trace semantics cannot be finalized here without forking an active
  design;
- Ops #67 is **incomplete**, so the permitted-tool-family vocabulary cannot be
  finalized without inventing the operation catalog that audit owns.

Opening either scaffold the issue names would therefore bind to unadopted or
unfinished upstream contracts or re-create them locally — the exact
dual-definition failure the Kernel candidate's threat table rejects. Derived
from that evidence, this report's single machine-readable terminal is:

```text
do_not_proceed
```

Dependency-bound, not permanent, with per-child gates that unlock
independently:

- an accepted exact Ops M0 manifest/constraint interface may, on its own,
  unlock reconsideration of the B0 builder/loader **conformance** work;
- Research #15 R2 completion and operator review gate the **routing
  scaffold's** run-context classes, and the completed, consumed Ops #67
  inventory gates its permitted-tool-family vocabulary.

A successor report (or an operator-authorized amendment to this one) would
re-derive its terminal from the evidence at its own exact-head review
boundary; no successor terminal is precommitted here.

This terminal is a repository-native terminal recommendation: the commit
records these bytes, reviewed status requires a separate exact-head review
receipt, and neither grants authority. It opens no child issue and permits no
scaffold; and had it been a `may_open_*` value, a child issue would still
require separate exact operator authorization.
