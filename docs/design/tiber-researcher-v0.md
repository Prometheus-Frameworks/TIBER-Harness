# TIBER Researcher v0

Status: architecture candidate for [TIBER-Harness #6](https://github.com/Prometheus-Frameworks/TIBER-Harness/issues/6)

This report is design and discovery only. It does not create a repository, implement a
Researcher runtime, activate a research job, call a model, admit a source, connect private
league data, create a schedule, promote a claim, modify a Strategy artifact, or authorize any
downstream action.

## 1. Decision summary

TIBER should separate durable football-research custody from both the TIBER-Harness evaluation
boundary and the TIBER-Ops authority boundary.

The recommended future topology is:

- **TIBER-Ops** owns activation, amendment, cancellation, promotion, revocation, and
  supersession decisions.
- A separate, file-backed repository named **TIBER-Research** owns research contracts,
  admitted-input manifests, append-oriented working state, candidate findings, independent
  reviews, and immutable terminal seals.
- **Codex, Claude Code, local models, or future providers** may act as declared executor or
  reviewer roles. They do not own the research state or its authority.
- **TIBER-Harness** remains outside the v0 production research path. It may later evaluate
  synthetic Research contracts and conformance fixtures under a separately approved contract.
- Future **Strategy** artifacts pull only exact sealed claims that also carry an effective,
  narrowly scoped Ops permission. Research never pushes changes into Strategy.

The separate repository is justified primarily by a least-privilege write boundary. A research
executor can be allowed to append candidate research state without receiving write authority
over Ops, source repositories, Harness, Strategy, Forecast, or a product surface.

The first proposed workload is
[TIBER-Ops #52](https://github.com/Prometheus-Frameworks/TIBER-Ops/issues/52), but this report
does not activate it.

## 2. Current Harness boundary

The current [TIBER-Harness README](https://github.com/Prometheus-Frameworks/TIBER-Harness/blob/main/README.md)
defines Harness as a provider-agnostic runtime and evaluation layer for testing whether model
outputs conform to TIBER contracts, fixtures, schemas, and deterministic validators.

That boundary remains unchanged:

- model output is advisory;
- deterministic validators are authoritative within Harness evaluations;
- Harness is not a product surface;
- Harness does not promote real artifacts;
- existing promotion-oriented evaluations treat lineup, start/sit, waiver, trade, ranking, and
  recommendation content as contamination;
- default tests require no remote provider, secret, or network call; and
- no TIBER product repository depends on Harness at runtime.

Research packets about football opportunity or market hypotheses require a distinct,
explicitly non-promotional contract. Their existence must not weaken existing contamination
checks or allow football research to masquerade as an artifact-audit result, deterministic
validator verdict, promotion decision, or governed universal truth.

Harness may eventually test whether a candidate executor obeys a Research contract. It should
not own or operate the live research archive.

## 3. Researcher purpose and non-purpose

### 3.1 Purpose

Researcher is the logical, provider-neutral capability for conducting bounded football research
whose inspectable state can survive beyond one chat, context window, model, or provider.

It exists to:

- freeze a bounded research question before evidence collection;
- distinguish an operator prior from empirical evidence;
- pin the exact governed TIBER artifacts and admitted source objects used;
- preserve hypotheses, calculations, counterevidence, contradictions, negative findings, and
  uncertainty;
- permit safe cold resume from explicit state;
- support a fresh-context challenge and protocol review;
- seal passed, rejected, blocked, inconclusive, and rework-required attempts; and
- expose exact candidate claims for a later, separate operator decision.

### 3.2 Non-purpose

Researcher is not:

- a weekly-task runner;
- an autonomous football scout;
- an agent identity or permanent session;
- a source-acquisition loophole;
- a model-training or Forecast pipeline;
- a ranking, lineup, waiver, trade, or draft-action engine;
- a Strategy implementation;
- an artifact promoter;
- a scheduler;
- a product surface; or
- a substitute for operator authority.

A schedule may later instantiate a Research job. A provider may later execute one. A Strategy
artifact may later consume a permitted claim. None of those concerns defines Researcher itself.

## 4. Placement options

| Option | Benefit | Material problem | Disposition |
|---|---|---|---|
| Workload family inside Harness | Reuses current provider and validator concepts | Live football research state would share a repository with promotion-oriented contamination checks and broaden Harness beyond evaluation | Reject |
| Adjacent Harness-managed package/runtime | Some separation while retaining shared tooling | Harness would still become the operational owner of football research and an implicit dependency | Reject |
| Separate file-backed Research repository | Creates a narrow write boundary, durable domain custody, provider neutrality, and clean future consumer interface | Requires a separately governed repository and a small local validation surface | Recommend |
| No new capability | Avoids repository overhead | Leaves long-horizon research dependent on chat state, issue prose, and ad hoc handoffs | Reject |

The repository should be named after the durable capability, **TIBER-Research**, rather than
after a provider or agent. “Researcher” remains a logical execution role that different
providers can perform.

The architecture report belongs in Harness because #6 owns the placement decision. Any future
creation of TIBER-Research requires a separate, explicit operator authorization.

## 5. Ownership and dependency boundaries

| Component | Owns | May write | Consumes |
|---|---|---|---|
| TIBER-Ops | Activation, amendment, cancellation, promotion, revocation, supersession | Ops only | Proposed Research job hashes and sealed Research claim IDs |
| TIBER-Research | Job and attempt custody, inputs, evidence, packets, reviews, seals | Research only | Exact Ops decisions and read-only pinned source artifacts |
| Executor role | Bounded research actions permitted by an activated job | One active Research attempt only | Activated job, admitted inputs, ledger head, repository policy |
| Reviewer role | Substantive-adequacy and protocol-compliance verdicts | One review record for one frozen attempt | Exact frozen candidate bytes |
| TIBER-Harness | Optional future synthetic conformance evaluations | Harness fixtures and reports only | Versioned Research contract examples |
| Strategy consumer | Consumer-specific interpretation and adoption | Strategy only | Sealed Research claims plus an effective Ops permission |
| Source repositories | Their governed domain artifacts | Their own repositories only | Nothing from Research is required |

These are different kinds of relationships:

- **Authority flow:** Ops authorizes a specific job or a specific later use.
- **Data flow:** Research reads pinned inputs; a consumer later reads sealed claims.
- **Software dependency:** v0 Research does not require Ops or Harness code at runtime.

Source repositories remain unaware of Research. Research never modifies a source repository,
Ops, Harness, Strategy, Forecast, or a product. Strategy pulls; Research never pushes.

## 6. Relationship to Harness #5

[Harness #5](https://github.com/Prometheus-Frameworks/TIBER-Harness/issues/5) proposes a context
kernel, provider-neutral workload profiles, routing, cache boundaries, multi-agent rules, and
run observability. It is an architecture proposal, not an implemented dependency.

| #5 concept | Research v0 treatment |
|---|---|
| Context kernel | Optional future `context_manifest_ref`; v0 may use an independently pinned context manifest |
| Workload profiles | A future profile such as methodology research may map to Research, but the v0 job schema is self-contained |
| Provider routing | External invocation concern; the job records the selected provider but cannot select or escalate its own provider |
| Tool allowlists | Required in the job contract; enforcement belongs to the executing environment and is recorded in the ledger |
| Cache boundaries | Cached governed context may improve efficiency, but cache or persisted reasoning is never evidence |
| Multi-agent execution | v0 uses one active writer and one fresh-context reviewer; parallel synthesis is deferred |
| Run observability | Research records actor sessions, tool events, interventions, budgets, checkpoints, and terminal hashes |

Research must not require a `kernel_version` that does not yet exist. When a governed context
kernel later exists, a job may pin it through `context_manifest_ref` without changing the
Research ownership boundary.

Completion of this report does not authorize implementation of any #5 component.

## 7. Canonical identities and repository layout

A reusable job contract, one operator-activated run, and an executor submission attempt are not
the same object:

- `job_id` identifies the durable research question.
- `job_version` identifies one immutable specification of that question.
- `run_id` identifies one operator activation of an exact job version against one frozen input
  manifest, cutoff, authority envelope, and budget.
- `attempt_id` identifies one executor submission within that run.

Reviewer-requested rework that preserves the job, inputs, cutoff, source envelope, and authority
creates a successor attempt. A change to the question, subjects, comparison population, source
envelope, frozen inputs, cutoff, authority, or budget creates a new run and requires a new Ops
activation. It must not be represented as a correction to the old attempt.

```text
TIBER-Research/
  schemas/
  tools/
  jobs/
    opportunity-clusters-2026-v0/
      v1/
        job.yaml
  objects/
    sha256/
      <retained-object-bytes-when-permitted>
  runs/
    <run-id>/
      activation.json
      inputs.json
      run-events.jsonl
      sources/
        <source-object-id>/
          metadata.json
          content
      attempts/
        <attempt-id>/
          ledger.jsonl
          packet.json
          packet.md
          submission.json
          review.json
          seal.json
```

`content` and `objects/` are used only when the applicable source policy permits exact-byte
retention. `metadata.json` remains required and records whether it resolves to retained content,
an immutable governed object, or lineage only. A reference to material that cannot lawfully be
retained may be traceable without being fully replayable; the run must state that limitation
rather than claim stronger reproducibility.

For the simplest #52 pilot, the complete evidence packet should be frozen before activation. A
future design may allow retrieval within an already approved source family, but the retrieved
object must be quarantined, source-validated, included in the submitted digest set, and must not
silently widen the activated source envelope.

### 7.1 `job.yaml`

The immutable, provider-neutral task specification. It has a stable `job_id` and explicit
`job_version`. Its canonical bytes are hashed before activation.

### 7.2 `activation.json`

A receipt pointing to the exact signed Ops activation decision, job hash, input-manifest hash,
run ID, cutoff, authority envelope, budget, and permitted branch/path. The receipt is not
independent authority. A mismatch between receipt, decision, job, inputs, or environment fails
closed.

### 7.3 `inputs.json`

The complete admitted-input manifest:

- issue-body snapshots and body hashes;
- baseline snapshot;
- subject and comparison populations;
- repository, commit, path, blob, artifact, and contract identities;
- retained-object hashes where permitted;
- source admissibility and retention mode;
- freshness and cutoff state;
- revision and supersession information; and
- unavailable, excluded, or blocked inputs.

Location, a URL, or a `/promoted/` path is never governance, freshness, or admissibility proof.

### 7.4 `run-events.jsonl`

The run-level chronological record for activation, attempt submissions, review returns,
cancellation, budget exhaustion, protocol violations, and successor links. It never carries
football evidence or silently changes the activated job or inputs.

### 7.5 `sources/`

The run-scoped source-object inventory. Every admitted source object has `metadata.json`.
Retained content exists only when the source envelope authorizes that retention mode; otherwise
the metadata records the exact lineage and replayability limitation.

### 7.6 `ledger.jsonl`

The append-oriented externalized memory for one attempt.

The v0 ledger is explicitly **single-writer**. Every event has:

- stable event ID;
- monotonic sequence;
- previous-event hash;
- event type;
- actor-session reference;
- recorded time;
- parent or source references;
- applicable epistemic class;
- applicable freshness and admissibility state;
- limitations; and
- event hash.

Actor/provider/tool defaults live at the run or actor-session level and are repeated on an event
only when they differ. The ledger is frozen at submission. No event is appended after the
candidate is submitted for review.

The ledger is append-oriented before submission, not inherently immutable. Sequence and
previous-event hashes make rewrites detectable; submission and sealing make the attempt
tamper-evident.

Minimum event types are:

- `hypothesis`;
- `source_observation`;
- `calculation`;
- `challenge`;
- `checkpoint`;
- `intervention`;
- `tool_use`;
- `status_transition`;
- `amendment_proposal`; and
- `out_of_scope_discovery`.

An amendment may be proposed in the ledger but applied only through a new exact Ops decision
and successor job version.

### 7.7 `packet.json` and `packet.md`

`packet.json` is the authoritative structured synthesis for the attempt. It is not evidence and
is not claimed to be a deterministic intellectual consequence of the ledger. A validator checks
that every candidate claim resolves to admitted evidence, calculation lineage, counterevidence,
limitations, and challenge records.

`packet.md` is a deterministic operator-readable rendering of `packet.json`. It is never an
independently authored authority surface.

### 7.8 `submission.json`

The executor's immutable review handoff. It records canonical SHA-256 digests of:

- job;
- activation;
- input manifest;
- all admitted source metadata and retained content objects;
- full ledger and ledger head;
- structured packet;
- exact rendered packet shown to the reviewer; and
- validator and canonicalization versions.

The reviewer receives exactly this submission read-only. Any correction after submission
creates a successor attempt.

### 7.9 `review.json`

One immutable review of one exact frozen submission. It pins:

- submission digest;
- reviewer context and independence basis.

The reviewer may write only the review record. It cannot repair the material it reviews.

### 7.10 `seal.json`

The terminal integrity manifest for an attempt. It records the submission digest, review digest,
terminal state, predecessor or successor references, and canonicalization versions. It excludes
its own digest. The canonical SHA-256 digest of `seal.json` becomes the attempt/archive ID.

Every terminal attempt is sealed, including blocked, inconclusive, rejected, cancelled, and
rework-required attempts. Rework creates a successor attempt; it never changes a prior seal.

No promotion record belongs inside a sealed attempt.

### 7.11 Canonicalization

The future Stage 0 specification must name one byte-level procedure rather than use the word
“hash” loosely:

- UTF-8 raw-byte hashing for YAML, Markdown, JSONL, and retained source bytes;
- RFC 8785 JSON Canonicalization Scheme, or one equally explicit pinned procedure, for
  structured JSON digests; and
- `sha256:<lowercase-hex>` identifiers.

Canonicalization rules are versioned in submissions and seals. This report specifies the
requirement but does not implement it.

## 8. Research-job contract

An activated `job.yaml` contains at least:

- schema version, job ID, and job version;
- purpose and bounded questions;
- research mode and expected output class;
- exact subject population;
- permitted comparison population;
- pilot-local baseline reference;
- declared cutoff and applicable time horizon;
- optional recurrence metadata and invocation-key shape, inert unless a separately authorized
  scheduler exists;
- admitted TIBER artifacts and exact pins;
- admitted source envelope and evidence classes;
- context classes and privacy ceiling;
- tool allowlist;
- repository read/write scope;
- authority ceiling and prohibited actions;
- provider-neutral actor roles;
- optional time, cost, tool-call, and evidence budgets;
- checkpoint and cold-resume requirements;
- required self-challenge and independent-review gates;
- stop, cancellation, blocked, and inconclusive conditions;
- escalation conditions and the exact human decision owner;
- permitted terminal states;
- reportability classification;
- amendment owner; and
- expected consumer-authority state, initially none.

The executing agent cannot expand subjects, comparison populations, repositories, sources,
tools, budgets, recurrence, permissions, or expected consumer use. Budget exhaustion is a
blocked or incomplete state, never completion evidence.

The activation declaration is not sufficient by itself. Effective filesystem, repository,
network, connector, tool, and credential capabilities must be a subset of the activated
envelope. The executor may write only the current attempt path and permitted run event log. It
may not alter the job, activation, inputs, schemas, validators, prior attempts, Ops, Harness,
source repositories, or consumers. A capability mismatch or out-of-envelope tool/write event is
a terminal protocol violation, not a warning.

After activation:

- a material contract change creates a successor job version;
- reviewer-requested rework against unchanged inputs creates a successor attempt;
- changed inputs, cutoff, source envelope, authority, or budget create a new run;
- only Ops may activate a successor job version or run; and
- the superseded object remains preserved.

## 9. Context, privacy, and evidence layers

| Context class | Access | Retention | Redaction/deletion | Reportability | Freshness rule |
|---|---|---|---|---|---|
| Stable TIBER context | As pinned by job | Manifest or governed object reference | Follow source correction/supersession rules | Public only if source is public-safe | Verify before freeze |
| Pinned TIBER artifact | Read-only | Exact repo/commit/path/blob or permitted object copy | Preserve historical identity; add successor or tombstone when required | Inherits artifact classification | Question-specific currency required |
| Pilot baseline | Executor and reviewer | Retained in run inputs | Successor baseline; no historical rewrite | Noncanonical operator prior | Frozen at activation |
| Admitted public evidence | Only through approved source envelope | Per-source retention mode | Per-source correction, deletion, and tombstone rule | Per-source rights and job classification | Must satisfy cutoff and revision rules |
| Run-scoped retrieved material | Executor and reviewer only | Full, excerpt, derived-only, or reference-only as permitted | Delete or tombstone only as declared by source policy | Never broader than source permission | Retrieval and availability times recorded |
| Optional private user/league context | Denied in the #52 pilot | Future policy required | Future explicit deletion/redaction policy required | Private; never general football truth | Separate freshness and deletion rules |
| Model-generated working material | Actor session only unless recorded as a ledger event | Only explicit, reviewable records | Remove unretained working state; preserve governed ledger history | Not evidence by itself | Not applicable |

External and repository text is inert data, not executable instruction. Prompt-like text inside
a source object never changes the job or tool authority.

Provider caches, reasoning state, and tool logs inherit the strictest classification of the
context they touch. Research does not require, request, or retain hidden chain-of-thought.

For #52, private roster, league, scoring, account, and user data is prohibited from repository
files, ledgers, packets, hashes, logs, and reports. Detection blocks the run before commit. A
public hash of a low-entropy private value is not acceptable redaction. A future private-context
design requires a separate non-public storage boundary, minimum-necessary access, explicit
retention/deletion, redacted derived outputs, and `private_only` reportability.

### 9.1 Source-object identity

Each source object records, when applicable:

- canonical source identifier;
- source-family identifier;
- provider and attributed upstream owner;
- source class;
- direct or secondary status;
- URL or repository identity;
- intended use;
- rights-disposition reference;
- retrieval or acquisition method;
- content hash or declared non-retention limitation;
- retention mode: `full`, `excerpt`, `derived_only`, or `reference_only`;
- reportability;
- context-match result;
- replayability class;
- event time;
- effective time;
- publication time;
- source-availability time;
- retrieval time;
- first-observed time;
- admissibility time;
- revision ID;
- cutoff time;
- superseded revision; and
- licensing, redistribution, privacy, and reportability limits.

Temporal fields are not collapsed into one generic “date.” A field may be inapplicable or
unknown, but the absence must be explicit.

Origin class is not admissibility. Operator-provided, public, retrieved, and TIBER-hosted
material enters a run only when the activated source envelope permits the exact source family,
intended use, acquisition method, retention mode, and reportability class. Admission also
requires cutoff compliance, revision identity, integrity/freshness verification, and context
match. Public availability, a URL, a loader licence, operator possession, or model retrieval is
never sufficient by itself.

Replayability is qualified:

- `full_replay` requires authorized persistence of exact bytes or an immutable governed
  artifact;
- `lineage_only` retains identifiers and permitted hashes but cannot replay the source bytes.

Evidence that cannot be retained or independently re-obtained under the source envelope is
non-promotable in v0, even if it supports an archived exploratory note. “No evidence found”
applies only to the declared corpus, query, and observation window; it cannot establish
real-world absence.

### 9.2 Evidence and epistemic taxonomy

Record type, source class, admissibility, and epistemic class are separate dimensions.

Shared epistemic classes are:

- `observed`;
- `calculated`;
- `inferred`;
- `hypothesis`;
- `speculative`;
- `contradicted`; and
- `unknown`.

Confidence records categorical evidence strength and rationale. It is not a universal numeric
trust score and does not substitute for mechanical verification, operator judgment,
independent review, or empirical confirmation.

Model-generated interpretation may connect evidence to a proposed claim. It does not become
evidence merely because a model wrote it.

Operator observations can define the baseline prior. They count as empirical evidence only
when the job admits an exact operator-provided observation packet with sufficient identity,
context, retention, cutoff, and reportability information. The prior cannot support itself.

A negative search is recorded as a ledger event with its bounded query, searched source
universe, tool, time, cutoff, and `not_found`, `unavailable`, or `inadmissible` result. It is not
silently omitted. Unresolved questions remain explicit in checkpoints and the final packet.

A calculation event records the deterministic code or method version, exact input references
and hashes, parameters, exclusions, units, output hash, and any reproducibility limitation.

## 10. Lifecycle, challenge, review, and sealing

Research is iterative; hypothesis generation, evidence collection, calculation, and challenge
may repeat within an active attempt. They are not a rigid waterfall.

### 10.1 Job-version state

```text
proposed -> approved_spec -> superseded | retired
```

A job version is not executable merely because its specification is approved. Only an exact run
activation binds it to inputs, cutoff, authority, environment, and budget. Ops owns approval,
supersession, and retirement.

### 10.2 Run state

```text
proposed
  -> activated
  -> active
  -> completed | blocked | cancelled | budget_exhausted | protocol_violation
  -> closed
```

Only Ops can activate or cancel a run. A run cannot change its job version, inputs, cutoff,
source envelope, authority, or budget in place.

### 10.3 Attempt state

```text
active_research
  -> submitted
  -> reviewed_pass | reviewed_rework | reviewed_blocked | reviewed_reject
  -> sealed
```

A cancelled, budget-exhausted, malformed, or protocol-violating attempt creates a terminal
submission manifest for the material that exists and is sealed with `review_verdict:
not_reached` when independent review did not occur.

### 10.4 Challenge

Before submission, the executor records a genuine adversarial search for:

- counterevidence;
- rival causal explanations;
- selection effects;
- duplicated or correlated evidence;
- contradictory governed artifacts;
- stale assumptions;
- market-context dependence;
- missing comparison coverage;
- identity ambiguity;
- cutoff leakage; and
- reasons the operator prior may still be correct.

A candidate claim without an applicable challenge record cannot enter the final packet.

### 10.5 Independent review

A fresh-context reviewer reads only the frozen job, activation, inputs, ledger, packet,
repository policy, and exact source objects available under the contract.

The reviewer gives two distinct verdicts:

1. **Substantive adequacy:** Were credible rivals, counterexamples, contradictions, population
   limitations, and missing evidence handled?
2. **Protocol compliance:** Is every claim traceable, admissible, in scope, current for the
   cutoff, correctly labeled, and consistent with the authority ceiling?

“Fresh context” means the reviewer is not continuing the executor's hidden conversational
state. It does not, by itself, prove provider, organizational, or epistemic independence. The
actual independence basis is recorded without overstatement.

The reviewer does not edit reviewed material. A new material objection ends that attempt as
`reviewed_rework` or `reviewed_reject`. A successor attempt performs any correction and receives
a new review.

A review PASS means the process and completion claim are trustworthy. It does not establish
that a football claim is universally true.

### 10.6 Cold resume

Before continuing an active attempt, a fresh executor must:

1. verify the exact activated job and Ops decision;
2. recompute the input-manifest and ledger-head hashes;
3. re-establish the current permitted action from the latest checkpoint;
4. verify that relevant source, artifact, cutoff, and rights state has not drifted;
5. verify remaining budgets and stop conditions; and
6. fail closed if current authority or currency cannot be established.

A checkpoint records the frontier question, evidence gaps, current ledger head, budgets,
blocked items, out-of-scope discoveries, and next permitted actions.

If a source or governed artifact changes, the old attempt remains historically valid for its
declared cutoff but is not represented as current. Material drift requires a new input manifest,
new run ID, and new Ops activation.

Any job, input, ledger-head, authority, or currency mismatch marks the checkpoint stale. A stale
checkpoint cannot be resumed or silently refreshed in place. Post-submission states are
recorded in `review.json` and `seal.json`, not appended to the already frozen ledger.

Cancellation or budget exhaustion records a terminal run event, preserves and seals partial
material, and makes the attempt non-promotable. A malformed or truncated ledger may identify
the last validated record for diagnosis, but missing content is never reconstructed by
inference and execution does not resume past the corruption.

## 11. Output classes and authority

Research may produce:

- an evidence inventory;
- a hypothesis comparison;
- a calculation record;
- a methodology note;
- a structured research packet;
- a negative or inconclusive result;
- a blocked-state explanation; and
- a follow-up proposal.

| Output class | Default visibility | Default authority |
|---|---|---|
| Ledger | Internal review | Non-promotable |
| Evidence inventory | Inherits the strictest included source classification | Non-promotable |
| Hypothesis comparison | Internal review | Non-promotable |
| Calculation record | Internal review; public only under a separate safe-output decision | Non-promotable |
| Methodology note | Internal review; may later be classified public-safe | Non-promotable |
| Structured research packet | Internal operator review | Exact claims may become eligible only through later Ops action |
| Negative, inconclusive, or blocked result | Internal operator review | Non-promotable unless a later decision names an exact claim |
| Follow-up proposal | Internal operator review | Proposal only; grants no authority |

Every output explicitly declares `public_safe`, `internal`, `private`, `non_promotable`, or
`later_review_only` treatment as applicable. The default is internal and non-promotable.

All outputs leave Research with downstream authority `none`.

### 11.1 Promotion handshake

Promotion is an Ops authority transition outside the sealed Research attempt.

A future Ops promotion decision identifies:

- exact sealed attempt hash;
- exact accepted claim IDs;
- target consumer or consumer class;
- permitted use;
- excluded interpretations;
- freshness window;
- revocation and supersession rules; and
- signed operator provenance.

A changed claim statement or scope receives a new claim ID and an explicit
`supersedes_claim_id`; an existing ID is never reused with changed semantics.

A Strategy consumer must pin both:

1. the sealed Research claim bundle; and
2. the effective Ops permission.

Merge is custody, not promotion. Review PASS is not promotion. A Strategy consumer retains its
own semantics and makes its own adoption decision.

Revocation or supersession creates a new immutable Ops record and never edits the prior
decision. If a consumer cannot establish the effective decision chain as of its own consumption
cutoff, use fails closed. Research may expose a regenerated, explicitly non-authoritative
decision index for discoverability, but that index is never the source of authority.

The initial narrow permission class should mean only that a future Strategy artifact may
evaluate and cite the named claim. It must not imply:

- universal football truth;
- an approved ranking;
- an automatic Board Geometry or Opportunity Cluster change;
- product advice;
- permission to merge, deploy, publish, or run Forecast; or
- applicability to another scoring, league, season, or market context.

### 11.2 Future Research-to-Strategy claim bundle

An eventual consumer interface may contain:

- claim ID;
- subject;
- claim type;
- statement;
- scope;
- evidence and counterevidence references;
- confidence rationale;
- freshness;
- limitations;
- sealed attempt hash; and
- effective Ops decision reference.

Board Geometry, Opportunity Clusters, and other Strategy concepts remain consumer semantics.
Research supplies reviewed claims; it does not implement those concepts.

## 12. Multi-agent and provider model

The v0 pilot uses:

- one declared executor with single-writer ledger authority;
- one fresh-context reviewer who cannot edit the candidate; and
- the operator as the sole authority for activation, amendment, cancellation, promotion, and
  revocation.

Provider and role are independent:

- Codex, Claude Code, a local model, or a future provider may fill an executor or reviewer role;
- every actor receives the same activated job and input pins;
- actor sessions and tool use are recorded;
- no actor may delegate authority it does not possess;
- provider cache, hidden reasoning, memory, or conversation state is never evidence;
- disagreements are retained as explicit records;
- synthesis cannot erase missing evidence; and
- one model agreeing with another is not empirical corroboration.

Self-declared provider, model, author, time, or tool fields are claims unless independently
captured by orchestration, connector, commit, or trusted environment metadata. The record
distinguishes declared metadata from mechanically observed metadata.

Parallel writers and automated multi-agent orchestration are deferred. A future design may use
per-event objects or a coordinated append protocol, but v0 does not pretend a shared JSONL file
is concurrency-safe.

## 13. #52 as the first pilot workload

[Ops #52](https://github.com/Prometheus-Frameworks/TIBER-Ops/issues/52) is a strong first
workload because it asks for evidence-backed challenges to a visible operator model and permits
players to move upstream, downstream, remain unchanged, or remain unresolved.

It is currently a research brief, not an executable job.

### 13.1 Required pilot inputs

Before activation, the pilot needs:

- a frozen body snapshot and hash of #52;
- a frozen body snapshot and hash of
  [Ops #51](https://github.com/Prometheus-Frameworks/TIBER-Ops/issues/51);
- a noncanonical, pilot-local `baseline_snapshot` expressing the operator's current clusters
  and tier boundaries;
- scoring, roster, draft, platform, season, and observation assumptions;
- canonical player identities for every named subject;
- an exact subject population;
- a permitted comparison population;
- a question-to-evidence capability map showing which questions are evaluable from the admitted
  envelope;
- a declared market snapshot contract;
- a cutoff;
- a verified governed-artifact input manifest;
- an admitted source envelope; and
- an exact signed Ops activation decision for the job hash.

All 30 named candidates require resolution. Names such as “Tate,” “Tyson,” “Meyers,” “Harvey,”
and “Higgins” are not sufficient machine identities. Each subject requires a canonical
TIBER/player ID or an explicit run-scoped identity mapping, plus full name, season, team,
position, and aliases. An agent may propose mappings for operator confirmation but must not
guess unresolved identities.

The **subject population** controls who may receive a finding or disposition. The
**comparison population** permits league baselines, cohorts, replacement levels, market
observations, and comparator players to support relational analysis. A comparator does not
silently become a new research subject.

### 13.2 Market snapshot contract

“Mispriced” and “market value” are undefined without:

- platform or market;
- league, roster, and scoring format;
- redraft, dynasty, best-ball, mock, or managed-league context;
- observation date and window;
- aggregation method;
- sample size;
- known selection bias;
- retained observations or a declared non-retention limitation; and
- freshness.

A market-inefficiency claim must be `null` when no context-matched, admitted market snapshot
exists.

### 13.3 Current source-governance gate

The corrected Research Observatory source-policy candidate recorded through
[Ops #24](https://github.com/Prometheus-Frameworks/TIBER-Ops/issues/24) is merged but not
adopted. Its corrected candidate source set is empty. Public availability, a loader, a URL, or
technical access is not source admission.

Therefore the #52 job must use one exact, approved envelope:

1. governed TIBER artifacts whose identity, governance, freshness, and question-specific
   fitness are verified;
2. a specifically approved operator-provided source packet with explicit rights, retention,
   cutoff, privacy, and reportability treatment; or
3. a separately approved pilot source envelope.

Unrestricted browsing is not a fallback. Without an admitted market snapshot, market questions
end blocked or inconclusive while role/opportunity questions may proceed only where admitted
evidence is sufficient.

If the capability map shows that no #52 claim can traverse admitted evidence, counterevidence,
structured synthesis, fresh-context review, and sealing, the job is not activated. A blocked
architecture smoke test can validate one fail-closed path, but it cannot alone establish
end-to-end pilot readiness.

Because #52 is preseason work, it evaluates the current evidentiary support for forward-looking
opportunity hypotheses. It does not validate future volume or performance as observed fact.
“Supported” means current admitted evidence is directionally consistent within the declared
scope, assumptions, and cutoff.

### 13.4 Question and disposition axes

The run and each question record separate dimensions:

- **process terminal:** `completed`, `blocked`, `cancelled`, `budget_exhausted`, or
  `protocol_violation`;
- **completion:** `answered`, `inconclusive`, or `blocked`;
- **assessment:** `supported`, `partly_supported`, `weakened`, `contradicted`, or
  `insufficient`;
- **baseline disposition:** `upstream`, `downstream`, `unchanged`, or `null`; and
- **review verdict:** `pass`, `rework_required`, `reject`, or `not_reached`;
- **authority state:** always `unpromoted` inside Research; and
- **blocker reason:** for example `missing_evidence`, `inadmissible_source`,
  `identity_unresolved`, `cutoff_failure`, or `comparison_coverage_missing`.

These states must not be collapsed into one enum.

### 13.5 Minimum per-subject output

- subject identity;
- baseline position;
- falsifiable hypothesis;
- observed evidence;
- calculated evidence;
- counterevidence and rival explanations;
- comparison-population references;
- missing or inadmissible evidence;
- assessment;
- proposed baseline disposition;
- confidence band and rationale;
- market-inefficiency claim or `null`;
- market-snapshot reference or `null`;
- freshness; and
- limitations.

The packet may compare subjects against the frozen baseline. It must not create a general
ranking, draft plan, lineup decision, waiver claim, trade recommendation, or product behavior.

### 13.6 Pilot acceptance

The architecture pilot succeeds when:

- the exact job, activation, baseline, subjects, comparisons, inputs, and cutoff are hashable;
- at least one claim completes the admitted-evidence, challenge, packet, review, and seal path;
- every claim resolves to admitted evidence, calculations, and applicable challenge records;
- unsupported questions fail closed;
- a market claim cannot exist without a matching market snapshot;
- the ledger passes the cold-resume test;
- a fresh-context reviewer can reproduce the traceability audit;
- rework produces a successor attempt;
- every terminal attempt is sealed;
- the packet grants no downstream authority; and
- no source, Strategy, Forecast, Harness, Ops, or product artifact is modified by the run.

The content of the football conclusion is not the acceptance test, but exercising only a
pre-execution block is not a complete end-to-end pilot.

## 14. Optional weekly invocation worked example

A future weekly waiver-research task would instantiate the same job protocol; it would not
redefine Researcher.

In this example only, Codex fills the executor role. Replacing Codex with another provider does
not change the contract, evidence, review, or authority boundaries.

1. A scheduler observes that a declared NFL week has completed.
2. It proposes a run using an idempotency key such as
   `<season>:<week>:<job_version>:<input_digest>`.
3. A duplicate key is a no-op; it does not create a second run.
4. The run begins only if the exact activation and source envelope permit that invocation.
5. The job template declares a freshness window; an expired or unverifiable input snapshot
   blocks the run.
6. The executor researches the bounded available-player population using the frozen inputs.
7. “No meaningful change” produces a valid, explicit negative result rather than invented
   findings.
8. A missed run is recorded. It may run later only from the original approved cutoff snapshot;
   it is not silently backfilled with evidence published after that cutoff.
9. Fresh-context review and terminal sealing remain mandatory.
10. The operator reviews any later consumer proposal before a waiver, lineup, publication, or
   product action.

The scheduler owns timing only. Research owns research custody. Ops owns authority. The
consumer owns any later action. No scheduler is required for the one-time #52 pilot or for the
Researcher abstraction to be coherent.

This example does not authorize a schedule, private roster connection, weekly workflow, or
waiver action.

## 15. Threat and failure analysis

| Threat or failure | Required control |
|---|---|
| Scope creep during research | Activated job hash, closed subjects, explicit comparison population, operator-owned amendments |
| Authority escalation | Job authority ceiling, tool allowlist, exact activation receipt, fail-closed mismatch |
| Declared permissions exceed effective sandbox | Environment capabilities must be a subset of the activated envelope; mismatch is a protocol violation |
| Executor writes to authority, source, validator, or consumer state | Sole attempt write path and run-event path; all other repositories and control files read-only |
| Mutable authority reference changes | Exact decision-body snapshot, digest, permalink, and activation receipt |
| Duplicate run activation | Stable run ID and idempotency key; duplicate is rejected or linked without executing |
| Stale artifact used as current | Verify-then-freeze preflight, question-specific currency, resume-time drift check |
| Cutoff leakage | Source availability/retrieval/revision fields and rejection of post-cutoff material |
| Public access mistaken for permitted use | Exact source envelope, rights/retention classification, no browsing fallback |
| Source origin launders inadmissible material | Origin and admissibility remain separate; exact intended use and rights decision required |
| Issue body edited after activation | Retained body snapshot and digest |
| Ambiguous player identity | Canonical IDs or explicit run-scoped mapping before evidence collection |
| Closed subjects prevent relational analysis | Separate permitted comparison population |
| Comparator silently becomes a subject | Validator rejects findings for identities outside subject population |
| Operator prior supports itself | Baseline classified as hypothesis; empirical use requires a separate admitted observation packet |
| Model prose treated as evidence | Explicit source and epistemic classes; model interpretation cannot cite itself |
| Prompt injection in evidence | Source text treated as inert data; tools and authority come only from the job |
| Correlated evidence double-counted | Challenge record identifies shared lineage and duplicated sources |
| Persuasive narrative hides missing support | Structured packet, claim-to-evidence validation, negative and missing evidence preserved |
| Synthesis erases agent disagreement | Disagreements remain first-class records and must be represented in packet limitations |
| Executor self-confirms | Fresh-context review of frozen bytes with separate substantive and protocol verdicts |
| Reviewer changes reviewed material | Review is append-external to frozen candidate; rework creates a successor attempt |
| Candidate moves during review | Reviewer binds to immutable `submission_digest`; mismatch stops review |
| Concurrent ledger corruption | Single-writer v0, monotonic sequence, previous-event hash |
| Crash or truncated ledger | Validate to last complete event, block the attempt, preserve bytes, and never infer missing records |
| Ledger or packet edited after review | Terminal seal and mutation-invalidating validation |
| Markdown diverges from structured result | Deterministic JSON-to-Markdown renderer; JSON remains authoritative |
| Validator is skipped or fails | Submission, review PASS, and sealing fail closed without recorded successful validation |
| Promotion mutates archive | Promotion remains an Ops decision outside the sealed attempt |
| Merge mistaken for acceptance | Explicit custody-versus-authority rule |
| Revoked permission remains in use | Consumer resolves the effective immutable Ops decision chain at its consumption cutoff |
| Old result represented as current | Declared cutoff, freshness window, effective Ops decision, supersession records |
| Private context leaks into public claim | Private context denied for #52; future separate access, retention, redaction, and reportability policy |
| Hash leaks low-entropy private data | Private material and derived hashes are prohibited from the public v0 repository |
| Retention limits conflict with replay claim | Explicit `full_replay` versus `lineage_only`; non-replayable evidence is non-promotable in v0 |
| Budget exhaustion presented as completion | Separate blocked/incomplete terminal and recorded remaining evidence gaps |
| Provider or author metadata is spoofed | Separate self-declared fields from trusted orchestration, connector, commit, or environment observations |
| Git history is rewritten or object disappears | Exact hashes, remote commit identities, terminal seal, and declared retention/recoverability limitations |
| Source later requires deletion | Future rights-aware tombstone/redaction process; no false promise of permanent replayability |

## 16. Minimum deterministic controls for a future implementation

The architecture requires a small Research-local validator, deterministic packet renderer, and
sealing command before the first real pilot. They are requirements for a later implementation,
not code authorized by this report.

Minimum tests are:

1. mutation of activated job bytes fails;
2. an activation-receipt mismatch fails;
3. effective capabilities broader than the activation envelope fail;
4. missing or unpinned inputs fail;
5. silent subject additions fail;
6. a finding for a comparison-only identity fails;
7. an unadmitted source fails;
8. ledger sequence, previous-event hash, and frozen-prefix tampering fail;
9. canonicalization and submission digests bind every source object and the exact rendered
   packet;
10. every packet claim resolves to admitted evidence and a challenge record;
11. a market claim without a matching market snapshot fails;
12. post-cutoff or temporally unresolved evidence fails according to the job policy;
13. a review must pin a distinct frozen submission and state its independence basis;
14. rework cannot overwrite a prior attempt;
15. changed inputs or cutoff cannot masquerade as attempt rework;
16. any post-seal mutation invalidates the seal;
17. a later Ops promotion does not alter the sealed attempt;
18. `packet.md` regenerates byte-for-byte from `packet.json`;
19. prohibited private content or a derived low-entropy hash fails before commit;
20. a fresh executor can recover the ledger head, current state, open questions, blockers,
    budgets, and next permitted actions; and
21. a blocked attempt can pass fail-closed validation but cannot by itself satisfy end-to-end
    pilot acceptance.

The pilot guarantees integrity, traceability, resumability, and reproducible calculations where
declared. It does not claim that a model's intellectual synthesis is deterministic.

## 17. Staged evolution

### Current stage — architecture only

Land or reject this design report under #6. No repository or runtime is created.

### Stage 0 — separately authorized Research scaffold

Create TIBER-Research with:

- schemas;
- canonical hashing rules;
- validator;
- deterministic renderer;
- sealing mechanism; and
- one synthetic, non-football-authoritative fixture.

No provider calls, source acquisition, schedule, private context, or live research.

### Stage 1 — separately activated manual #52 pilot

After the baseline, identities, comparison population, capability map, input manifest, source
envelope, and exact job contract are approved, one executor performs one bounded run and one
fresh-context reviewer audits each submitted attempt. No promotion or consumer integration.

### Stage 2 — optional Harness conformance support

Harness may later test synthetic Research contracts for:

- schema conformance;
- authority leakage;
- subject/population violations;
- source-reference completeness;
- claim/evidence traceability;
- archive integrity; and
- provider/tool metadata.

This requires its own approval and must not weaken existing promotion or fantasy-contamination
validators.

### Stage 3 — optional Strategy consumption

Only after a sealed pilot and separate Ops decision may a Strategy consumer evaluate a generic
claim bundle. Research does not implement Board Geometry, Opportunity Clusters, or another
consumer concept.

### Stage 4 — optional recurrence

Only after manual runs establish an operational baseline may a separate proposal consider
idempotent scheduling, missed-run handling, no-change behavior, cost ceilings, and unattended
invocation. A positive pilot result does not authorize this stage.

## 18. Explicit exclusions

This design and the first pilot exclude:

- conducting #52 player research during architecture work;
- creating TIBER-Research under #6 authority;
- adding unresolved players to #52;
- unrestricted web research or corpus acquisition;
- a recurring campaign factory or scheduler;
- provider routing implementation;
- a permanent agent session;
- parallel or autonomous multi-agent orchestration;
- private Sleeper league, roster, or user access;
- hidden reasoning or provider memory as research state;
- Board Geometry or Opportunity Cluster implementation;
- a Strategy repository or product surface;
- rankings, lineup, waiver, trade, or draft-action automation;
- Forecast runs or model changes;
- automatic promotion, merge, deployment, or publication;
- a database, vector store, knowledge graph, or Research UI;
- organization-wide policy enforcement; and
- modification of Ops, source, Strategy, Forecast, Fantasy, or another domain repository by a
  Research run.

## 19. Immediate gates

Before any #52 evidence collection begins:

1. this design must receive review and a separate operator disposition;
2. repository creation and Stage 0 must receive separate authority;
3. the validator, renderer, seal mechanism, and synthetic fixture must pass;
4. #51 and #52 must be snapshotted and hashed;
5. the pilot-local baseline must be frozen;
6. every subject identity must be resolved;
7. the comparison population must be declared;
8. the question-to-evidence capability map must prove at least one evaluable claim path;
9. the scoring, draft, market, season, and cutoff context must be frozen;
10. the admitted source envelope and retention modes must be approved;
11. the input manifest must pass freshness and admissibility preflight;
12. effective environment capabilities must be no broader than the proposed activation; and
13. Ops must activate the exact job, input, cutoff, authority, and budget digests as one run.

No player investigation begins before those gates exist.

## 20. Final placement recommendation

The minimum honest architecture is a separate, file-backed TIBER-Research repository for
research custody and sealed candidate football claims; TIBER-Ops as the sole authority owner;
provider-neutral agents as bounded executor and reviewer roles; TIBER-Harness as an optional
future synthetic conformance evaluator; and Strategy as a pull-based consumer of exact claims
that also carry an effective Ops permission.

```text
researcher_requires_separate_repository
```

This terminal decision authorizes no implementation, repository creation, follow-up issue,
research run, source use, schedule, promotion, or consumer action.

## References

- [TIBER-Harness README](https://github.com/Prometheus-Frameworks/TIBER-Harness/blob/main/README.md)
- [TIBER-Harness #5](https://github.com/Prometheus-Frameworks/TIBER-Harness/issues/5)
- [TIBER-Harness #6](https://github.com/Prometheus-Frameworks/TIBER-Harness/issues/6)
- [TIBER-Ops #20](https://github.com/Prometheus-Frameworks/TIBER-Ops/issues/20)
- [TIBER-Ops #22](https://github.com/Prometheus-Frameworks/TIBER-Ops/issues/22)
- [TIBER-Ops #24](https://github.com/Prometheus-Frameworks/TIBER-Ops/issues/24)
- [TIBER-Ops #51](https://github.com/Prometheus-Frameworks/TIBER-Ops/issues/51)
- [TIBER-Ops #52](https://github.com/Prometheus-Frameworks/TIBER-Ops/issues/52)
