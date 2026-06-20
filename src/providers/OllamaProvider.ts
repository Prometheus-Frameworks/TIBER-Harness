/**
 * OllamaProvider — opt-in, local-only model provider.
 *
 * Calls a locally running Ollama server's `/api/chat` endpoint so the harness
 * can stress-test the existing TIBER skill contracts against any installed local
 * model. It is NEVER wired into CI: it sets `requiresNetwork = true` (loopback
 * HTTP is still a network call), so `assertCiSafe` gates it behind
 * `TIBER_HARNESS_ALLOW_NETWORK=1`.
 *
 * Boundary discipline (see docs/PROVIDER_BOUNDARY.md):
 *   - The provider returns `response.message.content` verbatim as the raw,
 *     UNTRUSTED model output. It does not parse it, trust it, or inspect it for
 *     a verdict. validateJson → validateSchema → skill.validate →
 *     applyDeterministicOverrides decide everything.
 *   - It pulls/installs nothing. The model must already be present locally.
 *   - It carries no API keys; the only config is host + model name.
 */

import type { ModelProvider, ProviderRequest, ProviderResponse } from '../core/types.ts';

export interface OllamaProviderConfig {
  /** Base URL of the Ollama server, e.g. http://127.0.0.1:11434. */
  host: string;
  /** Name of an already-installed local model (this provider never pulls). */
  model: string;
}

/** Shape of the bits of the `/api/chat` (stream:false) response we read. */
interface OllamaChatResponse {
  message?: { content?: unknown };
}

export class OllamaProvider implements ModelProvider {
  readonly name = 'ollama';
  readonly requiresNetwork = true;
  /** Surfaced in reports alongside the provider name. */
  readonly model: string;

  private readonly host: string;

  constructor(config: OllamaProviderConfig) {
    // Trim trailing slashes so `${host}/api/chat` is well-formed.
    this.host = config.host.replace(/\/+$/, '');
    this.model = config.model;
  }

  async complete(request: ProviderRequest): Promise<ProviderResponse> {
    const url = `${this.host}/api/chat`;
    const body = {
      model: this.model,
      messages: [
        // System: the skill's own prompt contract.
        { role: 'system', content: request.prompt },
        // User: the serialized fixture input, untouched.
        { role: 'user', content: serializeInput(request.input) },
      ],
      // Ask Ollama to constrain output to JSON; the JSON gate still verifies it.
      format: 'json',
      stream: false,
    };

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (err) {
      // Connection refused / DNS / timeout — Ollama is not reachable.
      throw new Error(
        `OllamaProvider could not reach Ollama at ${url}: ${(err as Error).message}. ` +
          'Is `ollama serve` running and is OLLAMA_HOST correct?',
      );
    }

    if (!response.ok) {
      const detail = await safeText(response);
      throw new Error(
        `Ollama returned HTTP ${response.status} ${response.statusText} for model "${this.model}"` +
          `${detail ? `: ${detail}` : ''}. ` +
          'Confirm the model is installed locally (e.g. `ollama list`).',
      );
    }

    let data: OllamaChatResponse;
    try {
      data = (await response.json()) as OllamaChatResponse;
    } catch (err) {
      throw new Error(
        `Ollama returned a non-JSON envelope from ${url}: ${(err as Error).message}.`,
      );
    }

    const content = data?.message?.content;
    if (typeof content !== 'string') {
      // This is a transport/protocol failure (the envelope is malformed), not a
      // model-content question, so we surface it rather than feed junk forward.
      throw new Error(
        `Ollama response from ${url} had no string message.content for model "${this.model}".`,
      );
    }

    // Raw, untrusted model text — exactly as returned. Not parsed here.
    return { raw: content };
  }
}

/** Serialize the trusted fixture input as the user turn. */
function serializeInput(input: unknown): string {
  return JSON.stringify(input, null, 2);
}

/** Best-effort body read for error context; never throws. */
async function safeText(response: Response): Promise<string> {
  try {
    return (await response.text()).slice(0, 500);
  } catch {
    return '';
  }
}
