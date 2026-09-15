import shared from 'utilium/eslint';

export default [
	...shared(import.meta.dirname),
	{ ignores: ['src/*/dist/'] },
	{
		rules: {
			'@typescript-eslint/no-empty-object-type': 'off',
		},
	},
];
