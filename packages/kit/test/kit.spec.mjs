import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as KitDiagram from '@produck/kit-diagram';

import * as Kit from '../src/index.mjs';

describe('Kit::', function () {
	it('should create a Kit from global Kit', function () {
		const newKit = Kit.global('new');

		assert.strictEqual(newKit.Kit, newKit);
	});

	it('should throw if bad name.', function () {
		assert.throws(() => Kit.global(1), {
			name: 'TypeError',
			message: 'Invalid "name", one "string" expected.\n',
		});
	});

	it('should throw if accessing bad dep.', function () {
		assert.throws(() => Kit.global().foo, {
			name: 'ReferenceError',
			message: 'Dependence "foo" is undefined.\n',
		});
	});

	it('should throw if set a duplicated dep.', function () {
		const kit = Kit.global('foo');

		kit.bar = {};

		assert.throws(() => kit.bar = 'baz', {
			name: 'Error',
			message: 'There has been a dependence named "bar".\n',
		});
	});

	it('should throw if accessing by symbol key.', function () {
		assert.throws(() => Kit.global()[Symbol()], {
			name: 'TypeError',
			message: 'Cannot convert a Symbol value to a string',
		});
	});

	it('should throw if setDiagram receives non-function.', function () {
		assert.throws(() => Kit.setDiagram(42), {
			name: 'TypeError',
			message: 'Invalid "diagram", one function expected.',
		});
	});

	it('should support global setDiagram.', function () {
		Kit.setDiagram(KitDiagram.chainToRoot);

		assert.throws(() => Kit.global('scope').foo, {
			name: 'ReferenceError',
			message: 'Dependence "foo" is undefined.\n[scope] --|> [Kit::Global]',
		});

		Kit.setDiagram();

		assert.throws(() => Kit.global('scope2').foo, {
			name: 'ReferenceError',
			message: 'Dependence "foo" is undefined.\n',
		});
	});
});
