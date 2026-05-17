import express from 'express';
import { setupDocs } from '@insantoshmahto/oas-ui';

const app = express();

const document = {
  openapi: '3.0.0',
  info: { title: 'Express Example API', version: '0.1.0' },
  paths: {},
};

// Mount docs at /docs (Swagger UI)
setupDocs('/docs', app, document, { uiRenderer: 'swagger' });

app.get('/', (_req, res) => res.json({ hello: 'express' }));

const port = 3001;
app.listen(port, () => {
  console.log(`Express example listening at http://localhost:${port}`);
  console.log(`Docs available at http://localhost:${port}/docs`);
});
