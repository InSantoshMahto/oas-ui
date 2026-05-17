import { RendererAdapter } from "./renderer-adapter.interface";

function redocHtml(specUrl: string) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ReDoc</title>
  </head>
  <body>
    <redoc spec-url="${specUrl}"></redoc>
    <script src="https://unpkg.com/redoc@next/bundles/redoc.standalone.js"></script>
  </body>
</html>`;
}

export const RedocAdapter: RendererAdapter = {
  name: "redoc",
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
      res.type("text/html").send(redocHtml(specUrl));
    });
  },
};
