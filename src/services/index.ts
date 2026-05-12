import type { Service } from "./types";
import { coffeeService } from "./coffee";

/**
 * Registry of all quote-builder services.
 *
 * Each service implements the same `Service` interface but is
 * otherwise independent — different schemas, data, business rules.
 * To add a new service (예: 정수기, 스낵 등):
 *
 *   1. Create src/services/<name>/ with its own store, hooks, types,
 *      panels and QuoteDocument component.
 *   2. Export a Service object from src/services/<name>/index.ts.
 *   3. Register it in SERVICES below.
 *
 * Order in this array controls the order shown in the service
 * switcher dropdown.
 */
export const SERVICES: Service[] = [coffeeService];

export const SERVICES_BY_ID: Record<string, Service> = Object.fromEntries(
  SERVICES.map((s) => [s.id, s]),
);

export function getService(id: string): Service {
  return SERVICES_BY_ID[id] ?? SERVICES[0];
}

export type { Service, ServiceSection } from "./types";
