# oas-ui
Open API Spec UI for NestJS

Pluggable OpenAPI UI runner for Nest/Express/Fastify applications.

This repository contains an initial implementation of a UI runner that can serve OpenAPI documentation using different renderers (Swagger UI, ReDoc, Scalar). The spec generation is intentionally out-of-scope here — the runner expects an OpenAPI document or a factory that returns one.

Usage example (Nest + TypeScript):

```/dev/null/EXAMPLE.md#L1-36
import { INestApplication } from '@nestjs/common';
import { setupDocs } from '@insantoshmahto/oas-ui';

// `document` can be a static OpenAPI object or a function that returns it (optionally async).
const document = { openapi: '3.0.0', info: { title: 'API', version: '1.0' }, paths: {} };

// register docs at /docs
setupDocs('/docs', app, document, { uiRenderer: 'swagger' });
```

Design goals:
- Minimal core that serves raw JSON/YAML and mounts a UI renderer
- Pluggable renderer adapters for Swagger UI, ReDoc, and others
- Works with Nest (Express and Fastify) and plain Express/Fastify applications

See `src` for implementation details and adapters.
