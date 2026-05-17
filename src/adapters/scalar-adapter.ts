import { RendererAdapter } from "./renderer-adapter.interface";

function scalarHtml(specUrl: string, customPath?: string) {
  // The scalar adapter is intentionally minimal. It prefers a user-provided custom UI (customPath)
  // and falls back to Swagger UI CDN if none is provided.
  if (customPath) {
    return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body><iframe src="${customPath}" style="border:0;width:100%;height:100vh"></iframe></body></html>`;
  }

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Scalar UI (Swagger fallback)</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function() {
        SwaggerUIBundle({
          url: '${specUrl}',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: 'StandaloneLayout'
        });
      }
    </script>
  </body>
</html>`;
}

export const ScalarAdapter: RendererAdapter = {
  name: "scalar",
  serve(app: any, path: string, _docProvider: any, options?: any) {
    const expressApp: any = (function getAppInstance(a: any) {
      if (!a) throw new Error("App instance is required");
      if (typeof a.getHttpAdapter === "function") {
        const adapter = a.getHttpAdapter();
        if (adapter && typeof adapter.getInstance === "function")
          return adapter.getInstance();
        return adapter;
      }
      if (typeof a.get === "function") return a;
      throw new Error(
        "Unsupported app instance; only Nest (Express/Fastify) or plain Express/Fastify apps are supported",
      );
    })(app);

    const normalized = path.endsWith("/") ? path.slice(0, -1) : path;
    expressApp.get(normalized, (_req: any, res: any) => {
      const specUrl = normalized + "/openapi.json";
      res
        .type("text/html")
        .send(scalarHtml(specUrl, options && options.customUiPath));
    });
  },
};
