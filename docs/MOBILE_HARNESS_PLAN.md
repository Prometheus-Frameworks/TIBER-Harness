# Mobile / Local Harness Plan (Draft)

> Status: **placeholder / future follow-up.** Nothing here is implemented in the
> initial scaffold. This document records intent so the contract can stabilize
> first.

## Goal

Run the same skill contracts and deterministic validators against models that
execute **locally or on-device** — so a model can be evaluated for safe TIBER
operation without any remote calls.

## Why it waits

The validation contract (`runSkill` pipeline, schemas, detectors, override
backstop) must stabilize before we optimize for a constrained runtime. The
deterministic layers are intentionally dependency-light and pure, which already
makes them portable; the open questions are about *providers*, not validators.

## Sketch

1. **Local providers first.** Land `OllamaProvider` and an OpenAI-compatible
   local provider (e.g. `llama.cpp` server) behind the existing `ModelProvider`
   interface. Same `requiresNetwork` gating; loopback is still "network."
2. **Bundle the contracts.** Ship `prompt.md` + schemas + validators as a
   portable bundle the runtime reads at startup.
3. **On-device report sink.** Reuse `writeReport` against a local path; no upload.
4. **Resource envelope.** Document memory/latency expectations per model class.

## Non-goals (unchanged from the harness as a whole)

- No production integration, no artifact promotion, no fantasy scoring or advice.
- No remote provider calls in CI.
- No dependency from TIBER-Fantasy on TIBER-Harness.
