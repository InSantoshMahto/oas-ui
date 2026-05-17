import { RendererAdapter } from "./renderer-adapter.interface";

function swaggerHtml(specUrl: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Swagger UI</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function() {
        const ui = SwaggerUIBundle({
          url: '%SPEC_URL%',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: 'StandaloneLayout'
        });
        window.ui = ui;
      };
    </script>
  </body>
</html>`.replace("%SPEC_URL%", specUrl);
}

export const SwaggerAdapter: RendererAdapter = {
  name: "swagger",
  serve(app: any, path: string) {
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
    expressApp.get(normalized, (req: any, res: any) => {
      const specUrl = normalized + "/openapi.json";
      res.type("text/html").send(swaggerHtml(specUrl));
    });
  },
};
