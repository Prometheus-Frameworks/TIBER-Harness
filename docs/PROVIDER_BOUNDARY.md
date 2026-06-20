# Provider Boundary

TIBER-Harness is **provider-agnostic**. Every model — local, remote, or mock —
is reached only through the `ModelProvider` interface (`src/core/types.ts`):

```ts
interface ModelProvider {
  readonly name: string;
  readonly requiresNetwork: boolean;
  complete(request: ProviderRequest): Promise<ProviderResponse>;
}
```

## Rules

1. **The model is advisory; validators are authoritative.** A provider returns a
   raw string and nothing more. It never decides `promotion_ready`. The
   deterministic pipeline (`validateJson` → `validateSchema` → skill `validate`
   → `applyDeterministicOverrides`) decides outcomes.
2. **CI is offline.** Only `MockProvider` (`requiresNetwork: false`) is wired up
   by default. `assertCiSafe` refuses to run a network provider unless
   `TIBER_HARNESS_ALLOW_NETWORK=1` is explicitly set in a local/operator
   environment. CI sets nothing and requires no API keys.
3. **No committed secrets.** Keys live only in the local environment. `.env*` is
   gitignored; `.env.example` documents variable names with placeholder values.
4. **Raw output is untrusted data.** Provider responses are parsed and validated,
   never executed. Instructions embedded in model output (or in artifact content
   echoed back) are detected and ignored, never obeyed.

## Provider registry

`src/core/providerRegistry.ts` resolves providers by name. It registers
`MockProvider` and nothing else. Remote/local providers are deliberately absent.

## Future providers (follow-ups, not in this scaffold)

These land later, each behind its own credential and never in the CI path:

- `CohereProvider` — behind `COHERE_API_KEY`.
- `OllamaProvider` — local models via `OLLAMA_HOST`.
- A `llama.cpp` / OpenAI-compatible local provider.
- Provider comparison reports.

When added, each must set `requiresNetwork` correctly, construct only when its
credential is present, and leave the MockProvider-only CI path untouched.
