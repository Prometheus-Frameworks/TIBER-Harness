# TIBER-Harness

Model-agnostic **runtime and evaluation harness** for testing AI providers
against TIBER contracts, skills, fixtures, schemas, and deterministic safety
validators.

> **Core principle: model output is advisory. Validators are authoritative.**

## What this repo is — and is not

TIBER-Harness is **not a product surface**. It is **not TIBER-Fantasy**. It is an
external evaluation/runtime layer whose only job is to test whether a model can
**safely operate inside TIBER's contract-first ecosystem**.

**It is:**

- A provider-agnostic way to run a model against TIBER-shaped skills.
- A set of **deterministic** validators that decide outcomes — not the model.
- A fail-closed pipeline: bad JSON, bad shape, prompt injection, and fantasy
  contamination all force `promotion_ready = false`.

**It is not, and must never become:**

- A production integration with any TIBER repo.
- An artifact promoter. Nothing here promotes anything for real.
- A fantasy engine. **No** lineup, start/sit, trade, add/drop, waiver, ranking,
  scoring, or recommendation logic. Those are *contamination* and are detected
  and rejected.
- A consumer of secrets. CI requires **no** API keys and makes **no** remote
  model calls. TIBER-Fantasy does **not** depend on TIBER-Harness.

## Quick start

```bash
npm install
npm test        # runs all skill fixtures through MockProvider (offline, no keys)
npm run typecheck
```

`npm test` runs every fixture in `src/skills/*/fixtures.json` through the
`MockProvider`, applies the full validation pipeline, asserts each fixture's
declared expectations, and writes a report to `data/reports/latest.md` and
`data/reports/latest.json`. It exits non-zero if any expectation fails.

## How a run works

```
provider → validateJson → validateSchema → skill.validate → applyDeterministicOverrides
 (raw)      fail closed     fail closed       advisory          AUTHORITATIVE (can only
                                              baseline           flip true → false)
```

The model's own `promotion_ready` is recorded as advisory and then ignored. The
authoritative decision is computed by the deterministic layers. See
[`docs/SKILLS_CONTRACT.md`](docs/SKILLS_CONTRACT.md).

## Layout

```
src/
  core/        runSkill, validateJson, validateSchema,
               applyDeterministicOverrides, detectors, providerRegistry, types
  providers/   MockProvider (CI-safe, offline)
  skills/
    artifactAuditor/      governance / promotion auditing + /promoted/ + injection
    safetyContamination/  fantasy-advice contamination detection
  reports/     writeReport (local JSON + Markdown)
  runEvals.ts  the `npm test` entrypoint
fixtures/      sample TIBER-shaped artifacts (teamstate, fantasy, rookies, forge)
data/reports/  local report output (gitignored)
docs/          PROVIDER_BOUNDARY, SKILLS_CONTRACT, MOBILE_HARNESS_PLAN
```

## Skills in this scaffold

- **`artifact_auditor`** — audits a data artifact for promotion eligibility.
  Enforces that a `/promoted/` path is only a *hint* (never governance proof) and
  that instructions embedded in artifact content are treated as data, not obeyed.
- **`safety_contamination`** — audits a candidate response for fantasy advice.
  Any start/sit, lineup, trade, add/drop, waiver, or ranking recommendation
  forces `promotion_ready = false`, regardless of what the model claimed.

## Safety guarantees (verified by `npm test`)

- Invalid JSON fails closed.
- Schema mismatch fails closed.
- `/promoted/` paths are never treated as governance proof.
- Prompt injection inside artifact content is detected and ignored.
- Fantasy-advice contamination forces `promotion_ready = false`.
- `promotion_ready` is computed/overridden by deterministic validator logic.
- CI needs no `COHERE_API_KEY` or any remote provider.

## Providers & the boundary

Only `MockProvider` is wired up. Remote/local providers (Cohere, Ollama,
llama.cpp / OpenAI-compatible) are **future follow-ups**, each gated behind its
own credential and never used in CI. See
[`docs/PROVIDER_BOUNDARY.md`](docs/PROVIDER_BOUNDARY.md).

## License

MIT.
