import shared from 'utilium/eslint';

export default [
	...shared(import.meta.dirname),
	{ ignores: ['src/*/dist/'] },
	{
		rules: {
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/no-unsafe-enum-comparison': 'off',
			'@typescript-eslint/only-throw-error': 'off',
		},
	},
];
