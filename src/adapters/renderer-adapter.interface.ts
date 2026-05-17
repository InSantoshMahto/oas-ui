import { DocumentProvider, SetupOptions, OpenAPIObject } from '../types';

export interface RendererAdapter {
  name: string;
  serve(
    app: any,
    path: string,
    documentProvider: DocumentProvider,
    options?: SetupOptions,
  ): void | Promise<void>;
  serveStaticAssets?(app: any, rootPath: string, pathPrefix: string): void | Promise<void>;
}
