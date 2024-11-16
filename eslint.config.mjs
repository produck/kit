import globals from 'globals';
import pluginJs from '@eslint/js';
// import tseslint from 'typescript-eslint';
import ProduckRules from '@produck/eslint-rules';

import { includeIgnoreFile } from '@eslint/compat';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

/** @type {import('eslint').Linter.Config[]} */
export default [
	includeIgnoreFile(gitignorePath),
	{files: ['**/*.{js,mjs}']},
	{languageOptions: { globals: {...globals.browser, ...globals.node} }},
	pluginJs.configs.recommended,
	// ...tseslint.configs.recommended,
	ProduckRules,
];
