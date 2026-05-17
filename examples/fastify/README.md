# Example: Nest + Fastify + oas-ui

This example demonstrates how to mount the `oas-ui` runner into a Nest application using the Fastify adapter.

Setup
1. From the repository root, build the package:

```bash
npm install
npm run build
```

2. Install example dependencies (this example references the local package via `file:../../`):

```bash
cd examples/fastify
npm install
```

3. Start the example:

```bash
npm run start
```

Visit `http://localhost:3000/docs` after the server starts. The example uses the Swagger UI adapter by default.

Notes
- The example's `package.json` references the local package (`@insantoshmahto/oas-ui`) via `file:../../`. You can adjust this to a published version if available.
- Requires Node 18+ and an up-to-date Nest setup.
