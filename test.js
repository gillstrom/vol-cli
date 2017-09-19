import execa from 'execa';
import test from 'ava';
import vol from 'vol';

test(async t => {
	await execa('./cli.js', [30]);
	t.is(await vol.get(), 0.3);
});
