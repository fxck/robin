import { defineNitroModule } from 'nitropack/runtime';
import { readFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(__dirname, '../../..');

export default defineNitroModule({
  name: 'tsconfig-paths-to-aliases',
  setup(nitro) {
    const tsconfig = JSON.parse(
      readFileSync(join(workspaceRoot, 'tsconfig.base.json')).toString()
    );
    const paths = tsconfig.compilerOptions.paths;
    const aliases = Object.entries(paths).reduce(
      (aliases, [aliasKey, aliasValue]) => ({
        ...aliases,
        [aliasKey]: join(workspaceRoot, (aliasValue as any)[0]),
      }),
      {},
    );
    nitro.options.alias ??= {};
    nitro.options.alias = { ...nitro.options.alias, ...aliases };
  },
});
