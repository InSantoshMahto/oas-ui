export * from './types';
export * from './ui';
export * from './adapters/renderer-adapter.interface';

// Register built-in adapters
import { SwaggerAdapter } from './adapters/swagger-adapter';
import { RedocAdapter } from './adapters/redoc-adapter';
import { ScalarAdapter } from './adapters/scalar-adapter';
import { registerRendererAdapter } from './ui';

registerRendererAdapter(SwaggerAdapter);
registerRendererAdapter(RedocAdapter);
registerRendererAdapter(ScalarAdapter);
