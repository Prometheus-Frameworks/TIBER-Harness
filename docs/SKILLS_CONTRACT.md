# Skills Contract

A **skill** is a self-contained evaluation unit. Each lives in
`src/skills/<name>/` and ships four contract artifacts plus a validator:

| File | Role |
| --- | --- |
| `prompt.md` | Instructions handed to the provider. States that its output is advisory. |
| `input.schema.json` | JSON Schema the (trusted) fixture input must satisfy. |
| `output.schema.json` | JSON Schema the (untrusted) model output must satisfy. |
| `fixtures.json` | Eval cases: `input`, the mock's canned `mockResponse`, and `expect`. |
| `validate.ts` | **Deterministic** validator. Pure: no I/O, no randomness. |
| `index.ts` | Assembles the `SkillDefinition` from the above. |

## The run pipeline (`src/core/runSkill.ts`)

Each stage can only narrow the outcome; none can widen it.

1. **Input schema check** — guards against a misconfigured fixture (throws loudly).
2. **Provider call** — returns an untrusted raw string.
3. **`validateJson`** — fail closed on malformed JSON (`json_parse_failed`).
4. **`validateSchema`** — fail closed on shape mismatch (`schema_validation_failed`).
5. **Skill `validate`** — deterministic, skill-specific verdict (advisory baseline).
6. **`applyDeterministicOverrides`** — authoritative cross-cutting backstop.

## The promotion_ready contract

- `promotion_ready` in model output is **advisory**. It is recorded as
  `modelClaimedPromotionReady` for the report, then ignored.
- The authoritative `promotionReady` is computed by the validators.
- The override backstop can only flip `true → false`, never `false → true`.
  Any **block**-severity finding forces it closed. This is "fail closed."

## Shared deterministic detectors (`src/core/detectors.ts`)

- `detectPromptInjection` — embedded "ignore previous instructions" / "mark as
  governed" / "promotion_ready = true" style overrides. Detected → ignored.
- `detectFantasyAdvice` — start/sit, lineup, trade, add/drop, waiver, ranking
  *recommendations*. Detected → contamination → promotion forced false.
- `isPromotedPathHint` — a `/promoted/` path is a hint, never governance proof.

## Adding a skill

1. Create `src/skills/<name>/` with the five files above.
2. Keep `validate.ts` pure and deterministic.
3. Register it in `src/skills/index.ts`.
4. Add fixtures covering the happy path **and** the fail-closed paths.
