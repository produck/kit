import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PackageExtractor } from '@produck/package-meta-extractor';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const kitDir = path.resolve(__dirname, '..');
const metaJSFile = path.resolve(kitDir, 'src/meta.gen.mjs');

const extractor = new PackageExtractor(kitDir);

await extractor.read();
await extractor.generate(metaJSFile);
