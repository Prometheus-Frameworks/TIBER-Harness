# Local Ollama Provider (opt-in)

`OllamaProvider` lets TIBER-Harness run the **existing** skill fixtures against
any model installed in a locally running [Ollama](https://ollama.com) server. It
is the first proof that the harness is provider-agnostic beyond `MockProvider`,
and the first local-model stress-test path.

> **Core principle: model output is advisory. Validators are authoritative.**
> The local model only *proposes* output. `validateJson` → `validateSchema` →
> the skill validators → `applyDeterministicOverrides` decide every verdict,
> exactly as on the mock path.

## What it is — and is not

- It is an **opt-in, local-only** runner (`npm run eval:ollama`). It is **never**
  used in CI.
- It **pulls/installs nothing**. The model must already be installed locally.
- It carries **no API keys**. The only configuration is a host and a model name.
- It does **not** parse or trust the model's output inside the provider. The
  provider returns `response.message.content` verbatim as untrusted raw text.

`npm test` / CI are completely unaffected: they still run `MockProvider` only,
offline, with no keys and no network.

## Requirements

1. [Ollama](https://ollama.com) installed and running locally (`ollama serve`).
2. A model already installed, e.g. `ollama pull llama3.1` (run manually — the
   harness will not do this for you).

## Configuration (environment)

| Variable                     | Required | Default                     | Purpose                                                            |
| ---------------------------- | -------- | --------------------------- | ------------------------------------------------------------------ |
| `TIBER_HARNESS_ALLOW_NETWORK`| **yes**  | _(unset)_                   | Must be `1`. Loopback HTTP is still a network call; this is the opt-in. |
| `OLLAMA_MODEL`               | **yes**  | _(none)_                    | Name of an already-installed local model.                          |
| `OLLAMA_HOST`                | no       | `http://127.0.0.1:11434`    | Base URL of the Ollama server.                                     |

The runner fails clearly (non-zero exit) if the network opt-in is missing, if
`OLLAMA_MODEL` is empty, or if Ollama is unreachable.

## Running

```bash
# With Ollama running and a model installed:
TIBER_HARNESS_ALLOW_NETWORK=1 OLLAMA_MODEL=llama3.1 npm run eval:ollama
```

The runner POSTs each fixture to `${OLLAMA_HOST}/api/chat` with:

```jsonc
{
  "model":    "<OLLAMA_MODEL>",
  "messages": [
    { "role": "system", "content": "<the skill's prompt contract>" },
    { "role": "user",   "content": "<the serialized fixture input>" }
  ],
  "format":   "json",
  "stream":   false
}
```

It then runs the model's raw output through the standard pipeline and writes a
report to `data/reports/latest.{md,json}` (gitignored), tagged with the provider
name (`ollama`) and the model name.

## Reading the report

Each fixture's `expect` block is calibrated against the `MockProvider`'s canned
response. A live model legitimately diverges from it, so the Ollama runner treats
the comparison as **informational**, not a pass/fail gate:

- `BASE` — the live run matched the MockProvider baseline.
- `DIFF` — the live run diverged (the divergence lines show how).

The runner exits non-zero **only** on operational failures (no opt-in, no model,
Ollama unreachable, malformed Ollama envelope), never on baseline divergence.

## Guarantees that still hold with a local model

The deterministic backstops are model-independent, so they hold no matter what
the local model returns:

- Invalid JSON from the model still **fails closed**.
- Schema mismatch still **fails closed**.
- Fantasy-advice contamination still forces `promotion_ready = false`.
- A `/promoted/` path is still never treated as governance proof.
- Prompt injection inside artifact content is still detected and ignored.

## Boundary notes

- `OllamaProvider` is **not** registered in `src/core/providerRegistry.ts`; the
  registry stays `MockProvider`-only. The Ollama runner constructs the provider
  directly, behind the network opt-in.
- `requiresNetwork = true`, so `assertCiSafe` refuses to run it unless
  `TIBER_HARNESS_ALLOW_NETWORK=1` is explicitly set.
- See [`PROVIDER_BOUNDARY.md`](PROVIDER_BOUNDARY.md) for the full provider
  contract.
