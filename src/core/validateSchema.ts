/**
 * Minimal, dependency-free JSON Schema validator.
 *
 * Why hand-rolled instead of a library: the harness contract is that
 * validation is *deterministic and self-contained*. A small, audited subset we
 * fully control beats an opaque transitive dependency for a safety boundary
 * that must fail closed. Supports the subset the skill schemas actually use:
 * type (incl. unions), properties, required, additionalProperties, items,
 * enum, const, min/maxLength, minimum/maximum, min/maxItems, pattern.
 */

import type { JsonSchema } from './types.ts';

export interface SchemaValidationResult {
  valid: boolean;
  errors: string[];
}

function typeOf(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function matchesType(value: unknown, type: string): boolean {
  switch (type) {
    case 'integer':
      return typeof value === 'number' && Number.isInteger(value);
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'array':
      return Array.isArray(value);
    case 'null':
      return value === null;
    case 'object':
      return typeOf(value) === 'object';
    default:
      return typeOf(value) === type;
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function validateNode(
  value: unknown,
  schema: JsonSchema,
  path: string,
  errors: string[],
): void {
  // type (string or union)
  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((t) => matchesType(value, t))) {
      errors.push(`${path}: expected type ${types.join('|')}, got ${typeOf(value)}`);
      return; // further checks are meaningless once the base type is wrong
    }
  }

  if (schema.const !== undefined && !deepEqual(value, schema.const)) {
    errors.push(`${path}: must equal const ${JSON.stringify(schema.const)}`);
  }

  if (schema.enum !== undefined && !schema.enum.some((e) => deepEqual(e, value))) {
    errors.push(`${path}: must be one of ${JSON.stringify(schema.enum)}`);
  }

  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(`${path}: shorter than minLength ${schema.minLength}`);
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      errors.push(`${path}: longer than maxLength ${schema.maxLength}`);
    }
    if (schema.pattern !== undefined && !new RegExp(schema.pattern).test(value)) {
      errors.push(`${path}: does not match pattern ${schema.pattern}`);
    }
  }

  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push(`${path}: below minimum ${schema.minimum}`);
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push(`${path}: above maximum ${schema.maximum}`);
    }
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push(`${path}: fewer than minItems ${schema.minItems}`);
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      errors.push(`${path}: more than maxItems ${schema.maxItems}`);
    }
    if (schema.items !== undefined) {
      value.forEach((item, i) => {
        validateNode(item, schema.items as JsonSchema, `${path}[${i}]`, errors);
      });
    }
  }

  if (typeOf(value) === 'object') {
    const obj = value as Record<string, unknown>;
    if (schema.required !== undefined) {
      for (const key of schema.required) {
        if (!(key in obj)) {
          errors.push(`${path}: missing required property "${key}"`);
        }
      }
    }
    if (schema.properties !== undefined) {
      for (const [key, subSchema] of Object.entries(schema.properties)) {
        if (key in obj) {
          validateNode(obj[key], subSchema, `${path}.${key}`, errors);
        }
      }
    }
    if (schema.additionalProperties !== undefined) {
      const known = new Set(Object.keys(schema.properties ?? {}));
      for (const key of Object.keys(obj)) {
        if (known.has(key)) continue;
        if (schema.additionalProperties === false) {
          errors.push(`${path}: additional property "${key}" is not allowed`);
        } else if (typeof schema.additionalProperties === 'object') {
          validateNode(obj[key], schema.additionalProperties, `${path}.${key}`, errors);
        }
      }
    }
  }
}

export function validateSchema(value: unknown, schema: JsonSchema): SchemaValidationResult {
  const errors: string[] = [];
  validateNode(value, schema, '$', errors);
  return { valid: errors.length === 0, errors };
}
