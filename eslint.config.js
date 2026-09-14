import shared from 'utilium/eslint';

export default [
	...shared(import.meta.dirname),
	{
		rules: {
			'@typescript-eslint/no-empty-object-type': 'off',
		},
	},
];
