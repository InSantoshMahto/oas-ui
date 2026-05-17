# RFC: Extract OpenAPI generation from @nestjs/swagger into standalone core + UI-adapters

- Status: Proposal
- Author: InSantoshMahto (drafted with assistant)
- Created: 2026-05-16
- Primary repos (implementation plan):
  - initial forks under GitHub org: `@InSantoshMahto` (e.g., [@InSantoshMahto/oas]([os](https://github.com/InSantoshMahto/oas)), [@InSantoshMahto/oas-ui](https://github.com/InSantoshMahto/oas-ui))
  - long-term intended names: `@nestjs/oas`, `@nestjs/oas-ui` (upstream adoption optional)

## Summary

Extract the OpenAPI (OpenAPI 3.x) generation logic out of `@nestjs/swagger` into a focused, minimal library (proposed: `@nestjs/oas` or temporary fork `@InSantoshMahto/oas`). Publish a companion `@nestjs/oas-ui` (or `@InSantoshMahto/oas-ui`) to serve multiple UI renderers via a pluggable adapter system (Swagger UI, Redoc, Scalar, and custom adapters). `@nestjs/swagger` becomes a thin wrapper that re-exports the generator and installs default adapters to preserve backwards compatibility.

This mirrors the separation used in other ecosystems (e.g., oaswrap/spec & oaswrap/spec-ui) and enables:
- minimal generator package (small surface, fewer dependencies),
- independent UI adapters with separate release cycles,
- easier support for alternative UIs (Scalar, custom portals),
- simpler consumption by CLI/static doc tooling.

## Goals

- Single responsibility: generation vs. rendering.
- Preserve existing decorator-driven workflow for Nest apps.
- Provide a stable minimal public API for spec generation that UI adapters can consume.
- Keep backwards compatibility: `@nestjs/swagger` remains a convenience wrapper.
- Make it easy for third parties (Scalar, Redoc, custom) to ship adapters.

## Non-goals

- Rewriting the spec generation logic — reuse existing, well-tested code from `nestjs/swagger`.
- Bundling every possible external UI into the generator package.
- Immediate upstream rename/transfer to `@nestjs/*` (we will fork under `@InSantoshMahto` and iterate).

## High-level design

Two packages:

1. `@nestjs/oas` (core generator)
   - Responsibility: produce a valid OpenAPI 3.x object from a Nest application.
   - Public API:
     - DocumentBuilder
     - createDocument(app, config, options) → OpenAPIObject
     - loadPluginMetadata(fn)
     - helpers: getSchemaPath, refs, etc.
   - Implementation: extract and adapt existing files:
     - `document-builder.ts`
     - `swagger-scanner.ts` → `spec-scanner.ts`
     - `swagger-explorer.ts` → `spec-explorer.ts`
     - services: `schema-object-factory.ts`, `model-properties-accessor.ts`, `swagger-types-mapper.ts`
     - explorers/* (decorator readers)
     - interfaces/open-api-spec.interface.ts
   - Keep support for OAS 3.0 & 3.1 (webhooks handling already present).

2. `@nestjs/oas-ui` (UI runner + adapters)
   - Responsibility: serve docs and support pluggable UI renderers.
   - Public API:
     - setupDocs(path, app, documentOrFactory, options)
       - options.uiRenderer?: string (e.g., 'swagger' | 'redoc' | 'scalar' | custom)
       - options.raw?: boolean | Array<'json'|'yaml'>
       - options.rendererOptions?: Record<string,any>
       - options.customUiPath?: string
       - options.patchDocumentOnRequest?: (req,res,doc) => OpenAPIObject | Promise<OpenAPIObject>
     - registerRendererAdapter(adapter: RendererAdapter)
   - RendererAdapter interface:
     - name: string
     - serve(app, path, documentProvider, options): void | Promise<void>
     - serveStaticAssets?(app, rootPath, pathPrefix): void | Promise<void>
   - Provide built-in adapters: `swagger` (Swagger UI), `redoc` (Redoc), and a `scalar` adapter (starter that can use CDN or user assets).
   - Responsibility for raw JSON/YAML endpoints and `patchDocumentOnRequest` hook.

3. `@nestjs/swagger`
   - Becomes a compatibility wrapper that re-exports the generator and delegates UI to `@nestjs/oas-ui` to preserve existing API surface and user ergonomics.

## API examples

Generator usage:
```ts
import { DocumentBuilder, createDocument } from '@InSantoshMahto/oas';

const config = new DocumentBuilder().setTitle('API').setVersion('1.0').build();
const document = createDocument(app, config, { deepScanRoutes: true });
