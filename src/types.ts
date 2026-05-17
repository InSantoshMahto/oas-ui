export type OpenAPIObject = Record<string, any>;

export type DocumentProvider =
  | OpenAPIObject
  | ((req?: any, res?: any) => Promise<OpenAPIObject> | OpenAPIObject);

export interface SetupOptions {
  uiRenderer?: string; // 'swagger' | 'redoc' | custom
  raw?: boolean | Array<"json" | "yaml">; // serve raw endpoints
  rendererOptions?: Record<string, any>;
  customUiPath?: string; // local path for custom UI assets
  patchDocumentOnRequest?: (
    req: any,
    res: any,
    document: OpenAPIObject,
  ) => OpenAPIObject | Promise<OpenAPIObject>;
}
