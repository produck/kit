import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJSONFile = path.resolve(__dirname, '../package.json');
const meta = JSON.parse(fs.readFileSync(packageJSONFile, 'utf8'));
const versionJSFile = path.resolve(__dirname, '../src/version.gen.mjs');

fs.writeFileSync(versionJSFile, `export default '${meta.version}';`);
