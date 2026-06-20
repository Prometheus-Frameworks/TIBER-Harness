/**
 * MockProvider — deterministic, offline, CI-safe.
 *
 * It performs no network calls and contains no model. Each fixture carries the
 * exact raw string the model would have returned (`mockResponse`), and the
 * provider simply echoes it back keyed by `fixtureId`. This lets the eval suite
 * exercise the full validation pipeline — including deliberately malformed and
 * adversarial outputs — with zero providers, keys, or flakiness.
 */

import type { ModelProvider, ProviderRequest, ProviderResponse } from '../core/types.ts';

export class MockProvider implements ModelProvider {
  readonly name = 'mock';
  readonly requiresNetwork = false;

  /** fixtureId -> canned raw response, registered by the eval runner. */
  private readonly responses = new Map<string, string>();

  /** Register the canned output for a fixture before running it. */
  register(fixtureId: string, raw: string): void {
    this.responses.set(fixtureId, raw);
  }

  async complete(request: ProviderRequest): Promise<ProviderResponse> {
    const id = request.fixtureId;
    if (id === undefined || !this.responses.has(id)) {
      throw new Error(
        `MockProvider has no canned response for fixture "${id ?? '(none)'}" (skill "${request.skill}").`,
      );
    }
    return { raw: this.responses.get(id) as string };
  }
}
