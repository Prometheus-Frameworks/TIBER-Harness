/**
 * Provider registry. Resolves a provider by name. The MockProvider is always
 * registered. Remote/network providers are intentionally NOT registered here:
 * they are future follow-ups (see docs/PROVIDER_BOUNDARY.md) and must only ever
 * be constructed when their credential is present in a local/operator
 * environment. CI runs entirely on the mock and requires no keys.
 */

import type { ModelProvider } from './types.ts';
import { MockProvider } from '../providers/MockProvider.ts';

const registry = new Map<string, ModelProvider>();

export function registerProvider(provider: ModelProvider): void {
  registry.set(provider.name, provider);
}

export function getProvider(name: string): ModelProvider {
  const provider = registry.get(name);
  if (!provider) {
    throw new Error(
      `Unknown provider "${name}". Registered: ${[...registry.keys()].join(', ') || '(none)'}`,
    );
  }
  return provider;
}

export function listProviders(): string[] {
  return [...registry.keys()];
}

/**
 * Guard used by the CI path: refuses to run a network provider unless it has
 * been explicitly opted into. Keeps "no remote provider calls in CI" honest.
 */
export function assertCiSafe(provider: ModelProvider): void {
  if (provider.requiresNetwork && process.env.TIBER_HARNESS_ALLOW_NETWORK !== '1') {
    throw new Error(
      `Provider "${provider.name}" requires network access and is not permitted in the default (CI-safe) path. ` +
        'Set TIBER_HARNESS_ALLOW_NETWORK=1 to opt in locally.',
    );
  }
}

// The mock is the only provider wired up by default.
registerProvider(new MockProvider());
