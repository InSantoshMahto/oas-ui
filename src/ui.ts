import YAML from "js-yaml";
import { DocumentProvider, OpenAPIObject, SetupOptions } from "./types";
import { RendererAdapter } from "./adapters/renderer-adapter.interface";

const adapters = new Map<string, RendererAdapter>();

export function registerRendererAdapter(adapter: RendererAdapter) {
  if (!adapter || !adapter.name) throw new Error("Invalid adapter");
  adapters.set(adapter.name, adapter);
}

function getAdapter(name?: string) {
  const key = name || "swagger";
  const found = adapters.get(key);
  if (!found) throw new Error(`Renderer adapter not registered: ${key}`);
  return found;
}

function getServerInstance(app: any) {
  if (!app) throw new Error("App instance is required");
  // Nest application -> get underlying HTTP adapter
  if (typeof app.getHttpAdapter === "function") {
    const adapter = app.getHttpAdapter();
    if (adapter && typeof adapter.getInstance === "function")
      return adapter.getInstance();
    return adapter;
  }
  // Plain Express/Fastify apps expose get/use
  if (typeof app.get === "function" && typeof app.use === "function")
    return app;
  throw new Error(
    "Unsupported application instance; only Nest (Express/Fastify) or plain Express/Fastify apps are supported",
  );
}

async function resolveDocument(
  documentProvider: DocumentProvider,
  req: any,
  res: any,
) {
  if (typeof documentProvider === "function") {
    try {
      // prefer (req, res) signature
      return await documentProvider(req, res);
    } catch (e) {
      // fallback to no-arg provider
      return await documentProvider();
    }
  }
  return documentProvider;
}

function sendJsonResponse(res: any, obj: any) {
  if (!res) throw new Error("Response object is required");
  if (typeof res.json === "function") return res.json(obj); // Express
  if (typeof res.send === "function") {
    // Fastify reply supports send(obj)
    try {
      return res.send(obj);
    } catch (e) {
      // ignore and fallback
    }
  }
  if (typeof res.type === "function" && typeof res.send === "function")
    return res.type("application/json").send(JSON.stringify(obj));
  if (typeof res.writeHead === "function" && typeof res.end === "function") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(obj));
  }
  throw new Error("Unsupported response object; cannot send JSON");
}

function sendYamlResponse(res: any, yamlStr: string) {
  if (!res) throw new Error("Response object is required");
  if (typeof res.type === "function" && typeof res.send === "function")
    return res.type("text/yaml").send(yamlStr);
  if (typeof res.header === "function" && typeof res.send === "function") {
    try {
      // Fastify reply: header(name, value)
      res.header("content-type", "text/yaml");
    } catch (e) {
      // ignore
    }
    return res.send(yamlStr);
  }
  if (typeof res.writeHead === "function" && typeof res.end === "function") {
    res.writeHead(200, { "Content-Type": "text/yaml" });
    return res.end(yamlStr);
  }
  throw new Error("Unsupported response object; cannot send YAML");
}

export async function setupDocs(
  path: string,
  app: any,
  documentProvider: DocumentProvider,
  options?: SetupOptions,
) {
  const server = getServerInstance(app);
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const prefix = normalized.endsWith("/")
    ? normalized.slice(0, -1)
    : normalized;

  // raw endpoints
  const serveJson =
    options?.raw === true ||
    (Array.isArray(options?.raw) && options?.raw.includes("json")) ||
    options?.raw === undefined;
  const serveYaml =
    Array.isArray(options?.raw) && options?.raw.includes("yaml");

  if (serveJson) {
    server.get(prefix + "/openapi.json", async (req: any, res: any) => {
      const doc = await resolveDocument(documentProvider, req, res);
      const patched = options?.patchDocumentOnRequest
        ? await options.patchDocumentOnRequest(req, res, doc)
        : doc;
      return sendJsonResponse(res, patched);
    });
  }

  if (serveYaml) {
    server.get(prefix + "/openapi.yaml", async (req: any, res: any) => {
      const doc = await resolveDocument(documentProvider, req, res);
      const patched = options?.patchDocumentOnRequest
        ? await options.patchDocumentOnRequest(req, res, doc)
        : doc;
      return sendYamlResponse(res, YAML.dump(patched));
    });
  }

  // serve UI via adapter
  const adapter = getAdapter(options?.uiRenderer);
  await adapter.serve(app, prefix, documentProvider, options);
}
