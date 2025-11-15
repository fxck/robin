import { defineNitroConfig } from 'nitropack/config';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(__dirname, '../..');

export default defineNitroConfig({
  srcDir: 'src',
  preset: 'node-server',
  compatibilityDate: '2025-11-14',
  devServer: {
    port: 3000,
  },
  runtimeConfig: {
    databaseUrl: '',
    redisUrl: '',
    s3Endpoint: '',
    s3Region: '',
    s3Bucket: '',
    s3AccessKeyId: '',
    s3SecretAccessKey: '',
    cdnHost: '',
    public: {
      apiBase: 'http://localhost:3000',
      appUrl: 'http://localhost:5173',
    }
  },
  experimental: {
    asyncContext: true,
    typescriptBundlerResolution: true,
  },
  imports: {
    dirs: [
      './utils/**/*.ts',
      './services/**/*.ts',
    ],
    global: true,
  },
  alias: {
    '@robin/database': resolve(workspaceRoot, 'packages/database/src/index.ts'),
    '@robin/auth': resolve(workspaceRoot, 'packages/auth/src/index.ts'),
    '@robin/types': resolve(workspaceRoot, 'packages/types/src/index.ts'),
    '@robin/utils': resolve(workspaceRoot, 'packages/utils/src/index.ts'),
    '@robin/config': resolve(workspaceRoot, 'packages/config/src/index.ts'),
  },
  esbuild: {
    options: {
      target: 'node20',
    },
  },
});
