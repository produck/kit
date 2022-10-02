import assert from 'node:assert';
import * as Kit from '../index.mjs';
import version from '../version.mjs';

describe('Kit::', function () {
	it('should create a Kit from global Kit', function () {
		const newKit = Kit.global('new');

		assert.strictEqual(newKit.Kit, newKit);
		assert.strictEqual(newKit.version, version);
	});

	it('should throw if bad name.', function () {
		assert.throws(() => Kit.global(1), {
			name: 'TypeError',
			message: 'Invalid "name", one "string" expected.\n[Kit::Global]'
		});
	});

	it('should throw if accessing bad dep.', function () {
		assert.throws(() => Kit.global().foo, {
			name: 'ReferenceError',
			message: 'No dependence named "foo" is defined.\n[<Anonymous>] --|> [Kit::Global]'
		});
	});

	it('should throw if set a duplicated dep.', function () {
		const kit = Kit.global('foo');

		kit.bar = {};

		assert.throws(() => kit.bar = 'baz', {
			name: 'Error',
			message: 'There has been a dependence named "bar".\n[foo] --|> [Kit::Global]'
		});
	});

	it('should throw if accessing by symbol key.', function () {
		assert.throws(() => Kit.global()[Symbol()], {
			name: 'TypeError',
			message: 'Invalid "property", one "string" expected.\n[<Anonymous>] --|> [Kit::Global]'
		});
	});
});